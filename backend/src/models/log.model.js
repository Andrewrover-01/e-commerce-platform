'use strict'

/**
 * Log model schema definition.
 *
 * @typedef {Object} LogRecord
 * @property {string} id
 * @property {string} level
 * @property {string} event
 * @property {string} message
 * @property {Object} payload
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

function createLog(data) {
  return {
    id: data.id || null,
    level: data.level || 'info',
    event: data.event || '',
    message: data.message || '',
    payload: data.payload || {},
    createdAt: data.createdAt || new Date(),
    updatedAt: data.updatedAt || new Date(),
  }
}

module.exports = { createLog }
