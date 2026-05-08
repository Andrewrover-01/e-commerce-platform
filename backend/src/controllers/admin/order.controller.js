'use strict'

const adminOrderService = require('../../services/admin/order.service')
const refundService = require('../../services/refund.service')
const logisticsService = require('../../services/integrations/logistics.service')

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

  // ── Refund management ─────────────────────────────────────────────────

  async getRefundList(req, res, next) {
    try {
      const result = await adminOrderService.getRefundList(req.query)
      res.json({ code: 200, data: result })
    } catch (err) { next(err) }
  }

  async approveRefund(req, res, next) {
    try {
      const order = await refundService.approveRefund(req.params.id)
      res.json({ code: 200, message: '退款已批准', data: order })
    } catch (err) { next(err) }
  }

  async rejectRefund(req, res, next) {
    try {
      const order = await refundService.rejectRefund(req.params.id, req.body.reason)
      res.json({ code: 200, message: '退款已拒绝', data: order })
    } catch (err) { next(err) }
  }

  async completeRefund(req, res, next) {
    try {
      const order = await refundService.completeRefund(req.params.id)
      res.json({ code: 200, message: '退款已完成', data: order })
    } catch (err) { next(err) }
  }

  // ── Logistics tracking ────────────────────────────────────────────────

  async getTracking(req, res, next) {
    try {
      const order = await adminOrderService.getById(req.params.id)
      if (!order.trackingNo) {
        return res.json({ code: 200, data: { trackingNo: null, events: [] } })
      }
      const tracking = await logisticsService.queryTracking(order.trackingNo, req.query.carrier)
      res.json({ code: 200, data: tracking })
    } catch (err) { next(err) }
  }
}

module.exports = new AdminOrderController()
