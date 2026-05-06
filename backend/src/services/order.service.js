'use strict'

const orderRepo = require('../repositories/order.repository')
const productRepo = require('../repositories/product.repository')
const { ORDER_STATUS } = require('../models/order.model')

class OrderService {
  async create(userId, data) {
    const { items, address, couponId, remark } = data

    if (!items || items.length === 0) throw new Error('订单商品不能为空')

    // Calculate totals
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

    const orderNo = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`

    const order = await orderRepo.create({
      orderNo,
      userId,
      items: enrichedItems,
      totalAmount,
      discountAmount: 0,
      payAmount: totalAmount,
      address,
      couponId: couponId || null,
      remark: remark || '',
      status: ORDER_STATUS.PENDING_PAYMENT,
    })

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
    return orderRepo.update(orderId, { status: ORDER_STATUS.CANCELLED })
  }
}

module.exports = new OrderService()
