'use strict'

const paymentService = require('../services/payment.service')

class PaymentController {
  /**
   * POST /orders/:id/pay
   * Body: { paymentMethod: 'alipay' | 'wechat' | 'creditcard' }
   */
  async initiate(req, res, next) {
    try {
      const result = await paymentService.initiate(
        req.user.id,
        req.params.id,
        req.body.paymentMethod
      )
      res.json({ code: 200, message: '支付发起成功', data: result })
    } catch (err) {
      next(err)
    }
  }

  /**
   * POST /payments/notify
   * Body: { orderNo, paymentToken, status: 'success' | 'failed' }
   * This endpoint simulates the payment-gateway async callback.
   */
  async notify(req, res, next) {
    try {
      const order = await paymentService.handleNotify(req.body)
      res.json({ code: 200, message: '回调处理成功', data: { orderId: order.id, status: order.status } })
    } catch (err) {
      next(err)
    }
  }
}

module.exports = new PaymentController()
