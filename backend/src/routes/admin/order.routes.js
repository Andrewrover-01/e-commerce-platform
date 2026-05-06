'use strict'

const { Router } = require('express')
const orderController = require('../../controllers/admin/order.controller')

const router = Router()

router.get('/', orderController.getList.bind(orderController))
router.get('/refunds', orderController.getRefundList.bind(orderController))
router.get('/:id', orderController.getById.bind(orderController))
router.patch('/:id/status', orderController.updateStatus.bind(orderController))
router.post('/:id/refund', orderController.handleRefund.bind(orderController))

module.exports = router
