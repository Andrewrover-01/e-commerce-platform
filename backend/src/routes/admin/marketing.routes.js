'use strict'

const { Router } = require('express')
const marketingController = require('../../controllers/admin/marketing.controller')

const router = Router()

// Coupons
router.get('/coupons', marketingController.getCouponList.bind(marketingController))
router.post('/coupons', marketingController.createCoupon.bind(marketingController))
router.put('/coupons/:id', marketingController.updateCoupon.bind(marketingController))
router.delete('/coupons/:id', marketingController.deleteCoupon.bind(marketingController))

// Activities
router.get('/activities', marketingController.getActivityList.bind(marketingController))

module.exports = router
