const express = require('express')
const router = express.Router()
const { authenticate } = require('../middleware/auth')
const { requireCustomer, requireStaff } = require('../middleware/rbac')
const { handleValidation } = require('../middleware/validate')
const {
  getMyTransactions,
  createTransaction,
  getPendingTransactions,
  verifyTransaction,
  submitToSwift,
  transactionValidation,
} = require('../controllers/transactionController')

// Customer routes
router.get('/', authenticate, requireCustomer, getMyTransactions)
router.post('/', authenticate, requireCustomer, transactionValidation, handleValidation, createTransaction)

// Staff routes
router.get('/pending', authenticate, requireStaff, getPendingTransactions)
router.patch('/:id/verify', authenticate, requireStaff, verifyTransaction)
router.post('/:id/submit-to-swift', authenticate, requireStaff, submitToSwift)

module.exports = router
