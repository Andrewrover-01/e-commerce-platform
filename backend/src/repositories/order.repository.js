'use strict'

const BaseRepository = require('./base.repository')
const { createOrder } = require('../models/order.model')

class OrderRepository extends BaseRepository {
  constructor() {
    super(createOrder)
  }

  async findByUser(userId) {
    return this.findWhere(o => o.userId === userId)
  }

  async findByStatus(status) {
    return this.findWhere(o => o.status === status)
  }

  async findByOrderNo(orderNo) {
    return this.findOneWhere(o => o.orderNo === orderNo)
  }
}

module.exports = new OrderRepository()
