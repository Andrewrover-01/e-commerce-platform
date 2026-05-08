'use strict'

const config = require('../config')
const { getClient, isReady } = require('../config/redis')

const memoryCache = new Map()

function _now() {
  return Date.now()
}

function _stableSort(value) {
  if (Array.isArray(value)) return value.map(_stableSort)
  if (value && typeof value === 'object') {
    return Object.keys(value)
      .sort()
      .reduce((acc, key) => {
        acc[key] = _stableSort(value[key])
        return acc
      }, {})
  }
  return value
}

function buildKey(prefix, params) {
  if (!params) return prefix
  const normalized = JSON.stringify(_stableSort(params))
  return `${prefix}:${Buffer.from(normalized).toString('base64')}`
}

async function get(key) {
  if (config.redis.enabled && isReady()) {
    const value = await getClient().get(key)
    return value ? JSON.parse(value) : null
  }

  const entry = memoryCache.get(key)
  if (!entry) return null
  if (entry.expiresAt && entry.expiresAt < _now()) {
    memoryCache.delete(key)
    return null
  }
  return entry.value
}

async function set(key, value, ttlSeconds = config.redis.ttlSeconds) {
  if (config.redis.enabled && isReady()) {
    await getClient().set(key, JSON.stringify(value), { EX: ttlSeconds })
    return
  }

  const expiresAt = ttlSeconds ? _now() + ttlSeconds * 1000 : null
  memoryCache.set(key, { value, expiresAt })
}

async function del(key) {
  if (config.redis.enabled && isReady()) {
    await getClient().del(key)
    return
  }
  memoryCache.delete(key)
}

async function delByPrefix(prefix) {
  if (config.redis.enabled && isReady()) {
    const client = getClient()
    let cursor = '0'
    do {
      const [nextCursor, keys] = await client.scan(cursor, { MATCH: `${prefix}*`, COUNT: 100 })
      cursor = nextCursor
      if (keys.length) await client.del(keys)
    } while (cursor !== '0')
    return
  }

  for (const key of memoryCache.keys()) {
    if (key.startsWith(prefix)) {
      memoryCache.delete(key)
    }
  }
}

async function invalidateProduct(productId) {
  await del(`product:${productId}`)
  await delByPrefix('product:list:')
  await delByPrefix('product:hot')
  await delByPrefix('product:new')
  await delByPrefix('product:flash')
}

module.exports = {
  buildKey,
  get,
  set,
  del,
  delByPrefix,
  invalidateProduct,
}
