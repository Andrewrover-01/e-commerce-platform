'use strict'

const { Router } = require('express')
const productController = require('../controllers/product.controller')

const router = Router()

router.get('/', productController.getList.bind(productController))
router.get('/hot', productController.getHot.bind(productController))
router.get('/new', productController.getNew.bind(productController))
router.get('/flash-sale', productController.getFlashSale.bind(productController))
router.get('/:id', productController.getById.bind(productController))

module.exports = router
