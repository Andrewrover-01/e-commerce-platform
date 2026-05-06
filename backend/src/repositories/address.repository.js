'use strict'

const BaseRepository = require('./base.repository')
const { createAddress } = require('../models/address.model')

class AddressRepository extends BaseRepository {
  constructor() {
    super(createAddress)
  }

  async findByUser(userId) {
    return this.findWhere(a => a.userId === userId)
  }

  async findDefaultByUser(userId) {
    return this.findOneWhere(a => a.userId === userId && a.isDefault)
  }

  /**
   * Set one address as default and clear the flag on all others for the user.
   * @param {string} userId
   * @param {string} addressId
   * @returns {Promise<Object|null>}
   */
  async setDefault(userId, addressId) {
    const addresses = this._store.filter(a => a.userId === userId)
    for (const addr of addresses) {
      addr.isDefault = addr.id === addressId
      addr.updatedAt = new Date()
    }
    return this._store.find(a => a.id === addressId) || null
  }
}

module.exports = new AddressRepository()
