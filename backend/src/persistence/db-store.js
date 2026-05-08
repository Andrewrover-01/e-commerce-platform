'use strict'

const config = require('../config')
const { getConnection, getDbType } = require('../config/database')

function isEnabled() {
  return getDbType() !== 'memory'
}

function _ensureReady() {
  if (!isEnabled()) return
  if (!getConnection()) {
    throw new Error('[DB] Connection not initialized. Call connect() first.')
  }
}

function _tableName() {
  return config.db.table || 'app_records'
}

function _parsePayload(payload) {
  if (!payload) return null
  if (typeof payload === 'string') {
    return JSON.parse(payload)
  }
  return payload
}

async function findAll(collection) {
  _ensureReady()
  const conn = getConnection()
  const table = _tableName()
  const dbType = getDbType()

  if (dbType === 'mysql') {
    const [rows] = await conn.query(`SELECT payload FROM ${table} WHERE collection = ?`, [collection])
    return rows.map(row => _parsePayload(row.payload))
  }

  const { rows } = await conn.query(`SELECT payload FROM ${table} WHERE collection = $1`, [collection])
  return rows.map(row => _parsePayload(row.payload))
}

async function findById(collection, id) {
  _ensureReady()
  const conn = getConnection()
  const table = _tableName()
  const dbType = getDbType()

  if (dbType === 'mysql') {
    const [rows] = await conn.query(`SELECT payload FROM ${table} WHERE id = ? AND collection = ? LIMIT 1`, [id, collection])
    if (!rows.length) return null
    return _parsePayload(rows[0].payload)
  }

  const { rows } = await conn.query(`SELECT payload FROM ${table} WHERE id = $1 AND collection = $2 LIMIT 1`, [id, collection])
  if (!rows.length) return null
  return _parsePayload(rows[0].payload)
}

async function insert(collection, record) {
  _ensureReady()
  const conn = getConnection()
  const table = _tableName()
  const payload = JSON.stringify(record)
  const createdAt = record.createdAt instanceof Date ? record.createdAt : new Date(record.createdAt)
  const updatedAt = record.updatedAt instanceof Date ? record.updatedAt : new Date(record.updatedAt)

  if (getDbType() === 'mysql') {
    await conn.query(
      `INSERT INTO ${table} (id, collection, payload, created_at, updated_at) VALUES (?, ?, ?, ?, ?)`,
      [record.id, collection, payload, createdAt, updatedAt]
    )
    return
  }

  await conn.query(
    `INSERT INTO ${table} (id, collection, payload, created_at, updated_at) VALUES ($1, $2, $3::jsonb, $4, $5)`,
    [record.id, collection, payload, createdAt, updatedAt]
  )
}

async function update(collection, id, record) {
  _ensureReady()
  const conn = getConnection()
  const table = _tableName()
  const payload = JSON.stringify(record)
  const updatedAt = record.updatedAt instanceof Date ? record.updatedAt : new Date(record.updatedAt)

  if (getDbType() === 'mysql') {
    const [result] = await conn.query(
      `UPDATE ${table} SET payload = ?, updated_at = ? WHERE id = ? AND collection = ?`,
      [payload, updatedAt, id, collection]
    )
    return result.affectedRows > 0
  }

  const result = await conn.query(
    `UPDATE ${table} SET payload = $1::jsonb, updated_at = $2 WHERE id = $3 AND collection = $4`,
    [payload, updatedAt, id, collection]
  )
  return result.rowCount > 0
}

async function remove(collection, id) {
  _ensureReady()
  const conn = getConnection()
  const table = _tableName()

  if (getDbType() === 'mysql') {
    const [result] = await conn.query(
      `DELETE FROM ${table} WHERE id = ? AND collection = ?`,
      [id, collection]
    )
    return result.affectedRows > 0
  }

  const result = await conn.query(
    `DELETE FROM ${table} WHERE id = $1 AND collection = $2`,
    [id, collection]
  )
  return result.rowCount > 0
}

async function count(collection) {
  _ensureReady()
  const conn = getConnection()
  const table = _tableName()

  if (getDbType() === 'mysql') {
    const [rows] = await conn.query(`SELECT COUNT(*) as total FROM ${table} WHERE collection = ?`, [collection])
    return Number(rows[0].total || 0)
  }

  const { rows } = await conn.query(`SELECT COUNT(*) as total FROM ${table} WHERE collection = $1`, [collection])
  return Number(rows[0].total || 0)
}

module.exports = {
  isEnabled,
  findAll,
  findById,
  insert,
  update,
  remove,
  count,
}
