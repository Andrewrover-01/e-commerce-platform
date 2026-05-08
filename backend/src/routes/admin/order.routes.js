'use strict'

const { Router } = require('express')
const orderController = require('../../controllers/admin/order.controller')

const router = Router()

router.get('/', orderController.getList.bind(orderController))
router.get('/refunds', orderController.getRefundList.bind(orderController))
router.get('/:id', orderController.getById.bind(orderController))
router.patch('/:id/status', orderController.updateStatus.bind(orderController))
router.post('/:id/ship', orderController.ship.bind(orderController))
router.post('/:id/complete', orderController.complete.bind(orderController))
router.post('/:id/cancel', orderController.cancel.bind(orderController))
// Refund state machine
router.post('/:id/refund/approve', orderController.approveRefund.bind(orderController))
router.post('/:id/refund/reject', orderController.rejectRefund.bind(orderController))
router.post('/:id/refund/complete', orderController.completeRefund.bind(orderController))
// Logistics tracking
router.get('/:id/tracking', orderController.getTracking.bind(orderController))

module.exports = router
