const express = require('express')
const router = express.Router()
const { authLimiter } = require('../config/security')
const { handleValidation } = require('../middleware/validate')
const { authenticate } = require('../middleware/auth')
const {
  register, login, refresh, logout,
  registerValidation, loginValidation,
} = require('../controllers/authController')

router.post('/register', authLimiter, registerValidation, handleValidation, register)
router.post('/login', authLimiter, loginValidation, handleValidation, login)
router.post('/refresh', refresh)
router.post('/logout', authenticate, logout)

module.exports = router
