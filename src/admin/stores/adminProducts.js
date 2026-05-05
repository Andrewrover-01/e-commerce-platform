import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getProducts, getCategories } from '@/api/mock'

// Extend raw product with admin fields (in-memory only)
function toAdminProduct(p, idx) {
  return {
    ...p,
    status: idx % 7 === 0 ? 'off' : 'on',   // 'on' | 'off'
    minStock: 10,
  }
}

export const useAdminProductsStore = defineStore('adminProducts', () => {
  const products = ref([])
  const categories = ref([])
  const brands = ref([])
  const loading = ref(false)
  let nextId = 10000
  let catCounter = 1000
  let brandCounter = 0

  // ---------- init ----------
  async function init() {
    if (products.value.length) return
    loading.value = true
    try {
      const [res, cats] = await Promise.all([
        getProducts({ pageSize: 100 }),
        getCategories(),
      ])
      products.value = res.list.map((p, i) => toAdminProduct(p, i))
      categories.value = cats.map(c => ({ ...c }))
      // derive brands from products with numeric IDs
      const seen = new Set()
      const blist = []
      res.list.forEach(p => {
        if (!seen.has(p.brand)) {
          seen.add(p.brand)
          brandCounter++
          blist.push({ id: brandCounter, name: p.brand, logo: '', description: '' })
        }
      })
      brands.value = blist
    } finally {
      loading.value = false
    }
  }

  // ---------- computed ----------
  const lowStockProducts = computed(() =>
    products.value.filter(p => p.stock <= p.minStock)
  )

  // ---------- CRUD ----------
  function addProduct(data) {
    nextId++
    products.value.unshift({
      id: nextId,
      name: data.name,
      price: Number(data.price),
      originalPrice: Number(data.originalPrice || data.price),
      image: data.image || `https://picsum.photos/300/300?random=${nextId}`,
      rating: 5.0,
      reviewCount: 0,
      category: data.category,
      categoryId: categories.value.find(c => c.name === data.category)?.id || 0,
      description: data.description || '',
      stock: Number(data.stock),
      brand: data.brand,
      sales: 0,
      isNew: true,
      isHot: false,
      status: data.status || 'on',
      minStock: Number(data.minStock || 10),
    })
  }

  function updateProduct(id, data) {
    const idx = products.value.findIndex(p => p.id === id)
    if (idx === -1) return
    products.value[idx] = {
      ...products.value[idx],
      ...data,
      id,
      price: Number(data.price ?? products.value[idx].price),
      originalPrice: Number(data.originalPrice ?? products.value[idx].originalPrice),
      stock: Number(data.stock ?? products.value[idx].stock),
      minStock: Number(data.minStock ?? products.value[idx].minStock),
    }
  }

  function deleteProduct(id) {
    products.value = products.value.filter(p => p.id !== id)
  }

  function deleteProducts(ids) {
    const set = new Set(ids)
    products.value = products.value.filter(p => !set.has(p.id))
  }

  function toggleStatus(id) {
    const p = products.value.find(p => p.id === id)
    if (p) p.status = p.status === 'on' ? 'off' : 'on'
  }

  function batchSetStatus(ids, status) {
    const set = new Set(ids)
    products.value.forEach(p => { if (set.has(p.id)) p.status = status })
  }

  // ---------- Categories CRUD ----------
  function addCategory(data) {
    catCounter++
    categories.value.push({ id: catCounter, name: data.name, icon: data.icon || '📦', sub: [] })
  }
  function updateCategory(id, data) {
    const c = categories.value.find(c => c.id === id)
    if (c) Object.assign(c, data)
  }
  function deleteCategory(id) {
    categories.value = categories.value.filter(c => c.id !== id)
  }

  // ---------- Brands CRUD ----------
  function addBrand(data) {
    brandCounter++
    brands.value.push({ id: brandCounter, name: data.name, logo: data.logo || '', description: data.description || '' })
  }
  function updateBrand(id, data) {
    const b = brands.value.find(b => b.id === id)
    if (b) Object.assign(b, data)
  }
  function deleteBrand(id) {
    brands.value = brands.value.filter(b => b.id !== id)
  }

  // ---------- CSV export ----------
  function exportCSV(list) {
    const header = ['ID', '商品名称', '分类', '品牌', '价格', '原价', '库存', '最小库存', '状态', '销量']
    const rows = list.map(p => [
      p.id, `"${p.name}"`, `"${p.category}"`, `"${p.brand}"`,
      p.price, p.originalPrice, p.stock, p.minStock,
      p.status === 'on' ? '上架' : '下架', p.sales,
    ])
    const csv = [header, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `products_${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // ---------- CSV import ----------
  function importCSV(text) {
    const lines = text.trim().split('\n').slice(1) // skip header
    let count = 0
    lines.forEach(line => {
      const cols = line.split(',').map(s => s.replace(/^"|"$/g, '').trim())
      if (cols.length < 9 || !cols[1]) return
      addProduct({
        name: cols[1],
        category: cols[2],
        brand: cols[3],
        price: Number(cols[4]) || 0,
        originalPrice: Number(cols[5]) || 0,
        stock: Number(cols[6]) || 0,
        minStock: Number(cols[7]) || 10,
        status: cols[8] === '上架' ? 'on' : 'off',
      })
      count++
    })
    return count
  }

  return {
    products, categories, brands, loading, lowStockProducts,
    init, addProduct, updateProduct, deleteProduct, deleteProducts,
    toggleStatus, batchSetStatus,
    addCategory, updateCategory, deleteCategory,
    addBrand, updateBrand, deleteBrand,
    exportCSV, importCSV,
  }
})
