'use strict'

/**
 * Address model schema definition.
 *
 * @typedef {Object} Address
 * @property {string}  id
 * @property {string}  userId
 * @property {string}  name        - Recipient name
 * @property {string}  phone       - Recipient phone
 * @property {string}  province
 * @property {string}  city
 * @property {string}  district
 * @property {string}  street      - Detailed street address
 * @property {string}  postcode
 * @property {boolean} isDefault
 * @property {Date}    createdAt
 * @property {Date}    updatedAt
 */

function createAddress(data) {
  return {
    id: data.id || null,
    userId: data.userId || '',
    name: data.name || '',
    phone: data.phone || '',
    province: data.province || '',
    city: data.city || '',
    district: data.district || '',
    street: data.street || '',
    postcode: data.postcode || '',
    isDefault: data.isDefault !== undefined ? Boolean(data.isDefault) : false,
    createdAt: data.createdAt || new Date(),
    updatedAt: data.updatedAt || new Date(),
  }
}

module.exports = { createAddress }
