'use strict'

const BaseRepository = require('./base.repository')
const { createBanner } = require('../models/banner.model')

class BannerRepository extends BaseRepository {
  constructor() {
    super(createBanner)
  }

  async findActive() {
    const banners = await this.findWhere(b => b.isActive)
    return banners.sort((a, b) => a.sort - b.sort)
  }
}

module.exports = new BannerRepository()
