require('dotenv').config()
const https = require('node:https')
const http = require('node:http')
const fs = require('node:fs')
const path = require('node:path')
const app = require('./app')
const { logger } = require('./utils/logger')

// TLS configuration - strong ciphers with Perfect Forward Secrecy only
const tlsOptions = {
  key: fs.readFileSync(path.join(__dirname, '../certs/server.key')),
  cert: fs.readFileSync(path.join(__dirname, '../certs/server.crt')),
  minVersion: 'TLSv1.2',
  ciphers: [
    'ECDHE-ECDSA-AES256-GCM-SHA384',
    'ECDHE-RSA-AES256-GCM-SHA384',
    'ECDHE-ECDSA-AES128-GCM-SHA256',
    'ECDHE-RSA-AES128-GCM-SHA256',
    'ECDHE-ECDSA-CHACHA20-POLY1305',
    'ECDHE-RSA-CHACHA20-POLY1305',
  ].join(':'),
  honorCipherOrder: true,
}

const HTTPS_PORT = process.env.PORT || 5000
const HTTP_PORT = process.env.HTTP_REDIRECT_PORT || 5001

// HTTPS server
https.createServer(tlsOptions, app).listen(HTTPS_PORT, () => {
  logger.info(`HTTPS server running on port ${HTTPS_PORT}`)
})

// HTTP redirect server - redirect all HTTP to HTTPS
// Host header is not trusted; redirect target uses server-configured hostname only
const REDIRECT_HOST = process.env.REDIRECT_HOST || 'localhost'

http.createServer((req, res) => {
  // Allow only safe relative paths: no protocol, no double slashes, no control chars
  const rawPath = req.url || '/'
  const safePath = /^\/[^\s]*$/.test(rawPath) ? rawPath : '/'
  res.writeHead(301, { Location: `https://${REDIRECT_HOST}:${HTTPS_PORT}${safePath}` })
  res.end()
}).listen(HTTP_PORT, () => {
  logger.info(`HTTP redirect server running on port ${HTTP_PORT}`)
})
