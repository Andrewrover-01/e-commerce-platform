'use strict'

/**
 * Database connection (MySQL/PostgreSQL).
 *
 * Uses a single JSON-record table so the existing repository layer can switch
 * between in-memory and DB persistence without rewriting every repository.
 */

const config = require('./index')

let _connection = null
let _dbType = 'memory'

function normalizeDbType(type) {
  if (!type) return 'memory'
  const lower = String(type).toLowerCase()
  if (['mysql', 'mariadb'].includes(lower)) return 'mysql'
  if (['postgres', 'postgresql', 'pg'].includes(lower)) return 'postgres'
  if (lower === 'memory') return 'memory'
  return lower
}

async function _ensureSchema() {
  if (!_connection || _dbType === 'memory') return

  const tableName = config.db.table || 'app_records'

  if (_dbType === 'mysql') {
    const createSql = `
      CREATE TABLE IF NOT EXISTS ${tableName} (
        id VARCHAR(36) PRIMARY KEY,
        collection VARCHAR(64) NOT NULL,
        payload JSON NOT NULL,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        INDEX idx_collection (collection)
      )
    `
    await _connection.query(createSql)
  } else if (_dbType === 'postgres') {
    const createSql = `
      CREATE TABLE IF NOT EXISTS ${tableName} (
        id VARCHAR(36) PRIMARY KEY,
        collection VARCHAR(64) NOT NULL,
        payload JSONB NOT NULL,
        created_at TIMESTAMP NOT NULL,
        updated_at TIMESTAMP NOT NULL
      )
    `
    await _connection.query(createSql)
    await _connection.query(`CREATE INDEX IF NOT EXISTS idx_collection ON ${tableName} (collection)`)
  }
}

async function connect() {
  _dbType = normalizeDbType(config.db.type)
  if (_dbType === 'memory') {
    console.log('[DB] Using in-memory store (no external database)')
    return null
  }

  if (_dbType === 'mysql') {
    const mysql = require('mysql2/promise')
    _connection = await mysql.createPool({
      host: config.db.host,
      port: config.db.port,
      database: config.db.name,
      user: config.db.user,
      password: config.db.password,
      ssl: config.db.ssl ? { rejectUnauthorized: false } : undefined,
      connectionLimit: 10,
    })
    await _ensureSchema()
    console.log('[DB] MySQL connected')
    return _connection
  }

  if (_dbType === 'postgres') {
    const { Pool } = require('pg')
    _connection = new Pool({
      host: config.db.host,
      port: config.db.port,
      database: config.db.name,
      user: config.db.user,
      password: config.db.password,
      ssl: config.db.ssl ? { rejectUnauthorized: false } : undefined,
      max: 10,
    })
    await _connection.query('SELECT 1')
    await _ensureSchema()
    console.log('[DB] PostgreSQL connected')
    return _connection
  }

  throw new Error(`[DB] Unsupported DB_TYPE: ${config.db.type}`)
}

function getConnection() {
  return _connection
}

function getDbType() {
  return _dbType
}

module.exports = { connect, getConnection, getDbType }
