'use strict'

const { Router } = require('express')
const categoryController = require('../controllers/category.controller')

const router = Router()

router.get('/', categoryController.getList.bind(categoryController))
router.get('/tree', categoryController.getTree.bind(categoryController))
router.get('/:id', categoryController.getById.bind(categoryController))

module.exports = router
