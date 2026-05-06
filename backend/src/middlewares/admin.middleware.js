'use strict'

const { USER_ROLES } = require('../models/user.model')

/**
 * Requires req.user.role === 'admin'.
 * Must be used AFTER authMiddleware.
 */
function adminMiddleware(req, res, next) {
  if (!req.user || req.user.role !== USER_ROLES.ADMIN) {
    return res.status(403).json({ code: 403, message: '权限不足，仅管理员可访问' })
  }
  next()
}

module.exports = adminMiddleware
