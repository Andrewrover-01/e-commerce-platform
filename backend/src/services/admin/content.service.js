'use strict'

const bannerRepo = require('../../repositories/banner.repository')
const noticeRepo = require('../../repositories/notice.repository')
const articleRepo = require('../../repositories/article.repository')
const reviewRepo = require('../../repositories/review.repository')
const { REVIEW_STATUS } = require('../../models/review.model')
const { ARTICLE_STATUS } = require('../../models/article.model')

class AdminContentService {
  // ── Banners ──────────────────────────────────────────────────────────

  async getBanners() { return bannerRepo.findAll() }
  async createBanner(data) { return bannerRepo.create(data) }
  async updateBanner(id, data) {
    const updated = await bannerRepo.update(id, data)
    if (!updated) throw new Error('Banner 不存在')
    return updated
  }
  async deleteBanner(id) {
    if (!(await bannerRepo.delete(id))) throw new Error('Banner 不存在')
    return true
  }

  // ── Notices ──────────────────────────────────────────────────────────

  async getNotices() { return noticeRepo.findAll() }
  async createNotice(data) { return noticeRepo.create(data) }
  async updateNotice(id, data) {
    const updated = await noticeRepo.update(id, data)
    if (!updated) throw new Error('公告不存在')
    return updated
  }
  async deleteNotice(id) {
    if (!(await noticeRepo.delete(id))) throw new Error('公告不存在')
    return true
  }

  // ── Articles ─────────────────────────────────────────────────────────

  async getArticles(params = {}) {
    const { status, page = 1, pageSize = 20 } = params
    let list = await articleRepo.findAll()
    if (status) list = list.filter(a => a.status === status)
    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    return articleRepo.paginate(list, Number(page), Number(pageSize))
  }
  async createArticle(data) { return articleRepo.create(data) }
  async updateArticle(id, data) {
    if (data.status === ARTICLE_STATUS.PUBLISHED && !data.publishedAt) {
      data.publishedAt = new Date()
    }
    const updated = await articleRepo.update(id, data)
    if (!updated) throw new Error('文章不存在')
    return updated
  }
  async deleteArticle(id) {
    if (!(await articleRepo.delete(id))) throw new Error('文章不存在')
    return true
  }

  // ── Reviews ──────────────────────────────────────────────────────────

  async getReviews(params = {}) {
    const { status, page = 1, pageSize = 20 } = params
    let list = await reviewRepo.findAll()
    if (status) list = list.filter(r => r.status === status)
    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    return reviewRepo.paginate(list, Number(page), Number(pageSize))
  }
  async approveReview(id) {
    const updated = await reviewRepo.update(id, { status: REVIEW_STATUS.APPROVED })
    if (!updated) throw new Error('评价不存在')
    return updated
  }
  async rejectReview(id) {
    const updated = await reviewRepo.update(id, { status: REVIEW_STATUS.REJECTED })
    if (!updated) throw new Error('评价不存在')
    return updated
  }
  async deleteReview(id) {
    if (!(await reviewRepo.delete(id))) throw new Error('评价不存在')
    return true
  }
}

module.exports = new AdminContentService()
