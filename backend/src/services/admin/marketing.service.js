'use strict'

const couponRepo = require('../../repositories/coupon.repository')
const promotionService = require('../promotion.service')

class AdminMarketingService {
  // ── Coupons ──────────────────────────────────────────────────────────

  async getCouponList(params = {}) {
    const { keyword, page = 1, pageSize = 20 } = params
    let list = await couponRepo.findAll()
    if (keyword) {
      const kw = keyword.toLowerCase()
      list = list.filter(c => c.code.toLowerCase().includes(kw) || c.name.toLowerCase().includes(kw))
    }
    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    return couponRepo.paginate(list, Number(page), Number(pageSize))
  }

  async createCoupon(data) {
    const existing = await couponRepo.findByCode(data.code)
    if (existing) throw new Error('优惠券码已存在')
    return couponRepo.create(data)
  }

  async updateCoupon(id, data) {
    const updated = await couponRepo.update(id, data)
    if (!updated) throw new Error('优惠券不存在')
    return updated
  }

  async deleteCoupon(id) {
    const deleted = await couponRepo.delete(id)
    if (!deleted) throw new Error('优惠券不存在')
    return true
  }

  // ── Promotions (满减 / 折扣 / 秒杀) ──────────────────────────────────

  async getPromotionList(params = {}) {
    return promotionService.getList(params)
  }

  async getPromotionById(id) {
    return promotionService.getById(id)
  }

  async createPromotion(data) {
    return promotionService.create(data)
  }

  async updatePromotion(id, data) {
    return promotionService.update(id, data)
  }

  async deletePromotion(id) {
    return promotionService.delete(id)
  }
}

module.exports = new AdminMarketingService()
