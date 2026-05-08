'use strict'

const userRepo = require('../repositories/user.repository')
const { toPublic } = require('../models/user.model')

class UserService {
  async getProfile(userId) {
    const user = await userRepo.findById(userId)
    if (!user) throw new Error('用户不存在')
    return toPublic(user)
  }

  async updateProfile(userId, updates) {
    const allowed = ['username', 'avatar', 'phone']
    const safeUpdates = Object.fromEntries(
      Object.entries(updates).filter(([k]) => allowed.includes(k))
    )
    const updated = await userRepo.update(userId, safeUpdates)
    if (!updated) throw new Error('用户不存在')
    return toPublic(updated)
  }
}

module.exports = new UserService()
