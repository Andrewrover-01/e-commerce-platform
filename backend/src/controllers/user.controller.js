'use strict'

const userService = require('../services/user.service')

class UserController {
  async getProfile(req, res, next) {
    try {
      const user = await userService.getProfile(req.user.id)
      res.json({ code: 200, data: user })
    } catch (err) {
      next(err)
    }
  }

  async updateProfile(req, res, next) {
    try {
      const user = await userService.updateProfile(req.user.id, req.body)
      res.json({ code: 200, message: '更新成功', data: user })
    } catch (err) {
      next(err)
    }
  }
}

module.exports = new UserController()
