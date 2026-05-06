'use strict'

const { Router } = require('express')

const router = Router()

// Public auth endpoints
router.use('/auth', require('./auth.routes'))

// Public product & category endpoints
router.use('/products', require('./product.routes'))
router.use('/categories', require('./category.routes'))

// Authenticated user endpoints
router.use('/user', require('./user.routes'))
router.use('/orders', require('./order.routes'))
router.use('/cart', require('./cart.routes'))

// Admin endpoints (prefixed /admin)
router.use('/admin', require('./admin/index'))

module.exports = router
