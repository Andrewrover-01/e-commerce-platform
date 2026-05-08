'use strict'

const { Router } = require('express')
const marketingController = require('../../controllers/admin/marketing.controller')

const router = Router()

// Coupons
router.get('/coupons', marketingController.getCouponList.bind(marketingController))
router.post('/coupons', marketingController.createCoupon.bind(marketingController))
router.put('/coupons/:id', marketingController.updateCoupon.bind(marketingController))
router.delete('/coupons/:id', marketingController.deleteCoupon.bind(marketingController))

// Promotions (满减 / 折扣 / 秒杀)
router.get('/promotions', marketingController.getPromotionList.bind(marketingController))
router.get('/promotions/:id', marketingController.getPromotionById.bind(marketingController))
router.post('/promotions', marketingController.createPromotion.bind(marketingController))
router.put('/promotions/:id', marketingController.updatePromotion.bind(marketingController))
router.delete('/promotions/:id', marketingController.deletePromotion.bind(marketingController))

module.exports = router
