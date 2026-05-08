'use strict'

const { Router } = require('express')
const financeController = require('../../controllers/admin/finance.controller')

const router = Router()

router.get('/overview', financeController.getOverview.bind(financeController))
router.get('/statements', financeController.getStatements.bind(financeController))

module.exports = router
