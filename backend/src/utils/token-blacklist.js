'use strict'

/**
 * In-memory token blacklist for JWT logout / forced-invalidation.
 *
 * On logout, add the token's JTI (or the raw token) here.
 * The auth middleware checks this set before accepting any token.
 *
 * Production note: replace the in-memory Set with a Redis SET with TTL equal
 * to the token's remaining lifetime to avoid unbounded memory growth.
 */

const blacklist = new Set()

/**
 * Add a token to the blacklist.
 * Optionally schedule automatic removal after `ttlMs` milliseconds so the set
 * doesn't grow without bound during long-running server sessions.
 *
 * @param {string} token
 * @param {number} [ttlMs]  Milliseconds until the entry is auto-removed.
 */
function addToBlacklist(token, ttlMs) {
  blacklist.add(token)
  if (ttlMs && ttlMs > 0) {
    setTimeout(() => blacklist.delete(token), ttlMs).unref()
  }
}

/**
 * Check whether a token is blacklisted.
 * @param {string} token
 * @returns {boolean}
 */
function isBlacklisted(token) {
  return blacklist.has(token)
}

/**
 * Return the current number of blacklisted tokens (useful for monitoring).
 * @returns {number}
 */
function size() {
  return blacklist.size
}

module.exports = { addToBlacklist, isBlacklisted, size }
