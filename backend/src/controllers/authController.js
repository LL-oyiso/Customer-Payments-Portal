const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const { PrismaClient } = require('@prisma/client')
const { body } = require('express-validator')
const { hashPassword, verifyPassword, isPasswordBreached } = require('../services/passwordService')
const { loginBruteForce } = require('../config/security')
const { securityLog } = require('../utils/logger')
const { validate } = require('../utils/validators')

const prisma = new PrismaClient()

const generateTokens = (user) => {
  const payload = { id: user.id, role: user.role, username: user.username }

  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m',
  })

  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d',
  })

  return { accessToken, refreshToken }
}

// Validation rules for register
const registerValidation = [
  body('firstName').trim().custom((val) => {
    if (!validate.fullName(val)) throw new Error('Invalid first name.')
    return true
  }),
  body('lastName').trim().custom((val) => {
    if (!validate.fullName(val)) throw new Error('Invalid last name.')
    return true
  }),
  body('email').trim().toLowerCase().custom((val) => {
    if (!validate.email(val)) throw new Error('Invalid email address.')
    return true
  }),
  body('idNumber').trim().custom((val) => {
    if (!validate.idNumber(val)) throw new Error('Invalid SA ID number. Must be exactly 13 digits.')
    return true
  }),
  body('accountNumber').trim().custom((val) => {
    if (!validate.accountNumber(val)) throw new Error('Invalid account number. Must be 7 to 11 digits.')
    return true
  }),
  body('username').trim().custom((val) => {
    if (!validate.username(val)) throw new Error('Invalid username format.')
    return true
  }),
  body('password').custom((val) => {
    if (!validate.password(val)) throw new Error('Password must be 12-128 characters.')
    return true
  }),
]

// Validation rules for login
// accountNumber is optional — staff can omit it, customers must provide it
const loginValidation = [
  body('username').trim().custom((val) => {
    if (!validate.username(val)) throw new Error('Invalid username.')
    return true
  }),
  body('accountNumber').optional({ nullable: true, checkFalsy: true }).trim().custom((val) => {
    if (val && !validate.accountNumber(val)) throw new Error('Invalid account number format.')
    return true
  }),
  body('password').notEmpty().withMessage('Password is required.'),
]

const register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, idNumber, accountNumber, username, password } = req.body
    const fullName = `${firstName.trim()} ${lastName.trim()}`

    // Check password strength via HIBP
    const breached = await isPasswordBreached(password)
    if (breached) {
      return res.status(400).json({
        error: 'This password has appeared in a data breach. Please choose a different password.',
      })
    }

    // Generic message for all conflicts - prevents account enumeration attacks
    // See: Iron-Clad Java Ch.2 - never reveal whether an account exists
    const existing = await prisma.user.findFirst({
      where: { OR: [{ username }, { email }, { idNumber }, { accountNumber }] },
    })
    if (existing) {
      return res.status(409).json({ error: 'Registration failed. Please check your details and try again.' })
    }

    const passwordHash = await hashPassword(password)

    const user = await prisma.user.create({
      data: { fullName, email: email.toLowerCase(), idNumber, accountNumber, username, passwordHash, role: 'CUSTOMER' },
    })

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'REGISTER',
        entityType: 'USER',
        entityId: user.id,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        success: true,
      },
    })

    securityLog('USER_REGISTERED', { userId: user.id, ip: req.ip })

    res.status(201).json({ message: 'Registration successful. Please log in.' })
  } catch (err) {
    next(err)
  }
}

const login = async (req, res, next) => {
  const { username, accountNumber, password } = req.body
  const ip = req.ip

  try {
    // Check brute force limit
    await loginBruteForce.consume(`${ip}_${username}`)
  } catch {
    securityLog('LOGIN_BLOCKED_BRUTE_FORCE', { username, ip })
    return res.status(429).json({ error: 'Too many failed attempts. Please try again later.' })
  }

  try {
    const user = await prisma.user.findUnique({ where: { username } })

    // Use constant-time comparison path regardless of whether user exists
    const dummyHash = '$argon2id$v=19$m=19456,t=2,p=1$dummy$dummy'
    const passwordValid = user
      ? await verifyPassword(user.passwordHash, password)
      : await verifyPassword(dummyHash, password).catch(() => false)

    // Account number verification:
    // - If provided: must match exactly (customer login flow)
    // - If omitted: only permitted for STAFF roles (staff login flow)
    let accountValid
    if (accountNumber) {
      accountValid = user ? user.accountNumber === accountNumber : false
    } else {
      accountValid = user ? user.role === 'STAFF' : false
    }

    if (!user || !passwordValid || !accountValid) {
      await prisma.failedLoginAttempt.create({
        data: { username, ipAddress: ip },
      }).catch(() => {})

      securityLog('LOGIN_FAILED', { username, ip })

      // Generic message - prevents account enumeration
      return res.status(401).json({ error: 'Invalid credentials.' })
    }

    // Reset brute force counter on success
    await loginBruteForce.delete(`${ip}_${username}`).catch(() => {})

    const { accessToken, refreshToken } = generateTokens(user)

    // Store refresh token in DB
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    await prisma.refreshToken.create({
      data: { userId: user.id, token: refreshToken, expiresAt },
    })

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    })

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN',
        entityType: 'USER',
        entityId: user.id,
        ipAddress: ip,
        userAgent: req.get('User-Agent'),
        success: true,
      },
    })

    securityLog('LOGIN_SUCCESS', { userId: user.id, ip })

    res.json({
      accessToken,
      refreshToken,
      user: { id: user.id, role: user.role, username: user.username, fullName: user.fullName },
    })
  } catch (err) {
    next(err)
  }
}

const refresh = async (req, res, next) => {
  const { refreshToken } = req.body

  if (!refreshToken) {
    return res.status(401).json({ error: 'Refresh token required.' })
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)

    const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } })

    if (!stored || stored.revoked || stored.expiresAt < new Date()) {
      return res.status(401).json({ error: 'Invalid or expired refresh token.' })
    }

    // Revoke old token and issue new pair (rotation)
    await prisma.refreshToken.update({ where: { id: stored.id }, data: { revoked: true } })

    const user = await prisma.user.findUnique({ where: { id: decoded.id } })
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user)

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    await prisma.refreshToken.create({
      data: { userId: user.id, token: newRefreshToken, expiresAt },
    })

    res.json({ accessToken, refreshToken: newRefreshToken })
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired refresh token.' })
  }
}

const logout = async (req, res, next) => {
  const { refreshToken } = req.body

  try {
    if (refreshToken) {
      await prisma.refreshToken.updateMany({
        where: { token: refreshToken },
        data: { revoked: true },
      })
    }

    securityLog('LOGOUT', { userId: req.user?.id, ip: req.ip })
    res.json({ message: 'Logged out successfully.' })
  } catch (err) {
    next(err)
  }
}

module.exports = { register, login, refresh, logout, registerValidation, loginValidation }
