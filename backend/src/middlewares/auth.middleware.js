'use strict'

const jwt = require('jsonwebtoken')
const config = require('../config')
const { isBlacklisted } = require('../utils/token-blacklist')

/**
 * Extract the raw Bearer token from the Authorization header.
 * Returns null when the header is missing or malformed.
 * @param {import('express').Request} req
 * @returns {string|null}
 */
function extractToken(req) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null
  return authHeader.slice(7)
}

/**
 * authMiddleware — required authentication.
 *
 * Verifies the Bearer JWT in the Authorization header, checks the token
 * blacklist (for logged-out tokens), and attaches
 *   req.user = { id, role }
 *   req.token = <raw token>   (needed by the logout handler)
 * to the request.  Rejects with 401 if the token is absent, invalid, or
 * blacklisted.
 */
function authMiddleware(req, res, next) {
  const token = extractToken(req)
  if (!token) {
    return res.status(401).json({ code: 401, message: '未登录，请先登录' })
  }

  if (isBlacklisted(token)) {
    return res.status(401).json({ code: 401, message: 'Token 已失效，请重新登录' })
  }

  try {
    const payload = jwt.verify(token, config.jwt.secret)
    req.user = { id: payload.id, role: payload.role }
    req.token = token
    next()
  } catch (err) {
    return res.status(401).json({ code: 401, message: 'Token 已过期或无效，请重新登录' })
  }
}

/**
 * optionalAuth — optional authentication.
 *
 * Same as authMiddleware but NEVER rejects the request when no token (or an
 * invalid token) is supplied.  Use this for semi-public routes where an
 * authenticated user gets extra data (e.g. personalised product listings).
 *
 * When a valid token is present, req.user and req.token are populated.
 * When no token is present (or it is blacklisted/expired), req.user is null.
 */
function optionalAuth(req, _res, next) {
  const token = extractToken(req)
  if (!token || isBlacklisted(token)) {
    req.user = null
    return next()
  }

  try {
    const payload = jwt.verify(token, config.jwt.secret)
    req.user = { id: payload.id, role: payload.role }
    req.token = token
  } catch (_err) {
    req.user = null
  }
  next()
}

module.exports = authMiddleware
module.exports.optionalAuth = optionalAuth
