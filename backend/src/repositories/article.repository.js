'use strict'

const BaseRepository = require('./base.repository')
const { createArticle, ARTICLE_STATUS } = require('../models/article.model')

class ArticleRepository extends BaseRepository {
  constructor() {
    super(createArticle)
  }

  async findPublished() {
    return this.findWhere(a => a.status === ARTICLE_STATUS.PUBLISHED)
  }

  async findByCategory(category) {
    return this.findWhere(a => a.category === category && a.status === ARTICLE_STATUS.PUBLISHED)
  }
}

module.exports = new ArticleRepository()
