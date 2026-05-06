'use strict'

/**
 * Article (CMS content) model schema definition.
 *
 * @typedef {Object} Article
 * @property {string}  id
 * @property {string}  title
 * @property {string}  summary
 * @property {string}  content     - HTML or Markdown body
 * @property {string}  coverImage
 * @property {string}  category    - e.g. 'news' | 'guide' | 'help'
 * @property {string}  status      - 'draft' | 'published'
 * @property {number}  views
 * @property {Date}    publishedAt
 * @property {Date}    createdAt
 * @property {Date}    updatedAt
 */

const ARTICLE_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
}

function createArticle(data) {
  return {
    id: data.id || null,
    title: data.title || '',
    summary: data.summary || '',
    content: data.content || '',
    coverImage: data.coverImage || '',
    category: data.category || 'news',
    status: data.status || ARTICLE_STATUS.DRAFT,
    views: Number(data.views) || 0,
    publishedAt: data.publishedAt || null,
    createdAt: data.createdAt || new Date(),
    updatedAt: data.updatedAt || new Date(),
  }
}

module.exports = { createArticle, ARTICLE_STATUS }
