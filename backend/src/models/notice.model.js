'use strict'

/**
 * Notice (announcement) model schema definition.
 *
 * @typedef {Object} Notice
 * @property {string}  id
 * @property {string}  title
 * @property {string}  content
 * @property {string}  type        - 'system' | 'promotion' | 'other'
 * @property {boolean} isPinned
 * @property {boolean} isActive
 * @property {Date}    createdAt
 * @property {Date}    updatedAt
 */

const NOTICE_TYPE = {
  SYSTEM: 'system',
  PROMOTION: 'promotion',
  OTHER: 'other',
}

function createNotice(data) {
  return {
    id: data.id || null,
    title: data.title || '',
    content: data.content || '',
    type: data.type || NOTICE_TYPE.SYSTEM,
    isPinned: Boolean(data.isPinned),
    isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
    createdAt: data.createdAt || new Date(),
    updatedAt: data.updatedAt || new Date(),
  }
}

module.exports = { createNotice, NOTICE_TYPE }
