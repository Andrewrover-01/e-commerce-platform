'use strict'

const orderRepo = require('../../repositories/order.repository')
const userRepo = require('../../repositories/user.repository')
const productRepo = require('../../repositories/product.repository')

/**
 * Admin dashboard service — aggregates KPI data.
 * Replace with real DB aggregation queries when integrating a database.
 */
class DashboardService {
  async getOverview() {
    const [allOrders, allUsers, allProducts] = await Promise.all([
      orderRepo.findAll(),
      userRepo.findAll(),
      productRepo.findAll(),
    ])

    const revenue = allOrders
      .filter(o => ['paid', 'shipped', 'delivered'].includes(o.status))
      .reduce((sum, o) => sum + o.payAmount, 0)

    return {
      totalRevenue: revenue,
      totalOrders: allOrders.length,
      totalUsers: allUsers.length,
      totalProducts: allProducts.length,
    }
  }

  async getRecentOrders(limit = 10) {
    const orders = await orderRepo.findAll()
    return orders
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit)
  }
}

module.exports = new DashboardService()
