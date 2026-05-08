'use strict'

/**
 * PromotionService — rule engine for three promotion types.
 *
 *  full_reduction  满减  — order total >= threshold → deduct reductionAmount
 *  discount        折扣  — line items in scope → multiply price by discountRate
 *  flash_sale      秒杀  — product has a time-limited lower price + limited stock
 *
 * Public API used by order creation flow:
 *   applyPromotions(cartItems, userId) → { enrichedItems, promotionDiscount, appliedPromotions }
 */

const promotionRepo = require('../repositories/promotion.repository')
const stockLockService = require('./stock-lock.service')
const { PROMOTION_TYPE } = require('../models/promotion.model')
const AppError = require('../utils/app-error')

class PromotionService {
  // ── Admin management ────────────────────────────────────────────────────────

  async getList(params = {}) {
    const { type, isActive, page = 1, pageSize = 20 } = params
    let list = await promotionRepo.findAll()

    if (type) list = list.filter(p => p.type === type)
    if (isActive !== undefined) {
      const flag = isActive === 'true' || isActive === true
      list = list.filter(p => p.isActive === flag)
    }

    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    return promotionRepo.paginate(list, Number(page), Number(pageSize))
  }

  async getById(id) {
    const p = await promotionRepo.findById(id)
    if (!p) throw AppError.notFound('促销活动不存在')
    return p
  }

  async create(data) {
    this._validateData(data)
    return promotionRepo.create(data)
  }

  async update(id, data) {
    const existing = await this.getById(id)
    if (!existing) throw AppError.notFound('促销活动不存在')
    return promotionRepo.update(id, data)
  }

  async delete(id) {
    const deleted = await promotionRepo.delete(id)
    if (!deleted) throw AppError.notFound('促销活动不存在')
    return true
  }

  // ── Promotion application engine ────────────────────────────────────────────

  /**
   * Get active flash-sale promotion for a product (if any).
   * Returns the promotion record or null.
   * @param {string} productId
   * @returns {Promise<Object|null>}
   */
  async getFlashSaleForProduct(productId) {
    const promos = await promotionRepo.findByProduct(productId)
    const flashSale = promos.find(p => p.type === PROMOTION_TYPE.FLASH_SALE)
    return flashSale || null
  }

  /**
   * Apply all active promotions to a set of cart items.
   *
   * @param {Array<{ productId, productName, productImage, price, quantity, categoryId }>} items
   *   Enriched cart items with product details already resolved.
   * @param {string} userId  For per-user flash-sale limit checking.
   * @returns {Promise<{
   *   enrichedItems: Array,
   *   promotionDiscount: number,
   *   appliedPromotions: Array<{ id, name, type, discount }>
   * }>}
   */
  async applyPromotions(items, userId) {
    const activePromotions = await promotionRepo.findActive()
    const appliedPromotions = []
    let enrichedItems = items.map(i => ({ ...i }))

    // ── 1. Flash sale — override per-item price + validate dedicated stock ───
    for (const item of enrichedItems) {
      const flashSale = activePromotions.find(
        p => p.type === PROMOTION_TYPE.FLASH_SALE && p.productId === item.productId
      )
      if (!flashSale) continue

      // Validate per-user limit
      if (flashSale.perUserLimit !== null && item.quantity > flashSale.perUserLimit) {
        throw AppError.badRequest(
          `商品 "${item.productName}" 秒杀每人限购 ${flashSale.perUserLimit} 件`
        )
      }

      // Check dedicated flash-sale stock
      const flashAvailable = flashSale.flashStock - (flashSale.flashLockedStock || 0)
      if (flashAvailable < item.quantity) {
        throw AppError.conflict(
          `商品 "${item.productName}" 秒杀库存不足（剩余 ${flashAvailable} 件）`
        )
      }

      // Override price
      const originalLineTotal = item.price * item.quantity
      item.originalPrice = item.price
      item.price = flashSale.flashPrice
      item.isFlashSale = true
      item.flashSaleId = flashSale.id

      appliedPromotions.push({
        id: flashSale.id,
        name: flashSale.name,
        type: PROMOTION_TYPE.FLASH_SALE,
        discount: parseFloat((originalLineTotal - flashSale.flashPrice * item.quantity).toFixed(2)),
      })
    }

    // Recompute order total after flash sale prices applied
    let orderTotal = enrichedItems.reduce((sum, i) => sum + i.price * i.quantity, 0)

    // ── 2. Discount — apply discountRate to eligible line items ─────────────
    for (const promo of activePromotions) {
      if (promo.type !== PROMOTION_TYPE.DISCOUNT) continue

      let promoDiscount = 0
      for (const item of enrichedItems) {
        if (item.isFlashSale) continue  // Flash sale items exempt from further discounts
        if (!this._itemInScope(item, promo)) continue

        const lineDiscount = parseFloat(
          (item.price * item.quantity * (1 - promo.discountRate)).toFixed(2)
        )
        item.discountRate = promo.discountRate
        promoDiscount += lineDiscount
      }

      if (promoDiscount > 0) {
        appliedPromotions.push({ id: promo.id, name: promo.name, type: PROMOTION_TYPE.DISCOUNT, discount: promoDiscount })
        orderTotal -= promoDiscount
      }
    }

    // ── 3. Full reduction — check order total (post-discount) vs threshold ───
    for (const promo of activePromotions) {
      if (promo.type !== PROMOTION_TYPE.FULL_REDUCTION) continue
      if (orderTotal < promo.threshold) continue

      appliedPromotions.push({
        id: promo.id,
        name: promo.name,
        type: PROMOTION_TYPE.FULL_REDUCTION,
        discount: promo.reductionAmount,
      })
    }

    const promotionDiscount = parseFloat(
      appliedPromotions.reduce((sum, p) => sum + p.discount, 0).toFixed(2)
    )

    return { enrichedItems, promotionDiscount, appliedPromotions }
  }

  /**
   * Lock flash-sale stock for a set of enriched items after order is confirmed.
   * Must be called after applyPromotions and before persisting the order.
   * @param {Array} enrichedItems
   */
  async lockFlashSaleStock(enrichedItems) {
    for (const item of enrichedItems) {
      if (!item.isFlashSale || !item.flashSaleId) continue
      const promo = await promotionRepo.findById(item.flashSaleId)
      if (!promo) continue
      const newLocked = (promo.flashLockedStock || 0) + item.quantity
      if (newLocked > promo.flashStock) {
        throw AppError.conflict(`商品 "${item.productName}" 秒杀库存已售完`)
      }
      await promotionRepo.update(promo.id, { flashLockedStock: newLocked })
    }
  }

  /**
   * Commit flash-sale stock (on payment success).
   * Deducts from flashStock and releases the lock.
   * @param {Array} enrichedItems
   */
  async commitFlashSaleStock(enrichedItems) {
    for (const item of enrichedItems) {
      if (!item.isFlashSale || !item.flashSaleId) continue
      const promo = await promotionRepo.findById(item.flashSaleId)
      if (!promo) continue
      await promotionRepo.update(promo.id, {
        flashStock: Math.max(0, promo.flashStock - item.quantity),
        flashLockedStock: Math.max(0, (promo.flashLockedStock || 0) - item.quantity),
      })
    }
  }

  /**
   * Release flash-sale stock (on order cancel / payment fail).
   * @param {Array} enrichedItems
   */
  async releaseFlashSaleStock(enrichedItems) {
    for (const item of enrichedItems) {
      if (!item.isFlashSale || !item.flashSaleId) continue
      const promo = await promotionRepo.findById(item.flashSaleId)
      if (!promo) continue
      await promotionRepo.update(promo.id, {
        flashLockedStock: Math.max(0, (promo.flashLockedStock || 0) - item.quantity),
      })
    }
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────

  _itemInScope(item, promo) {
    if (promo.scopeType === 'all') return true
    if (promo.scopeType === 'category') return (promo.scopeIds || []).includes(item.categoryId)
    if (promo.scopeType === 'product') return (promo.scopeIds || []).includes(item.productId)
    return false
  }

  _validateData(data) {
    const { type } = data
    if (type === PROMOTION_TYPE.FULL_REDUCTION) {
      if (data.threshold == null || data.reductionAmount == null) {
        throw AppError.badRequest('满减活动必须填写门槛金额和减免金额')
      }
    } else if (type === PROMOTION_TYPE.DISCOUNT) {
      if (data.discountRate == null || data.discountRate <= 0 || data.discountRate >= 1) {
        throw AppError.badRequest('折扣率必须在 0~1 之间（不含）')
      }
    } else if (type === PROMOTION_TYPE.FLASH_SALE) {
      if (!data.productId || data.flashPrice == null || data.flashStock == null) {
        throw AppError.badRequest('秒杀活动必须填写商品ID、秒杀价和秒杀库存')
      }
    } else {
      throw AppError.badRequest(`不支持的促销类型: ${type}`)
    }
  }
}

module.exports = new PromotionService()
