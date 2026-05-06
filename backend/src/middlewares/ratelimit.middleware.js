'use strict'

const rateLimit = require('express-rate-limit')

/**
 * Strict rate limiter for authentication endpoints (login / register).
 * Limits each IP to 10 requests per 15 minutes to prevent brute-force attacks.
 */
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { code: 429, message: '请求过于频繁，请15分钟后再试' },
})

module.exports = { authRateLimiter }
