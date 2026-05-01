const { createLogger, format, transports } = require('winston')
const { combine, timestamp, json, errors } = format

const logger = createLogger({
  level: 'info',
  format: combine(
    timestamp(),
    errors({ stack: true }),
    json()
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'logs/security.log' }),
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
  ],
})

const securityLog = (action, details = {}) => {
  logger.warn({
    type: 'SECURITY_EVENT',
    action,
    ...details,
  })
}

module.exports = { logger, securityLog }
