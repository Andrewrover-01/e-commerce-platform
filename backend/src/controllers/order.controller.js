'use strict'

const orderService = require('../services/order.service')

class OrderController {
  async create(req, res, next) {
    try {
      const order = await orderService.create(req.user.id, req.body)
      res.status(201).json({ code: 200, message: '下单成功', data: order })
    } catch (err) {
      next(err)
    }
  }

  async getList(req, res, next) {
    try {
      const result = await orderService.getList(req.user.id, req.query)
      res.json({ code: 200, data: result })
    } catch (err) {
      next(err)
    }
  }

  async getById(req, res, next) {
    try {
      const order = await orderService.getById(req.user.id, req.params.id)
      res.json({ code: 200, data: order })
    } catch (err) {
      next(err)
    }
  }

  async cancel(req, res, next) {
    try {
      const order = await orderService.cancel(req.user.id, req.params.id)
      res.json({ code: 200, message: '取消成功', data: order })
    } catch (err) {
      next(err)
    }
  }
}

module.exports = new OrderController()
