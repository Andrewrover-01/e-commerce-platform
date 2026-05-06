'use strict'

const { Router } = require('express')
const productController = require('../../controllers/admin/product.controller')

const router = Router()

// Products
router.get('/', productController.getList.bind(productController))
router.get('/:id', productController.getById.bind(productController))
router.post('/', productController.create.bind(productController))
router.put('/:id', productController.update.bind(productController))
router.delete('/:id', productController.delete.bind(productController))

// Categories
router.get('/categories/list', productController.getCategoryList.bind(productController))
router.post('/categories', productController.createCategory.bind(productController))
router.put('/categories/:id', productController.updateCategory.bind(productController))
router.delete('/categories/:id', productController.deleteCategory.bind(productController))

module.exports = router
