'use strict'

const orderRepo = require('../../repositories/order.repository')
const { ORDER_STATUS } = require('../../models/order.model')

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
