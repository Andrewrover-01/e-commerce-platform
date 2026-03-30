<template>
  <div class="order-page">
    <div class="container">
      <h1 class="page-title">订单中心</h1>

      <!-- 待提交结算 (购物车有选中商品) -->
      <div v-if="pendingItems.length > 0" class="checkout-section">
        <div class="section-card">
          <h2 class="section-heading">确认订单</h2>

          <!-- 配送地址 -->
          <div class="addr-block">
            <div class="addr-label">配送地址</div>
            <div v-if="!addressEditing" class="addr-display">
              <span class="addr-name">{{ address.name }}</span>
              <span class="addr-phone">{{ address.phone }}</span>
              <span class="addr-detail">{{ address.detail }}</span>
              <button class="addr-edit-btn" @click="addressEditing = true">修改</button>
            </div>
            <div v-else class="addr-edit-form">
              <input v-model="address.name" class="form-input addr-input" placeholder="收货人" />
              <input v-model="address.phone" class="form-input addr-input" placeholder="手机号" />
              <input v-model="address.detail" class="form-input addr-input" placeholder="详细地址" />
              <button class="btn btn-outline btn-small" @click="addressEditing = false">确认</button>
            </div>
          </div>

          <!-- 商品清单 -->
          <table class="order-table">
            <thead>
              <tr>
                <th>商品</th>
                <th>单价</th>
                <th>数量</th>
                <th>小计</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in pendingItems" :key="item.productId">
                <td class="item-cell">
                  <img :src="item.image" :alt="item.name" class="order-item-img" />
                  <span class="order-item-name">{{ item.name }}</span>
                </td>
                <td class="price">¥{{ formatPrice(item.price) }}</td>
                <td>× {{ item.quantity }}</td>
                <td class="price">¥{{ formatPrice(item.price * item.quantity) }}</td>
              </tr>
            </tbody>
          </table>

          <!-- 金额汇总 -->
          <div class="order-summary">
            <div class="summary-row">
              <span>商品总价</span>
              <span class="price">¥{{ formatPrice(totalAmount) }}</span>
            </div>
            <div class="summary-row">
              <span>运费</span>
              <span class="price-green">{{ totalAmount >= 99 ? '免运费' : '¥10.00' }}</span>
            </div>
            <div class="summary-row total-row">
              <span>应付总额</span>
              <span class="total-price">¥{{ formatPrice(finalAmount) }}</span>
            </div>
          </div>

          <button class="btn btn-primary btn-large submit-btn" @click="handleSubmit">
            提交订单
          </button>
        </div>
      </div>

      <!-- 订单已提交 / 历史订单 -->
      <div v-if="orders.length > 0" class="orders-section">
        <div class="section-card">
          <h2 class="section-heading">我的订单</h2>
          <div class="order-list">
            <div v-for="order in orders" :key="order.id" class="order-card">
              <div class="order-card-header">
                <span class="order-id">订单号：{{ order.id }}</span>
                <span class="order-date">{{ order.date }}</span>
                <span class="order-status" :class="'status-' + order.status">
                  {{ statusLabel(order.status) }}
                </span>
              </div>
              <div class="order-items-preview">
                <img
                  v-for="item in order.items.slice(0, 3)"
                  :key="item.productId"
                  :src="item.image"
                  :alt="item.name"
                  class="preview-img"
                />
                <span v-if="order.items.length > 3" class="preview-more">+{{ order.items.length - 3 }}</span>
              </div>
              <div class="order-card-footer">
                <span class="order-total">共 {{ order.items.reduce((s, i) => s + i.quantity, 0) }} 件，合计
                  <strong class="price">¥{{ formatPrice(order.total) }}</strong>
                </span>
                <div class="order-actions">
                  <button v-if="order.status === 'pending'" class="btn btn-small btn-primary" @click="payOrder(order)">
                    去支付
                  </button>
                  <button v-if="order.status === 'shipped'" class="btn btn-small btn-outline" @click="confirmOrder(order)">
                    确认收货
                  </button>
                  <button v-if="order.status === 'done'" class="btn btn-small btn-outline" @click="$router.push('/products')">
                    再次购买
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 全空态 -->
      <div v-if="pendingItems.length === 0 && orders.length === 0" class="order-empty">
        <p class="empty-icon">📦</p>
        <p class="empty-text">暂无订单，快去购物吧！</p>
        <router-link to="/products" class="btn btn-primary">去购物</router-link>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'

const router = useRouter()
const cartStore = useCartStore()

const pendingItems = computed(() => cartStore.selectedItems)
const totalAmount = computed(() => cartStore.selectedPrice)
const finalAmount = computed(() => totalAmount.value >= 99 ? totalAmount.value : totalAmount.value + 10)

const addressEditing = ref(false)
const address = ref({ name: '张三', phone: '138****8888', detail: '北京市海淀区中关村大街1号' })

// Persisted orders
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
  background: var(--color-bg-white);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  padding: var(--spacing-6);
  margin-bottom: var(--spacing-5);
}
.section-heading {
  font-size: var(--font-size-xl);
  font-weight: 700;
  margin-bottom: var(--spacing-5);
  padding-bottom: var(--spacing-3);
  border-bottom: 2px solid var(--color-primary);
}

/* 地址 */
.addr-block {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-4);
  margin-bottom: var(--spacing-5);
  padding: var(--spacing-4);
  background: var(--color-primary-pale);
  border-radius: var(--radius-md);
  flex-wrap: wrap;
}
.addr-label { font-weight: 600; font-size: var(--font-size-sm); color: var(--color-text-secondary); flex-shrink: 0; }
.addr-display { display: flex; align-items: center; gap: var(--spacing-4); flex: 1; flex-wrap: wrap; }
.addr-name { font-weight: 700; }
.addr-phone, .addr-detail { color: var(--color-text-regular); font-size: var(--font-size-sm); }
.addr-edit-btn {
  background: none;
  border: none;
  color: var(--color-primary);
  font-size: var(--font-size-sm);
  cursor: pointer;
  text-decoration: underline;
}
.addr-edit-form { display: flex; gap: var(--spacing-2); flex-wrap: wrap; flex: 1; }
.addr-input { width: auto; flex: 1; min-width: 120px; }

/* 订单表格 */
.order-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--font-size-sm);
  margin-bottom: var(--spacing-5);
}
.order-table th {
  padding: var(--spacing-3);
  background: #f7f7f7;
  color: var(--color-text-secondary);
  font-weight: 500;
  text-align: left;
  border-bottom: 1px solid var(--color-border-light);
}
.order-table td {
  padding: var(--spacing-3);
  border-bottom: 1px solid var(--color-border-light);
  color: var(--color-text-primary);
  vertical-align: middle;
}
.item-cell { display: flex; align-items: center; gap: var(--spacing-3); }
.order-item-img { width: 56px; height: 56px; object-fit: cover; border-radius: var(--radius-sm); border: 1px solid var(--color-border-light); flex-shrink: 0; }
.order-item-name { font-size: var(--font-size-sm); max-width: 360px; }

/* 汇总 */
.order-summary {
  width: 280px;
  margin-left: auto;
  margin-bottom: var(--spacing-5);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  overflow: hidden;
}
.summary-row {
  display: flex;
  justify-content: space-between;
  padding: var(--spacing-3) var(--spacing-4);
  font-size: var(--font-size-sm);
  border-bottom: 1px solid var(--color-border-light);
}
.summary-row:last-child { border-bottom: none; }
.total-row { font-weight: 700; background: #fff8f8; }
.price-green { color: var(--color-success); }
.total-price { color: var(--color-price); font-size: var(--font-size-xl); font-weight: 700; }

.submit-btn {
  display: block;
  min-width: 200px;
  margin-left: auto;
}

/* 订单卡片 */
.order-list { display: flex; flex-direction: column; gap: var(--spacing-4); }
.order-card {
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  overflow: hidden;
}
.order-card-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
  padding: var(--spacing-3) var(--spacing-4);
  background: #f7f7f7;
  font-size: var(--font-size-sm);
}
.order-id { font-weight: 600; color: var(--color-text-primary); }
.order-date { color: var(--color-text-secondary); }
.order-status { margin-left: auto; font-weight: 600; }
.status-pending { color: var(--color-warning); }
.status-shipped { color: var(--color-info); }
.status-done { color: var(--color-success); }
.status-cancelled { color: var(--color-text-secondary); }

.order-items-preview {
  display: flex;
  gap: var(--spacing-2);
  align-items: center;
  padding: var(--spacing-3) var(--spacing-4);
}
.preview-img {
  width: 56px;
  height: 56px;
  object-fit: cover;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border-light);
}
.preview-more {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.order-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-3) var(--spacing-4);
  border-top: 1px solid var(--color-border-light);
}
.order-total { font-size: var(--font-size-sm); color: var(--color-text-regular); }
.order-actions { display: flex; gap: var(--spacing-2); }

/* 空态 */
.order-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-4);
  padding: var(--spacing-12) 0;
  background: var(--color-bg-white);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
}
.empty-icon { font-size: 56px; }
.empty-text { font-size: var(--font-size-lg); color: var(--color-text-secondary); }
</style>

