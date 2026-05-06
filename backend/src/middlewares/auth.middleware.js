'use strict'

const jwt = require('jsonwebtoken')
const config = require('../config')

/**
 * Verifies the Bearer JWT in the Authorization header.
 * Attaches decoded payload as req.user = { id, role }.
 */
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ code: 401, message: '未登录，请先登录' })
  }

  const token = authHeader.slice(7)
  try {
    const payload = jwt.verify(token, config.jwt.secret)
    req.user = { id: payload.id, role: payload.role }
    next()
  } catch (err) {
    return res.status(401).json({ code: 401, message: 'Token 已过期或无效，请重新登录' })
  }
}

module.exports = authMiddleware
