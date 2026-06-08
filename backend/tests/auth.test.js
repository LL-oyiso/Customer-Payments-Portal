/**
 * Authentication Security Tests
 *
 * Proves that:
 * - Server-side input validation rejects malformed fields (email, password, username)
 * - Failed logins always return the same message regardless of whether the user exists
 *   (prevents account enumeration — OWASP Authentication Cheat Sheet)
 * - Brute force protection triggers a 429 after the rate limit is exceeded
 */

jest.mock('@prisma/client')
jest.mock('../src/services/passwordService')
jest.mock('../src/utils/logger', () => ({
  logger: { info: jest.fn(), error: jest.fn(), warn: jest.fn() },
  securityLog: jest.fn(),
}))
jest.mock('../src/config/security', () => ({
  helmetConfig: (req, res, next) => next(),
  corsConfig: (req, res, next) => next(),
  generalLimiter: (req, res, next) => next(),
  authLimiter: (req, res, next) => next(),
  loginBruteForce: {
    consume: jest.fn().mockResolvedValue({}),
    delete: jest.fn().mockResolvedValue({}),
  },
}))

const { PrismaClient } = require('@prisma/client')
const { verifyPassword, isPasswordBreached } = require('../src/services/passwordService')
const { loginBruteForce } = require('../src/config/security')

const prismaMock = {
  user: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  auditLog: { create: jest.fn().mockResolvedValue({}) },
  refreshToken: { create: jest.fn().mockResolvedValue({}) },
  failedLoginAttempt: { create: jest.fn().mockResolvedValue({}) },
}
PrismaClient.mockImplementation(() => prismaMock)

const request = require('supertest')
const app = require('../src/app')

const VALID_REGISTER_BODY = {
  firstName: 'Jane',
  lastName: 'Smith',
  email: 'jane.smith@example.com',
  idNumber: '9001015009087',
  accountNumber: '1234567',
  username: 'janesmith',
  password: 'SecurePassword123!',
}

const VALID_LOGIN_BODY = {
  username: 'janesmith',
  accountNumber: '1234567',
  password: 'SecurePassword123!',
}

beforeEach(() => {
  jest.clearAllMocks()
  loginBruteForce.consume.mockResolvedValue({})
  loginBruteForce.delete.mockResolvedValue({})
  isPasswordBreached.mockResolvedValue(false)
  verifyPassword.mockResolvedValue(false)
  prismaMock.auditLog.create.mockResolvedValue({})
  prismaMock.failedLoginAttempt.create.mockResolvedValue({})
})

describe('Input Validation — server enforces whitelisting independently of the client', () => {
  it('rejects registration with an invalid email format', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...VALID_REGISTER_BODY, email: 'notanemail' })

    expect(res.status).toBe(400)
    expect(res.body.error).toBe('Invalid input.')
  })

  it('rejects registration with a password shorter than 12 characters', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...VALID_REGISTER_BODY, password: 'Short1!' })

    expect(res.status).toBe(400)
    expect(res.body.error).toBe('Invalid input.')
  })

  it('rejects registration with an invalid username (special chars)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...VALID_REGISTER_BODY, username: 'user name!' })

    expect(res.status).toBe(400)
    expect(res.body.error).toBe('Invalid input.')
  })

  it('rejects registration with an ID number that is not 13 digits', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...VALID_REGISTER_BODY, idNumber: '123' })

    expect(res.status).toBe(400)
    expect(res.body.error).toBe('Invalid input.')
  })

  it('rejects login with a missing password field', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'janesmith', accountNumber: '1234567' })

    expect(res.status).toBe(400)
  })
})

describe('No Account Enumeration — same error regardless of whether the user exists', () => {
  it('returns 401 with a generic message when the user does not exist', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null)

    const res = await request(app)
      .post('/api/auth/login')
      .send(VALID_LOGIN_BODY)

    expect(res.status).toBe(401)
    expect(res.body.error).toBe('Invalid credentials.')
  })

  it('returns 401 with the same generic message when the password is wrong', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'user-id-1',
      username: 'janesmith',
      passwordHash: '$argon2id$v=19$m=19456,t=2,p=1$mock',
      accountNumber: '1234567',
      role: 'CUSTOMER',
      fullName: 'Jane Smith',
    })
    verifyPassword.mockResolvedValue(false)

    const res = await request(app)
      .post('/api/auth/login')
      .send(VALID_LOGIN_BODY)

    expect(res.status).toBe(401)
    expect(res.body.error).toBe('Invalid credentials.')
  })

  it('error message is identical whether the user exists or not', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null)
    const res1 = await request(app)
      .post('/api/auth/login')
      .send({ ...VALID_LOGIN_BODY, username: 'ghost_user_xyz' })

    prismaMock.user.findUnique.mockResolvedValue({
      id: 'user-id-1',
      username: 'janesmith',
      passwordHash: '$argon2id$v=19$m=19456,t=2,p=1$mock',
      accountNumber: '1234567',
      role: 'CUSTOMER',
      fullName: 'Jane Smith',
    })
    verifyPassword.mockResolvedValue(false)
    const res2 = await request(app)
      .post('/api/auth/login')
      .send(VALID_LOGIN_BODY)

    expect(res1.body.error).toBe(res2.body.error)
  })
})

describe('Brute Force Protection — rate limit enforced per IP and username', () => {
  it('returns 429 when the login rate limit is exceeded', async () => {
    loginBruteForce.consume.mockRejectedValue(new Error('Rate limit exceeded'))

    const res = await request(app)
      .post('/api/auth/login')
      .send(VALID_LOGIN_BODY)

    expect(res.status).toBe(429)
    expect(res.body.error).toMatch(/too many/i)
  })
})

describe('Refresh Token — malformed JWT triggers REFRESH_TOKEN_INVALID log', () => {
  it('returns 401 and logs the error when refresh token is malformed', async () => {
    const { securityLog } = require('../src/utils/logger')

    const res = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: 'not.a.valid.jwt.token' })

    expect(res.status).toBe(401)
    expect(res.body.error).toBe('Invalid or expired refresh token.')
    expect(securityLog).toHaveBeenCalledWith('REFRESH_TOKEN_INVALID', expect.objectContaining({
      error: expect.any(String),
    }))
  })

  it('returns 401 when no refresh token is provided', async () => {
    const res = await request(app)
      .post('/api/auth/refresh')
      .send({})

    expect(res.status).toBe(401)
    expect(res.body.error).toBe('Refresh token required.')
  })
})
