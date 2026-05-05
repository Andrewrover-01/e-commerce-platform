import { defineStore } from 'pinia'
import { ref } from 'vue'

// =================== COUPONS ===================
export const COUPON_TYPES = { fullcut: '满减券', discount: '折扣券', cash: '代金券' }
export const COUPON_STATUS = { active: '进行中', expired: '已过期', disabled: '已停用' }

function generateCoupons() {
  const now = new Date()
  const future = (days) => {
    const d = new Date(now)
    d.setDate(d.getDate() + days)
    return d.toLocaleDateString('zh-CN')
  }
  const past = (days) => {
    const d = new Date(now)
    d.setDate(d.getDate() - days)
    return d.toLocaleDateString('zh-CN')
  }
  return [
    { id: 1, name: '满200减30', type: 'fullcut', threshold: 200, discount: 30, discountRate: null, startDate: past(10), endDate: future(20), quantity: 500, usedCount: 213, status: 'active' },
    { id: 2, name: '满500减80', type: 'fullcut', threshold: 500, discount: 80, discountRate: null, startDate: past(5), endDate: future(25), quantity: 300, usedCount: 87, status: 'active' },
    { id: 3, name: '九折优惠券', type: 'discount', threshold: 100, discount: null, discountRate: 90, startDate: past(3), endDate: future(30), quantity: 1000, usedCount: 456, status: 'active' },
    { id: 4, name: '八折限时券', type: 'discount', threshold: 200, discount: null, discountRate: 80, startDate: past(40), endDate: past(10), quantity: 200, usedCount: 200, status: 'expired' },
    { id: 5, name: '20元代金券', type: 'cash', threshold: 0, discount: 20, discountRate: null, startDate: past(2), endDate: future(28), quantity: 800, usedCount: 112, status: 'active' },
  ]
}

// =================== ACTIVITIES ===================
export const ACTIVITY_TYPES = { flashsale: '秒杀活动', groupbuy: '拼团活动' }
export const ACTIVITY_STATUS = { upcoming: '未开始', active: '进行中', ended: '已结束' }

function generateActivities() {
  const now = new Date()
  const future = (h) => { const d = new Date(now); d.setHours(d.getHours() + h); return d.toLocaleString('zh-CN', { hour12: false }) }
  const past = (h) => { const d = new Date(now); d.setHours(d.getHours() - h); return d.toLocaleString('zh-CN', { hour12: false }) }
  return [
    {
      id: 1, name: '618超级秒杀', type: 'flashsale', status: 'active',
      startTime: past(2), endTime: future(22),
      products: [
        { id: 1, name: 'iPhone 15 Pro Max', originalPrice: 9999, salePrice: 8999, stock: 50, image: 'https://picsum.photos/60/60?random=1' },
        { id: 4, name: 'MacBook Pro 14"', originalPrice: 16999, salePrice: 14999, stock: 20, image: 'https://picsum.photos/60/60?random=4' },
      ],
    },
    {
      id: 2, name: '双11预热拼团', type: 'groupbuy', status: 'upcoming',
      startTime: future(24), endTime: future(72),
      groupSize: 3, groupPrice: 5999,
      products: [
        { id: 2, name: '华为 Mate 60 Pro', originalPrice: 6999, salePrice: 5999, stock: 100, image: 'https://picsum.photos/60/60?random=2' },
      ],
    },
    {
      id: 3, name: '5月限时秒杀', type: 'flashsale', status: 'ended',
      startTime: past(48), endTime: past(24),
      products: [
        { id: 3, name: '小米14 Pro', originalPrice: 4999, salePrice: 3999, stock: 0, image: 'https://picsum.photos/60/60?random=3' },
      ],
    },
  ]
}

// =================== BANNERS ===================
function generateBanners() {
  return [
    { id: 1, title: '618大促开始', subtitle: '全场5折起', image: 'https://picsum.photos/1200/400?random=10', link: '/activity/618', sort: 1, enabled: true },
    { id: 2, title: '新品首发', subtitle: 'iPhone 15系列上市', image: 'https://picsum.photos/1200/400?random=11', link: '/products?category=手机数码', sort: 2, enabled: true },
    { id: 3, title: '满300减50', subtitle: '家电专场', image: 'https://picsum.photos/1200/400?random=12', link: '/products?category=家用电器', sort: 3, enabled: false },
  ]
}

// =================== PROMO FLOORS ===================
function generatePromoFloors() {
  return [
    { id: 1, title: '热销爆款', type: 'hot', bgColor: '#fff7e6', sort: 1, enabled: true, productIds: [1, 2, 3, 4, 5, 6, 7, 8] },
    { id: 2, title: '新品上市', type: 'new', bgColor: '#f0f9ff', sort: 2, enabled: true, productIds: [2, 3, 5, 7] },
    { id: 3, title: '特价清仓', type: 'clearance', bgColor: '#fff0f0', sort: 3, enabled: false, productIds: [4, 6, 8] },
  ]
}

// =================== STORE ===================
export const useAdminMarketingStore = defineStore('adminMarketing', () => {
  const coupons = ref([])
  const activities = ref([])
  const banners = ref([])
  const promoFloors = ref([])
  const loading = ref(false)
  let couponCounter = 100
  let activityCounter = 100
  let bannerCounter = 100
  let floorCounter = 100

  function init() {
    if (coupons.value.length) return
    loading.value = true
    setTimeout(() => {
      coupons.value = generateCoupons()
      activities.value = generateActivities()
      banners.value = generateBanners()
      promoFloors.value = generatePromoFloors()
      loading.value = false
    }, 200)
  }

  // ---- Coupons ----
  function addCoupon(data) {
    couponCounter++
    coupons.value.unshift({ id: couponCounter, usedCount: 0, ...data })
  }
  function updateCoupon(id, data) {
    const c = coupons.value.find(c => c.id === id)
    if (c) Object.assign(c, data)
  }
  function deleteCoupon(id) {
    coupons.value = coupons.value.filter(c => c.id !== id)
  }
  function toggleCoupon(id) {
    const c = coupons.value.find(c => c.id === id)
    if (c) c.status = c.status === 'active' ? 'disabled' : 'active'
  }

  // ---- Activities ----
  function addActivity(data) {
    activityCounter++
    activities.value.unshift({ id: activityCounter, ...data })
  }
  function updateActivity(id, data) {
    const a = activities.value.find(a => a.id === id)
    if (a) Object.assign(a, data)
  }
  function deleteActivity(id) {
    activities.value = activities.value.filter(a => a.id !== id)
  }

  // ---- Banners ----
  function addBanner(data) {
    bannerCounter++
    banners.value.push({ id: bannerCounter, ...data })
    banners.value.sort((a, b) => a.sort - b.sort)
  }
  function updateBanner(id, data) {
    const b = banners.value.find(b => b.id === id)
    if (b) Object.assign(b, data)
    banners.value.sort((a, b) => a.sort - b.sort)
  }
  function deleteBanner(id) {
    banners.value = banners.value.filter(b => b.id !== id)
  }
  function toggleBanner(id) {
    const b = banners.value.find(b => b.id === id)
    if (b) b.enabled = !b.enabled
  }

  // ---- Promo Floors ----
  function addFloor(data) {
    floorCounter++
    promoFloors.value.push({ id: floorCounter, ...data })
    promoFloors.value.sort((a, b) => a.sort - b.sort)
  }
  function updateFloor(id, data) {
    const f = promoFloors.value.find(f => f.id === id)
    if (f) Object.assign(f, data)
    promoFloors.value.sort((a, b) => a.sort - b.sort)
  }
  function deleteFloor(id) {
    promoFloors.value = promoFloors.value.filter(f => f.id !== id)
  }
  function toggleFloor(id) {
    const f = promoFloors.value.find(f => f.id === id)
    if (f) f.enabled = !f.enabled
  }

  return {
    coupons, activities, banners, promoFloors, loading,
    init,
    addCoupon, updateCoupon, deleteCoupon, toggleCoupon,
    addActivity, updateActivity, deleteActivity,
    addBanner, updateBanner, deleteBanner, toggleBanner,
    addFloor, updateFloor, deleteFloor, toggleFloor,
  }
})
