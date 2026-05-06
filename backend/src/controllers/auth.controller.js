'use strict'

const authService = require('../services/auth.service')

class AuthController {
  async register(req, res, next) {
    try {
      const result = await authService.register(req.body)
      res.status(201).json({ code: 200, message: '注册成功', data: result })
    } catch (err) {
      next(err)
    }
  }

  async login(req, res, next) {
    try {
      const result = await authService.login(req.body)
      res.json({ code: 200, message: '登录成功', data: result })
    } catch (err) {
      next(err)
    }
  }

  async adminLogin(req, res, next) {
    try {
      const result = await authService.adminLogin(req.body)
      res.json({ code: 200, message: '登录成功', data: result })
    } catch (err) {
      next(err)
    }
  }
}

module.exports = new AuthController()
