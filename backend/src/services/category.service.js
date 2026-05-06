'use strict'

const categoryRepo = require('../repositories/category.repository')

class CategoryService {
  async getAll() {
    return categoryRepo.findActive()
  }

  async getTree() {
    const all = await categoryRepo.findActive()
    const topLevel = all.filter(c => c.parentId === null)
    return topLevel.map(top => ({
      ...top,
      children: all.filter(c => c.parentId === top.id),
    }))
  }

  async getById(id) {
    const category = await categoryRepo.findById(id)
    if (!category) throw new Error('分类不存在')
    return category
  }
}

module.exports = new CategoryService()
