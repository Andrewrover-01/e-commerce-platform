'use strict'

const { Router } = require('express')
const userController = require('../controllers/user.controller')
const addressController = require('../controllers/address.controller')
const couponController = require('../controllers/coupon.controller')
const auth = require('../middlewares/auth.middleware')

const router = Router()

router.use(auth)

// Profile
router.get('/profile', userController.getProfile.bind(userController))
router.put('/profile', userController.updateProfile.bind(userController))

// Addresses
router.get('/addresses', addressController.list.bind(addressController))
router.post('/addresses', addressController.add.bind(addressController))
router.put('/addresses/:id', addressController.update.bind(addressController))
router.delete('/addresses/:id', addressController.remove.bind(addressController))
router.patch('/addresses/:id/default', addressController.setDefault.bind(addressController))

// User's claimed coupons
router.get('/coupons', couponController.userCoupons.bind(couponController))

module.exports = router
