'use strict'

const fs = require('fs')
const path = require('path')
const { createProduct } = require('../models/product.model')
const { createCategory } = require('../models/category.model')
const productRepo = require('../repositories/product.repository')
const categoryRepo = require('../repositories/category.repository')

async function seedDatabase() {
  console.log('[Seed] 开始加载初始数据...')

  const mockDataPath = path.join(__dirname, '../../../public/mock')

  const categoriesData = JSON.parse(
    fs.readFileSync(path.join(mockDataPath, 'categories.json'), 'utf-8')
  )
  const productsData = JSON.parse(
    fs.readFileSync(path.join(mockDataPath, 'products.json'), 'utf-8')
  )

  for (const cat of categoriesData) {
    categoryRepo._store.push(createCategory(cat))
  }
  console.log(`[Seed] 加载了 ${categoriesData.length} 个分类`)

  for (const prod of productsData) {
    productRepo._store.push(createProduct(prod))
  }
  console.log(`[Seed] 加载了 ${productsData.length} 个商品`)

  return { categories: categoriesData, products: productsData }
}

module.exports = { seedDatabase }