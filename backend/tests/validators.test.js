/**
 * Validator Unit Tests
 *
 * Proves that every whitelist rule correctly accepts valid input
 * and rejects malformed input — server-side enforcement independent of the client.
 */

const { validate } = require('../src/utils/validators')

describe('validate.amount — positive decimal guard (two conditions)', () => {
  it('accepts a valid positive decimal amount', () => {
    expect(validate.amount(100.50)).toBe(true)
  })

  it('accepts a whole number amount', () => {
    expect(validate.amount(5000)).toBe(true)
  })

  it('rejects zero — passes format check but fails > 0 guard', () => {
    expect(validate.amount(0)).toBe(false)
  })

  it('rejects a negative amount', () => {
    expect(validate.amount(-99.99)).toBe(false)
  })

  it('rejects a non-numeric string', () => {
    expect(validate.amount('abc')).toBe(false)
  })
})

describe('validate.currency — must be in ISO 4217 allowed list', () => {
  it('accepts a valid currency code', () => {
    expect(validate.currency('USD')).toBe(true)
  })

  it('accepts ZAR (South African Rand)', () => {
    expect(validate.currency('ZAR')).toBe(true)
  })

  it('rejects a code not in the allowed list', () => {
    expect(validate.currency('XYZ')).toBe(false)
  })

  it('rejects lowercase currency codes', () => {
    expect(validate.currency('usd')).toBe(false)
  })
})

describe('validate.username — \\w pattern (alphanumeric + underscore)', () => {
  it('accepts alphanumeric username', () => {
    expect(validate.username('john_doe')).toBe(true)
  })

  it('rejects username with spaces', () => {
    expect(validate.username('john doe')).toBe(false)
  })

  it('rejects too-short username (under 3 chars)', () => {
    expect(validate.username('ab')).toBe(false)
  })

  it('rejects username with special characters', () => {
    expect(validate.username('user@name!')).toBe(false)
  })
})

describe('validate.swiftCode — ISO 9362 format', () => {
  it('accepts a valid 8-character SWIFT code', () => {
    expect(validate.swiftCode('ABCDZAJJ')).toBe(true)
  })

  it('accepts a valid 11-character SWIFT code with branch', () => {
    expect(validate.swiftCode('ABCDZAJJXXX')).toBe(true)
  })

  it('rejects a SWIFT code with lowercase letters', () => {
    expect(validate.swiftCode('abcdzajj')).toBe(false)
  })
})
