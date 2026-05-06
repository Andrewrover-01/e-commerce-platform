'use strict'

const BaseRepository = require('./base.repository')
const { createReview } = require('../models/review.model')

class ReviewRepository extends BaseRepository {
  constructor() {
    super(createReview)
  }

  async findByProduct(productId) {
    return this.findWhere(r => r.productId === productId)
  }

  async findByUser(userId) {
    return this.findWhere(r => r.userId === userId)
  }

  async findPending() {
    return this.findWhere(r => r.status === 'pending')
  }

  async findApproved(productId) {
    return this.findWhere(r => r.productId === productId && r.status === 'approved')
  }
}

module.exports = new ReviewRepository()
