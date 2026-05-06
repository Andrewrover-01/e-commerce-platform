'use strict'

const BaseRepository = require('./base.repository')
const { createCategory } = require('../models/category.model')

class CategoryRepository extends BaseRepository {
  constructor() {
    super(createCategory)
  }

  async findActive() {
    return this.findWhere(c => c.isActive)
  }

  async findTopLevel() {
    return this.findWhere(c => c.parentId === null && c.isActive)
  }

  async findChildren(parentId) {
    return this.findWhere(c => c.parentId === parentId && c.isActive)
  }
}

module.exports = new CategoryRepository()
