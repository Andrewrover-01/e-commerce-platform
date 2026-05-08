'use strict'

const { Router } = require('express')
const { body } = require('express-validator')
const authController = require('../controllers/auth.controller')
const validate = require('../middlewares/validate.middleware')
const { authRateLimiter } = require('../middlewares/ratelimit.middleware')
const authMiddleware = require('../middlewares/auth.middleware')

const router = Router()

router.post(
  '/register',
  authRateLimiter,
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
  authRateLimiter,
  [
    body('login').trim().notEmpty().withMessage('请输入用户名或邮箱'),
    body('password').notEmpty().withMessage('请输入密码'),
    validate,
  ],
  authController.login.bind(authController)
)

// Logout — requires a valid (non-blacklisted) JWT
router.post('/logout', authMiddleware, authController.logout.bind(authController))

module.exports = router
