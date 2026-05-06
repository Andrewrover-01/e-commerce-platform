'use strict'

const { Router } = require('express')
const dashboardController = require('../../controllers/admin/dashboard.controller')

const router = Router()

router.get('/overview', dashboardController.getOverview.bind(dashboardController))
router.get('/recent-orders', dashboardController.getRecentOrders.bind(dashboardController))

module.exports = router
