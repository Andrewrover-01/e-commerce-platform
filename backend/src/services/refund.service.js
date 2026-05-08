'use strict'

/**
 * RefundService — full refund/return state machine.
 *
 * Allowed transitions:
 *
 *   delivered → refund_requested   (user submits)
 *   refund_requested → refunding   (admin approves)
 *   refund_requested → refund_rejected (admin rejects)
 *   refunding → refunded           (admin completes)
 *
 * On approval   : trigger gateway refund + notify user via SMS
 * On completion : mark order refunded, send SMS confirmation
 * On rejection  : send SMS with reason
 */

const orderRepo = require('../repositories/order.repository')
const productRepo = require('../repositories/product.repository')
const { ORDER_STATUS } = require('../models/order.model')
const AppError = require('../utils/app-error')
const paymentGateway = require('./integrations/payment-gateway.service')
const smsService = require('./integrations/sms.service')
const userRepo = require('../repositories/user.repository')

async function _getUserPhone(userId) {
  const user = await userRepo.findById(userId)
  return user ? user.phone : null
}

class RefundService {
  /**
   * User submits a refund request.
   * Only allowed when order is in DELIVERED status.
   */
  async requestRefund(userId, orderId, { reason, amount } = {}) {
    const order = await orderRepo.findById(orderId)
    if (!order) throw AppError.notFound('订单不存在')
    if (order.userId !== userId) throw AppError.forbidden('无权操作该订单')
    if (order.status !== ORDER_STATUS.DELIVERED) {
      throw AppError.conflict('只有已完成的订单可以申请退款')
    }

    const refundAmount = amount !== undefined
      ? Math.min(Number(amount), order.payAmount)
      : order.payAmount

    const updated = await orderRepo.update(orderId, {
      status: ORDER_STATUS.REFUND_REQUESTED,
      refundReason: reason || '',
      refundAmount,
    })

    // SMS: notify user that request was received
    const phone = await _getUserPhone(userId)
    await smsService.sendTemplate(phone, 'REFUND_REQUESTED', { orderNo: order.orderNo })

    return updated
  }

  /**
   * Admin approves the refund request → moves to REFUNDING.
   * Calls payment gateway refund API.
   */
  async approveRefund(orderId) {
    const order = await orderRepo.findById(orderId)
    if (!order) throw AppError.notFound('订单不存在')
    if (order.status !== ORDER_STATUS.REFUND_REQUESTED) {
      throw AppError.conflict('只有待审核的退款申请可以批准')
    }

    // Trigger gateway refund (non-blocking best-effort; errors logged but not thrown)
    if (order.paymentMethod) {
      try {
        await paymentGateway.refund(order.paymentMethod, {
          outTradeNo: order.orderNo,
          refundAmount: order.refundAmount || order.payAmount,
          reason: order.refundReason || '',
        })
      } catch (err) {
        console.error('[Refund] Gateway refund call failed:', err.message)
      }
    }

    const updated = await orderRepo.update(orderId, { status: ORDER_STATUS.REFUNDING })

    const phone = await _getUserPhone(order.userId)
    await smsService.sendTemplate(phone, 'REFUND_APPROVED', {
      orderNo: order.orderNo,
      amount: order.refundAmount || order.payAmount,
    })

    return updated
  }

  /**
   * Admin rejects the refund request.
   * Order is marked as REFUND_REJECTED so the user can see the outcome clearly.
   */
  async rejectRefund(orderId, rejectReason = '') {
    const order = await orderRepo.findById(orderId)
    if (!order) throw AppError.notFound('订单不存在')
    if (order.status !== ORDER_STATUS.REFUND_REQUESTED) {
      throw AppError.conflict('只有待审核的退款申请可以拒绝')
    }

    const updated = await orderRepo.update(orderId, {
      status: ORDER_STATUS.REFUND_REJECTED,
      refundRejectReason: rejectReason || '',
    })

    const phone = await _getUserPhone(order.userId)
    await smsService.sendTemplate(phone, 'REFUND_REJECTED', {
      orderNo: order.orderNo,
      reason: rejectReason || '不符合退款条件',
    })

    return updated
  }

  /**
   * Admin marks refund as completed (funds actually returned).
   * Restores stock for returned items.
   */
  async completeRefund(orderId) {
    const order = await orderRepo.findById(orderId)
    if (!order) throw AppError.notFound('订单不存在')
    if (order.status !== ORDER_STATUS.REFUNDING) {
      throw AppError.conflict('只有处理中的退款可以完成')
    }

    // Restore physical stock for all order items
    for (const item of order.items || []) {
      const product = await productRepo.findById(item.productId)
      if (!product) continue
      await productRepo.update(product.id, {
        stock: product.stock + item.quantity,
        sales: Math.max(0, (product.sales || 0) - item.quantity),
      })
    }

    const updated = await orderRepo.update(orderId, {
      status: ORDER_STATUS.REFUNDED,
      refundedAt: new Date(),
    })

    const phone = await _getUserPhone(order.userId)
    await smsService.sendTemplate(phone, 'REFUND_COMPLETED', {
      orderNo: order.orderNo,
      amount: order.refundAmount || order.payAmount,
    })

    return updated
  }
}

module.exports = new RefundService()
