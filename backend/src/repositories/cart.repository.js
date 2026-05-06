'use strict'

const BaseRepository = require('./base.repository')
const { createCart } = require('../models/cart.model')

class CartRepository extends BaseRepository {
  constructor() {
    super(createCart)
  }

  async findByUser(userId) {
    return this.findOneWhere(c => c.userId === userId)
  }
}

module.exports = new CartRepository()
