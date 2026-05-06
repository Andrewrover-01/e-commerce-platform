'use strict'

/**
 * Category model schema definition.
 *
 * @typedef {Object} Category
 * @property {string}   id
 * @property {string}   name
 * @property {string}   icon
 * @property {string|null} parentId   - null for top-level categories
 * @property {number}   sort          - Display order
 * @property {boolean}  isActive
 * @property {Date}     createdAt
 * @property {Date}     updatedAt
 */

function createCategory(data) {
  return {
    id: data.id || null,
    name: data.name || '',
    icon: data.icon || '',
    parentId: data.parentId || null,
    sort: Number(data.sort) || 0,
    isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
    createdAt: data.createdAt || new Date(),
    updatedAt: data.updatedAt || new Date(),
  }
}

module.exports = { createCategory }
