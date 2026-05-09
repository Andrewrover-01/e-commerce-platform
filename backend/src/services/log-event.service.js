'use strict'

const logRepo = require('../repositories/log.repository')
const queueService = require('./queue.service')

class LogEventService {
  async record({ level = 'info', event, message, payload = {} }) {
    const entry = await logRepo.create({ level, event, message, payload })
    await queueService.publishLogEvent({
      id: entry.id,
      level: entry.level,
      event: entry.event,
      message: entry.message,
      createdAt: entry.createdAt,
    })
    return entry
  }
}

module.exports = new LogEventService()
