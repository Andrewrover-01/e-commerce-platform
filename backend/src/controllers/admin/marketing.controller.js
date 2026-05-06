'use strict'

const adminMarketingService = require('../../services/admin/marketing.service')

class AdminMarketingController {
  async getCouponList(req, res, next) {
    try {
      const result = await adminMarketingService.getCouponList(req.query)
      res.json({ code: 200, data: result })
    } catch (err) { next(err) }
  }

  async createCoupon(req, res, next) {
    try {
      const coupon = await adminMarketingService.createCoupon(req.body)
      res.status(201).json({ code: 200, message: '创建成功', data: coupon })
    } catch (err) { next(err) }
  }

  async updateCoupon(req, res, next) {
    try {
      const coupon = await adminMarketingService.updateCoupon(req.params.id, req.body)
      res.json({ code: 200, message: '更新成功', data: coupon })
    } catch (err) { next(err) }
  }

  async deleteCoupon(req, res, next) {
    try {
      await adminMarketingService.deleteCoupon(req.params.id)
      res.json({ code: 200, message: '删除成功' })
    } catch (err) { next(err) }
  }

  async getActivityList(req, res, next) {
    try {
      const list = await adminMarketingService.getActivityList()
      res.json({ code: 200, data: list })
    } catch (err) { next(err) }
  }
}

module.exports = new AdminMarketingController()
