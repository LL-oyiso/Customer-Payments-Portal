const { PrismaClient } = require('@prisma/client')
const { body } = require('express-validator')
const { securityLog } = require('../utils/logger')
const { validate, ALLOWED_PROVIDERS } = require('../utils/validators')

const prisma = new PrismaClient()

// Validation rules for creating a transaction
const transactionValidation = [
  body('amount').custom((val) => {
    if (!validate.amount(val)) throw new Error('Invalid amount. Must be a positive number with up to 2 decimal places.')
    return true
  }),
  body('currency').trim().custom((val) => {
    if (!validate.currency(val)) throw new Error('Invalid currency code. Must be a valid ISO 4217 code.')
    return true
  }),
  body('provider').trim().custom((val) => {
    if (!validate.provider(val)) throw new Error(`Invalid provider. Allowed: ${ALLOWED_PROVIDERS.join(', ')}.`)
    return true
  }),
  body('payeeAccount').trim().custom((val) => {
    if (!validate.payeeAccount(val)) throw new Error('Invalid payee account number.')
    return true
  }),
  body('payeeSwiftCode').trim().toUpperCase().custom((val) => {
    if (!validate.swiftCode(val)) throw new Error('Invalid SWIFT/BIC code format.')
    return true
  }),
]

// Customer: get own transactions
const getMyTransactions = async (req, res, next) => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: { customerId: req.user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, amount: true, currency: true, provider: true,
        payeeAccount: true, payeeSwiftCode: true, status: true,
        createdAt: true, submittedAt: true,
      },
    })
    res.json({ transactions })
  } catch (err) {
    next(err)
  }
}

// Customer: create a new transaction
const createTransaction = async (req, res, next) => {
  try {
    const { amount, currency, provider, payeeAccount, payeeSwiftCode } = req.body

    const transaction = await prisma.transaction.create({
      data: {
        customerId: req.user.id,
        amount: parseFloat(amount),
        currency,
        provider,
        payeeAccount,
        payeeSwiftCode,
        status: 'PENDING',
      },
    })

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'CREATE_TRANSACTION',
        entityType: 'TRANSACTION',
        entityId: transaction.id,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        success: true,
      },
    })

    res.status(201).json({ message: 'Payment submitted successfully.', transactionId: transaction.id })
  } catch (err) {
    next(err)
  }
}

// Staff: get all actionable transactions (PENDING awaiting verify, VERIFIED awaiting SWIFT submission)
const getPendingTransactions = async (req, res, next) => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: { status: { in: ['PENDING', 'VERIFIED'] } },
      orderBy: { createdAt: 'asc' },
      include: {
        customer: {
          select: { fullName: true, accountNumber: true },
        },
      },
    })
    res.json({ transactions })
  } catch (err) {
    next(err)
  }
}

// Staff: verify a transaction
const verifyTransaction = async (req, res, next) => {
  try {
    const { id } = req.params

    const transaction = await prisma.transaction.findUnique({ where: { id } })

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found.' })
    }

    if (transaction.status !== 'PENDING') {
      return res.status(400).json({ error: 'Transaction is not in PENDING status.' })
    }

    const updated = await prisma.transaction.update({
      where: { id },
      data: { status: 'VERIFIED', verifiedById: req.user.id },
    })

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'VERIFY_TRANSACTION',
        entityType: 'TRANSACTION',
        entityId: id,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        success: true,
      },
    })

    securityLog('TRANSACTION_VERIFIED', { staffId: req.user.id, transactionId: id, ip: req.ip })

    res.json({ message: 'Transaction verified.', transaction: updated })
  } catch (err) {
    next(err)
  }
}

// Staff: submit to SWIFT (end of dev scope)
const submitToSwift = async (req, res, next) => {
  try {
    const { id } = req.params

    const transaction = await prisma.transaction.findUnique({ where: { id } })

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found.' })
    }

    if (transaction.status !== 'VERIFIED') {
      return res.status(400).json({ error: 'Transaction must be VERIFIED before submitting to SWIFT.' })
    }

    const updated = await prisma.transaction.update({
      where: { id },
      data: { status: 'SUBMITTED', submittedAt: new Date() },
    })

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'SUBMIT_TO_SWIFT',
        entityType: 'TRANSACTION',
        entityId: id,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        success: true,
        detail: `SWIFT code: ${transaction.payeeSwiftCode}`,
      },
    })

    securityLog('TRANSACTION_SUBMITTED_TO_SWIFT', { staffId: req.user.id, transactionId: id, ip: req.ip })

    res.json({ message: 'Transaction submitted to SWIFT successfully.', transaction: updated })
  } catch (err) {
    next(err)
  }
}

module.exports = {
  getMyTransactions,
  createTransaction,
  getPendingTransactions,
  verifyTransaction,
  submitToSwift,
  transactionValidation,
}
