'use strict'

const productRepo = require('../../repositories/product.repository')
const categoryRepo = require('../../repositories/category.repository')
const AppError = require('../../utils/app-error')
const cacheService = require('../cache.service')

class AdminProductService {
  async getList(params = {}) {
    const { keyword, status, categoryId, page = 1, pageSize = 20 } = params
    let list = await productRepo.findAll()

    if (keyword) {
      const kw = keyword.toLowerCase()
      list = list.filter(p => p.name.toLowerCase().includes(kw) || p.brand.toLowerCase().includes(kw))
    }
    if (status) list = list.filter(p => p.status === status)
    if (categoryId) list = list.filter(p => p.categoryId === categoryId)

    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    return productRepo.paginate(list, Number(page), Number(pageSize))
  }

  async getById(id) {
    const product = await productRepo.findById(id)
    if (!product) throw new Error('商品不存在')
    return product
  }

  async create(data) {
    const product = await productRepo.create(data)
    await cacheService.invalidateProduct(product.id)
    return product
  }

  async update(id, data) {
    const updated = await productRepo.update(id, data)
    if (!updated) throw new Error('商品不存在')
    await cacheService.invalidateProduct(id)
    return updated
  }

  async delete(id) {
    const deleted = await productRepo.delete(id)
    if (!deleted) throw new Error('商品不存在')
    await cacheService.invalidateProduct(id)
    return true
  }

  /**
   * Batch-update stock for multiple products in a single request.
   * @param {Array<{ id: string, stock: number }>} items
   * @returns {Promise<{ updated: number, errors: Array<{ id: string, message: string }> }>}
   */
  async batchUpdateStock(items) {
    if (!Array.isArray(items) || items.length === 0) {
      throw AppError.badRequest('items 不能为空')
    }

    const results = { updated: 0, errors: [] }

    for (const item of items) {
      const { id, stock } = item
      if (stock === undefined || stock === null || stock < 0) {
        results.errors.push({ id, message: '库存值无效（必须 >= 0）' })
        continue
      }
      const product = await productRepo.findById(id)
      if (!product) {
        results.errors.push({ id, message: '商品不存在' })
        continue
      }
      await productRepo.update(id, { stock: Number(stock) })
      await cacheService.invalidateProduct(id)
      results.updated++
    }

    return results
  }

  // ── Categories management ────────────────────────────────────────────
  async getCategoryList() {
    return categoryRepo.findAll()
  }

  async createCategory(data) {
    return categoryRepo.create(data)
  }

  async updateCategory(id, data) {
    const updated = await categoryRepo.update(id, data)
    if (!updated) throw new Error('分类不存在')
    return updated
  }

  async deleteCategory(id) {
    const deleted = await categoryRepo.delete(id)
    if (!deleted) throw new Error('分类不存在')
    return true
  }
}

module.exports = new AdminProductService()
