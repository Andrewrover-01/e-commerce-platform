'use strict'

const adminUserService = require('../../services/admin/user.service')

class AdminUserController {
  async getList(req, res, next) {
    try {
      const result = await adminUserService.getList(req.query)
      res.json({ code: 200, data: result })
    } catch (err) { next(err) }
  }

  async getById(req, res, next) {
    try {
      const user = await adminUserService.getById(req.params.id)
      res.json({ code: 200, data: user })
    } catch (err) { next(err) }
  }

  async create(req, res, next) {
    try {
      const user = await adminUserService.create(req.body)
      res.status(201).json({ code: 200, message: '创建成功', data: user })
    } catch (err) { next(err) }
  }

  async update(req, res, next) {
    try {
      const user = await adminUserService.update(req.params.id, req.body)
      res.json({ code: 200, message: '更新成功', data: user })
    } catch (err) { next(err) }
  }

  async toggleActive(req, res, next) {
    try {
      const { isActive } = req.body
      const user = await adminUserService.toggleActive(req.params.id, isActive)
      res.json({ code: 200, message: isActive ? '已启用' : '已禁用', data: user })
    } catch (err) { next(err) }
  }
}

module.exports = new AdminUserController()
