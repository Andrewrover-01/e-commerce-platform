import request from '@/utils/request'

function extractData(res) {
  return res.data?.data ?? res.data ?? []
}

function extractItem(res) {
  return res.data?.data ?? res.data
}

async function loadCategories() {
  const res = await request.get('/api/v1/categories')
  return extractData(res)
}

async function loadProducts() {
  const res = await request.get('/api/v1/products')
  return extractData(res)
}

export async function getCategories() {
  return loadCategories()
}

export async function getProducts(params = {}) {
  const { category, keyword, sort, page = 1, pageSize = 12 } = params

  const queryParams = { page, pageSize }
  if (category) queryParams.category = category
  if (keyword) queryParams.keyword = keyword
  if (sort) queryParams.sort = sort

  const res = await request.get('/api/v1/products', { params: queryParams })
  return extractItem(res)
}

export async function getProductById(id) {
  const res = await request.get(`/api/v1/products/${id}`)
  return extractItem(res)
}

export async function getFlashSaleProducts() {
  const res = await request.get('/api/v1/products/flash-sale')
  return extractData(res)
}

export async function getHotProducts() {
  const res = await request.get('/api/v1/products/hot')
  return extractData(res)
}

export async function getNewProducts() {
  const res = await request.get('/api/v1/products/new')
  return extractData(res)
}
