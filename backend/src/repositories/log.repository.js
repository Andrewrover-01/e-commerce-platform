'use strict'

const BaseRepository = require('./base.repository')
const { createLog } = require('../models/log.model')

class LogRepository extends BaseRepository {
  constructor() {
    super(createLog)
  }

  async findByEvent(event) {
    return this.findWhere(log => log.event === event)
  }
}

module.exports = new LogRepository()
