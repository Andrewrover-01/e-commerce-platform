'use strict'

/**
 * Coupon model schema definition.
 *
 * @typedef {Object} Coupon
 * @property {string}  id
 * @property {string}  code          - Unique coupon code
 * @property {string}  name
 * @property {string}  type          - 'fixed' | 'percent'
 * @property {number}  value         - Amount off (fixed) or percent off (percent)
 * @property {number}  minOrderAmount - Minimum order to use coupon
 * @property {number}  totalQuantity  - Total issued (-1 = unlimited)
 * @property {number}  usedQuantity
 * @property {Date}    startAt
 * @property {Date}    endAt
 * @property {boolean} isActive
 * @property {Date}    createdAt
 * @property {Date}    updatedAt
 */

const COUPON_TYPE = {
  FIXED: 'fixed',
  PERCENT: 'percent',
}

function createCoupon(data) {
  return {
    id: data.id || null,
    code: data.code || '',
    name: data.name || '',
    type: data.type || COUPON_TYPE.FIXED,
    value: Number(data.value) || 0,
    minOrderAmount: Number(data.minOrderAmount) || 0,
    totalQuantity: Number(data.totalQuantity) || -1,
    usedQuantity: Number(data.usedQuantity) || 0,
    startAt: data.startAt || new Date(),
    endAt: data.endAt || new Date(),
    isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
    createdAt: data.createdAt || new Date(),
    updatedAt: data.updatedAt || new Date(),
  }
}

module.exports = { createCoupon, COUPON_TYPE }
