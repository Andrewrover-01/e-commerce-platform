'use strict'

const couponRepo = require('../repositories/coupon.repository')
const { COUPON_TYPE } = require('../models/coupon.model')

class CouponService {
  async getActiveCoupons() {
    return couponRepo.findActive()
  }

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
}

module.exports = new CouponService()
