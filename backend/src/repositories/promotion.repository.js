'use strict'

const BaseRepository = require('./base.repository')
const { createPromotion } = require('../models/promotion.model')

class PromotionRepository extends BaseRepository {
  constructor() {
    super(createPromotion)
  }

  async findActive() {
    const now = new Date()
    return this.findWhere(p => p.isActive && new Date(p.startAt) <= now && new Date(p.endAt) >= now)
  }

  async findByProduct(productId) {
    const now = new Date()
    return this.findWhere(
      p =>
        p.isActive &&
        new Date(p.startAt) <= now &&
        new Date(p.endAt) >= now &&
        p.productId === productId
    )
  }
}

module.exports = new PromotionRepository()
