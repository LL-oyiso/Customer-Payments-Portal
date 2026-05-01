const { securityLog } = require('../utils/logger')

const requireRole = (role) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required.' })
  }

  if (req.user.role !== role) {
    securityLog('UNAUTHORISED_ACCESS_ATTEMPT', {
      userId: req.user.id,
      userRole: req.user.role,
      requiredRole: role,
      path: req.path,
      ip: req.ip,
    })
    return res.status(403).json({ error: 'Access denied.' })
  }

  next()
}

const requireCustomer = requireRole('CUSTOMER')
const requireStaff = requireRole('STAFF')

module.exports = { requireRole, requireCustomer, requireStaff }
