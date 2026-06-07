require('dotenv').config()
const express = require('express')
const hpp = require('hpp')
const { helmetConfig, corsConfig, generalLimiter } = require('./config/security')
const { errorHandler } = require('./middleware/errorHandler')
const authRoutes = require('./routes/auth')
const transactionRoutes = require('./routes/transactions')

const app = express()

app.set('trust proxy', 1)

app.use(helmetConfig)
app.use(corsConfig)
app.use(hpp())
app.use(generalLimiter)

app.use(express.json({ limit: '100kb' }))
app.use(express.urlencoded({ extended: false, limit: '100kb' }))

app.use('/api/auth', authRoutes)
app.use('/api/transactions', transactionRoutes)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.use((req, res) => {
  res.status(404).json({ error: 'Not found.' })
})

app.use(errorHandler)

module.exports = app
