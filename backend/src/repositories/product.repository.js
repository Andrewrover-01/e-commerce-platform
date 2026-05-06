'use strict'

const BaseRepository = require('./base.repository')
const { createProduct, PRODUCT_STATUS } = require('../models/product.model')

class ProductRepository extends BaseRepository {
  constructor() {
    super(createProduct)
  }

  async findActive() {
    return this.findWhere(p => p.status === PRODUCT_STATUS.ON_SALE)
  }

  async findByCategory(categoryId) {
    return this.findWhere(p => p.categoryId === categoryId && p.status === PRODUCT_STATUS.ON_SALE)
  }

  async searchByKeyword(keyword) {
    const kw = keyword.toLowerCase()
    return this.findWhere(
      p =>
        p.status === PRODUCT_STATUS.ON_SALE &&
        (p.name.toLowerCase().includes(kw) || p.brand.toLowerCase().includes(kw))
    )
  }

  async findHot(limit = 8) {
    const all = await this.findActive()
    return all.sort((a, b) => b.sales - a.sales).slice(0, limit)
  }

  async findNew(limit = 4) {
    const all = await this.findActive()
    return all.filter(p => p.isNew).slice(0, limit)
  }

  async findFlashSale(limit = 6) {
    const all = await this.findActive()
    return all.filter(p => p.isHot).slice(0, limit)
  }
}

module.exports = new ProductRepository()
