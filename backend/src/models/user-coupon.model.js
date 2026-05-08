'use strict'

/**
 * UserCoupon model — tracks coupon claims and usage per user.
 *
 * @typedef {Object} UserCoupon
 * @property {string}      id
 * @property {string}      userId
 * @property {string}      couponId
 * @property {string}      couponCode  - Denormalised snapshot
 * @property {string}      couponName  - Denormalised snapshot
 * @property {boolean}     isUsed
 * @property {string|null} usedInOrderId
 * @property {Date}        claimedAt
 * @property {Date|null}   usedAt
 * @property {Date}        createdAt
 * @property {Date}        updatedAt
 */

function createUserCoupon(data) {
  return {
    id: data.id || null,
    userId: data.userId || '',
    couponId: data.couponId || '',
    couponCode: data.couponCode || '',
    couponName: data.couponName || '',
    isUsed: data.isUsed !== undefined ? Boolean(data.isUsed) : false,
    usedInOrderId: data.usedInOrderId || null,
    claimedAt: data.claimedAt || new Date(),
    usedAt: data.usedAt || null,
    createdAt: data.createdAt || new Date(),
    updatedAt: data.updatedAt || new Date(),
  }
}

module.exports = { createUserCoupon }
