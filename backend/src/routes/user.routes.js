'use strict'

const { Router } = require('express')
const userController = require('../controllers/user.controller')
const auth = require('../middlewares/auth.middleware')

const router = Router()

router.use(auth)

router.get('/profile', userController.getProfile.bind(userController))
router.put('/profile', userController.updateProfile.bind(userController))

module.exports = router
