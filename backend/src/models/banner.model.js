'use strict'

/**
 * Banner (carousel / ad) model schema definition.
 *
 * @typedef {Object} Banner
 * @property {string}  id
 * @property {string}  title
 * @property {string}  imageUrl
 * @property {string}  linkUrl     - Target URL on click
 * @property {number}  sort
 * @property {boolean} isActive
 * @property {Date}    createdAt
 * @property {Date}    updatedAt
 */

function createBanner(data) {
  return {
    id: data.id || null,
    title: data.title || '',
    imageUrl: data.imageUrl || '',
    linkUrl: data.linkUrl || '',
    sort: Number(data.sort) || 0,
    isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
    createdAt: data.createdAt || new Date(),
    updatedAt: data.updatedAt || new Date(),
  }
}

module.exports = { createBanner }
