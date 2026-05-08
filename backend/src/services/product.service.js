'use strict'

const productRepo = require('../repositories/product.repository')

class ProductService {
  async getList(params = {}) {
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

    return productRepo.paginate(list, Number(page), Number(pageSize))
  }

  async getById(id) {
    const product = await productRepo.findById(id)
    if (!product) throw new Error('商品不存在')
    return product
  }

  async getHot(limit = 8) {
    return productRepo.findHot(limit)
  }

  async getNew(limit = 4) {
    return productRepo.findNew(limit)
  }

  async getFlashSale(limit = 6) {
    return productRepo.findFlashSale(limit)
  }
}

module.exports = new ProductService()
