import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const NAMES = ['张伟', '李娜', '王芳', '刘洋', '陈静', '杨磊', '赵雪', '周涛', '吴敏', '郑勇',
  '孙丽', '朱强', '徐慧', '马超', '胡丹', '林峰', '黄梅', '曹阳', '何欢', '高博']
const AVATARS = Array.from({ length: 20 }, (_, i) => `https://api.dicebear.com/7.x/avataaars/svg?seed=user${i + 1}`)

const PRODUCT_NAMES = [
  'iPhone 15 Pro Max', '华为 Mate 60 Pro', '小米14 Pro', 'MacBook Pro 14"',
  'Nike Air Max', '海蓝之谜精华液', '戴森 V15 吸尘器', 'AirPods Pro 2',
]

function randomDate(daysAgo) {
  const d = new Date()
  d.setDate(d.getDate() - Math.floor(Math.random() * daysAgo))
  return d.toLocaleDateString('zh-CN')
}

function generateUsers(count = 60) {
  return Array.from({ length: count }, (_, i) => {
    const name = NAMES[i % NAMES.length] + (i >= NAMES.length ? String(Math.floor(i / NAMES.length) + 1) : '')
    const cartCount = Math.floor(Math.random() * 6)
    const wishlistCount = Math.floor(Math.random() * 10)
    return {
      id: 1000 + i + 1,
      name,
      email: `user${i + 1}@example.com`,
      phone: `138${String(10000000 + i).slice(1)}`,
      avatar: AVATARS[i % AVATARS.length],
      status: i % 8 === 0 ? 'disabled' : 'active',  // 'active' | 'disabled'
      registerDate: randomDate(365),
      lastLogin: randomDate(30),
      orderCount: Math.floor(Math.random() * 50),
      totalSpent: Math.floor(Math.random() * 50000),
      cart: Array.from({ length: cartCount }, (_, j) => ({
        productId: 100 + j,
        name: PRODUCT_NAMES[(i + j) % PRODUCT_NAMES.length],
        price: Math.floor(Math.random() * 9000) + 99,
        quantity: (j % 3) + 1,
        image: `https://picsum.photos/60/60?random=${i * 10 + j}`,
      })),
      wishlist: Array.from({ length: wishlistCount }, (_, j) => ({
        productId: 200 + j,
        name: PRODUCT_NAMES[(i + j + 3) % PRODUCT_NAMES.length],
        price: Math.floor(Math.random() * 9000) + 99,
        image: `https://picsum.photos/60/60?random=${i * 10 + j + 50}`,
      })),
    }
  })
}

export const useAdminUsersStore = defineStore('adminUsers', () => {
  const users = ref([])
  const loading = ref(false)

  function init() {
    if (users.value.length) return
    loading.value = true
    setTimeout(() => {
      users.value = generateUsers(60)
      loading.value = false
    }, 200)
  }

  const activeCount = computed(() => users.value.filter(u => u.status === 'active').length)
  const disabledCount = computed(() => users.value.filter(u => u.status === 'disabled').length)

  function toggleStatus(id) {
    const u = users.value.find(u => u.id === id)
    if (u) u.status = u.status === 'active' ? 'disabled' : 'active'
  }

  function resetPassword(id) {
    // In a real app this would call an API; here we just return the new temp password
    const chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefghjkmnpqrstwxyz23456789'
    return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  }

  function updateUser(id, data) {
    const u = users.value.find(u => u.id === id)
    if (u) Object.assign(u, data)
  }

  return { users, loading, activeCount, disabledCount, init, toggleStatus, resetPassword, updateUser }
})
