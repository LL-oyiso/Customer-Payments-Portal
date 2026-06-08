/**
 * Transaction Access Control Tests
 *
 * Proves that the staff-only "all transactions" audit view:
 * - Returns the full transaction history to an authenticated STAFF user
 * - Is blocked for CUSTOMER tokens (403)
 * - Is blocked for unauthenticated requests (401)
 */

jest.mock('@prisma/client')
jest.mock('../src/utils/logger', () => ({
  logger: { info: jest.fn(), error: jest.fn(), warn: jest.fn() },
  securityLog: jest.fn(),
}))
jest.mock('../src/config/security', () => ({
  helmetConfig: (req, res, next) => next(),
  corsConfig: (req, res, next) => next(),
  generalLimiter: (req, res, next) => next(),
  authLimiter: (req, res, next) => next(),
  loginBruteForce: { consume: jest.fn(), delete: jest.fn() },
}))

const { PrismaClient } = require('@prisma/client')

const prismaMock = {
  user: { findUnique: jest.fn() },
  transaction: { findMany: jest.fn() },
  auditLog: { create: jest.fn().mockResolvedValue({}) },
  refreshToken: { create: jest.fn().mockResolvedValue({}) },
  failedLoginAttempt: { create: jest.fn().mockResolvedValue({}) },
}
PrismaClient.mockImplementation(() => prismaMock)

const request = require('supertest')
const jwt = require('jsonwebtoken')
const app = require('../src/app')

const makeToken = (role) =>
  jwt.sign({ id: 'test-user-id', role, username: 'testuser' }, process.env.JWT_SECRET, { expiresIn: '1h' })

const SAMPLE = [
  {
    id: 'tx-1',
    amount: '1500.00',
    currency: 'USD',
    payeeAccount: 'GB29NWBK60161331926819',
    payeeSwiftCode: 'NWBKGB2L',
    status: 'SUBMITTED',
    createdAt: new Date().toISOString(),
    customer: { fullName: 'Jane Smith', accountNumber: '1234567' },
    verifiedBy: { fullName: 'Staff Member One' },
  },
]

beforeEach(() => {
  jest.clearAllMocks()
  prismaMock.transaction.findMany.mockResolvedValue(SAMPLE)
})

describe('GET /api/transactions/all — staff audit view', () => {
  it('returns the full transaction history to a STAFF user', async () => {
    const token = makeToken('STAFF')
    const res = await request(app)
      .get('/api/transactions/all')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body.transactions)).toBe(true)
    expect(res.body.transactions).toHaveLength(1)
    expect(res.body.transactions[0]).toHaveProperty('customer')
    expect(prismaMock.transaction.findMany).toHaveBeenCalledTimes(1)
  })

  it('blocks a CUSTOMER token with 403', async () => {
    const token = makeToken('CUSTOMER')
    const res = await request(app)
      .get('/api/transactions/all')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(403)
    expect(prismaMock.transaction.findMany).not.toHaveBeenCalled()
  })

  it('blocks an unauthenticated request with 401', async () => {
    const res = await request(app).get('/api/transactions/all')

    expect(res.status).toBe(401)
    expect(prismaMock.transaction.findMany).not.toHaveBeenCalled()
  })

  it('returns 500 (handled) if the database query fails', async () => {
    prismaMock.transaction.findMany.mockRejectedValue(new Error('DB down'))
    const token = makeToken('STAFF')
    const res = await request(app)
      .get('/api/transactions/all')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(500)
    expect(res.body.error).toBeDefined()
  })
})
