import request from '@/utils/request'

const MOCK_DELAY = 200

let categoriesCache = null
let productsCache = null

function delay(ms = MOCK_DELAY) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function loadCategories() {
  if (categoriesCache) return categoriesCache
  const { data } = await request.get('/mock/categories.json')
  categoriesCache = data
  return categoriesCache
}

async function loadProducts() {
  if (productsCache) return productsCache
  const { data } = await request.get('/mock/products.json')
  productsCache = data
  return productsCache
}

export async function getCategories() {
  return loadCategories()
}

export async function getProducts(params = {}) {
  await delay()
  const products = await loadProducts()
  let list = [...products]

  if (params.category) {
    list = list.filter(p => p.category === params.category || p.categoryId === Number(params.categoryId))
  }

  if (params.keyword) {
    const kw = String(params.keyword).toLowerCase()
    list = list.filter(p => p.name.toLowerCase().includes(kw) || p.brand.toLowerCase().includes(kw))
  }

  if (params.sort === 'price_asc') list.sort((a, b) => a.price - b.price)
  else if (params.sort === 'price_desc') list.sort((a, b) => b.price - a.price)
  else if (params.sort === 'sales') list.sort((a, b) => b.sales - a.sales)
  else if (params.sort === 'rating') list.sort((a, b) => b.rating - a.rating)
  else if (params.sort === 'newest') list.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0) || b.id - a.id)

  const page = Number(params.page) || 1
  const pageSize = Number(params.pageSize) || 12
  const total = list.length
  const paginated = list.slice((page - 1) * pageSize, page * pageSize)
  return { list: paginated, total, page, pageSize }
}

export async function getProductById(id) {
  await delay()
  const products = await loadProducts()
  const product = products.find(p => p.id === Number(id))

  if (!product) {
    throw new Error('商品不存在')
  }

  return {
    ...product,
    images: [
      product.image,
      `https://picsum.photos/300/300?random=${id}0`,
      `https://picsum.photos/300/300?random=${id}1`,
      `https://picsum.photos/300/300?random=${id}2`
    ],
    specs: [
      { label: '品牌', value: product.brand },
      { label: '类别', value: product.category },
      { label: '库存', value: `${product.stock}件` }
    ],
    reviews: [
      { id: 1, user: '用户***001', rating: 5, content: '非常好用，物超所值，强烈推荐！', date: '2024-01-15', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user1' },
      { id: 2, user: '买家***abc', rating: 4, content: '包装很好，发货很快，质量不错', date: '2024-01-10', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user2' },
      { id: 3, user: '匿名用户', rating: 5, content: '京东自营，放心购买，下次还会再来', date: '2024-01-08', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user3' }
    ]
  }
}

export async function getFlashSaleProducts() {
  const products = await loadProducts()
  return products.filter(p => p.isHot).slice(0, 6)
}

export async function getHotProducts() {
  const products = await loadProducts()
  return [...products].sort((a, b) => b.sales - a.sales).slice(0, 8)
}

export async function getNewProducts() {
  const products = await loadProducts()
  return products.filter(p => p.isNew).slice(0, 4)
}
