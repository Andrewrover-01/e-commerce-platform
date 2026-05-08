'use strict'

const { validationResult } = require('express-validator')

/**
 * Reads express-validator result and returns 422 if there are errors.
 * Place this handler after your validation chains in a route definition.
 */
function validateMiddleware(req, res, next) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({
      code: 422,
      message: '参数校验失败',
      errors: errors.array().map(e => ({ field: e.path, message: e.msg })),
    })
  }
  next()
}

module.exports = validateMiddleware
