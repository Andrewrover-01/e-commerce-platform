'use strict'

const refundService = require('../services/refund.service')

class RefundController {
  async requestRefund(req, res, next) {
    try {
      const order = await refundService.requestRefund(req.user.id, req.params.orderId, req.body)
      res.json({ code: 200, message: '退款申请已提交', data: order })
    } catch (err) { next(err) }
  }
}

module.exports = new RefundController()
