import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCartStore = defineStore('cart', () => {
  const items = ref(JSON.parse(localStorage.getItem('jd_cart') || '[]'))

  function save() {
    localStorage.setItem('jd_cart', JSON.stringify(items.value))
  }

  const totalCount = computed(() => items.value.reduce((sum, i) => sum + i.quantity, 0))
  const selectedItems = computed(() => items.value.filter(i => i.selected))
  const selectedCount = computed(() => selectedItems.value.reduce((sum, i) => sum + i.quantity, 0))
  const selectedPrice = computed(() =>
    selectedItems.value.reduce((sum, i) => sum + i.price * i.quantity, 0)
  )

  function addToCart(product, qty = 1) {
    const existing = items.value.find(i => i.productId === product.id)
    if (existing) {
      existing.quantity += qty
    } else {
      items.value.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: qty,
        selected: true
      })
    }
    save()
  }

  function removeFromCart(productId) {
    items.value = items.value.filter(i => i.productId !== productId)
    save()
  }

  function updateQuantity(productId, qty) {
    const item = items.value.find(i => i.productId === productId)
    if (item) {
      item.quantity = Math.max(1, qty)
      save()
    }
  }

  function toggleSelect(productId) {
    const item = items.value.find(i => i.productId === productId)
    if (item) {
      item.selected = !item.selected
      save()
    }
  }

  function selectAll(val) {
    items.value.forEach(i => { i.selected = val })
    save()
  }

  function clearCart() {
    items.value = []
    save()
  }

  return { items, totalCount, selectedItems, selectedCount, selectedPrice, addToCart, removeFromCart, updateQuantity, toggleSelect, selectAll, clearCart }
})
