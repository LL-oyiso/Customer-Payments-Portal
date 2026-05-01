const { logger } = require('../utils/logger')

const errorHandler = (err, req, res, next) => {
  logger.error({
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
    ip: req.ip,
  })

  // Never expose internal error details to the client
  res.status(err.status || 500).json({
    error: 'An unexpected error occurred. Please try again.',
  })
}

module.exports = { errorHandler }
