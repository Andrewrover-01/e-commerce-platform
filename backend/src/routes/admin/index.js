'use strict'

const { Router } = require('express')
const auth = require('../../middlewares/auth.middleware')
const admin = require('../../middlewares/admin.middleware')

const router = Router()

// Admin auth (no JWT required for login)
router.use('/auth', require('./auth.routes'))

// All routes below require a valid JWT + admin role
router.use(auth, admin)

router.use('/dashboard', require('./dashboard.routes'))
router.use('/products', require('./product.routes'))
router.use('/orders', require('./order.routes'))
router.use('/users', require('./user.routes'))
router.use('/marketing', require('./marketing.routes'))
router.use('/finance', require('./finance.routes'))
router.use('/content', require('./content.routes'))

module.exports = router
