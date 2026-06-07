/**
 * Health Check Test
 *
 * Confirms the API is reachable and responding correctly.
 * Used as a smoke test in CI to verify the app boots without errors.
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
PrismaClient.mockImplementation(() => ({
  user: { findUnique: jest.fn() },
}))

const request = require('supertest')
const app = require('../src/app')

describe('Health Check', () => {
  it('GET /api/health returns 200 with status ok', async () => {
    const res = await request(app).get('/api/health')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ status: 'ok' })
  })

  it('returns 404 for unknown routes', async () => {
    const res = await request(app).get('/api/nonexistent-route')
    expect(res.status).toBe(404)
  })
})
