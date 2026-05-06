'use strict'

const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')

const config = require('./config')
const { connect } = require('./config/database')
const routes = require('./routes')
const errorMiddleware = require('./middlewares/error.middleware')

const app = express()

// ── Security & utilities ─────────────────────────────────────────────
app.use(helmet())
app.use(cors({
  origin: config.cors.origins,
  credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

if (config.nodeEnv !== 'test') {
  app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'))
}

// ── Health check ─────────────────────────────────────────────────────
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
