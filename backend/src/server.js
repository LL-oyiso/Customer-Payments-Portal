require('dotenv').config()
const https = require('https')
const http = require('http')
const fs = require('fs')
const path = require('path')
const express = require('express')
const hpp = require('hpp')
const { helmetConfig, corsConfig, generalLimiter } = require('./config/security')
const { errorHandler } = require('./middleware/errorHandler')
const { logger } = require('./utils/logger')
const authRoutes = require('./routes/auth')
const transactionRoutes = require('./routes/transactions')

const app = express()

// Trust proxy (for correct IP behind reverse proxy)
app.set('trust proxy', 1)

// Security middleware
app.use(helmetConfig)
app.use(corsConfig)
app.use(hpp())
app.use(generalLimiter)

// Body parsing with strict size limits
app.use(express.json({ limit: '100kb' }))
app.use(express.urlencoded({ extended: false, limit: '100kb' }))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/transactions', transactionRoutes)

// Health check (no auth required)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found.' })
})

// Global error handler
app.use(errorHandler)

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
http.createServer((req, res) => {
  res.writeHead(301, { Location: `https://${req.headers.host.split(':')[0]}:${HTTPS_PORT}${req.url}` })
  res.end()
}).listen(HTTP_PORT, () => {
  logger.info(`HTTP redirect server running on port ${HTTP_PORT}`)
})
