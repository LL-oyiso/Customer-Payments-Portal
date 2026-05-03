// Whitelist regex patterns - only allow known-good characters
// Reject-not-sanitize philosophy: if it doesn't match, it's rejected

const PATTERNS = {
  // Full name: letters, spaces, hyphens, apostrophes only
  fullName: /^[a-zA-Z\s'-]{2,100}$/,

  // South African ID number: exactly 13 digits, not all zeros, first 6 = YYMMDD
  idNumber: /^(?!0{13})\d{13}$/,

  // SA bank account number: 7 to 11 digits
  accountNumber: /^\d{7,11}$/,

  // Username: alphanumeric and underscore, 3-30 chars
  username: /^[a-zA-Z0-9_]{3,30}$/,

  // Password: minimum 12 chars, max 128 (complexity enforced by zxcvbn)
  password: /^.{12,128}$/,

  // Amount: positive decimal with up to 2 decimal places
  amount: /^\d{1,12}(\.\d{1,2})?$/,

  // ISO 4217 currency code: exactly 3 uppercase letters
  currency: /^[A-Z]{3}$/,

  // ISO 9362 SWIFT/BIC code: 8 or 11 characters
  swiftCode: /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/,

  // Payee account: IBAN-compatible, 1-34 alphanumeric chars
  payeeAccount: /^[A-Z0-9]{1,34}$/,

  // Provider name: letters, spaces, hyphens
  provider: /^[a-zA-Z\s-]{2,50}$/,
}

// ISO 4217 allowed currency codes (subset of most common)
const ALLOWED_CURRENCIES = [
  'USD', 'EUR', 'GBP', 'ZAR', 'JPY', 'CNY', 'AUD', 'CAD', 'CHF',
  'HKD', 'SGD', 'SEK', 'NOK', 'DKK', 'NZD', 'MXN', 'BRL', 'INR',
  'KRW', 'TRY', 'RUB', 'AED', 'SAR', 'NGN', 'KES', 'GHS', 'EGP',
]

const ALLOWED_PROVIDERS = ['SWIFT']

const validate = {
  fullName: (val) => PATTERNS.fullName.test(val),
  idNumber: (val) => PATTERNS.idNumber.test(val) && val !== '0000000000000',
  accountNumber: (val) => PATTERNS.accountNumber.test(val),
  username: (val) => PATTERNS.username.test(val),
  password: (val) => PATTERNS.password.test(val),
  amount: (val) => PATTERNS.amount.test(String(val)) && parseFloat(val) > 0,
  currency: (val) => PATTERNS.currency.test(val) && ALLOWED_CURRENCIES.includes(val),
  swiftCode: (val) => PATTERNS.swiftCode.test(val),
  payeeAccount: (val) => PATTERNS.payeeAccount.test(val),
  provider: (val) => ALLOWED_PROVIDERS.includes(val),
}

module.exports = { PATTERNS, ALLOWED_CURRENCIES, ALLOWED_PROVIDERS, validate }
