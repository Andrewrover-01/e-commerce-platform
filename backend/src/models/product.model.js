'use strict'

/**
 * Product model schema definition.
 *
 * @typedef {Object} Product
 * @property {string}   id
 * @property {string}   name
 * @property {string}   description
 * @property {number}   price
 * @property {number}   originalPrice
 * @property {string}   image          - Main image URL
 * @property {string[]} images         - Gallery image URLs
 * @property {string}   categoryId
 * @property {string}   brand
 * @property {number}   stock
 * @property {number}   sales
 * @property {number}   rating         - 0–5
 * @property {boolean}  isHot
 * @property {boolean}  isNew
 * @property {boolean}  isOnSale
 * @property {string}   status         - 'on_sale' | 'off_sale' | 'deleted'
 * @property {Date}     createdAt
 * @property {Date}     updatedAt
 */

const PRODUCT_STATUS = {
  ON_SALE: 'on_sale',
  OFF_SALE: 'off_sale',
  DELETED: 'deleted',
}

function createProduct(data) {
  return {
    id: data.id || null,
    name: data.name || '',
    description: data.description || '',
    price: Number(data.price) || 0,
    originalPrice: Number(data.originalPrice) || 0,
    image: data.image || '',
    images: data.images || [],
    categoryId: data.categoryId || '',
    brand: data.brand || '',
    stock: Number(data.stock) || 0,
    lockedStock: Number(data.lockedStock) || 0,
    sales: Number(data.sales) || 0,
    rating: Number(data.rating) || 5,
    isHot: Boolean(data.isHot),
    isNew: Boolean(data.isNew),
    isOnSale: data.isOnSale !== undefined ? Boolean(data.isOnSale) : true,
    status: data.status || PRODUCT_STATUS.ON_SALE,
    createdAt: data.createdAt || new Date(),
    updatedAt: data.updatedAt || new Date(),
  }
}

module.exports = { createProduct, PRODUCT_STATUS }
