<template>
  <div class="order-page">
    <div class="container">
      <h1 class="page-title">订单中心</h1>

      <el-card v-if="pendingItems.length > 0" shadow="never" class="section-card">
        <template #header><strong>确认订单</strong></template>

        <el-card shadow="never" class="addr-block">
          <el-space wrap>
            <el-text type="info">配送地址</el-text>
            <template v-if="!addressEditing">
              <el-text>{{ address.name }}</el-text>
              <el-text>{{ address.phone }}</el-text>
              <el-text>{{ address.detail }}</el-text>
              <el-button link type="primary" @click="addressEditing = true">修改</el-button>
            </template>
            <template v-else>
              <el-input v-model="address.name" placeholder="收货人" class="addr-input" />
              <el-input v-model="address.phone" placeholder="手机号" class="addr-input" />
              <el-input v-model="address.detail" placeholder="详细地址" class="addr-input" />
              <el-button @click="addressEditing = false">确认</el-button>
            </template>
          </el-space>
        </el-card>

        <el-table :data="pendingItems" style="width: 100%; margin-bottom: 16px;">
          <el-table-column label="商品" min-width="300">
            <template #default="{ row }">
              <div class="item-cell">
                <el-image :src="row.image" :alt="row.name" class="order-item-img" fit="cover" />
                <span>{{ row.name }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="单价" width="140">
            <template #default="{ row }">¥{{ formatPrice(row.price) }}</template>
          </el-table-column>
          <el-table-column label="数量" width="100">
            <template #default="{ row }">× {{ row.quantity }}</template>
          </el-table-column>
          <el-table-column label="小计" width="150">
            <template #default="{ row }">¥{{ formatPrice(row.price * row.quantity) }}</template>
          </el-table-column>
        </el-table>

        <el-descriptions :column="1" border class="order-summary">
          <el-descriptions-item label="商品总价">¥{{ formatPrice(totalAmount) }}</el-descriptions-item>
          <el-descriptions-item label="运费">{{ totalAmount >= 99 ? '免运费' : '¥10.00' }}</el-descriptions-item>
          <el-descriptions-item label="应付总额">
            <span class="total-price">¥{{ formatPrice(finalAmount) }}</span>
          </el-descriptions-item>
        </el-descriptions>

        <div class="actions">
          <el-button type="danger" size="large" @click="handleSubmit">提交订单</el-button>
        </div>
      </el-card>

      <el-card v-if="orders.length > 0" shadow="never" class="section-card">
        <template #header><strong>我的订单</strong></template>
        <el-space direction="vertical" fill :size="12">
          <el-card v-for="order in orders" :key="order.id" shadow="never">
            <div class="order-card-header">
              <span class="order-id">订单号：{{ order.id }}</span>
              <span class="order-date">{{ order.date }}</span>
              <el-tag :type="statusType(order.status)">{{ statusLabel(order.status) }}</el-tag>
            </div>
            <div class="order-items-preview">
              <el-image
                v-for="item in order.items.slice(0, 3)"
                :key="item.productId"
                :src="item.image"
                :alt="item.name"
                class="preview-img"
                fit="cover"
              />
              <span v-if="order.items.length > 3" class="preview-more">+{{ order.items.length - 3 }}</span>
            </div>
            <div class="order-card-footer">
              <span>共 {{ order.items.reduce((s, i) => s + i.quantity, 0) }} 件，合计 ¥{{ formatPrice(order.total) }}</span>
              <el-space>
                <el-button v-if="order.status === 'pending'" type="danger" size="small" @click="payOrder(order)">去支付</el-button>
                <el-button v-if="order.status === 'shipped'" size="small" @click="confirmOrder(order)">确认收货</el-button>
                <el-button v-if="order.status === 'done'" size="small" @click="$router.push('/products')">再次购买</el-button>
              </el-space>
            </div>
          </el-card>
        </el-space>
      </el-card>

      <el-empty v-if="pendingItems.length === 0 && orders.length === 0" description="暂无订单，快去购物吧！">
        <router-link to="/products"><el-button type="primary">去购物</el-button></router-link>
      </el-empty>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useCartStore } from '@/stores/cart'

const cartStore = useCartStore()

const pendingItems = computed(() => cartStore.selectedItems)
const totalAmount = computed(() => cartStore.selectedPrice)
const finalAmount = computed(() => (totalAmount.value >= 99 ? totalAmount.value : totalAmount.value + 10))

const addressEditing = ref(false)
const address = ref({ name: '张三', phone: '138****8888', detail: '北京市海淀区中关村大街1号' })

const orders = ref(JSON.parse(localStorage.getItem('jd_orders') || '[]'))

function saveOrders() {
  localStorage.setItem('jd_orders', JSON.stringify(orders.value))
}

function handleSubmit() {
  const order = {
    id: 'JD' + Date.now(),
    date: new Date().toLocaleDateString('zh-CN'),
    status: 'pending',
    items: pendingItems.value.map(i => ({ ...i })),
    total: finalAmount.value,
    address: { ...address.value },
  }
  orders.value.unshift(order)
  saveOrders()
  cartStore.clearCart()
}

function payOrder(order) {
  order.status = 'shipped'
  saveOrders()
}

function confirmOrder(order) {
  order.status = 'done'
  saveOrders()
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
.order-page {
  padding: var(--spacing-6) 0 var(--spacing-10);
}

.page-title {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  margin-bottom: var(--spacing-5);
}

.section-card {
  margin-bottom: var(--spacing-5);
}

.addr-block {
  margin-bottom: var(--spacing-4);
  background: var(--color-primary-pale);
  border: none;
}

.addr-input {
  width: 180px;
}

.item-cell {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.order-item-img {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border-light);
}

.order-summary {
  width: 320px;
  margin-left: auto;
}

.total-price {
  color: var(--color-price);
  font-size: var(--font-size-xl);
  font-weight: 700;
}

.actions {
  display: flex;
  justify-content: flex-end;
  margin-top: var(--spacing-4);
}

.order-card-header,
.order-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-3);
}

.order-items-preview {
  display: flex;
  gap: var(--spacing-2);
  align-items: center;
  margin: var(--spacing-3) 0;
}

.preview-img {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border-light);
}

.preview-more {
  color: var(--color-text-secondary);
}
</style>
