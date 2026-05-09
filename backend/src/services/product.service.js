'use strict'

const productRepo = require('../repositories/product.repository')
const cacheService = require('./cache.service')

class ProductService {
  async getList(params = {}) {
    const cacheKey = cacheService.buildKey('product:list', params)
    const cached = await cacheService.get(cacheKey)
    if (cached) return cached

    const { category, keyword, sort, page = 1, pageSize = 12 } = params

    let list = await productRepo.findActive()

    if (category) {
      list = list.filter(p => p.categoryId === category)
    }
    if (keyword) {
      const kw = String(keyword).toLowerCase()
      list = list.filter(
        p => p.name.toLowerCase().includes(kw) || p.brand.toLowerCase().includes(kw)
      )
    }

    if (sort === 'price_asc')   list.sort((a, b) => a.price - b.price)
    else if (sort === 'price_desc') list.sort((a, b) => b.price - a.price)
    else if (sort === 'sales')  list.sort((a, b) => b.sales - a.sales)
    else if (sort === 'rating') list.sort((a, b) => b.rating - a.rating)
    else if (sort === 'newest') list.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0) || b.id - a.id)

    const result = productRepo.paginate(list, Number(page), Number(pageSize))
    await cacheService.set(cacheKey, result)
    return result
  }

  async getById(id) {
    const cacheKey = `product:${id}`
    const cached = await cacheService.get(cacheKey)
    if (cached) return cached

    const product = await productRepo.findById(id)
    if (!product) throw new Error('商品不存在')
    await cacheService.set(cacheKey, product)
    return product
  }

  async getHot(limit = 8) {
    const cacheKey = `product:hot:${limit}`
    const cached = await cacheService.get(cacheKey)
    if (cached) return cached
    const result = await productRepo.findHot(limit)
    await cacheService.set(cacheKey, result)
    return result
  }

  async getNew(limit = 4) {
    const cacheKey = `product:new:${limit}`
    const cached = await cacheService.get(cacheKey)
    if (cached) return cached
    const result = await productRepo.findNew(limit)
    await cacheService.set(cacheKey, result)
    return result
  }

  async getFlashSale(limit = 6) {
    const cacheKey = `product:flash:${limit}`
    const cached = await cacheService.get(cacheKey)
    if (cached) return cached
    const result = await productRepo.findFlashSale(limit)
    await cacheService.set(cacheKey, result)
    return result
  }
}

module.exports = new ProductService()
