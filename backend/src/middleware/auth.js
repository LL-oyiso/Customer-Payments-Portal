const jwt = require('jsonwebtoken')
const { securityLog } = require('../utils/logger')

const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization']

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required.' })
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (err) {
    securityLog('INVALID_TOKEN', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      error: err.message,
    })
    return res.status(401).json({ error: 'Invalid or expired token.' })
  }
}

module.exports = { authenticate }
