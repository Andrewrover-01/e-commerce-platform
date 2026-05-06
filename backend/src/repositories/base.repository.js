'use strict'

/**
 * BaseRepository — in-memory CRUD foundation.
 *
 * Every concrete repository extends this class and optionally overrides
 * individual methods.  When you add a real database, replace only the
 * method bodies here (or provide a separate DbBaseRepository subclass)
 * without touching the service layer.
 */

const { v4: uuidv4 } = require('uuid')

class BaseRepository {
  constructor(modelFactory) {
    this._store = []          // In-memory store (replace with DB pool)
    this._modelFactory = modelFactory  // Factory function from model file
  }

  /**
   * Return all records (shallow copy).
   * @returns {Promise<Object[]>}
   */
  async findAll() {
    return [...this._store]
  }

  /**
   * Find a single record by id.
   * @param {string} id
   * @returns {Promise<Object|null>}
   */
  async findById(id) {
    return this._store.find(item => item.id === id) || null
  }

  /**
   * Find records matching a predicate.
   * @param {Function} predicate
   * @returns {Promise<Object[]>}
   */
  async findWhere(predicate) {
    return this._store.filter(predicate)
  }

  /**
   * Find the first record matching a predicate.
   * @param {Function} predicate
   * @returns {Promise<Object|null>}
   */
  async findOneWhere(predicate) {
    return this._store.find(predicate) || null
  }

  /**
   * Insert a new record.  Auto-assigns id and timestamps.
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  async create(data) {
    const record = this._modelFactory({
      ...data,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    this._store.push(record)
    return { ...record }
  }

  /**
   * Update an existing record by id.
   * @param {string} id
   * @param {Object} updates
   * @returns {Promise<Object|null>}
   */
  async update(id, updates) {
    const index = this._store.findIndex(item => item.id === id)
    if (index === -1) return null
    this._store[index] = {
      ...this._store[index],
      ...updates,
      id,                      // Prevent accidental id change
      updatedAt: new Date(),
    }
    return { ...this._store[index] }
  }

  /**
   * Delete a record by id.
   * @param {string} id
   * @returns {Promise<boolean>}
   */
  async delete(id) {
    const index = this._store.findIndex(item => item.id === id)
    if (index === -1) return false
    this._store.splice(index, 1)
    return true
  }

  /**
   * Count total records (optionally filtered).
   * @param {Function} [predicate]
   * @returns {Promise<number>}
   */
  async count(predicate) {
    if (predicate) return this._store.filter(predicate).length
    return this._store.length
  }

  /**
   * Paginate results.
   * @param {Object[]} list
   * @param {number}   page     1-based
   * @param {number}   pageSize
   * @returns {{ list: Object[], total: number, page: number, pageSize: number }}
   */
  paginate(list, page = 1, pageSize = 20) {
    const total = list.length
    const start = (page - 1) * pageSize
    return {
      list: list.slice(start, start + pageSize),
      total,
      page,
      pageSize,
    }
  }
}

module.exports = BaseRepository
