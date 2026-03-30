<template>
  <div class="coupon-page">
    <div class="container">
      <div class="page-header">
        <h1 class="page-title">🎫 个人优惠券中心</h1>
        <p class="page-sub">领取专属优惠，享受更多折扣</p>
      </div>

      <!-- 状态筛选 tabs -->
      <div class="filter-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="filter-tab"
          :class="{ active: activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
          <span v-if="countByTab(tab.key) > 0" class="tab-count">{{ countByTab(tab.key) }}</span>
        </button>
      </div>

      <!-- 加载中 -->
      <div v-if="loading" class="loading-wrap">
        <span class="loading-spinner"></span>
        <span class="loading-text">加载优惠券中…</span>
      </div>

      <!-- 空态 -->
      <div v-else-if="filteredCoupons.length === 0" class="empty-wrap">
        <p class="empty-icon">🎫</p>
        <p class="empty-text">暂无{{ currentTabLabel }}优惠券</p>
        <router-link to="/products" class="btn btn-primary btn-small">去逛逛</router-link>
      </div>

      <!-- 优惠券网格 -->
      <div v-else class="coupon-grid">
        <div
          v-for="coupon in filteredCoupons"
          :key="coupon.id"
          class="coupon-card"
          :class="couponCardClass(coupon)"
        >
          <!-- 左侧：面额区 -->
          <div class="coupon-left">
            <div class="coupon-value">
              <em class="currency">¥</em>
              <span class="amount">{{ coupon.value }}</span>
            </div>
            <p class="coupon-threshold">满{{ coupon.minAmount }}元可用</p>
          </div>

          <!-- 竖线分隔 + 锯齿 -->
          <div class="coupon-divider">
            <div class="notch notch-top"></div>
            <div class="dashed-line"></div>
            <div class="notch notch-bottom"></div>
          </div>

          <!-- 右侧：详情区 -->
          <div class="coupon-right">
            <div class="coupon-header">
              <span class="coupon-name">{{ coupon.name }}</span>
              <span class="coupon-type-badge" :class="'type-' + coupon.type">
                {{ typeLabel(coupon.type) }}
              </span>
            </div>
            <p class="coupon-category">
              <span class="info-icon">🏷️</span>适用：{{ coupon.category }}
            </p>
            <p class="coupon-validity">
              <span class="info-icon">📅</span>有效期：{{ coupon.startDate }} ~ {{ coupon.endDate }}
            </p>
            <p class="coupon-remain" :class="{ low: coupon.remainCount > 0 && coupon.remainCount < 200 }">
              <template v-if="coupon.status === 'expired'">已过期</template>
              <template v-else-if="coupon.status === 'soldout'">已抢完</template>
              <template v-else-if="coupon.remainCount < 200 && coupon.remainCount > 0">
                仅剩 {{ coupon.remainCount }} 张
              </template>
              <template v-else>剩余 {{ coupon.remainCount }} 张</template>
            </p>

            <!-- 操作按钮 -->
            <div class="coupon-action">
              <button
                v-if="coupon.status === 'available'"
                class="claim-btn"
                :disabled="claiming === coupon.id"
                @click="handleClaim(coupon)"
              >
                <span v-if="claiming === coupon.id" class="btn-spinner"></span>
                {{ claiming === coupon.id ? '领取中…' : '立即领取' }}
              </button>
              <span v-else-if="coupon.status === 'claimed'" class="status-badge status-claimed">
                ✓ 已领取
              </span>
              <span v-else-if="coupon.status === 'expired'" class="status-badge status-expired">
                已过期
              </span>
              <span v-else-if="coupon.status === 'soldout'" class="status-badge status-soldout">
                已抢完
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 使用说明 -->
      <div class="usage-tips">
        <h3 class="tips-title">📋 使用说明</h3>
        <ul class="tips-list">
          <li>优惠券须在有效期内使用，过期自动失效。</li>
          <li>每张优惠券限领一次，不可转让、不可兑换现金。</li>
          <li>优惠券不与其他促销活动叠加使用。</li>
          <li>已领取的优惠券可在结算页面选择使用。</li>
        </ul>
      </div>
    </div>

    <!-- Toast 提示 -->
    <transition name="toast-fade">
      <div v-if="toast.visible" class="toast" :class="'toast-' + toast.type">
        {{ toast.message }}
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'
import { getCoupons, claimCoupon } from '@/api/mock'

const router = useRouter()
const userStore = useUserStore()

const coupons = ref([])
const loading = ref(true)
const claiming = ref(null)
const activeTab = ref('all')

const toast = ref({ visible: false, message: '', type: 'success' })

const tabs = [
  { key: 'all', label: '全部' },
  { key: 'available', label: '可领取' },
  { key: 'claimed', label: '已领取' },
  { key: 'expired', label: '已过期/已抢完' },
]

onMounted(async () => {
  loading.value = true
  try {
    coupons.value = await getCoupons()
  } finally {
    loading.value = false
  }
})

const filteredCoupons = computed(() => {
  if (activeTab.value === 'all') return coupons.value
  if (activeTab.value === 'expired') {
    return coupons.value.filter(c => c.status === 'expired' || c.status === 'soldout')
  }
  return coupons.value.filter(c => c.status === activeTab.value)
})

const currentTabLabel = computed(() => {
  const found = tabs.find(t => t.key === activeTab.value)
  return found ? found.label : ''
})

function countByTab(key) {
  if (key === 'all') return 0
  if (key === 'expired') return coupons.value.filter(c => c.status === 'expired' || c.status === 'soldout').length
  return coupons.value.filter(c => c.status === key).length
}

function couponCardClass(coupon) {
  return {
    'card-available': coupon.status === 'available',
    'card-claimed': coupon.status === 'claimed',
    'card-expired': coupon.status === 'expired' || coupon.status === 'soldout',
  }
}

function typeLabel(type) {
  const map = { general: '通用', category: '品类', newuser: '新人' }
  return map[type] || type
}

async function handleClaim(coupon) {
  if (!userStore.isLoggedIn) {
    router.push({ name: 'Login', query: { redirect: '/coupons' } })
    return
  }
  claiming.value = coupon.id
  try {
    await claimCoupon(coupon.id)
    // Update local coupon status
    const idx = coupons.value.findIndex(c => c.id === coupon.id)
    if (idx !== -1) {
      coupons.value[idx] = { ...coupons.value[idx], status: 'claimed', isClaimed: true }
    }
    showToast('领取成功！优惠券已存入您的账户', 'success')
  } catch (err) {
    showToast(err.message || '领取失败，请稍后重试', 'error')
  } finally {
    claiming.value = null
  }
}

function showToast(message, type = 'success') {
  toast.value = { visible: true, message, type }
  setTimeout(() => {
    toast.value.visible = false
  }, 3000)
}
</script>

<style scoped>
.coupon-page {
  padding: var(--spacing-6) 0 var(--spacing-10);
  min-height: 60vh;
}

/* ── 页头 ── */
.page-header {
  text-align: center;
  margin-bottom: var(--spacing-6);
}
.page-title {
  font-size: var(--font-size-3xl);
  font-weight: 700;
  color: var(--color-text-primary);
}
.page-sub {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  margin-top: var(--spacing-2);
}

/* ── 状态 tabs ── */
.filter-tabs {
  display: flex;
  gap: 0;
  border-bottom: 2px solid var(--color-border-light);
  margin-bottom: var(--spacing-6);
}
.filter-tab {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  padding: var(--spacing-3) var(--spacing-6);
  font-size: var(--font-size-base);
  color: var(--color-text-regular);
  background: none;
  border: none;
  cursor: pointer;
  transition: var(--transition-fast);
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
}
.filter-tab:hover { color: var(--color-primary); }
.filter-tab.active {
  color: var(--color-primary);
  font-weight: 700;
  border-bottom-color: var(--color-primary);
}
.tab-count {
  background: var(--color-primary);
  color: #fff;
  font-size: 10px;
  min-width: 16px;
  height: 16px;
  border-radius: var(--radius-full);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 3px;
}

/* ── 加载 / 空态 ── */
.loading-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-3);
  padding: var(--spacing-12) 0;
  color: var(--color-text-secondary);
}
.loading-text { font-size: var(--font-size-base); }
.empty-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-12) 0;
}
.empty-icon { font-size: 56px; }
.empty-text { color: var(--color-text-secondary); font-size: var(--font-size-base); }

/* ── 优惠券网格 ── */
.coupon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: var(--spacing-5);
  margin-bottom: var(--spacing-8);
}

/* ── 优惠券卡片 ── */
.coupon-card {
  display: flex;
  align-items: stretch;
  border-radius: var(--radius-lg);
  overflow: visible;
  box-shadow: var(--shadow-md);
  position: relative;
  transition: var(--transition-base);
}
.coupon-card:hover { box-shadow: var(--shadow-lg); transform: translateY(-2px); }

/* 可领取：红色调 */
.card-available .coupon-left {
  background: linear-gradient(135deg, #e1251b 0%, #ff5c4d 100%);
}
.card-available .coupon-right { background: #fff; }

/* 已领取：绿色调 */
.card-claimed .coupon-left {
  background: linear-gradient(135deg, #26a65b 0%, #4fc878 100%);
}
.card-claimed .coupon-right { background: #f0fdf4; }

/* 过期/已抢完：灰色调 */
.card-expired .coupon-left {
  background: linear-gradient(135deg, #aaaaaa 0%, #cccccc 100%);
}
.card-expired .coupon-right { background: #f5f5f5; }

/* ── 左侧面额区 ── */
.coupon-left {
  flex-shrink: 0;
  width: 130px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-5) var(--spacing-3);
  border-radius: var(--radius-lg) 0 0 var(--radius-lg);
  color: #fff;
}
.coupon-value {
  display: flex;
  align-items: flex-end;
  line-height: 1;
  margin-bottom: var(--spacing-2);
}
.currency {
  font-size: var(--font-size-xl);
  font-style: normal;
  font-weight: 600;
  margin-bottom: 4px;
}
.amount {
  font-size: 42px;
  font-weight: 900;
  letter-spacing: -2px;
  line-height: 1;
}
.coupon-threshold {
  font-size: var(--font-size-xs);
  opacity: 0.9;
  text-align: center;
  white-space: nowrap;
}

/* ── 锯齿分隔线 ── */
.coupon-divider {
  position: relative;
  width: 18px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.card-available .coupon-divider { background: #fff; }
.card-claimed .coupon-divider { background: #f0fdf4; }
.card-expired .coupon-divider { background: #f5f5f5; }

.notch {
  position: absolute;
  width: 18px;
  height: 18px;
  background: var(--color-bg-page);
  border-radius: 50%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1;
}
.notch-top { top: -9px; }
.notch-bottom { bottom: -9px; }
.dashed-line {
  width: 0;
  height: 100%;
  border-left: 2px dashed var(--color-border-base);
}

/* ── 右侧详情区 ── */
.coupon-right {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
  padding: var(--spacing-4) var(--spacing-5);
  border-radius: 0 var(--radius-lg) var(--radius-lg) 0;
}

.coupon-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-2);
  flex-wrap: wrap;
}
.coupon-name {
  font-size: var(--font-size-base);
  font-weight: 700;
  color: var(--color-text-primary);
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.coupon-type-badge {
  flex-shrink: 0;
  font-size: var(--font-size-xs);
  font-weight: 600;
  padding: 2px var(--spacing-2);
  border-radius: var(--radius-sm);
}
.type-general { background: #fff0ef; color: var(--color-primary); }
.type-category { background: #e8f4ff; color: var(--color-info); }
.type-newuser { background: #e8fff2; color: var(--color-success); }

.coupon-category,
.coupon-validity {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
}
.info-icon { font-size: 12px; }
.coupon-remain {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}
.coupon-remain.low { color: var(--color-warning); font-weight: 600; }

/* ── 操作按钮 ── */
.coupon-action { margin-top: auto; padding-top: var(--spacing-2); }

.claim-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-1);
  padding: var(--spacing-2) var(--spacing-5);
  background: var(--color-primary);
  color: #fff;
  border: none;
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition-fast);
  white-space: nowrap;
}
.claim-btn:hover:not(:disabled) { background: var(--color-primary-dark); }
.claim-btn:disabled { opacity: 0.65; cursor: not-allowed; }

.btn-spinner {
  display: inline-block;
  width: 12px;
  height: 12px;
  border: 2px solid rgba(255,255,255,0.5);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}
@keyframes spin { to { transform: rotate(360deg); } }

.status-badge {
  display: inline-block;
  padding: var(--spacing-2) var(--spacing-5);
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  font-weight: 600;
}
.status-claimed { background: #e8fff2; color: var(--color-success); }
.status-expired { background: #f5f5f5; color: var(--color-text-secondary); }
.status-soldout { background: #f5f5f5; color: var(--color-text-secondary); }

/* ── 使用说明 ── */
.usage-tips {
  background: var(--color-bg-white);
  border-radius: var(--radius-lg);
  padding: var(--spacing-5) var(--spacing-6);
  box-shadow: var(--shadow-sm);
  border-left: 4px solid var(--color-primary);
}
.tips-title {
  font-size: var(--font-size-base);
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-3);
}
.tips-list {
  list-style: disc;
  padding-left: var(--spacing-5);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}
.tips-list li {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  line-height: var(--line-height-base);
}

/* ── Toast 通知 ── */
.toast {
  position: fixed;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  padding: var(--spacing-3) var(--spacing-6);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  font-weight: 500;
  color: #fff;
  z-index: var(--z-toast);
  white-space: nowrap;
  box-shadow: var(--shadow-lg);
  pointer-events: none;
}
.toast-success { background: var(--color-success); }
.toast-error { background: var(--color-danger); }

.toast-fade-enter-active,
.toast-fade-leave-active { transition: opacity 0.3s, transform 0.3s; }
.toast-fade-enter-from,
.toast-fade-leave-to { opacity: 0; transform: translateX(-50%) translateY(-10px); }
</style>
