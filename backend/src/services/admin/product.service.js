'use strict'

const productRepo = require('../../repositories/product.repository')
const categoryRepo = require('../../repositories/category.repository')

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
    return productRepo.create(data)
  }

  async update(id, data) {
    const updated = await productRepo.update(id, data)
    if (!updated) throw new Error('商品不存在')
    return updated
  }

  async delete(id) {
    const deleted = await productRepo.delete(id)
    if (!deleted) throw new Error('商品不存在')
    return true
  }

  // Categories management
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
