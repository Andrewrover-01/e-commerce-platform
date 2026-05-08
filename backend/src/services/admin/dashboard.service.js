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

  async getSalesTrend(params = {}) {
    const days = Math.max(1, Math.min(365, Number(params.days) || 7))
    const orders = await orderRepo.findAll()
    const paidStatuses = ['paid', 'shipped', 'delivered']
    const end = new Date()
    const start = new Date(end)
    start.setDate(end.getDate() - (days - 1))

    const trendMap = new Map()
    for (let i = 0; i < days; i++) {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      const key = d.toISOString().slice(0, 10)
      trendMap.set(key, { date: key, amount: 0, orderCount: 0 })
    }

    for (const order of orders) {
      if (!paidStatuses.includes(order.status)) continue
      const dt = new Date(order.paidAt || order.createdAt)
      const key = dt.toISOString().slice(0, 10)
      const item = trendMap.get(key)
      if (!item) continue
      item.amount += Number(order.payAmount || 0)
      item.orderCount += 1
    }

    return Array.from(trendMap.values())
  }

  async getProductStats(params = {}) {
    const limit = Math.max(1, Math.min(100, Number(params.limit) || 10))
    const orders = await orderRepo.findAll()
    const paidStatuses = ['paid', 'shipped', 'delivered']
    const statsMap = new Map()
    let totalSales = 0
    let totalAmount = 0

    for (const order of orders) {
      if (!paidStatuses.includes(order.status)) continue
      for (const item of order.items || []) {
        totalSales += Number(item.quantity || 0)
        totalAmount += Number(item.price || 0) * Number(item.quantity || 0)
        if (!statsMap.has(item.productId)) {
          statsMap.set(item.productId, {
            productId: item.productId,
            productName: item.productName,
            sales: 0,
            amount: 0,
          })
        }
        const stat = statsMap.get(item.productId)
        stat.sales += Number(item.quantity || 0)
        stat.amount += Number(item.price || 0) * Number(item.quantity || 0)
      }
    }

    const list = Array.from(statsMap.values())
      .sort((a, b) => b.sales - a.sales)
      .slice(0, limit)

    return { totalSales, totalAmount, list }
  }

  async getUserStats(params = {}) {
    const days = Math.max(1, Math.min(365, Number(params.days) || 7))
    const [users, orders] = await Promise.all([userRepo.findAll(), orderRepo.findAll()])

    const totalUsers = users.length
    const disabledUsers = users.filter(u => !u.isActive).length
    const end = new Date()
    const start = new Date(end)
    start.setDate(end.getDate() - (days - 1))

    const newUsersMap = new Map()
    for (let i = 0; i < days; i++) {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      const key = d.toISOString().slice(0, 10)
      newUsersMap.set(key, { date: key, count: 0 })
    }

    for (const user of users) {
      const key = new Date(user.createdAt).toISOString().slice(0, 10)
      const item = newUsersMap.get(key)
      if (item) item.count += 1
    }

    const activeUserSet = new Set()
    for (const order of orders) {
      const key = new Date(order.createdAt).toISOString().slice(0, 10)
      if (newUsersMap.has(key)) activeUserSet.add(order.userId)
    }

    return {
      totalUsers,
      disabledUsers,
      activeUsers: activeUserSet.size,
      newUsersTrend: Array.from(newUsersMap.values()),
    }
  }
}

module.exports = new DashboardService()
