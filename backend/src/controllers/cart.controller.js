'use strict'

const cartService = require('../services/cart.service')

class CartController {
  async getCart(req, res, next) {
    try {
      const cart = await cartService.getCart(req.user.id)
      res.json({ code: 200, data: cart })
    } catch (err) {
      next(err)
    }
  }

  async addItem(req, res, next) {
    try {
      const cart = await cartService.addItem(req.user.id, req.body)
      res.json({ code: 200, message: '加入购物车成功', data: cart })
    } catch (err) {
      next(err)
    }
  }

  async updateItem(req, res, next) {
    try {
      const { productId } = req.params
      const { quantity } = req.body
      const cart = await cartService.updateItem(req.user.id, productId, Number(quantity))
      res.json({ code: 200, data: cart })
    } catch (err) {
      next(err)
    }
  }

  async removeItem(req, res, next) {
    try {
      const cart = await cartService.removeItem(req.user.id, req.params.productId)
      res.json({ code: 200, message: '删除成功', data: cart })
    } catch (err) {
      next(err)
    }
  }

  async clear(req, res, next) {
    try {
      await cartService.clear(req.user.id)
      res.json({ code: 200, message: '购物车已清空' })
    } catch (err) {
      next(err)
    }
  }

  async toggleSelect(req, res, next) {
    try {
      const { productId } = req.params
      const { selected } = req.body
      const cart = await cartService.toggleSelect(req.user.id, productId, Boolean(selected))
      res.json({ code: 200, data: cart })
    } catch (err) {
      next(err)
    }
  }
}

module.exports = new CartController()
