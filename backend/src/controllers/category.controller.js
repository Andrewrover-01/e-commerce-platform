'use strict'

const categoryService = require('../services/category.service')

class CategoryController {
  async getList(req, res, next) {
    try {
      const categories = await categoryService.getAll()
      res.json({ code: 200, data: categories })
    } catch (err) {
      next(err)
    }
  }

  async getTree(req, res, next) {
    try {
      const tree = await categoryService.getTree()
      res.json({ code: 200, data: tree })
    } catch (err) {
      next(err)
    }
  }

  async getById(req, res, next) {
    try {
      const category = await categoryService.getById(req.params.id)
      res.json({ code: 200, data: category })
    } catch (err) {
      next(err)
    }
  }
}

module.exports = new CategoryController()
