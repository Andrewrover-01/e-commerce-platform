'use strict'

const productService = require('../services/product.service')

class ProductController {
  async getList(req, res, next) {
    try {
      const result = await productService.getList(req.query)
      res.json({ code: 200, data: result })
    } catch (err) {
      next(err)
    }
  }

  async getById(req, res, next) {
    try {
      const product = await productService.getById(req.params.id)
      res.json({ code: 200, data: product })
    } catch (err) {
      next(err)
    }
  }

  async getHot(req, res, next) {
    try {
      const products = await productService.getHot(Number(req.query.limit) || 8)
      res.json({ code: 200, data: products })
    } catch (err) {
      next(err)
    }
  }

  async getNew(req, res, next) {
    try {
      const products = await productService.getNew(Number(req.query.limit) || 4)
      res.json({ code: 200, data: products })
    } catch (err) {
      next(err)
    }
  }

  async getFlashSale(req, res, next) {
    try {
      const products = await productService.getFlashSale(Number(req.query.limit) || 6)
      res.json({ code: 200, data: products })
    } catch (err) {
      next(err)
    }
  }
}

module.exports = new ProductController()
