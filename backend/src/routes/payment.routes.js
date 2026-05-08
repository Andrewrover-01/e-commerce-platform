'use strict'

const { Router } = require('express')
const paymentController = require('../controllers/payment.controller')

const router = Router()

/**
 * POST /payments/notify
 * Payment-gateway async callback — no auth required (gateway calls this directly).
 * In production: verify a gateway-provided HMAC/signature before processing.
 */
router.post('/notify', paymentController.notify.bind(paymentController))

module.exports = router
