'use strict'

const { Router } = require('express')
const orderController = require('../controllers/order.controller')
const paymentController = require('../controllers/payment.controller')
const auth = require('../middlewares/auth.middleware')
const { sensitiveWordFilter } = require('../middlewares/sensitive-word.middleware')

const router = Router()

router.use(auth)

router.get('/', orderController.getList.bind(orderController))
// Filter the 'remark' field on order creation
router.post('/', sensitiveWordFilter(), orderController.create.bind(orderController))
router.get('/:id', orderController.getById.bind(orderController))
router.post('/:id/cancel', orderController.cancel.bind(orderController))
// Initiate payment for an order
router.post('/:id/pay', paymentController.initiate.bind(paymentController))

module.exports = router
