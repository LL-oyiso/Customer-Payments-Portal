const argon2 = require('argon2')
const crypto = require('crypto')
const https = require('https')

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
// Only sends first 5 chars of SHA-1 hash - password never leaves server
const isPasswordBreached = (password) => {
  return new Promise((resolve) => {
    const sha1 = crypto.createHash('sha1').update(password).digest('hex').toUpperCase()
    const prefix = sha1.slice(0, 5)
    const suffix = sha1.slice(5)

    const options = {
      hostname: 'api.pwnedpasswords.com',
      path: `/range/${prefix}`,
      method: 'GET',
      headers: { 'Add-Padding': 'true' },
    }

    const req = https.request(options, (res) => {
      let data = ''
      res.on('data', (chunk) => { data += chunk })
      res.on('end', () => {
        const found = data.split('\r\n').some((line) => {
          const [hashSuffix] = line.split(':')
          return hashSuffix === suffix
        })
        resolve(found)
      })
    })

    req.on('error', () => resolve(false)) // fail open on network error
    req.end()
  })
}

module.exports = { hashPassword, verifyPassword, isPasswordBreached }
