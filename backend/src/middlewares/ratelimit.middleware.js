'use strict'

const rateLimit = require('express-rate-limit')
const config = require('../config')

// ── Shared rate-limit response formatter ─────────────────────────────────────

const rateLimitMessage = (msg) => ({ code: 429, message: msg })

// ── Auth routes — very strict (anti brute-force) ─────────────────────────────

/**
 * Applied to login / register: default 10 attempts per 15 minutes per IP.
 */
const authRateLimiter = rateLimit({
  windowMs: config.rateLimit.authWindowMs,
  max: config.rateLimit.authMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: rateLimitMessage('登录/注册请求过于频繁，请15分钟后再试'),
})

// ── General API — loose (anti-scraping / DDoS) ───────────────────────────────

/**
 * Applied to all /api routes: default 300 requests per minute per IP.
 */
const apiRateLimiter = rateLimit({
  windowMs: config.rateLimit.apiWindowMs,
  max: config.rateLimit.apiMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: rateLimitMessage('API 请求过于频繁，请稍后再试'),
})

// ── Write operations — moderate (anti-spam posting) ──────────────────────────

/**
 * Applied to state-changing endpoints (POST / PUT / PATCH / DELETE).
 * Default: 30 write operations per minute per IP.
 */
const writeLimiter = rateLimit({
  windowMs: config.rateLimit.writeWindowMs,
  max: config.rateLimit.writeMax,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => !['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method),
  message: rateLimitMessage('写操作请求过于频繁，请稍后再试'),
})

module.exports = { authRateLimiter, apiRateLimiter, writeLimiter }
