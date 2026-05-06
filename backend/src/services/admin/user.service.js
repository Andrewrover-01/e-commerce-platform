'use strict'

const userRepo = require('../../repositories/user.repository')
const { toPublic, USER_ROLES } = require('../../models/user.model')
const bcrypt = require('bcryptjs')

class AdminUserService {
  async getList(params = {}) {
    const { keyword, role, isActive, page = 1, pageSize = 20 } = params
    let list = await userRepo.findAll()

    if (keyword) {
      const kw = keyword.toLowerCase()
      list = list.filter(
        u => u.username.toLowerCase().includes(kw) || u.email.toLowerCase().includes(kw)
      )
    }
    if (role) list = list.filter(u => u.role === role)
    if (isActive !== undefined) list = list.filter(u => u.isActive === (isActive === 'true'))

    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    const paginated = userRepo.paginate(list, Number(page), Number(pageSize))
    return { ...paginated, list: paginated.list.map(toPublic) }
  }

  async getById(id) {
    const user = await userRepo.findById(id)
    if (!user) throw new Error('用户不存在')
    return toPublic(user)
  }

  async create(data) {
    const { username, email, password, role = USER_ROLES.USER } = data
    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await userRepo.create({ username, email, password: hashedPassword, role })
    return toPublic(user)
  }

  async update(id, data) {
    const allowed = ['username', 'email', 'avatar', 'phone', 'role', 'isActive']
    const safeUpdates = Object.fromEntries(
      Object.entries(data).filter(([k]) => allowed.includes(k))
    )
    const updated = await userRepo.update(id, safeUpdates)
    if (!updated) throw new Error('用户不存在')
    return toPublic(updated)
  }

  async toggleActive(id, isActive) {
    return this.update(id, { isActive })
  }
}

module.exports = new AdminUserService()
