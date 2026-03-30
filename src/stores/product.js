import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getProducts, getProductById, getCategories } from '@/api/mock'

export const useProductStore = defineStore('product', () => {
  const products = ref([])
  const categories = ref([])
  const currentProduct = ref(null)
  const loading = ref(false)
  const total = ref(0)

  async function fetchProducts(params = {}) {
    loading.value = true
    try {
      const res = await getProducts(params)
      products.value = res.list
      total.value = res.total
    } finally {
      loading.value = false
    }
  }

  async function fetchProductById(id) {
    loading.value = true
    try {
      currentProduct.value = await getProductById(id)
    } finally {
      loading.value = false
    }
  }

  async function fetchCategories() {
    categories.value = await getCategories()
  }

  return { products, categories, currentProduct, loading, total, fetchProducts, fetchProductById, fetchCategories }
})
