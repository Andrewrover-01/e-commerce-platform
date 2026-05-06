'use strict'

const { Router } = require('express')
const userController = require('../../controllers/admin/user.controller')

const router = Router()

router.get('/', userController.getList.bind(userController))
router.get('/:id', userController.getById.bind(userController))
router.post('/', userController.create.bind(userController))
router.put('/:id', userController.update.bind(userController))
router.patch('/:id/active', userController.toggleActive.bind(userController))

module.exports = router
