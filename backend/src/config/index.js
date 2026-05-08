'use strict'

require('dotenv').config()

const config = {
  port: parseInt(process.env.PORT, 10) || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',

  jwt: {
    secret: process.env.JWT_SECRET || 'dev_secret_change_in_production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    adminExpiresIn: process.env.JWT_ADMIN_EXPIRES_IN || '1d',
  },

  cors: {
    origins: (process.env.CORS_ORIGINS || 'http://localhost:5173').split(',').map(o => o.trim()),
  },

  rateLimit: {
    // Global API limiter
    apiWindowMs: parseInt(process.env.RATE_API_WINDOW_MS, 10) || 60 * 1000,
    apiMax:      parseInt(process.env.RATE_API_MAX, 10)       || 300,
    // Write-operation limiter
    writeWindowMs: parseInt(process.env.RATE_WRITE_WINDOW_MS, 10) || 60 * 1000,
    writeMax:      parseInt(process.env.RATE_WRITE_MAX, 10)       || 30,
    // Auth limiter
    authWindowMs: parseInt(process.env.RATE_AUTH_WINDOW_MS, 10) || 15 * 60 * 1000,
    authMax:      parseInt(process.env.RATE_AUTH_MAX, 10)        || 10,
  },

  // Database config placeholder — swap in real values when adding a DB adapter
  db: {
    type: process.env.DB_TYPE || 'memory',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    name: process.env.DB_NAME || 'ecommerce',
    user: process.env.DB_USER || '',
    password: process.env.DB_PASSWORD || '',
    table: process.env.DB_TABLE || 'app_records',
    ssl: process.env.DB_SSL === 'true',
  },

  redis: {
    enabled: process.env.REDIS_ENABLED === 'true' || Boolean(process.env.REDIS_URL),
    url: process.env.REDIS_URL || '',
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD || '',
    db: parseInt(process.env.REDIS_DB, 10) || 0,
    ttlSeconds: parseInt(process.env.REDIS_TTL_SECONDS, 10) || 300,
  },

  queue: {
    enabled: process.env.QUEUE_ENABLED === 'true' || false,
    orderQueueKey: process.env.QUEUE_ORDER_KEY || 'queue:orders',
    logQueueKey: process.env.QUEUE_LOG_KEY || 'queue:logs',
    pollIntervalMs: parseInt(process.env.QUEUE_POLL_MS, 10) || 1000,
  },
}

module.exports = config
