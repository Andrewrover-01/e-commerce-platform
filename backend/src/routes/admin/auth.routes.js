'use strict'

const { Router } = require('express')
const { body } = require('express-validator')
const authController = require('../../controllers/auth.controller')
const validate = require('../../middlewares/validate.middleware')

const router = Router()

router.post(
  '/login',
  [
    body('login').trim().notEmpty().withMessage('请输入用户名或邮箱'),
    body('password').notEmpty().withMessage('请输入密码'),
    validate,
  ],
  authController.adminLogin.bind(authController)
)

module.exports = router
