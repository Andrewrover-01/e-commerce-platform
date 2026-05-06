'use strict'

const orderRepo = require('../repositories/order.repository')
const productRepo = require('../repositories/product.repository')
const { ORDER_STATUS } = require('../models/order.model')
const AppError = require('../utils/app-error')

// Supported payment methods
const PAYMENT_METHODS = ['alipay', 'wechat', 'creditcard']

class PaymentService {
  /**
   * Initiate payment for a pending order.
   * In a real system this would call a payment gateway and return a pay URL / QR code.
   * Here we return a simulated payment token immediately.
   *
   * @param {string} userId
   * @param {string} orderId
   * @param {string} paymentMethod
   * @returns {Promise<{ orderNo: string, payAmount: number, paymentToken: string }>}
   */
  async initiate(userId, orderId, paymentMethod) {
    if (!PAYMENT_METHODS.includes(paymentMethod)) {
      throw AppError.badRequest(`不支持的支付方式，请选择: ${PAYMENT_METHODS.join(', ')}`)
    }

    const order = await orderRepo.findById(orderId)
    if (!order) throw AppError.notFound('订单不存在')
    if (order.userId !== userId) throw AppError.forbidden('无权操作该订单')
    if (order.status !== ORDER_STATUS.PENDING_PAYMENT) {
      throw AppError.badRequest('订单状态不允许支付')
    }

    // Update order with chosen payment method
    await orderRepo.update(orderId, { paymentMethod })

    // Simulate a payment token (in production this comes from the gateway)
    const paymentToken = Buffer.from(`${orderId}:${Date.now()}`).toString('base64')

    return {
      orderNo: order.orderNo,
      payAmount: order.payAmount,
      paymentMethod,
      paymentToken,
    }
  }

  /**
   * Handle payment gateway callback (notify).
   * Verifies the token, marks the order as PAID.
   * In production: verify signature from gateway, idempotent processing.
   *
   * @param {{ orderNo: string, paymentToken: string, status: string }} payload
   * @returns {Promise<Object>} Updated order
   */
  async handleNotify(payload) {
    const { orderNo, paymentToken, status } = payload

    if (!orderNo || !paymentToken) throw AppError.badRequest('回调参数缺失')

    // Decode and validate token (simplified)
    let orderId
    try {
      const decoded = Buffer.from(paymentToken, 'base64').toString('utf8')
      orderId = decoded.split(':')[0]
    } catch (_) {
      throw AppError.badRequest('无效的支付凭证')
    }

    const order = await orderRepo.findById(orderId)
    if (!order) throw AppError.notFound('订单不存在')
    if (order.orderNo !== orderNo) throw AppError.badRequest('订单号不匹配')

    // If already paid, return idempotently
    if (order.status === ORDER_STATUS.PAID) return order

    if (status === 'success') {
      return orderRepo.update(orderId, {
        status: ORDER_STATUS.PAID,
        paidAt: new Date(),
      })
    }

    // Payment failed — restore stock (cancelled by gateway)
    if (status === 'failed') {
      for (const item of order.items) {
        const product = await productRepo.findById(item.productId)
        if (product) {
          await productRepo.update(product.id, {
            stock: product.stock + item.quantity,
            sales: Math.max(0, product.sales - item.quantity),
          })
        }
      }
      return orderRepo.update(orderId, { status: ORDER_STATUS.CANCELLED })
    }

    throw AppError.badRequest(`未知的支付状态: ${status}`)
  }
}

module.exports = new PaymentService()
