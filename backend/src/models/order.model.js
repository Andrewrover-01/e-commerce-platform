'use strict'

/**
 * Order model schema definition.
 *
 * @typedef {Object} OrderItem
 * @property {string} productId
 * @property {string} productName
 * @property {string} productImage
 * @property {number} price
 * @property {number} quantity
 *
 * @typedef {Object} Order
 * @property {string}      id
 * @property {string}      orderNo       - Human-readable order number
 * @property {string}      userId
 * @property {OrderItem[]} items
 * @property {number}      totalAmount
 * @property {number}      discountAmount
 * @property {number}      payAmount      - totalAmount - discountAmount
 * @property {string}      status         - 'pending_payment' | 'paid' | 'shipped' | 'delivered' | 'cancelled' | 'refunding' | 'refunded'
 * @property {Object}      address        - Snapshot of shipping address at order time
 * @property {string|null} couponId
 * @property {string|null} paymentMethod  - 'alipay' | 'wechat' | 'creditcard' | null
 * @property {Date|null}   paidAt
 * @property {Date|null}   shippedAt
 * @property {Date|null}   deliveredAt
 * @property {string}      remark
 * @property {Date}        createdAt
 * @property {Date}        updatedAt
 */

const ORDER_STATUS = {
  PENDING_PAYMENT: 'pending_payment',
  PAID: 'paid',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REFUND_REQUESTED: 'refund_requested',
  REFUNDING: 'refunding',
  REFUNDED: 'refunded',
  REFUND_REJECTED: 'refund_rejected',
}

function createOrder(data) {
  return {
    id: data.id || null,
    orderNo: data.orderNo || '',
    userId: data.userId || '',
    items: data.items || [],
    totalAmount: Number(data.totalAmount) || 0,
    discountAmount: Number(data.discountAmount) || 0,
    payAmount: Number(data.payAmount) || 0,
    status: data.status || ORDER_STATUS.PENDING_PAYMENT,
    address: data.address || {},
    couponId: data.couponId || null,
    paymentMethod: data.paymentMethod || null,
    paidAt: data.paidAt || null,
    shippedAt: data.shippedAt || null,
    deliveredAt: data.deliveredAt || null,
    trackingNo: data.trackingNo || null,
    refundReason: data.refundReason || null,
    refundAmount: data.refundAmount !== undefined ? Number(data.refundAmount) : null,
    refundedAt: data.refundedAt || null,
    cancelReason: data.cancelReason || null,
    cancelledAt: data.cancelledAt || null,
    remark: data.remark || '',
    createdAt: data.createdAt || new Date(),
    updatedAt: data.updatedAt || new Date(),
  }
}

module.exports = { createOrder, ORDER_STATUS }
