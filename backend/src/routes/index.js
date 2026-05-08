'use strict'

const { Router } = require('express')

const router = Router()

// Public auth endpoints
router.use('/auth', require('./auth.routes'))

// Public product & category endpoints
router.use('/products', require('./product.routes'))
router.use('/categories', require('./category.routes'))

// Coupon endpoints (public list + authenticated claim)
router.use('/coupons', require('./coupon.routes'))

// Authenticated user endpoints
router.use('/user', require('./user.routes'))
router.use('/orders', require('./order.routes'))
router.use('/cart', require('./cart.routes'))

// Payment gateway callback (no auth — gateway calls this)
router.use('/payments', require('./payment.routes'))

// Admin endpoints (prefixed /admin)
router.use('/admin', require('./admin/index'))

module.exports = router
