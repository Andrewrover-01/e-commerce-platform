'use strict'

const BaseRepository = require('./base.repository')
const { createUserCoupon } = require('../models/user-coupon.model')

class UserCouponRepository extends BaseRepository {
  constructor() {
    super(createUserCoupon)
  }

  async findByUser(userId) {
    return this.findWhere(uc => uc.userId === userId)
  }

  async findByUserAndCoupon(userId, couponId) {
    return this.findOneWhere(uc => uc.userId === userId && uc.couponId === couponId)
  }

  async findUnusedByUserAndCode(userId, couponCode) {
    return this.findOneWhere(
      uc => uc.userId === userId && uc.couponCode === couponCode && !uc.isUsed
    )
  }
}

module.exports = new UserCouponRepository()
