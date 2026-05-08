'use strict'

/**
 * Review model schema definition.
 *
 * @typedef {Object} Review
 * @property {string}  id
 * @property {string}  productId
 * @property {string}  orderId
 * @property {string}  userId
 * @property {string}  username
 * @property {string}  avatar
 * @property {number}  rating      - 1–5
 * @property {string}  content
 * @property {string[]} images
 * @property {string}  status      - 'pending' | 'approved' | 'rejected'
 * @property {Date}    createdAt
 * @property {Date}    updatedAt
 */

const REVIEW_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
}

function createReview(data) {
  return {
    id: data.id || null,
    productId: data.productId || '',
    orderId: data.orderId || '',
    userId: data.userId || '',
    username: data.username || '',
    avatar: data.avatar || '',
    rating: Number(data.rating) || 5,
    content: data.content || '',
    images: data.images || [],
    status: data.status || REVIEW_STATUS.PENDING,
    createdAt: data.createdAt || new Date(),
    updatedAt: data.updatedAt || new Date(),
  }
}

module.exports = { createReview, REVIEW_STATUS }
