'use strict'

/**
 * Promotion model — covers three promotion types:
 *
 *  full_reduction — 满减: orderTotal >= threshold, discount fixed amount.
 *  discount       — 折扣: multiply eligible line-items by a rate (0-1).
 *  flash_sale     — 秒杀: a product-level limited-time, limited-stock lower price.
 *
 * @typedef {Object} Promotion
 * @property {string}      id
 * @property {string}      name
 * @property {string}      type            - 'full_reduction' | 'discount' | 'flash_sale'
 * @property {string}      description
 * @property {Date}        startAt
 * @property {Date}        endAt
 * @property {boolean}     isActive
 *
 * full_reduction fields:
 * @property {number}      [threshold]     - Min order total to trigger
 * @property {number}      [reductionAmount] - Amount deducted from total
 *
 * discount fields:
 * @property {number}      [discountRate]  - 0.8 = 80%, 0.5 = 50% off etc.
 * @property {string[]}    [scopeType]     - 'all' | 'category' | 'product'
 * @property {string[]}    [scopeIds]      - Category or product IDs (if scope != 'all')
 *
 * flash_sale fields:
 * @property {string}      [productId]     - Target product
 * @property {number}      [flashPrice]    - Override price during flash sale
 * @property {number}      [flashStock]    - Dedicated flash-sale inventory
 * @property {number}      [flashLockedStock] - Reserved flash-sale inventory
 * @property {number}      [perUserLimit]  - Max units a single user may purchase
 *
 * @property {Date}        createdAt
 * @property {Date}        updatedAt
 */

const PROMOTION_TYPE = {
  FULL_REDUCTION: 'full_reduction',
  DISCOUNT: 'discount',
  FLASH_SALE: 'flash_sale',
}

function createPromotion(data) {
  return {
    id: data.id || null,
    name: data.name || '',
    type: data.type || PROMOTION_TYPE.FULL_REDUCTION,
    description: data.description || '',
    startAt: data.startAt ? new Date(data.startAt) : new Date(),
    endAt: data.endAt ? new Date(data.endAt) : new Date(),
    isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,

    // full_reduction
    threshold: data.threshold !== undefined ? Number(data.threshold) : null,
    reductionAmount: data.reductionAmount !== undefined ? Number(data.reductionAmount) : null,

    // discount
    discountRate: data.discountRate !== undefined ? Number(data.discountRate) : null,
    scopeType: data.scopeType || 'all',
    scopeIds: Array.isArray(data.scopeIds) ? data.scopeIds : [],

    // flash_sale
    productId: data.productId || null,
    flashPrice: data.flashPrice !== undefined ? Number(data.flashPrice) : null,
    flashStock: data.flashStock !== undefined ? Number(data.flashStock) : null,
    flashLockedStock: data.flashLockedStock !== undefined ? Number(data.flashLockedStock) : 0,
    perUserLimit: data.perUserLimit !== undefined ? Number(data.perUserLimit) : null,

    createdAt: data.createdAt || new Date(),
    updatedAt: data.updatedAt || new Date(),
  }
}

module.exports = { createPromotion, PROMOTION_TYPE }
