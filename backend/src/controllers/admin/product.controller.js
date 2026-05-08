'use strict'

const adminProductService = require('../../services/admin/product.service')

class AdminProductController {
  async getList(req, res, next) {
    try {
      const result = await adminProductService.getList(req.query)
      res.json({ code: 200, data: result })
    } catch (err) { next(err) }
  }

  async getById(req, res, next) {
    try {
      const product = await adminProductService.getById(req.params.id)
      res.json({ code: 200, data: product })
    } catch (err) { next(err) }
  }

  async create(req, res, next) {
    try {
      const product = await adminProductService.create(req.body)
      res.status(201).json({ code: 200, message: '创建成功', data: product })
    } catch (err) { next(err) }
  }

  async update(req, res, next) {
    try {
      const product = await adminProductService.update(req.params.id, req.body)
      res.json({ code: 200, message: '更新成功', data: product })
    } catch (err) { next(err) }
  }

  async delete(req, res, next) {
    try {
      await adminProductService.delete(req.params.id)
      res.json({ code: 200, message: '删除成功' })
    } catch (err) { next(err) }
  }

  async batchUpdateStock(req, res, next) {
    try {
      const result = await adminProductService.batchUpdateStock(req.body.items)
      res.json({ code: 200, message: '批量库存更新完成', data: result })
    } catch (err) { next(err) }
  }

  // Categories
  async getCategoryList(req, res, next) {
    try {
      const list = await adminProductService.getCategoryList()
      res.json({ code: 200, data: list })
    } catch (err) { next(err) }
  }

  async createCategory(req, res, next) {
    try {
      const category = await adminProductService.createCategory(req.body)
      res.status(201).json({ code: 200, message: '创建成功', data: category })
    } catch (err) { next(err) }
  }

  async updateCategory(req, res, next) {
    try {
      const category = await adminProductService.updateCategory(req.params.id, req.body)
      res.json({ code: 200, message: '更新成功', data: category })
    } catch (err) { next(err) }
  }

  async deleteCategory(req, res, next) {
    try {
      await adminProductService.deleteCategory(req.params.id)
      res.json({ code: 200, message: '删除成功' })
    } catch (err) { next(err) }
  }
}

module.exports = new AdminProductController()
