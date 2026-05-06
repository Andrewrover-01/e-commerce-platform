'use strict'

const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('../config')
const userRepo = require('../repositories/user.repository')
const { toPublic, USER_ROLES } = require('../models/user.model')

class AuthService {
  /**
   * Register a new user.
   * @param {{ username: string, email: string, password: string }} data
   * @returns {Promise<{ user: Object, token: string }>}
   */
  async register(data) {
    const { username, email, password } = data

    const existingByUsername = await userRepo.findByUsername(username)
    if (existingByUsername) throw new Error('用户名已存在')

    const existingByEmail = await userRepo.findByEmail(email)
    if (existingByEmail) throw new Error('邮箱已被注册')

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await userRepo.create({
      username,
      email,
      password: hashedPassword,
      role: USER_ROLES.USER,
    })

    const token = this._signToken(user, config.jwt.expiresIn)
    return { user: toPublic(user), token }
  }

  /**
   * Login with username/email + password.
   * @param {{ login: string, password: string }} data
   * @returns {Promise<{ user: Object, token: string }>}
   */
  async login(data) {
    const { login, password } = data

    const user =
      (await userRepo.findByUsername(login)) ||
      (await userRepo.findByEmail(login))

    if (!user) throw new Error('用户名或密码错误')
    if (!user.isActive) throw new Error('账号已被禁用')

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) throw new Error('用户名或密码错误')

    const token = this._signToken(user, config.jwt.expiresIn)
    return { user: toPublic(user), token }
  }

  /**
   * Admin login — same flow but role-checked and shorter token TTL.
   * @param {{ login: string, password: string }} data
   * @returns {Promise<{ user: Object, token: string }>}
   */
  async adminLogin(data) {
    const { login, password } = data

    const user =
      (await userRepo.findByUsername(login)) ||
      (await userRepo.findByEmail(login))

    if (!user) throw new Error('用户名或密码错误')
    if (user.role !== USER_ROLES.ADMIN) throw new Error('权限不足')
    if (!user.isActive) throw new Error('账号已被禁用')

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) throw new Error('用户名或密码错误')

    const token = this._signToken(user, config.jwt.adminExpiresIn)
    return { user: toPublic(user), token }
  }

  /**
   * Logout — invalidate the current JWT by blacklisting it.
   * @param {string} token  The raw Bearer token from the request.
   */
  async logout(token) {
    if (!token) return

    // Decode without verifying (it might be expired but we still want to blacklist it)
    let ttlMs = 0
    try {
      const payload = jwt.decode(token)
      if (payload && payload.exp) {
        ttlMs = payload.exp * 1000 - Date.now()
      }
    } catch (_) {
      // If decode fails, blacklist indefinitely (until server restart)
    }

    const { addToBlacklist } = require('../utils/token-blacklist')
    // Only blacklist if the token hasn't already expired (no point otherwise)
    if (ttlMs > 0) {
      addToBlacklist(token, ttlMs)
    } else {
      addToBlacklist(token)
    }
  }

  /** @private */
  _signToken(user, expiresIn) {
    return jwt.sign(
      { id: user.id, role: user.role },
      config.jwt.secret,
      { expiresIn }
    )
  }
}

module.exports = new AuthService()
