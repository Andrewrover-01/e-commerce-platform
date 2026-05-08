'use strict'

const adminOrderService = require('../../services/admin/order.service')

class AdminOrderController {
  async getList(req, res, next) {
    try {
      const result = await adminOrderService.getList(req.query)
      res.json({ code: 200, data: result })
    } catch (err) { next(err) }
  }

  async getById(req, res, next) {
    try {
      const order = await adminOrderService.getById(req.params.id)
      res.json({ code: 200, data: order })
    } catch (err) { next(err) }
  }

  async updateStatus(req, res, next) {
    try {
      const order = await adminOrderService.updateStatus(req.params.id, req.body.status)
      res.json({ code: 200, message: '状态更新成功', data: order })
    } catch (err) { next(err) }
  }

  async ship(req, res, next) {
    try {
      const order = await adminOrderService.ship(req.params.id, req.body.trackingNo)
      res.json({ code: 200, message: '发货成功', data: order })
    } catch (err) { next(err) }
  }

  async complete(req, res, next) {
    try {
      const order = await adminOrderService.complete(req.params.id)
      res.json({ code: 200, message: '订单已完成', data: order })
    } catch (err) { next(err) }
  }

  async cancel(req, res, next) {
    try {
      const order = await adminOrderService.cancel(req.params.id, req.body.reason)
      res.json({ code: 200, message: '订单已取消', data: order })
    } catch (err) { next(err) }
  }

  async getRefundList(req, res, next) {
    try {
      const result = await adminOrderService.getRefundList(req.query)
      res.json({ code: 200, data: result })
    } catch (err) { next(err) }
  }

  async handleRefund(req, res, next) {
    try {
      const order = await adminOrderService.handleRefund(req.params.id, req.body.approved)
      res.json({ code: 200, message: '退款处理成功', data: order })
    } catch (err) { next(err) }
  }
}

module.exports = new AdminOrderController()
