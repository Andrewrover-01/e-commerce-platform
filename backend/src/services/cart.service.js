'use strict'

const cartRepo = require('../repositories/cart.repository')
const productRepo = require('../repositories/product.repository')
const { createCartItem } = require('../models/cart.model')

class CartService {
  async getCart(userId) {
    const cart = await cartRepo.findByUser(userId)
    return cart || { userId, items: [] }
  }

  async addItem(userId, data) {
    const { productId, quantity = 1 } = data
    const product = await productRepo.findById(productId)
    if (!product) throw new Error('商品不存在')

    let cart = await cartRepo.findByUser(userId)

    if (!cart) {
      cart = await cartRepo.create({
        userId,
        items: [createCartItem({ ...product, productId: product.id, quantity })],
      })
      return cart
    }

    const existingIndex = cart.items.findIndex(i => i.productId === productId)
    let items
    if (existingIndex !== -1) {
      items = cart.items.map((item, idx) =>
        idx === existingIndex
          ? { ...item, quantity: item.quantity + quantity }
          : item
      )
    } else {
      items = [...cart.items, createCartItem({ ...product, productId: product.id, quantity })]
    }

    return cartRepo.update(cart.id, { items, updatedAt: new Date() })
  }

  async updateItem(userId, productId, quantity) {
    const cart = await cartRepo.findByUser(userId)
    if (!cart) throw new Error('购物车不存在')

    const items =
      quantity <= 0
        ? cart.items.filter(i => i.productId !== productId)
        : cart.items.map(i => (i.productId === productId ? { ...i, quantity } : i))

    return cartRepo.update(cart.id, { items, updatedAt: new Date() })
  }

  async removeItem(userId, productId) {
    return this.updateItem(userId, productId, 0)
  }

  async clear(userId) {
    const cart = await cartRepo.findByUser(userId)
    if (!cart) return null
    return cartRepo.update(cart.id, { items: [], updatedAt: new Date() })
  }

  async toggleSelect(userId, productId, selected) {
    const cart = await cartRepo.findByUser(userId)
    if (!cart) throw new Error('购物车不存在')
    const items = cart.items.map(i =>
      i.productId === productId ? { ...i, selected } : i
    )
    return cartRepo.update(cart.id, { items, updatedAt: new Date() })
  }
}

module.exports = new CartService()
