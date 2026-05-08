'use strict'

const orderRepo = require('../../repositories/order.repository')
const productRepo = require('../../repositories/product.repository')
const { ORDER_STATUS } = require('../../models/order.model')
const AppError = require('../../utils/app-error')

class AdminOrderService {
  async getList(params = {}) {
    const { status, userId, keyword, page = 1, pageSize = 20 } = params
    let list = await orderRepo.findAll()

    if (status) list = list.filter(o => o.status === status)
    if (userId) list = list.filter(o => o.userId === userId)
    if (keyword) {
      list = list.filter(
        o => o.orderNo.includes(keyword) || o.userId.includes(keyword)
      )
    }
    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    return orderRepo.paginate(list, Number(page), Number(pageSize))
  }

  async getById(id) {
    const order = await orderRepo.findById(id)
    if (!order) throw new Error('订单不存在')
    return order
  }

  async updateStatus(id, status) {
    if (!Object.values(ORDER_STATUS).includes(status)) throw new Error('无效的订单状态')
    const updated = await orderRepo.update(id, { status })
    if (!updated) throw new Error('订单不存在')
    return updated
  }

  async ship(id, trackingNo) {
    const order = await this.getById(id)
    if (order.status !== ORDER_STATUS.PAID) {
      throw AppError.conflict('仅已支付订单可发货')
    }
    if (!trackingNo || !String(trackingNo).trim()) {
      throw AppError.badRequest('请提供物流单号')
    }
    return orderRepo.update(id, {
      status: ORDER_STATUS.SHIPPED,
      trackingNo: String(trackingNo).trim(),
      shippedAt: new Date(),
    })
  }

  async complete(id) {
    const order = await this.getById(id)
    if (order.status !== ORDER_STATUS.SHIPPED) {
      throw AppError.conflict('仅已发货订单可完成')
    }
    return orderRepo.update(id, {
      status: ORDER_STATUS.DELIVERED,
      deliveredAt: new Date(),
    })
  }

  async cancel(id, reason = '') {
    const order = await this.getById(id)
    const cancellable = [ORDER_STATUS.PENDING_PAYMENT, ORDER_STATUS.PAID]
    if (!cancellable.includes(order.status)) {
      throw AppError.conflict('仅待支付或已支付订单可取消')
    }

    for (const item of order.items || []) {
      const product = await productRepo.findById(item.productId)
      if (!product) continue
      await productRepo.update(product.id, {
        stock: product.stock + item.quantity,
        sales: Math.max(0, product.sales - item.quantity),
      })
    }

    return orderRepo.update(id, {
      status: ORDER_STATUS.CANCELLED,
      cancelReason: reason || '',
      cancelledAt: new Date(),
    })
  }

  async getRefundList(params = {}) {
    const { page = 1, pageSize = 20 } = params
    const list = await orderRepo.findByStatus(ORDER_STATUS.REFUNDING)
    return orderRepo.paginate(list, Number(page), Number(pageSize))
  }

  async handleRefund(id, approved) {
    const status = approved ? ORDER_STATUS.REFUNDED : ORDER_STATUS.DELIVERED
    return this.updateStatus(id, status)
  }
}

module.exports = new AdminOrderService()
