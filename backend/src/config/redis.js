'use strict'

const { createClient } = require('redis')
const config = require('./index')

let _client = null
let _ready = false

function _buildUrl() {
  if (config.redis.url) return config.redis.url
  const auth = config.redis.password ? `:${encodeURIComponent(config.redis.password)}@` : ''
  return `redis://${auth}${config.redis.host}:${config.redis.port}/${config.redis.db}`
}

async function connect() {
  if (!config.redis.enabled) {
    console.log('[Redis] Disabled (set REDIS_ENABLED=true to enable)')
    return null
  }

  if (_client) return _client

  _client = createClient({ url: _buildUrl() })

  _client.on('error', err => {
    _ready = false
    console.error('[Redis] Connection error:', err.message)
  })

  _client.on('ready', () => {
    _ready = true
    console.log('[Redis] Connected')
  })

  try {
    await _client.connect()
  } catch (err) {
    _ready = false
    console.error('[Redis] Failed to connect:', err.message)
  }

  return _client
}

function getClient() {
  return _client
}

function isReady() {
  return _ready
}

module.exports = { connect, getClient, isReady }
