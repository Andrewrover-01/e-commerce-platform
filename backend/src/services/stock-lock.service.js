'use strict'

/**
 * StockLockService — prevents overselling by separating "available" stock
 * from "physical" stock using a lockedStock counter on each product.
 *
 *   availableStock = product.stock - product.lockedStock
 *
 * Order lifecycle:
 *   1. Order created   → lockStock()  — reserve units; blocks concurrent orders
 *   2. Payment success → commitStock() — physically deduct from stock + release lock
 *   3. Cancel / fail   → releaseStock() — free the reservation
 *
 * NOTE: In production with a real DB, replace findById+update with an
 * atomic conditional UPDATE:
 *   UPDATE products
 *      SET locked_stock = locked_stock + qty
 *    WHERE id = ? AND (stock - locked_stock) >= qty
 * and check affected rows === 1 to detect race-condition failures.
 */

const productRepo = require('../repositories/product.repository')
const AppError = require('../utils/app-error')

// Simple in-process mutex map per productId to serialize stock mutations.
// (Still replace with DB-level atomic updates in production.)
const productLocks = new Map()

class StockLockService {
  async _withLock(productId, fn) {
    const previous = productLocks.get(productId) || Promise.resolve()
    const next = previous.catch(() => {}).then(fn)
    const safeNext = next.catch(err => {
      console.error(`[StockLock] 更新商品 ${productId} 库存失败:`, err.message)
    })
    productLocks.set(productId, safeNext)
    return next
  }
  /**
   * Reserve `quantity` units for `productId`.
   * Throws if available stock is insufficient.
   * @param {string} productId
   * @param {number} quantity
   */
  async lockStock(productId, quantity) {
    return this._withLock(productId, async () => {
      const product = await productRepo.findById(productId)
      if (!product) throw AppError.notFound(`商品 ${productId} 不存在`)

      const available = product.stock - (product.lockedStock || 0)
      if (available < quantity) {
        throw AppError.conflict(`商品 "${product.name}" 库存不足（可用 ${available}，需要 ${quantity}）`)
      }

      await productRepo.update(productId, {
        lockedStock: (product.lockedStock || 0) + quantity,
      })
    })
  }

  /**
   * Release a previously locked reservation (order cancelled / payment failed).
   * @param {string} productId
   * @param {number} quantity
   */
  async releaseStock(productId, quantity) {
    return this._withLock(productId, async () => {
      const product = await productRepo.findById(productId)
      if (!product) return   // Product might be deleted; silently skip

      await productRepo.update(productId, {
        lockedStock: Math.max(0, (product.lockedStock || 0) - quantity),
      })
    })
  }

  /**
   * Commit a reservation after successful payment:
   * deduct physical stock, release lock, and increment sales counter.
   * @param {string} productId
   * @param {number} quantity
   */
  async commitStock(productId, quantity) {
    return this._withLock(productId, async () => {
      const product = await productRepo.findById(productId)
      if (!product) return   // Silently skip

      await productRepo.update(productId, {
        stock: Math.max(0, product.stock - quantity),
        lockedStock: Math.max(0, (product.lockedStock || 0) - quantity),
        sales: (product.sales || 0) + quantity,
      })
    })
  }

  /**
   * Restore physical stock when admin cancels a PAID order
   * (payment already committed, must undo the deduction).
   * @param {string} productId
   * @param {number} quantity
   */
  async restoreStock(productId, quantity) {
    return this._withLock(productId, async () => {
      const product = await productRepo.findById(productId)
      if (!product) return

      await productRepo.update(productId, {
        stock: product.stock + quantity,
        sales: Math.max(0, (product.sales || 0) - quantity),
      })
    })
  }
}

module.exports = new StockLockService()
