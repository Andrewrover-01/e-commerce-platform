'use strict'

const BaseRepository = require('./base.repository')
const { createCoupon } = require('../models/coupon.model')

class CouponRepository extends BaseRepository {
  constructor() {
    super(createCoupon)
  }

  async findByCode(code) {
    return this.findOneWhere(c => c.code === code)
  }

  async findActive() {
    const now = new Date()
    return this.findWhere(c => c.isActive && c.startAt <= now && c.endAt >= now)
  }
}

module.exports = new CouponRepository()
