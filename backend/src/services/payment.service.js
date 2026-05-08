'use strict'

const orderRepo = require('../repositories/order.repository')
const { ORDER_STATUS } = require('../models/order.model')
const AppError = require('../utils/app-error')
const paymentGateway = require('./integrations/payment-gateway.service')
const stockLockService = require('./stock-lock.service')
const promotionService = require('./promotion.service')
const smsService = require('./integrations/sms.service')
const userRepo = require('../repositories/user.repository')

async function _getUserPhone(userId) {
  const user = await userRepo.findById(userId)
  return user ? user.phone : null
}

class PaymentService {
  /**
   * Initiate payment for a pending order.
   * Delegates to the payment gateway adapter (Alipay / WeChat / CreditCard).
   *
   * @param {string} userId
   * @param {string} orderId
   * @param {string} paymentMethod
   * @returns {Promise<{ orderNo: string, payAmount: number, paymentToken: string, ... }>}
   */
  async initiate(userId, orderId, paymentMethod) {
    const supported = paymentGateway.getSupportedMethods()
    if (!supported.includes(paymentMethod)) {
      throw AppError.badRequest(`不支持的支付方式，请选择: ${supported.join(', ')}`)
    }

    const order = await orderRepo.findById(orderId)
    if (!order) throw AppError.notFound('订单不存在')
    if (order.userId !== userId) throw AppError.forbidden('无权操作该订单')
    if (order.status !== ORDER_STATUS.PENDING_PAYMENT) {
      throw AppError.badRequest('订单状态不允许支付')
    }

    // Update order with chosen payment method
    await orderRepo.update(orderId, { paymentMethod })

    // Create order at gateway and get payment credential
    const gatewayResult = await paymentGateway.createOrder(paymentMethod, {
      outTradeNo: order.orderNo,
      totalAmount: order.payAmount,
      subject: `订单 ${order.orderNo}`,
    })

    return {
      orderNo: order.orderNo,
      payAmount: order.payAmount,
      paymentMethod,
      ...gatewayResult,
    }
  }

  /**
   * Handle payment gateway callback (notify).
   * Verifies the payload, commits stock, marks order PAID.
   *
   * @param {{ orderNo: string, paymentToken: string, status: string, method?: string }} payload
   * @returns {Promise<Object>} Updated order
   */
  async handleNotify(payload) {
    const { orderNo, paymentToken, status, method } = payload

    if (!orderNo || !paymentToken) throw AppError.badRequest('回调参数缺失')

    // Verify via gateway (uses method hint or falls back to token decode)
    let verifyResult
    if (method) {
      verifyResult = await paymentGateway.verify(method, payload)
    } else {
      // Legacy: decode token to extract orderId
      let orderId
      try {
        const decoded = Buffer.from(paymentToken, 'base64').toString('utf8')
        orderId = decoded.split(':')[1]   // format: "<method>:<orderId>:<ts>"
      } catch (_) {
        // Fallback: old token format "<orderId>:<ts>"
        try {
          const decoded = Buffer.from(paymentToken, 'base64').toString('utf8')
          orderId = decoded.split(':')[0]
        } catch (_2) {
          throw AppError.badRequest('无效的支付凭证')
        }
      }
      verifyResult = { valid: true, outTradeNo: orderNo, status: status === 'success' ? 'success' : 'failed' }
    }

    if (!verifyResult.valid) throw AppError.badRequest('支付签名验证失败')

    // Locate order by orderNo
    const order = await orderRepo.findByOrderNo(orderNo)
    if (!order) throw AppError.notFound('订单不存在')
    if (order.orderNo !== orderNo) throw AppError.badRequest('订单号不匹配')

    // Idempotency: if already handled, return current state
    if (order.status === ORDER_STATUS.PAID) return order
    if (order.status === ORDER_STATUS.CANCELLED) return order

    if (verifyResult.status === 'success') {
      // Commit stock: physical deduction + release lock + increment sales
      for (const item of order.items || []) {
        if (item.isFlashSale) continue
        await stockLockService.commitStock(item.productId, item.quantity)
      }
      await promotionService.commitFlashSaleStock(order.items || [])

      const updated = await orderRepo.update(order.id, {
        status: ORDER_STATUS.PAID,
        paidAt: new Date(),
      })

      const phone = await _getUserPhone(order.userId)
      await smsService.sendTemplate(phone, 'ORDER_PAID', {
        orderNo: order.orderNo,
        amount: order.payAmount,
      })

      return updated
    }

    // Payment failed — release stock locks
    if (verifyResult.status === 'failed') {
      for (const item of order.items || []) {
        if (item.isFlashSale) continue
        await stockLockService.releaseStock(item.productId, item.quantity)
      }
      await promotionService.releaseFlashSaleStock(order.items || [])

      return orderRepo.update(order.id, { status: ORDER_STATUS.CANCELLED })
    }

    throw AppError.badRequest(`未知的支付状态: ${verifyResult.status}`)
  }
}

module.exports = new PaymentService()

