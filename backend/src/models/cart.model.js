'use strict'

/**
 * Cart model schema definition.
 *
 * @typedef {Object} CartItem
 * @property {string}  productId
 * @property {string}  productName
 * @property {string}  productImage
 * @property {number}  price
 * @property {number}  quantity
 * @property {boolean} selected
 *
 * @typedef {Object} Cart
 * @property {string}     id
 * @property {string}     userId
 * @property {CartItem[]} items
 * @property {Date}       updatedAt
 */

function createCart(data) {
  return {
    id: data.id || null,
    userId: data.userId || '',
    items: data.items || [],
    updatedAt: data.updatedAt || new Date(),
  }
}

function createCartItem(data) {
  return {
    productId: data.productId || '',
    productName: data.productName || '',
    productImage: data.productImage || '',
    price: Number(data.price) || 0,
    quantity: Number(data.quantity) || 1,
    selected: data.selected !== undefined ? Boolean(data.selected) : true,
  }
}

module.exports = { createCart, createCartItem }
