const argon2 = require('argon2')
const crypto = require('node:crypto')
const { securityLog } = require('../utils/logger')

const ARGON2_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 19456,  // 19 MiB (OWASP 2023 recommendation)
  timeCost: 2,
  parallelism: 1,
}

const hashPassword = async (password) => {
  const pepper = process.env.ARGON2_PEPPER || ''
  const pepperedPassword = pepper + password
  return argon2.hash(pepperedPassword, ARGON2_OPTIONS)
}

const verifyPassword = async (hash, password) => {
  const pepper = process.env.ARGON2_PEPPER || ''
  const pepperedPassword = pepper + password
  return argon2.verify(hash, pepperedPassword)
}

// HaveIBeenPwned k-anonymity check
// Only sends first 5 chars of SHA-1 hash — password never leaves server
const isPasswordBreached = async (password) => {
  const sha1 = crypto.createHash('sha1').update(password).digest('hex').toUpperCase()
  const prefix = sha1.slice(0, 5)
  const suffix = sha1.slice(5)

  try {
    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: { 'Add-Padding': 'true' },
    })
    const text = await response.text()
    return text.split('\r\n').some((line) => line.split(':')[0] === suffix)
  } catch (e) {
    securityLog('HIBP_CHECK_FAILED', { error: e.message })
    return false // fail open — HIBP unavailability must not block registration
  }
}

module.exports = { hashPassword, verifyPassword, isPasswordBreached }
