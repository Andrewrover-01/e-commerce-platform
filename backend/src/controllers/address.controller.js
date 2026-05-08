'use strict'

const addressService = require('../services/address.service')

class AddressController {
  async list(req, res, next) {
    try {
      const addresses = await addressService.list(req.user.id)
      res.json({ code: 200, data: addresses })
    } catch (err) {
      next(err)
    }
  }

  async add(req, res, next) {
    try {
      const address = await addressService.add(req.user.id, req.body)
      res.status(201).json({ code: 200, message: '地址添加成功', data: address })
    } catch (err) {
      next(err)
    }
  }

  async update(req, res, next) {
    try {
      const address = await addressService.update(req.user.id, req.params.id, req.body)
      res.json({ code: 200, message: '地址更新成功', data: address })
    } catch (err) {
      next(err)
    }
  }

  async remove(req, res, next) {
    try {
      await addressService.remove(req.user.id, req.params.id)
      res.json({ code: 200, message: '地址删除成功' })
    } catch (err) {
      next(err)
    }
  }

  async setDefault(req, res, next) {
    try {
      const address = await addressService.setDefault(req.user.id, req.params.id)
      res.json({ code: 200, message: '已设为默认地址', data: address })
    } catch (err) {
      next(err)
    }
  }
}

module.exports = new AddressController()
