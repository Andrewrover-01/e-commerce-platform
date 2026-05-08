'use strict'

const { Router } = require('express')
const dashboardController = require('../../controllers/admin/dashboard.controller')

const router = Router()

router.get('/overview', dashboardController.getOverview.bind(dashboardController))
router.get('/recent-orders', dashboardController.getRecentOrders.bind(dashboardController))
router.get('/sales-trend', dashboardController.getSalesTrend.bind(dashboardController))
router.get('/product-stats', dashboardController.getProductStats.bind(dashboardController))
router.get('/user-stats', dashboardController.getUserStats.bind(dashboardController))

module.exports = router
