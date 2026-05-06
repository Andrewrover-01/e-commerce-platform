'use strict'

const dashboardService = require('../../services/admin/dashboard.service')

class AdminDashboardController {
  async getOverview(req, res, next) {
    try {
      const data = await dashboardService.getOverview()
      res.json({ code: 200, data })
    } catch (err) {
      next(err)
    }
  }

  async getRecentOrders(req, res, next) {
    try {
      const orders = await dashboardService.getRecentOrders(Number(req.query.limit) || 10)
      res.json({ code: 200, data: orders })
    } catch (err) {
      next(err)
    }
  }
}

module.exports = new AdminDashboardController()
