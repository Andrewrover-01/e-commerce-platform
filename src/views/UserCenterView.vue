<template>
  <div class="user-page">
    <div class="container">
      <div class="user-layout">

        <!-- 左侧个人信息 -->
        <aside class="user-sidebar">
          <div class="profile-card">
            <img :src="userInfo.avatar" :alt="userInfo.username" class="profile-avatar" />
            <p class="profile-name">{{ userInfo.username }}</p>
            <p class="profile-id">ID: {{ userInfo.id }}</p>
          </div>

          <nav class="user-nav">
            <button
              v-for="tab in tabs"
              :key="tab.key"
              class="user-nav-item"
              :class="{ active: activeTab === tab.key }"
              @click="activeTab = tab.key"
            >
              <span class="nav-item-icon">{{ tab.icon }}</span>
              {{ tab.label }}
            </button>
          </nav>

          <button class="logout-btn" @click="handleLogout">退出登录</button>
        </aside>

        <!-- 右侧内容 -->
        <main class="user-main">

          <!-- 我的信息 -->
          <div v-if="activeTab === 'profile'" class="tab-panel">
            <h2 class="panel-title">我的信息</h2>
            <div class="info-card">
              <div class="info-row">
                <span class="info-key">用户名</span>
                <span class="info-val">{{ userInfo.username }}</span>
              </div>
              <div class="info-row">
                <span class="info-key">用户ID</span>
                <span class="info-val">{{ userInfo.id }}</span>
              </div>
              <div class="info-row">
                <span class="info-key">账号安全</span>
                <span class="info-val level-safe">已验证 ✓</span>
              </div>
              <div class="info-row">
                <span class="info-key">会员等级</span>
                <span class="info-val">
                  <span class="badge badge-orange">普通会员</span>
                </span>
              </div>
            </div>
          </div>

          <!-- 我的订单 -->
          <div v-else-if="activeTab === 'orders'" class="tab-panel">
            <h2 class="panel-title">我的订单</h2>

            <!-- 订单状态 tabs -->
            <div class="order-tabs">
              <button
                v-for="s in orderStatuses"
                :key="s.key"
                class="order-tab-btn"
                :class="{ active: orderStatus === s.key }"
                @click="orderStatus = s.key"
              >{{ s.label }}
                <span v-if="countByStatus(s.key) > 0" class="order-tab-count">{{ countByStatus(s.key) }}</span>
              </button>
            </div>

            <div v-if="filteredOrders.length === 0" class="empty-orders">
              <p class="empty-icon">📦</p>
              <p class="empty-text">暂无{{ currentStatusLabel }}订单</p>
              <router-link to="/products" class="btn btn-primary btn-small">去购物</router-link>
            </div>
            <div v-else class="orders-list">
              <div v-for="order in filteredOrders" :key="order.id" class="mini-order-card">
                <div class="mini-order-header">
                  <span class="order-id">{{ order.id }}</span>
                  <span class="order-date">{{ order.date }}</span>
                  <span class="order-status" :class="'status-' + order.status">{{ statusLabel(order.status) }}</span>
                </div>
                <div class="mini-order-items">
                  <img
                    v-for="item in order.items.slice(0, 4)"
                    :key="item.productId"
                    :src="item.image"
                    :alt="item.name"
                    class="mini-item-img"
                  />
                  <span v-if="order.items.length > 4" class="more-count">+{{ order.items.length - 4 }}</span>
                </div>
                <div class="mini-order-footer">
                  <span class="mini-total">合计：<strong class="price">¥{{ formatPrice(order.total) }}</strong></span>
                  <router-link to="/order" class="btn btn-small btn-outline">查看详情</router-link>
                </div>
              </div>
            </div>
          </div>

          <!-- 收藏夹 -->
          <div v-else-if="activeTab === 'favorites'" class="tab-panel">
            <h2 class="panel-title">我的收藏</h2>
            <div class="empty-placeholder">
              <p class="empty-icon">❤️</p>
              <p class="empty-text">暂无收藏商品</p>
              <router-link to="/products" class="btn btn-primary btn-small">去逛逛</router-link>
            </div>
          </div>

          <!-- 地址管理 -->
          <div v-else-if="activeTab === 'address'" class="tab-panel">
            <h2 class="panel-title">收货地址</h2>
            <div class="address-list">
              <div v-for="addr in savedAddresses" :key="addr.id" class="address-card">
                <div class="addr-info">
                  <span class="addr-name">{{ addr.name }}</span>
                  <span class="addr-phone">{{ addr.phone }}</span>
                  <p class="addr-detail">{{ addr.detail }}</p>
                </div>
                <div class="addr-actions">
                  <span v-if="addr.isDefault" class="default-badge">默认</span>
                </div>
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const userInfo = computed(() => userStore.userInfo)

const activeTab = ref('profile')
const orderStatus = ref('all')

const tabs = [
  { key: 'profile', label: '我的信息', icon: '👤' },
  { key: 'orders', label: '我的订单', icon: '📦' },
  { key: 'favorites', label: '我的收藏', icon: '❤️' },
  { key: 'address', label: '收货地址', icon: '📍' },
]

const orderStatuses = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待付款' },
  { key: 'shipped', label: '待收货' },
  { key: 'done', label: '已完成' },
]

const orders = computed(() => JSON.parse(localStorage.getItem('jd_orders') || '[]'))

const filteredOrders = computed(() => {
  if (orderStatus.value === 'all') return orders.value
  return orders.value.filter(o => o.status === orderStatus.value)
})

const currentStatusLabel = computed(() => {
  const found = orderStatuses.find(s => s.key === orderStatus.value)
  return found ? found.label : ''
})

function countByStatus(key) {
  if (key === 'all') return 0
  return orders.value.filter(o => o.status === key).length
}

const savedAddresses = ref([
  { id: 1, name: '张三', phone: '138****8888', detail: '北京市海淀区中关村大街1号 2单元 301', isDefault: true },
  { id: 2, name: '李四', phone: '139****9999', detail: '上海市浦东新区陆家嘴环路1000号', isDefault: false },
])

function handleLogout() {
  userStore.logout()
  router.push('/')
}

function statusLabel(status) {
  const map = { pending: '待付款', shipped: '待收货', done: '已完成', cancelled: '已取消' }
  return map[status] || status
}

function formatPrice(val) {
  return Number(val).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
</script>

<style scoped>
.user-page {
  padding: var(--spacing-6) 0 var(--spacing-10);
}
.user-layout {
  display: flex;
  gap: var(--spacing-6);
  align-items: flex-start;
}

/* ── 左侧栏 ── */
.user-sidebar {
  flex-shrink: 0;
  width: 200px;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}
.profile-card {
  background: var(--color-bg-white);
  border-radius: var(--radius-md);
  padding: var(--spacing-5);
  text-align: center;
  box-shadow: var(--shadow-sm);
}
.profile-avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--color-primary-light);
  margin-bottom: var(--spacing-3);
}
.profile-name {
  font-size: var(--font-size-base);
  font-weight: 700;
  color: var(--color-text-primary);
}
.profile-id {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  margin-top: 2px;
}
.user-nav {
  background: var(--color-bg-white);
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}
.user-nav-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  width: 100%;
  padding: var(--spacing-3) var(--spacing-4);
  font-size: var(--font-size-sm);
  color: var(--color-text-regular);
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  transition: var(--transition-fast);
  border-bottom: 1px solid var(--color-border-light);
}
.user-nav-item:last-child { border-bottom: none; }
.user-nav-item:hover {
  color: var(--color-primary);
  background: var(--color-primary-pale);
}
.user-nav-item.active {
  color: var(--color-primary);
  font-weight: 600;
  background: var(--color-primary-pale);
  border-right: 2px solid var(--color-primary);
}
.nav-item-icon { font-size: 16px; }
.logout-btn {
  background: none;
  border: 1px solid var(--color-border-base);
  border-radius: var(--radius-md);
  padding: var(--spacing-2) var(--spacing-4);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: var(--transition-fast);
  width: 100%;
}
.logout-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

/* ── 主内容 ── */
.user-main { flex: 1; min-width: 0; }
.tab-panel {
  background: var(--color-bg-white);
  border-radius: var(--radius-md);
  padding: var(--spacing-6);
  box-shadow: var(--shadow-sm);
}
.panel-title {
  font-size: var(--font-size-xl);
  font-weight: 700;
  margin-bottom: var(--spacing-5);
  padding-bottom: var(--spacing-3);
  border-bottom: 2px solid var(--color-primary);
}

/* 信息卡片 */
.info-card { display: flex; flex-direction: column; }
.info-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-5);
  padding: var(--spacing-4) 0;
  border-bottom: 1px solid var(--color-border-light);
}
.info-row:last-child { border-bottom: none; }
.info-key { color: var(--color-text-secondary); font-size: var(--font-size-sm); width: 80px; flex-shrink: 0; }
.info-val { color: var(--color-text-primary); font-size: var(--font-size-sm); }
.level-safe { color: var(--color-success); font-weight: 600; }

/* 订单 tabs */
.order-tabs {
  display: flex;
  gap: 0;
  border-bottom: 2px solid var(--color-border-light);
  margin-bottom: var(--spacing-5);
}
.order-tab-btn {
  padding: var(--spacing-3) var(--spacing-5);
  font-size: var(--font-size-sm);
  color: var(--color-text-regular);
  background: none;
  border: none;
  cursor: pointer;
  position: relative;
  transition: var(--transition-fast);
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
}
.order-tab-btn:hover { color: var(--color-primary); }
.order-tab-btn.active {
  color: var(--color-primary);
  font-weight: 700;
  border-bottom: 2px solid var(--color-primary);
  margin-bottom: -2px;
}
.order-tab-count {
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

/* 订单卡片 */
.orders-list { display: flex; flex-direction: column; gap: var(--spacing-4); }
.mini-order-card {
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  overflow: hidden;
}
.mini-order-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
  padding: var(--spacing-3) var(--spacing-4);
  background: #f7f7f7;
  font-size: var(--font-size-sm);
}
.order-id { font-weight: 600; color: var(--color-text-primary); flex: 1; }
.order-date { color: var(--color-text-secondary); }
.order-status { font-weight: 600; }
.status-pending { color: var(--color-warning); }
.status-shipped { color: var(--color-info); }
.status-done { color: var(--color-success); }
.status-cancelled { color: var(--color-text-secondary); }

.mini-order-items {
  display: flex;
  gap: var(--spacing-2);
  align-items: center;
  padding: var(--spacing-3) var(--spacing-4);
}
.mini-item-img {
  width: 52px;
  height: 52px;
  object-fit: cover;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border-light);
}
.more-count { font-size: var(--font-size-sm); color: var(--color-text-secondary); }
.mini-order-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-3) var(--spacing-4);
  border-top: 1px solid var(--color-border-light);
}
.mini-total { font-size: var(--font-size-sm); color: var(--color-text-regular); }

/* 地址 */
.address-list { display: flex; flex-direction: column; gap: var(--spacing-3); }
.address-card {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: var(--spacing-4);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
}
.addr-info { flex: 1; }
.addr-name { font-weight: 700; margin-right: var(--spacing-3); }
.addr-phone { color: var(--color-text-secondary); font-size: var(--font-size-sm); }
.addr-detail { color: var(--color-text-regular); font-size: var(--font-size-sm); margin-top: 4px; }
.addr-actions { display: flex; align-items: center; gap: var(--spacing-2); }
.default-badge {
  background: var(--color-primary-light);
  color: var(--color-primary);
  font-size: var(--font-size-xs);
  font-weight: 600;
  padding: 2px 6px;
  border-radius: var(--radius-sm);
}

/* 空态 */
.empty-orders,
.empty-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-10) 0;
  text-align: center;
}
.empty-icon { font-size: 48px; }
.empty-text { color: var(--color-text-secondary); }
</style>

