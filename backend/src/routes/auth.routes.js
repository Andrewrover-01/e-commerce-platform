'use strict'

const { Router } = require('express')
const { body } = require('express-validator')
const authController = require('../controllers/auth.controller')
const validate = require('../middlewares/validate.middleware')

const router = Router()

router.post(
  '/register',
  [
    body('username').trim().notEmpty().withMessage('用户名不能为空'),
    body('email').isEmail().withMessage('邮箱格式不正确'),
    body('password').isLength({ min: 6 }).withMessage('密码至少6位'),
    validate,
  ],
  authController.register.bind(authController)
)

router.post(
  '/login',
  [
    body('login').trim().notEmpty().withMessage('请输入用户名或邮箱'),
    body('password').notEmpty().withMessage('请输入密码'),
    validate,
  ],
  authController.login.bind(authController)
)

module.exports = router
