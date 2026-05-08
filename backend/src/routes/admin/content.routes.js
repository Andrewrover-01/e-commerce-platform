'use strict'

const { Router } = require('express')
const contentController = require('../../controllers/admin/content.controller')
const { sensitiveWordFilter } = require('../../middlewares/sensitive-word.middleware')

const router = Router()

// Banners
router.get('/banners', contentController.getBanners.bind(contentController))
router.post('/banners', sensitiveWordFilter(), contentController.createBanner.bind(contentController))
router.put('/banners/:id', sensitiveWordFilter(), contentController.updateBanner.bind(contentController))
router.delete('/banners/:id', contentController.deleteBanner.bind(contentController))

// Notices
router.get('/notices', contentController.getNotices.bind(contentController))
router.post('/notices', sensitiveWordFilter(), contentController.createNotice.bind(contentController))
router.put('/notices/:id', sensitiveWordFilter(), contentController.updateNotice.bind(contentController))
router.delete('/notices/:id', contentController.deleteNotice.bind(contentController))

// Articles
router.get('/articles', contentController.getArticles.bind(contentController))
router.post('/articles', sensitiveWordFilter(), contentController.createArticle.bind(contentController))
router.put('/articles/:id', sensitiveWordFilter(), contentController.updateArticle.bind(contentController))
router.delete('/articles/:id', contentController.deleteArticle.bind(contentController))

// Reviews
router.get('/reviews', contentController.getReviews.bind(contentController))
router.post('/reviews/:id/approve', contentController.approveReview.bind(contentController))
router.post('/reviews/:id/reject', contentController.rejectReview.bind(contentController))
router.delete('/reviews/:id', contentController.deleteReview.bind(contentController))

module.exports = router
