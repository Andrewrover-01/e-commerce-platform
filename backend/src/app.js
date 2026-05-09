'use strict'

const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')

const config = require('./config')
const { connect } = require('./config/database')
const redis = require('./config/redis')
const queueService = require('./services/queue.service')
const routes = require('./routes')
const errorMiddleware = require('./middlewares/error.middleware')
const { apiRateLimiter, writeLimiter } = require('./middlewares/ratelimit.middleware')

const app = express()

// ── Security headers ─────────────────────────────────────────────────
app.use(helmet())

// ── CORS — enhanced with explicit methods, headers, and preflight cache ──
app.use(cors({
  origin(origin, callback) {
    // Allow requests with no origin (server-to-server, curl, mobile apps)
    if (!origin) return callback(null, true)
    if (config.cors.origins.includes(origin)) return callback(null, true)
    callback(new Error(`CORS: 不允许来自 ${origin} 的跨域请求`))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['RateLimit-Limit', 'RateLimit-Remaining', 'RateLimit-Reset'],
  maxAge: 86400,   // Preflight cache: 24 h
}))

// Handle OPTIONS preflight on all routes
app.options('*', cors())

// ── Body parsers ─────────────────────────────────────────────────────
app.use(express.json({ limit: '2mb' }))
app.use(express.urlencoded({ extended: true, limit: '2mb' }))

// ── Request logging ──────────────────────────────────────────────────
if (config.nodeEnv !== 'test') {
  app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'))
}

// ── Global rate limiting ─────────────────────────────────────────────
app.use('/api', apiRateLimiter)    // All /api routes: 300 req/min per IP
app.use('/api', writeLimiter)      // Write methods only: 30 req/min per IP

// ── Health check (not rate-limited) ─────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', env: config.nodeEnv, timestamp: new Date() })
})

// ── API routes (all prefixed with /api/v1) ───────────────────────────
app.use('/api/v1', routes)

// ── 404 handler ──────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ code: 404, message: '接口不存在' })
})

// ── Global error handler (must be last) ─────────────────────────────
app.use(errorMiddleware)

// ── Start server ─────────────────────────────────────────────────────
async function start() {
  await connect()
  await redis.connect()
  await queueService.start()
  app.listen(config.port, () => {
    console.log(`[Server] 运行在 http://localhost:${config.port}  (${config.nodeEnv})`)
    console.log(`[Server] API 文档: http://localhost:${config.port}/api/v1`)
  })
}

start().catch(err => {
  console.error('[Server] 启动失败:', err)
  process.exit(1)
})

module.exports = app
