'use strict'

const orderRepo = require('../../repositories/order.repository')

class AdminFinanceService {
  async getOverview(params = {}) {
    const orders = await orderRepo.findAll()
    const paid = orders.filter(o => ['paid', 'shipped', 'delivered'].includes(o.status))

    const totalRevenue = paid.reduce((sum, o) => sum + o.payAmount, 0)
    const totalOrders = paid.length
    const avgOrderValue = totalOrders ? parseFloat((totalRevenue / totalOrders).toFixed(2)) : 0

    return { totalRevenue, totalOrders, avgOrderValue }
  }

  async getStatements(params = {}) {
    const { page = 1, pageSize = 20 } = params
    const orders = await orderRepo.findAll()
    const paid = orders
      .filter(o => ['paid', 'shipped', 'delivered'].includes(o.status))
      .sort((a, b) => new Date(b.paidAt || b.createdAt) - new Date(a.paidAt || a.createdAt))
    return orderRepo.paginate(paid, Number(page), Number(pageSize))
  }
}

module.exports = new AdminFinanceService()
