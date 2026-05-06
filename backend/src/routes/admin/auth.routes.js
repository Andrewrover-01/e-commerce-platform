'use strict'

const { Router } = require('express')
const { body } = require('express-validator')
const authController = require('../../controllers/auth.controller')
const validate = require('../../middlewares/validate.middleware')
const { authRateLimiter } = require('../../middlewares/ratelimit.middleware')

const router = Router()

router.post(
  '/login',
  authRateLimiter,
  [
    body('login').trim().notEmpty().withMessage('请输入用户名或邮箱'),
    body('password').notEmpty().withMessage('请输入密码'),
    validate,
  ],
  authController.adminLogin.bind(authController)
)

module.exports = router
