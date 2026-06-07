/**
 * RBAC — Role-Based Access Control Tests
 *
 * Proves that:
 * - All protected routes reject requests with no token (401)
 * - A CUSTOMER token cannot access staff-only endpoints (403)
 * - A STAFF token cannot access customer-only endpoints (403)
 * - Tampered or expired JWTs are rejected (401)
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
PrismaClient.mockImplementation(() => ({
  user: { findUnique: jest.fn(), findFirst: jest.fn(), create: jest.fn(), update: jest.fn() },
  auditLog: { create: jest.fn().mockResolvedValue({}) },
  refreshToken: { create: jest.fn().mockResolvedValue({}) },
  failedLoginAttempt: { create: jest.fn().mockResolvedValue({}) },
}))

const request = require('supertest')
const jwt = require('jsonwebtoken')
const app = require('../src/app')

const makeToken = (role) =>
  jwt.sign(
    { id: 'test-user-id', role, username: 'testuser' },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  )

describe('Unauthenticated Access — routes reject missing tokens', () => {
  it('rejects GET /api/transactions with no token', async () => {
    const res = await request(app).get('/api/transactions')
    expect(res.status).toBe(401)
  })

  it('rejects GET /api/transactions/pending with no token', async () => {
    const res = await request(app).get('/api/transactions/pending')
    expect(res.status).toBe(401)
  })

  it('rejects POST /api/transactions with no token', async () => {
    const res = await request(app).post('/api/transactions').send({})
    expect(res.status).toBe(401)
  })
})

describe('Cross-Role Access Prevention — role boundary enforcement', () => {
  it('blocks a CUSTOMER from accessing the staff-only pending queue', async () => {
    const token = makeToken('CUSTOMER')
    const res = await request(app)
      .get('/api/transactions/pending')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(403)
    expect(res.body.error).toBe('Access denied.')
  })

  it('blocks a STAFF member from accessing the customer-only transaction list', async () => {
    const token = makeToken('STAFF')
    const res = await request(app)
      .get('/api/transactions')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(403)
    expect(res.body.error).toBe('Access denied.')
  })

  it('blocks a STAFF member from submitting a new payment (customer-only)', async () => {
    const token = makeToken('STAFF')
    const res = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send({})

    expect(res.status).toBe(403)
    expect(res.body.error).toBe('Access denied.')
  })
})

describe('Token Integrity — invalid tokens are rejected', () => {
  it('rejects a tampered JWT signature', async () => {
    const token = makeToken('CUSTOMER')
    const tampered = token.slice(0, -5) + 'XXXXX'
    const res = await request(app)
      .get('/api/transactions')
      .set('Authorization', `Bearer ${tampered}`)

    expect(res.status).toBe(401)
  })

  it('rejects an expired JWT', async () => {
    const expired = jwt.sign(
      { id: 'test-user-id', role: 'CUSTOMER', username: 'testuser' },
      process.env.JWT_SECRET,
      { expiresIn: '-1s' }
    )
    const res = await request(app)
      .get('/api/transactions')
      .set('Authorization', `Bearer ${expired}`)

    expect(res.status).toBe(401)
  })

  it('rejects a token signed with the wrong secret', async () => {
    const wrongToken = jwt.sign(
      { id: 'test-user-id', role: 'CUSTOMER', username: 'testuser' },
      'wrong-secret-entirely'
    )
    const res = await request(app)
      .get('/api/transactions')
      .set('Authorization', `Bearer ${wrongToken}`)

    expect(res.status).toBe(401)
  })
})
