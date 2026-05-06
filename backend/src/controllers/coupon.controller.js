'use strict'

const couponService = require('../services/coupon.service')

class CouponController {
  /** GET /coupons — public list of active coupons */
  async list(req, res, next) {
    try {
      const coupons = await couponService.getActiveCoupons()
      res.json({ code: 200, data: coupons })
    } catch (err) {
      next(err)
    }
  }

  /** POST /coupons/:id/claim — claim a coupon for the logged-in user */
  async claim(req, res, next) {
    try {
      const userCoupon = await couponService.claimCoupon(req.user.id, req.params.id)
      res.status(201).json({ code: 200, message: '优惠券领取成功', data: userCoupon })
    } catch (err) {
      next(err)
    }
  }

  /** GET /user/coupons — coupons claimed by the current user */
  async userCoupons(req, res, next) {
    try {
      const coupons = await couponService.getUserCoupons(req.user.id)
      res.json({ code: 200, data: coupons })
    } catch (err) {
      next(err)
    }
  }
}

module.exports = new CouponController()
