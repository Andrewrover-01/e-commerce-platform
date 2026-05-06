'use strict'

const { Router } = require('express')
const couponController = require('../controllers/coupon.controller')
const auth = require('../middlewares/auth.middleware')
const { optionalAuth } = require('../middlewares/auth.middleware')

const router = Router()

// Public: list active coupons (show discount info to guests too)
router.get('/', optionalAuth, couponController.list.bind(couponController))

// Authenticated: claim a coupon
router.post('/:id/claim', auth, couponController.claim.bind(couponController))

module.exports = router
