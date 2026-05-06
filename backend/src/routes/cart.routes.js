'use strict'

const { Router } = require('express')
const cartController = require('../controllers/cart.controller')
const auth = require('../middlewares/auth.middleware')

const router = Router()

router.use(auth)

router.get('/', cartController.getCart.bind(cartController))
router.post('/items', cartController.addItem.bind(cartController))
router.put('/items/:productId', cartController.updateItem.bind(cartController))
router.delete('/items/:productId', cartController.removeItem.bind(cartController))
router.delete('/', cartController.clear.bind(cartController))
router.patch('/items/:productId/select', cartController.toggleSelect.bind(cartController))

module.exports = router
