'use strict'

const adminContentService = require('../../services/admin/content.service')

class AdminContentController {
  // ── Banners ──────────────────────────────────────────────────────────
  async getBanners(req, res, next) {
    try {
      res.json({ code: 200, data: await adminContentService.getBanners() })
    } catch (err) { next(err) }
  }
  async createBanner(req, res, next) {
    try {
      const banner = await adminContentService.createBanner(req.body)
      res.status(201).json({ code: 200, message: '创建成功', data: banner })
    } catch (err) { next(err) }
  }
  async updateBanner(req, res, next) {
    try {
      const banner = await adminContentService.updateBanner(req.params.id, req.body)
      res.json({ code: 200, message: '更新成功', data: banner })
    } catch (err) { next(err) }
  }
  async deleteBanner(req, res, next) {
    try {
      await adminContentService.deleteBanner(req.params.id)
      res.json({ code: 200, message: '删除成功' })
    } catch (err) { next(err) }
  }

  // ── Notices ──────────────────────────────────────────────────────────
  async getNotices(req, res, next) {
    try {
      res.json({ code: 200, data: await adminContentService.getNotices() })
    } catch (err) { next(err) }
  }
  async createNotice(req, res, next) {
    try {
      const notice = await adminContentService.createNotice(req.body)
      res.status(201).json({ code: 200, message: '创建成功', data: notice })
    } catch (err) { next(err) }
  }
  async updateNotice(req, res, next) {
    try {
      const notice = await adminContentService.updateNotice(req.params.id, req.body)
      res.json({ code: 200, message: '更新成功', data: notice })
    } catch (err) { next(err) }
  }
  async deleteNotice(req, res, next) {
    try {
      await adminContentService.deleteNotice(req.params.id)
      res.json({ code: 200, message: '删除成功' })
    } catch (err) { next(err) }
  }

  // ── Articles ─────────────────────────────────────────────────────────
  async getArticles(req, res, next) {
    try {
      res.json({ code: 200, data: await adminContentService.getArticles(req.query) })
    } catch (err) { next(err) }
  }
  async createArticle(req, res, next) {
    try {
      const article = await adminContentService.createArticle(req.body)
      res.status(201).json({ code: 200, message: '创建成功', data: article })
    } catch (err) { next(err) }
  }
  async updateArticle(req, res, next) {
    try {
      const article = await adminContentService.updateArticle(req.params.id, req.body)
      res.json({ code: 200, message: '更新成功', data: article })
    } catch (err) { next(err) }
  }
  async deleteArticle(req, res, next) {
    try {
      await adminContentService.deleteArticle(req.params.id)
      res.json({ code: 200, message: '删除成功' })
    } catch (err) { next(err) }
  }

  // ── Reviews ──────────────────────────────────────────────────────────
  async getReviews(req, res, next) {
    try {
      res.json({ code: 200, data: await adminContentService.getReviews(req.query) })
    } catch (err) { next(err) }
  }
  async approveReview(req, res, next) {
    try {
      const review = await adminContentService.approveReview(req.params.id)
      res.json({ code: 200, message: '已审核通过', data: review })
    } catch (err) { next(err) }
  }
  async rejectReview(req, res, next) {
    try {
      const review = await adminContentService.rejectReview(req.params.id)
      res.json({ code: 200, message: '已拒绝', data: review })
    } catch (err) { next(err) }
  }
  async deleteReview(req, res, next) {
    try {
      await adminContentService.deleteReview(req.params.id)
      res.json({ code: 200, message: '删除成功' })
    } catch (err) { next(err) }
  }
}

module.exports = new AdminContentController()
