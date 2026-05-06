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
    origins: (process.env.CORS_ORIGINS || 'http://localhost:5173').split(','),
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
  },
}

module.exports = config
