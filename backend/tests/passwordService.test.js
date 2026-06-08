/**
 * Password Service Unit Tests
 *
 * Covers:
 * - hashPassword: Argon2id peppered hashing
 * - verifyPassword: constant-time comparison
 * - isPasswordBreached: HIBP k-anonymity check including network failure fallback
 */

jest.mock('../src/utils/logger', () => ({
  securityLog: jest.fn(),
  logger: { info: jest.fn(), error: jest.fn(), warn: jest.fn() },
}))

jest.mock('argon2', () => ({
  argon2id: 'argon2id',
  hash: jest.fn().mockResolvedValue('$argon2id$v=19$mockhash'),
  verify: jest.fn().mockResolvedValue(true),
}))

global.fetch = jest.fn()

const argon2 = require('argon2')
const { hashPassword, verifyPassword, isPasswordBreached } = require('../src/services/passwordService')
const { securityLog } = require('../src/utils/logger')

beforeEach(() => {
  jest.clearAllMocks()
})

describe('hashPassword — Argon2id with server-side pepper', () => {
  it('returns an Argon2id hash string', async () => {
    const hash = await hashPassword('MyTestPassword123!')
    expect(hash).toBe('$argon2id$v=19$mockhash')
    expect(argon2.hash).toHaveBeenCalledTimes(1)
  })

  it('prepends the pepper before hashing', async () => {
    process.env.ARGON2_PEPPER = 'test-pepper-value'
    await hashPassword('mypassword')
    const calledWith = argon2.hash.mock.calls[0][0]
    expect(calledWith).toBe('test-pepper-valuemypassword')
  })
})

describe('verifyPassword — constant-time comparison', () => {
  it('returns true when argon2.verify succeeds', async () => {
    argon2.verify.mockResolvedValue(true)
    const result = await verifyPassword('$argon2id$v=19$mockhash', 'MyTestPassword123!')
    expect(result).toBe(true)
    expect(argon2.verify).toHaveBeenCalledTimes(1)
  })

  it('returns false when argon2.verify returns false', async () => {
    argon2.verify.mockResolvedValue(false)
    const result = await verifyPassword('$argon2id$v=19$mockhash', 'WrongPassword!')
    expect(result).toBe(false)
  })
})

describe('isPasswordBreached — HIBP k-anonymity check', () => {
  it('returns false and logs HIBP_CHECK_FAILED when the network request fails', async () => {
    global.fetch.mockRejectedValue(new Error('Network unavailable'))

    const result = await isPasswordBreached('anypassword')

    expect(result).toBe(false)
    expect(securityLog).toHaveBeenCalledWith('HIBP_CHECK_FAILED', {
      error: 'Network unavailable',
    })
  })

  it('returns false when the password hash suffix is not in the HIBP response', async () => {
    global.fetch.mockResolvedValue({
      text: jest.fn().mockResolvedValue('00000AAAAA:5\r\n00000BBBBB:3'),
    })

    const result = await isPasswordBreached('uniquepasswordnotinhibp')
    expect(result).toBe(false)
  })
})
