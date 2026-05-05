import { defineStore } from 'pinia'
import { ref } from 'vue'

function daysAgo(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toLocaleDateString('zh-CN')
}

function generateSalesData() {
  const daily = Array.from({ length: 30 }, (_, i) => ({
    date: daysAgo(29 - i),
    revenue: Math.floor(Math.random() * 80000) + 20000,
    orders: Math.floor(Math.random() * 300) + 50,
    refunds: Math.floor(Math.random() * 20),
  }))
  // Weekly: last 12 weeks
  const weekly = Array.from({ length: 12 }, (_, i) => {
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - (11 - i) * 7)
    return {
      week: `第${i + 1}周`,
      date: weekStart.toLocaleDateString('zh-CN'),
      revenue: Math.floor(Math.random() * 500000) + 100000,
      orders: Math.floor(Math.random() * 2000) + 500,
      refunds: Math.floor(Math.random() * 100),
    }
  })
  // Monthly: last 12 months
  const monthly = Array.from({ length: 12 }, (_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - (11 - i))
    return {
      month: `${d.getFullYear()}年${d.getMonth() + 1}月`,
      revenue: Math.floor(Math.random() * 2000000) + 500000,
      orders: Math.floor(Math.random() * 8000) + 2000,
      refunds: Math.floor(Math.random() * 400),
    }
  })
  return { daily, weekly, monthly }
}

function generateUserGrowth() {
  return Array.from({ length: 30 }, (_, i) => ({
    date: daysAgo(29 - i),
    newUsers: Math.floor(Math.random() * 200) + 20,
    activeUsers: Math.floor(Math.random() * 2000) + 500,
    churnUsers: Math.floor(Math.random() * 30),
  }))
}

const PRODUCT_NAMES = ['iPhone 15 Pro Max', '华为 Mate 60 Pro', '小米14 Pro', 'MacBook Pro 14"', 'Nike Air Max 270', '海蓝之谜精华液', '戴森 V15 吸尘器', 'AirPods Pro 2', '联想拯救者 R9000P', '索尼 WH-1000XM5', 'iPad Pro 12.9"', '三星 Galaxy S24 Ultra', 'Dyson Airwrap', 'Bose QuietComfort 45', '戴森吹风机 HD07']
const CATEGORIES = ['手机数码', '电脑办公', '家用电器', '运动户外', '美妆护肤', '服装鞋帽']

function generateProductVisits() {
  return PRODUCT_NAMES.map((name, i) => ({
    rank: i + 1,
    productId: 100 + i,
    name,
    category: CATEGORIES[i % CATEGORIES.length],
    visits: Math.floor(Math.random() * 50000) + 5000,
    sales: Math.floor(Math.random() * 2000) + 100,
    revenue: Math.floor(Math.random() * 5000000) + 100000,
    conversion: (Math.random() * 10 + 1).toFixed(1),
  })).sort((a, b) => b.visits - a.visits).map((p, i) => ({ ...p, rank: i + 1 }))
}

function generateInventoryAlerts() {
  const items = [
    { productId: 101, name: 'iPhone 15 Pro Max 256G', category: '手机数码', stock: 3, threshold: 10, price: 9999 },
    { productId: 102, name: '华为 Mate 60 Pro 512G', category: '手机数码', stock: 0, threshold: 5, price: 6999 },
    { productId: 103, name: 'MacBook Pro M3 16"', category: '电脑办公', stock: 2, threshold: 5, price: 19999 },
    { productId: 104, name: '戴森 V15 吸尘器', category: '家用电器', stock: 7, threshold: 10, price: 4990 },
    { productId: 105, name: 'AirPods Pro 2代', category: '手机数码', stock: 15, threshold: 20, price: 1999 },
    { productId: 106, name: 'Nike Air Max 270', category: '运动户外', stock: 4, threshold: 15, price: 899 },
    { productId: 107, name: '海蓝之谜精华液 30ml', category: '美妆护肤', stock: 1, threshold: 5, price: 2150 },
    { productId: 108, name: '索尼 WH-1000XM5', category: '手机数码', stock: 0, threshold: 8, price: 2599 },
  ]
  return items.map(item => ({
    ...item,
    status: item.stock === 0 ? 'out' : item.stock <= item.threshold ? 'low' : 'ok',
  }))
}

function generateFinanceReconciliation() {
  return Array.from({ length: 30 }, (_, i) => {
    const income = Math.floor(Math.random() * 100000) + 20000
    const refund = Math.floor(Math.random() * 5000)
    const fee = Math.floor(income * 0.02)
    return {
      date: daysAgo(29 - i),
      orderCount: Math.floor(Math.random() * 200) + 30,
      income,
      refund,
      fee,
      net: income - refund - fee,
    }
  })
}

export const useAdminAnalyticsStore = defineStore('adminAnalytics', () => {
  const salesData = ref({ daily: [], weekly: [], monthly: [] })
  const userGrowth = ref([])
  const productVisits = ref([])
  const inventoryAlerts = ref([])
  const financeReconciliation = ref([])
  const loading = ref(false)

  function init() {
    if (salesData.value.daily.length) return
    loading.value = true
    setTimeout(() => {
      salesData.value = generateSalesData()
      userGrowth.value = generateUserGrowth()
      productVisits.value = generateProductVisits()
      inventoryAlerts.value = generateInventoryAlerts()
      financeReconciliation.value = generateFinanceReconciliation()
      loading.value = false
    }, 200)
  }

  return { salesData, userGrowth, productVisits, inventoryAlerts, financeReconciliation, loading, init }
})
