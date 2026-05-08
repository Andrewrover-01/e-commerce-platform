'use strict'

const config = require('../config')
const AppError = require('../utils/app-error')

/**
 * Global error-handling middleware.
 * Must be registered last in app.js (after all routes).
 *
 * Behaviour:
 *  - AppError (isOperational: true)  → return the message as-is with its HTTP status.
 *  - JWT errors                       → map to 401.
 *  - express-validator errors          → should be caught by validate.middleware before reaching here.
 *  - Everything else                  → log and return a generic 500 in production.
 */
// eslint-disable-next-line no-unused-vars
function errorMiddleware(err, req, res, next) {
  // ── Operational / expected errors ──────────────────────────────────
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      code: err.statusCode,
      message: err.message,
    })
  }

  // ── JWT-specific errors ──────────────────────────────────────────────
  if (err.name === 'JsonWebTokenError' || err.name === 'NotBeforeError') {
    return res.status(401).json({ code: 401, message: 'Token 无效，请重新登录' })
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ code: 401, message: 'Token 已过期，请重新登录' })
  }

  // ── Plain Error thrown from services (legacy path) ───────────────────
  // Services currently throw new Error(msg); treat as 400 unless .status is set.
  if (err instanceof Error && !err.isOperational) {
    const status = err.status || 400
    // Only expose message for client-safe statuses; mask 5xx
    if (status < 500) {
      return res.status(status).json({ code: status, message: err.message })
    }
  }

  // ── Unexpected / programming errors ─────────────────────────────────
  const status = err.status || err.statusCode || 500

  if (config.nodeEnv !== 'production') {
    // Use separate arguments to avoid passing user-controlled strings as a format pattern
    console.error('[ERROR]', req.method, req.url, err)
  } else {
    // In production only log the status and a safe identifier
    console.error('[ERROR]', req.method, req.url, status, err.name)
  }

  res.status(status).json({
    code: status,
    message: config.nodeEnv !== 'production' ? err.message : '服务器内部错误',
    ...(config.nodeEnv !== 'production' && { stack: err.stack }),
  })
}

module.exports = errorMiddleware
