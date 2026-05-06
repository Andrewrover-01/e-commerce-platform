'use strict'

const addressRepo = require('../repositories/address.repository')
const AppError = require('../utils/app-error')

class AddressService {
  async list(userId) {
    const addresses = await addressRepo.findByUser(userId)
    return addresses.sort((a, b) => {
      if (a.isDefault !== b.isDefault) return a.isDefault ? -1 : 1
      return new Date(b.createdAt) - new Date(a.createdAt)
    })
  }

  async add(userId, data) {
    const { name, phone, province, city, district, street, postcode, isDefault } = data

    // If marking new address as default, clear current default first
    if (isDefault) {
      await this._clearDefault(userId)
    }

    // First address for user is automatically the default
    const existing = await addressRepo.findByUser(userId)
    const makeDefault = isDefault || existing.length === 0

    return addressRepo.create({ userId, name, phone, province, city, district, street, postcode, isDefault: makeDefault })
  }

  async update(userId, addressId, data) {
    const address = await this._getOwned(userId, addressId)

    const { name, phone, province, city, district, street, postcode, isDefault } = data
    const updates = {}
    if (name !== undefined) updates.name = name
    if (phone !== undefined) updates.phone = phone
    if (province !== undefined) updates.province = province
    if (city !== undefined) updates.city = city
    if (district !== undefined) updates.district = district
    if (street !== undefined) updates.street = street
    if (postcode !== undefined) updates.postcode = postcode

    if (isDefault) {
      await this._clearDefault(userId)
      updates.isDefault = true
    }

    return addressRepo.update(address.id, updates)
  }

  async remove(userId, addressId) {
    await this._getOwned(userId, addressId)
    await addressRepo.delete(addressId)
    return true
  }

  async setDefault(userId, addressId) {
    await this._getOwned(userId, addressId)
    return addressRepo.setDefault(userId, addressId)
  }

  /** @private */
  async _getOwned(userId, addressId) {
    const address = await addressRepo.findById(addressId)
    if (!address) throw AppError.notFound('地址不存在')
    if (address.userId !== userId) throw AppError.forbidden('无权操作该地址')
    return address
  }

  /** @private */
  async _clearDefault(userId) {
    const current = await addressRepo.findDefaultByUser(userId)
    if (current) {
      await addressRepo.update(current.id, { isDefault: false })
    }
  }
}

module.exports = new AddressService()
