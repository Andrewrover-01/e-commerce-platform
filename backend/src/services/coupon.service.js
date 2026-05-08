'use strict'

const couponRepo = require('../repositories/coupon.repository')
const userCouponRepo = require('../repositories/user-coupon.repository')
const { COUPON_TYPE } = require('../models/coupon.model')
const AppError = require('../utils/app-error')

class CouponService {
  async getActiveCoupons() {
    return couponRepo.findActive()
  }

  /**
   * Claim a coupon for a user.
   * @param {string} userId
   * @param {string} couponId
   * @returns {Promise<Object>} The created UserCoupon record.
   */
  async claimCoupon(userId, couponId) {
    const coupon = await couponRepo.findById(couponId)
    if (!coupon) throw AppError.notFound('优惠券不存在')
    if (!coupon.isActive) throw AppError.badRequest('优惠券已失效')

    const now = new Date()
    if (now < coupon.startAt || now > coupon.endAt) throw AppError.badRequest('优惠券不在有效期内')
    if (coupon.totalQuantity !== -1 && coupon.usedQuantity >= coupon.totalQuantity) {
      throw AppError.badRequest('优惠券已被领完')
    }

    // Check if already claimed
    const existing = await userCouponRepo.findByUserAndCoupon(userId, couponId)
    if (existing) throw AppError.conflict('您已领取过该优惠券')

    const userCoupon = await userCouponRepo.create({
      userId,
      couponId: coupon.id,
      couponCode: coupon.code,
      couponName: coupon.name,
      isUsed: false,
      usedInOrderId: null,
      claimedAt: new Date(),
    })

    return userCoupon
  }

  /**
   * Get all coupons claimed by a user.
   * @param {string} userId
   * @returns {Promise<Object[]>}
   */
  async getUserCoupons(userId) {
    return userCouponRepo.findByUser(userId)
  }

  /**
   * Validate a coupon code against an order total.
   * Returns the coupon record and discount amount.
   * @param {string} code
   * @param {number} orderAmount
   * @returns {Promise<{ coupon: Object, discount: number }>}
   */
  async validateCoupon(code, orderAmount) {
    const coupon = await couponRepo.findByCode(code)
    if (!coupon) throw new Error('优惠券不存在')
    if (!coupon.isActive) throw new Error('优惠券已失效')

    const now = new Date()
    if (now < coupon.startAt || now > coupon.endAt) throw new Error('优惠券不在有效期内')
    if (coupon.totalQuantity !== -1 && coupon.usedQuantity >= coupon.totalQuantity) {
      throw new Error('优惠券已被领完')
    }
    if (orderAmount < coupon.minOrderAmount) {
      throw new Error(`订单满 ${coupon.minOrderAmount} 元才可使用该优惠券`)
    }

    const discount =
      coupon.type === COUPON_TYPE.PERCENT
        ? parseFloat((orderAmount * (coupon.value / 100)).toFixed(2))
        : coupon.value

    return { coupon, discount }
  }

  /**
   * Validate a user-owned coupon by code and mark it as used.
   * Used internally by order service.
   * @param {string} userId
   * @param {string} couponCode
   * @param {number} orderAmount
   * @returns {Promise<{ userCoupon: Object, discount: number }>}
   */
  async applyUserCoupon(userId, couponCode, orderAmount) {
    const userCoupon = await userCouponRepo.findUnusedByUserAndCode(userId, couponCode)
    if (!userCoupon) throw new Error('优惠券不存在或已使用')

    const { coupon, discount } = await this.validateCoupon(couponCode, orderAmount)

    // Increment global usedQuantity on the coupon.
    // NOTE: In production use an atomic increment (e.g. UPDATE … SET used_quantity = used_quantity + 1
    // WHERE used_quantity < total_quantity) to prevent over-redemption under concurrent requests.
    await couponRepo.update(coupon.id, { usedQuantity: coupon.usedQuantity + 1 })

    return { userCoupon, couponId: coupon.id, discount }
  }

  /**
   * Mark a user coupon as used after order is confirmed.
   * @param {string} userCouponId
   * @param {string} orderId
   */
  async markUsed(userCouponId, orderId) {
    await userCouponRepo.update(userCouponId, {
      isUsed: true,
      usedInOrderId: orderId,
      usedAt: new Date(),
    })
  }
}

module.exports = new CouponService()
