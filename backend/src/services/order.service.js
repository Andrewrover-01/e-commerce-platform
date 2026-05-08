'use strict'

const { v4: uuidv4 } = require('uuid')
const orderRepo = require('../repositories/order.repository')
const productRepo = require('../repositories/product.repository')
const couponService = require('./coupon.service')
const stockLockService = require('./stock-lock.service')
const promotionService = require('./promotion.service')
const smsService = require('./integrations/sms.service')
const userRepo = require('../repositories/user.repository')
const { ORDER_STATUS } = require('../models/order.model')

async function _getUserPhone(userId) {
  const user = await userRepo.findById(userId)
  return user ? user.phone : null
}

class OrderService {
  async create(userId, data) {
    const { items, address, couponCode, remark } = data

    if (!items || items.length === 0) throw new Error('订单商品不能为空')

    // ── Phase 1: resolve products and build enriched items ───────────────
    const enrichedItems = []
    for (const item of items) {
      const product = await productRepo.findById(item.productId)
      if (!product) throw new Error(`商品 ${item.productId} 不存在`)
      enrichedItems.push({
        productId: product.id,
        productName: product.name,
        productImage: product.image,
        categoryId: product.categoryId,
        price: product.price,
        quantity: item.quantity,
      })
    }

    // ── Phase 2: apply promotion rule engine (flash sale / discount / 满减) ─
    const { enrichedItems: promoItems, promotionDiscount, appliedPromotions } =
      await promotionService.applyPromotions(enrichedItems, userId)

    let totalAmount = promoItems.reduce((sum, i) => sum + i.price * i.quantity, 0)

    // ── Phase 3: apply coupon if provided ────────────────────────────────
    let couponDiscount = 0
    let appliedUserCoupon = null
    let appliedCouponId = null

    if (couponCode) {
      const result = await couponService.applyUserCoupon(userId, couponCode, totalAmount)
      couponDiscount = result.discount
      appliedUserCoupon = result.userCoupon
      appliedCouponId = result.couponId
    }

    const discountAmount = parseFloat((promotionDiscount + couponDiscount).toFixed(2))
    const payAmount = Math.max(0, parseFloat((totalAmount - discountAmount).toFixed(2)))

    // ── Phase 4: lock regular stock + flash-sale stock ───────────────────
    // Lock stock for each item using StockLockService (prevents overselling).
    // NOTE: In production with a real DB, wrap phases 4-7 in a transaction.
    for (const item of promoItems) {
      if (item.isFlashSale) continue   // Flash-sale stock handled separately
      await stockLockService.lockStock(item.productId, item.quantity)
    }
    await promotionService.lockFlashSaleStock(promoItems)

    // UUID-based order number ensures global uniqueness without relying on timestamps
    const orderNo = `ORD${uuidv4().replace(/-/g, '').slice(0, 16).toUpperCase()}`

    // ── Phase 5: persist order ───────────────────────────────────────────
    const order = await orderRepo.create({
      orderNo,
      userId,
      items: promoItems,
      totalAmount,
      discountAmount,
      payAmount,
      address,
      couponId: appliedCouponId,
      appliedPromotions,
      remark: remark || '',
      status: ORDER_STATUS.PENDING_PAYMENT,
    })

    // ── Phase 6: mark user coupon as used ────────────────────────────────
    if (appliedUserCoupon) {
      await couponService.markUsed(appliedUserCoupon.id, order.id)
    }

    // ── Phase 7: send SMS notification ───────────────────────────────────
    const phone = await _getUserPhone(userId)
    await smsService.sendTemplate(phone, 'ORDER_PLACED', { orderNo, expireHours: 24 })

    return order
  }

  async getList(userId, params = {}) {
    const { status, page = 1, pageSize = 10 } = params
    let list = await orderRepo.findByUser(userId)
    if (status) list = list.filter(o => o.status === status)
    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    return orderRepo.paginate(list, Number(page), Number(pageSize))
  }

  async getById(userId, orderId) {
    const order = await orderRepo.findById(orderId)
    if (!order) throw new Error('订单不存在')
    if (order.userId !== userId) throw new Error('无权访问该订单')
    return order
  }

  async cancel(userId, orderId) {
    const order = await orderRepo.findById(orderId)
    if (!order) throw new Error('订单不存在')
    if (order.userId !== userId) throw new Error('无权操作该订单')
    if (order.status !== ORDER_STATUS.PENDING_PAYMENT) throw new Error('只能取消待支付的订单')

    // Release stock locks (order was never paid, no physical deduction)
    for (const item of order.items) {
      if (item.isFlashSale) continue
      await stockLockService.releaseStock(item.productId, item.quantity)
    }
    await promotionService.releaseFlashSaleStock(order.items)

    const updated = await orderRepo.update(orderId, { status: ORDER_STATUS.CANCELLED })

    const phone = await _getUserPhone(userId)
    await smsService.sendTemplate(phone, 'ORDER_CANCELLED', { orderNo: order.orderNo })

    return updated
  }
}

module.exports = new OrderService()

