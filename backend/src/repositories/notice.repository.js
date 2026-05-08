'use strict'

const BaseRepository = require('./base.repository')
const { createNotice } = require('../models/notice.model')

class NoticeRepository extends BaseRepository {
  constructor() {
    super(createNotice)
  }

  async findActive() {
    const notices = await this.findWhere(n => n.isActive)
    return notices.sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0) || b.createdAt - a.createdAt)
  }
}

module.exports = new NoticeRepository()
