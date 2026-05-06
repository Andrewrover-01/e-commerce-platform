'use strict'

/**
 * Sensitive word filter middleware.
 *
 * Recursively scans every string field in `req.body` for words from the
 * configured block list.  If a match is found the request is rejected with
 * HTTP 400 and a clear error message.
 *
 * Usage:
 *   const { sensitiveWordFilter } = require('../middlewares/sensitive-word.middleware')
 *   router.post('/reviews', auth, sensitiveWordFilter(), reviewController.create)
 *
 * Custom word list:
 *   router.post('/articles', auth, sensitiveWordFilter(['word1', 'word2']), controller)
 *
 * Replace / extend SENSITIVE_WORDS with your own list or load it from a DB.
 */

/**
 * Default block list — a representative set of commonly filtered terms on
 * Chinese e-commerce platforms.  Keep this list in lowercase; matching is
 * case-insensitive and full-width/half-width normalised.
 */
const SENSITIVE_WORDS = [
  // Political / social
  '法轮功', '天安门事件', '六四', '达赖喇嘛', '新疆独立', '西藏独立', '台独',
  // Violence
  '炸弹制作', '暗杀', '杀人方法',
  // Pornography (representative tokens)
  '色情', '裸聊', '援交', '卖淫',
  // Fraud / scam
  '刷单', '洗钱', '假币', '诈骗教程',
  // Spam
  '加微信', '加qq群',
  // Hate speech markers (placeholder — extend as needed)
  '反华',
]

/**
 * Recursively collect all string values from a plain object / array.
 * @param {*} value
 * @returns {string[]}
 */
function collectStrings(value) {
  if (typeof value === 'string') return [value]
  if (Array.isArray(value)) return value.flatMap(collectStrings)
  if (value !== null && typeof value === 'object') {
    return Object.values(value).flatMap(collectStrings)
  }
  return []
}

/**
 * Normalise text: lowercase + replace full-width ASCII with half-width.
 * @param {string} text
 * @returns {string}
 */
function normalise(text) {
  return text
    .toLowerCase()
    // Convert full-width ASCII (！…～ etc.) to half-width
    .replace(/[\uFF01-\uFF5E]/g, c => String.fromCharCode(c.charCodeAt(0) - 0xFEE0))
}

/**
 * Middleware factory.
 * @param {string[]} [extraWords]  Additional words to block beyond the defaults.
 * @returns {import('express').RequestHandler}
 */
function sensitiveWordFilter(extraWords = []) {
  const words = [...SENSITIVE_WORDS, ...extraWords].map(w => w.toLowerCase())

  return function (req, _res, next) {
    if (!req.body || typeof req.body !== 'object') return next()

    const texts = collectStrings(req.body)
    for (const text of texts) {
      const normalised = normalise(text)
      const hit = words.find(w => normalised.includes(w))
      if (hit) {
        const err = new Error('内容包含违禁词汇，请修改后重新提交')
        err.status = 400
        return next(err)
      }
    }
    next()
  }
}

module.exports = { sensitiveWordFilter, SENSITIVE_WORDS }
