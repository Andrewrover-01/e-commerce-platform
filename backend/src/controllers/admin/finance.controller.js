'use strict'

const adminFinanceService = require('../../services/admin/finance.service')

class AdminFinanceController {
  async getOverview(req, res, next) {
    try {
      const data = await adminFinanceService.getOverview(req.query)
      res.json({ code: 200, data })
    } catch (err) { next(err) }
  }

  async getStatements(req, res, next) {
    try {
      const result = await adminFinanceService.getStatements(req.query)
      res.json({ code: 200, data: result })
    } catch (err) { next(err) }
  }
}

module.exports = new AdminFinanceController()
