'use strict'

const { Router } = require('express')
const contentController = require('../../controllers/admin/content.controller')

const router = Router()

// Banners
router.get('/banners', contentController.getBanners.bind(contentController))
router.post('/banners', contentController.createBanner.bind(contentController))
router.put('/banners/:id', contentController.updateBanner.bind(contentController))
router.delete('/banners/:id', contentController.deleteBanner.bind(contentController))

// Notices
router.get('/notices', contentController.getNotices.bind(contentController))
router.post('/notices', contentController.createNotice.bind(contentController))
router.put('/notices/:id', contentController.updateNotice.bind(contentController))
router.delete('/notices/:id', contentController.deleteNotice.bind(contentController))

// Articles
router.get('/articles', contentController.getArticles.bind(contentController))
router.post('/articles', contentController.createArticle.bind(contentController))
router.put('/articles/:id', contentController.updateArticle.bind(contentController))
router.delete('/articles/:id', contentController.deleteArticle.bind(contentController))

// Reviews
router.get('/reviews', contentController.getReviews.bind(contentController))
router.post('/reviews/:id/approve', contentController.approveReview.bind(contentController))
router.post('/reviews/:id/reject', contentController.rejectReview.bind(contentController))
router.delete('/reviews/:id', contentController.deleteReview.bind(contentController))

module.exports = router
