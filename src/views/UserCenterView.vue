<template>
  <div class="user-page">
    <div class="container">
      <el-row :gutter="24" align="top">
        <el-col :span="5">
          <el-card shadow="never" class="profile-card">
            <el-avatar :src="userInfo.avatar" :size="72" />
            <p class="profile-name">{{ userInfo.username }}</p>
            <p class="profile-id">ID: {{ userInfo.id }}</p>
          </el-card>

          <el-card shadow="never" class="menu-card">
            <el-menu :default-active="activeTab" @select="val => (activeTab = val)">
              <el-menu-item v-for="tab in tabs" :key="tab.key" :index="tab.key">{{ tab.icon }} {{ tab.label }}</el-menu-item>
            </el-menu>
          </el-card>

          <el-button class="logout-btn" @click="handleLogout">退出登录</el-button>
        </el-col>

        <el-col :span="19">
          <el-card shadow="never" class="tab-panel">
            <template #header>
              <strong>{{ tabs.find(t => t.key === activeTab)?.label }}</strong>
            </template>

            <template v-if="activeTab === 'profile'">
              <el-descriptions :column="1" border>
                <el-descriptions-item label="用户名">{{ userInfo.username }}</el-descriptions-item>
                <el-descriptions-item label="用户ID">{{ userInfo.id }}</el-descriptions-item>
                <el-descriptions-item label="账号安全">
                  <el-tag type="success">已验证</el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="会员等级">
                  <el-tag type="warning">普通会员</el-tag>
                </el-descriptions-item>
              </el-descriptions>
            </template>

            <template v-else-if="activeTab === 'orders'">
              <el-tabs v-model="orderStatus">
                <el-tab-pane v-for="s in orderStatuses" :key="s.key" :label="tabLabel(s)" :name="s.key" />
              </el-tabs>

              <el-empty v-if="filteredOrders.length === 0" :description="`暂无${currentStatusLabel}订单`">
                <router-link to="/products"><el-button type="primary" size="small">去购物</el-button></router-link>
              </el-empty>

              <el-space v-else direction="vertical" fill :size="12">
                <el-card v-for="order in filteredOrders" :key="order.id" shadow="never">
                  <div class="mini-order-header">
                    <span class="order-id">{{ order.id }}</span>
                    <span class="order-date">{{ order.date }}</span>
                    <el-tag :type="statusType(order.status)">{{ statusLabel(order.status) }}</el-tag>
                  </div>
                  <div class="mini-order-items">
                    <el-image
                      v-for="item in order.items.slice(0, 4)"
                      :key="item.productId"
                      :src="item.image"
                      :alt="item.name"
                      class="mini-item-img"
                      fit="cover"
                    />
                    <span v-if="order.items.length > 4" class="more-count">+{{ order.items.length - 4 }}</span>
                  </div>
                  <div class="mini-order-footer">
                    <span>合计：<strong class="price">¥{{ formatPrice(order.total) }}</strong></span>
                    <router-link to="/order"><el-button size="small">查看详情</el-button></router-link>
                  </div>
                </el-card>
              </el-space>
            </template>

            <template v-else-if="activeTab === 'favorites'">
              <el-empty description="暂无收藏商品">
                <router-link to="/products"><el-button type="primary" size="small">去逛逛</el-button></router-link>
              </el-empty>
            </template>

            <template v-else-if="activeTab === 'address'">
              <el-space direction="vertical" fill :size="12">
                <el-card v-for="addr in savedAddresses" :key="addr.id" shadow="never">
                  <div class="address-card">
                    <div>
                      <span class="addr-name">{{ addr.name }}</span>
                      <span class="addr-phone">{{ addr.phone }}</span>
                      <p class="addr-detail">{{ addr.detail }}</p>
                    </div>
                    <el-tag v-if="addr.isDefault" type="danger">默认</el-tag>
                  </div>
                </el-card>
              </el-space>
            </template>
          </el-card>
        </el-col>
      </el-row>
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

function tabLabel(status) {
  const count = countByStatus(status.key)
  return count > 0 ? `${status.label} (${count})` : status.label
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

function statusType(status) {
  const map = { pending: 'warning', shipped: 'primary', done: 'success', cancelled: 'info' }
  return map[status] || 'info'
}

function formatPrice(val) {
  return Number(val).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
</script>

<style scoped>
.user-page {
  padding: var(--spacing-6) 0 var(--spacing-10);
}

.profile-card,
.menu-card {
  margin-bottom: var(--spacing-3);
}

.profile-card {
  text-align: center;
}

.profile-name {
  font-size: var(--font-size-base);
  font-weight: 700;
  margin-top: var(--spacing-3);
}

.profile-id {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  margin-top: 2px;
}

.logout-btn {
  width: 100%;
}

.mini-order-header,
.mini-order-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-3);
}

.mini-order-items {
  display: flex;
  gap: var(--spacing-2);
  align-items: center;
  margin: var(--spacing-3) 0;
}

.mini-item-img {
  width: 52px;
  height: 52px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border-light);
}

.more-count {
  color: var(--color-text-secondary);
}

.address-card {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.addr-name {
  font-weight: 700;
  margin-right: var(--spacing-3);
}

.addr-phone {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.addr-detail {
  color: var(--color-text-regular);
  font-size: var(--font-size-sm);
  margin-top: 4px;
}
</style>
