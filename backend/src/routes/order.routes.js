'use strict'

const { Router } = require('express')
const orderController = require('../controllers/order.controller')
const auth = require('../middlewares/auth.middleware')

const router = Router()

router.use(auth)

router.get('/', orderController.getList.bind(orderController))
router.post('/', orderController.create.bind(orderController))
router.get('/:id', orderController.getById.bind(orderController))
router.post('/:id/cancel', orderController.cancel.bind(orderController))

module.exports = router
