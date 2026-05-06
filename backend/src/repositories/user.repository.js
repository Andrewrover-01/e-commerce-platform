'use strict'

const BaseRepository = require('./base.repository')
const { createUser } = require('../models/user.model')

class UserRepository extends BaseRepository {
  constructor() {
    super(createUser)
  }

  async findByUsername(username) {
    return this.findOneWhere(u => u.username === username)
  }

  async findByEmail(email) {
    return this.findOneWhere(u => u.email === email)
  }

  async findActive() {
    return this.findWhere(u => u.isActive)
  }
}

module.exports = new UserRepository()
