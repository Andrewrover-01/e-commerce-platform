'use strict'

const { v4: uuidv4 } = require('uuid')
const orderRepo = require('../repositories/order.repository')
const productRepo = require('../repositories/product.repository')
const couponService = require('./coupon.service')
const { ORDER_STATUS } = require('../models/order.model')

class OrderService {
  async create(userId, data) {
    const { items, address, couponCode, remark } = data

    if (!items || items.length === 0) throw new Error('订单商品不能为空')

    // ── Phase 1: validate stock and compute line totals ──────────────────
    // NOTE: In production with a real DB, wrap from here to Phase 5 in a
    // database transaction and use SELECT ... FOR UPDATE to lock rows and
    // prevent overselling under concurrent requests.
    let totalAmount = 0
    const enrichedItems = []
    for (const item of items) {
      const product = await productRepo.findById(item.productId)
      if (!product) throw new Error(`商品 ${item.productId} 不存在`)
      if (product.stock < item.quantity) throw new Error(`商品 ${product.name} 库存不足`)
      const lineTotal = product.price * item.quantity
      totalAmount += lineTotal
      enrichedItems.push({
        productId: product.id,
        productName: product.name,
        productImage: product.image,
        price: product.price,
        quantity: item.quantity,
      })
    }

    // ── Phase 2: apply coupon if provided ────────────────────────────────
    let discountAmount = 0
    let appliedUserCoupon = null
    let appliedCouponId = null

    if (couponCode) {
      const result = await couponService.applyUserCoupon(userId, couponCode, totalAmount)
      discountAmount = result.discount
      appliedUserCoupon = result.userCoupon
      appliedCouponId = result.couponId
    }

    const payAmount = Math.max(0, parseFloat((totalAmount - discountAmount).toFixed(2)))

    // UUID-based order number ensures global uniqueness without relying on timestamps
    const orderNo = `ORD${uuidv4().replace(/-/g, '').slice(0, 16).toUpperCase()}`

    // ── Phase 3: persist order ───────────────────────────────────────────
    const order = await orderRepo.create({
      orderNo,
      userId,
      items: enrichedItems,
      totalAmount,
      discountAmount,
      payAmount,
      address,
      couponId: appliedCouponId,
      remark: remark || '',
      status: ORDER_STATUS.PENDING_PAYMENT,
    })

    // ── Phase 4: deduct stock ────────────────────────────────────────────
    // NOTE: In production use an atomic decrement (e.g. UPDATE … SET stock = stock - n WHERE stock >= n)
    // to prevent overselling under concurrent requests.
    for (const item of enrichedItems) {
      const product = await productRepo.findById(item.productId)
      if (product) {
        await productRepo.update(product.id, {
          stock: product.stock - item.quantity,
          sales: product.sales + item.quantity,
        })
      }
    }

    // ── Phase 5: mark user coupon as used ────────────────────────────────
    if (appliedUserCoupon) {
      await couponService.markUsed(appliedUserCoupon.id, order.id)
    }

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

    // Restore stock on cancel
    // NOTE: In production use an atomic increment inside a transaction.
    for (const item of order.items) {
      const product = await productRepo.findById(item.productId)
      if (product) {
        await productRepo.update(product.id, {
          stock: product.stock + item.quantity,
          sales: Math.max(0, product.sales - item.quantity),
        })
      }
    }

    return orderRepo.update(orderId, { status: ORDER_STATUS.CANCELLED })
  }
}

module.exports = new OrderService()
