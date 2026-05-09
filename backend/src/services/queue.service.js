'use strict'

const config = require('../config')
const { getClient, isReady } = require('../config/redis')

const memoryQueues = new Map()
const memorySequences = new Map()
let started = false

function _sequenceKey(queueKey) {
  return `${queueKey}:seq`
}

function _nowIso() {
  return new Date().toISOString()
}

async function start() {
  started = true
  if (!config.queue.enabled) {
    console.log('[Queue] Disabled (set QUEUE_ENABLED=true to enable)')
    return
  }
  console.log('[Queue] Enabled')
}

async function _nextSequence(queueKey) {
  if (config.redis.enabled && isReady()) {
    return await getClient().incr(_sequenceKey(queueKey))
  }
  const next = (memorySequences.get(queueKey) || 0) + 1
  memorySequences.set(queueKey, next)
  return next
}

async function publish(queueKey, type, payload = {}) {
  if (!started) await start()

  const sequence = await _nextSequence(queueKey)
  const event = {
    sequence,
    queue: queueKey,
    type,
    payload,
    publishedAt: _nowIso(),
  }

  if (config.redis.enabled && isReady()) {
    await getClient().rPush(queueKey, JSON.stringify(event))
    return event
  }

  const queue = memoryQueues.get(queueKey) || []
  queue.push(event)
  memoryQueues.set(queueKey, queue)
  return event
}

async function publishOrderEvent(eventType, payload = {}) {
  return publish(config.queue.orderQueueKey, eventType, payload)
}

async function publishLogEvent(payload = {}) {
  return publish(config.queue.logQueueKey, 'log_event', payload)
}

module.exports = {
  start,
  publish,
  publishOrderEvent,
  publishLogEvent,
}
