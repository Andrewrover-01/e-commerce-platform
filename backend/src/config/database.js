'use strict'

/**
 * Database connection placeholder.
 *
 * Replace the body of `connect()` with a real adapter when you are ready to
 * integrate a database, e.g.:
 *   - MySQL/MariaDB  →  mysql2/promise  or  Sequelize
 *   - MongoDB        →  mongoose
 *   - PostgreSQL     →  pg  or  Prisma
 *
 * The in-memory repositories (src/repositories/*) do NOT depend on this file,
 * so the server starts and works without any database configuration.
 */

const config = require('./index')

let _connection = null

async function connect() {
  if (config.db.type === 'memory') {
    console.log('[DB] Using in-memory store (no external database)')
    return null
  }

  // TODO: replace with real database connection logic
  // Example for MySQL (mysql2):
  //   const mysql = require('mysql2/promise')
  //   _connection = await mysql.createPool({ host, user, password, database })
  //   console.log('[DB] MySQL connected')

  // Example for MongoDB (mongoose):
  //   const mongoose = require('mongoose')
  //   _connection = await mongoose.connect(`mongodb://${host}:${port}/${name}`)
  //   console.log('[DB] MongoDB connected')

  return _connection
}

function getConnection() {
  return _connection
}

module.exports = { connect, getConnection }
