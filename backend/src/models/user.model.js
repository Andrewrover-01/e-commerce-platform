'use strict'

/**
 * User model schema definition.
 *
 * When integrating a real database, convert this to an ORM model
 * (e.g. Sequelize.define / mongoose.Schema).
 *
 * @typedef {Object} User
 * @property {string}  id          - UUID
 * @property {string}  username    - Unique username
 * @property {string}  email       - Unique email
 * @property {string}  password    - Bcrypt-hashed password
 * @property {string}  avatar      - Avatar URL
 * @property {string}  phone       - Phone number
 * @property {string}  role        - 'user' | 'admin'
 * @property {boolean} isActive    - Account enabled flag
 * @property {Date}    createdAt
 * @property {Date}    updatedAt
 */

const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
}

/**
 * Create a new user object with defaults.
 * @param {Partial<User>} data
 * @returns {User}
 */
function createUser(data) {
  return {
    id: data.id || null,
    username: data.username || '',
    email: data.email || '',
    password: data.password || '',
    avatar: data.avatar || '',
    phone: data.phone || '',
    role: data.role || USER_ROLES.USER,
    isActive: data.isActive !== undefined ? data.isActive : true,
    createdAt: data.createdAt || new Date(),
    updatedAt: data.updatedAt || new Date(),
  }
}

/**
 * Return a user object safe for public API response (no password).
 * @param {User} user
 * @returns {Omit<User, 'password'>}
 */
function toPublic(user) {
  const { password, ...rest } = user
  return rest
}

module.exports = { createUser, toPublic, USER_ROLES }
