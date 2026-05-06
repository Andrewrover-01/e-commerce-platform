'use strict'

/**
 * AppError — operational HTTP error with an explicit status code.
 *
 * Throw this from any service or middleware when you want a known, safe error
 * message returned to the client.  The global error handler in
 * error.middleware.js distinguishes operational errors (isOperational: true)
 * from unexpected programming errors and responds accordingly.
 *
 * Usage examples:
 *   throw new AppError('用户名已存在', 409)
 *   throw AppError.notFound('商品不存在')
 *   throw AppError.unauthorized()
 */
class AppError extends Error {
  /**
   * @param {string} message   Human-readable message returned to the client.
   * @param {number} statusCode HTTP status code (default 400).
   */
  constructor(message, statusCode = 400) {
    super(message)
    this.name = 'AppError'
    this.statusCode = statusCode
    this.isOperational = true   // Signals that this is a known, safe error
    Error.captureStackTrace(this, this.constructor)
  }

  // ── Factory helpers ───────────────────────────────────────────────────

  static badRequest(message) {
    return new AppError(message, 400)
  }

  static unauthorized(message = '未登录，请先登录') {
    return new AppError(message, 401)
  }

  static forbidden(message = '权限不足') {
    return new AppError(message, 403)
  }

  static notFound(message = '资源不存在') {
    return new AppError(message, 404)
  }

  static conflict(message) {
    return new AppError(message, 409)
  }

  static tooManyRequests(message = '请求过于频繁，请稍后再试') {
    return new AppError(message, 429)
  }

  static internal(message = '服务器内部错误') {
    return new AppError(message, 500)
  }
}

module.exports = AppError
