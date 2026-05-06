'use strict'

const config = require('../config')

/**
 * Global error-handling middleware.
 * Must be registered last in app.js (after all routes).
 */
// eslint-disable-next-line no-unused-vars
function errorMiddleware(err, req, res, next) {
  const status = err.status || 500
  const message = err.message || '服务器内部错误'

  if (config.nodeEnv !== 'production') {
    // Use separate arguments to avoid passing user-controlled strings as a format pattern
    console.error('[ERROR]', req.method, req.url, err)
  }

  res.status(status).json({
    code: status,
    message,
    ...(config.nodeEnv !== 'production' && { stack: err.stack }),
  })
}

module.exports = errorMiddleware
