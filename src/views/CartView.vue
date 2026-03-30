<template>
  <div class="cart-page">
    <div class="container">
      <h1 class="page-title">我的购物车</h1>

      <!-- 空购物车 -->
      <div v-if="items.length === 0" class="cart-empty">
        <p class="empty-icon">🛒</p>
        <p class="empty-text">购物车空空如也，快去选购吧！</p>
        <router-link to="/products" class="btn btn-primary btn-large">去购物</router-link>
      </div>

      <div v-else class="cart-layout">

        <!-- 商品列表 -->
        <div class="cart-list">

          <!-- 表头 -->
          <div class="cart-header">
            <label class="check-cell">
              <input type="checkbox" :checked="allSelected" @change="cartStore.selectAll($event.target.checked)" />
              全选
            </label>
            <span class="col-info">商品信息</span>
            <span class="col-price">单价</span>
            <span class="col-qty">数量</span>
            <span class="col-subtotal">小计</span>
            <span class="col-action">操作</span>
          </div>

          <!-- 商品行 -->
          <div
            v-for="item in items"
            :key="item.productId"
            class="cart-row"
            :class="{ 'row-selected': item.selected }"
          >
            <label class="check-cell">
              <input
                type="checkbox"
                :checked="item.selected"
                @change="cartStore.toggleSelect(item.productId)"
              />
            </label>

            <!-- 商品图 + 名 -->
            <div class="col-info">
              <img :src="item.image" :alt="item.name" class="item-img" />
              <span
                class="item-name text-ellipsis-2"
                @click="$router.push({ name: 'ProductDetail', params: { id: item.productId } })"
              >{{ item.name }}</span>
            </div>

            <!-- 单价 -->
            <div class="col-price price">¥{{ formatPrice(item.price) }}</div>

            <!-- 数量 -->
            <div class="col-qty">
              <div class="qty-ctrl">
                <button
                  class="qty-btn"
                  :disabled="item.quantity <= 1"
                  @click="cartStore.updateQuantity(item.productId, item.quantity - 1)"
                >−</button>
                <span class="qty-val">{{ item.quantity }}</span>
                <button
                  class="qty-btn"
                  @click="cartStore.updateQuantity(item.productId, item.quantity + 1)"
                >＋</button>
              </div>
            </div>

            <!-- 小计 -->
            <div class="col-subtotal price">¥{{ formatPrice(item.price * item.quantity) }}</div>

            <!-- 操作 -->
            <div class="col-action">
              <button class="del-btn" @click="cartStore.removeFromCart(item.productId)">删除</button>
            </div>
          </div>
        </div>

        <!-- 结算栏 -->
        <div class="checkout-bar">
          <label class="check-all-label">
            <input type="checkbox" :checked="allSelected" @change="cartStore.selectAll($event.target.checked)" />
            全选
          </label>
          <button class="del-selected-btn" @click="deleteSelected">删除选中</button>
          <div class="checkout-summary">
            <span class="summary-text">
              已选 <strong class="primary-text">{{ selectedCount }}</strong> 件商品，
              合计：<strong class="price-main">¥{{ formatPrice(selectedPrice) }}</strong>
            </span>
            <button
              class="btn btn-primary btn-large checkout-btn"
              :disabled="selectedCount === 0"
              @click="handleCheckout"
            >去结算</button>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const cartStore = useCartStore()
const userStore = useUserStore()

const items = computed(() => cartStore.items)
const selectedCount = computed(() => cartStore.selectedCount)
const selectedPrice = computed(() => cartStore.selectedPrice)
const allSelected = computed(() => items.value.length > 0 && items.value.every(i => i.selected))

function deleteSelected() {
  const ids = cartStore.selectedItems.map(i => i.productId)
  ids.forEach(id => cartStore.removeFromCart(id))
}

function handleCheckout() {
  if (!userStore.isLoggedIn) {
    router.push({ name: 'Login', query: { redirect: '/order' } })
    return
  }
  router.push('/order')
}

function formatPrice(val) {
  return Number(val).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
</script>

<style scoped>
.cart-page {
  padding: var(--spacing-6) 0 var(--spacing-10);
}

.page-title {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  margin-bottom: var(--spacing-5);
}

/* 空态 */
.cart-empty {
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

/* 布局 */
.cart-layout { display: flex; flex-direction: column; gap: var(--spacing-4); }

/* 列表 */
.cart-list {
  background: var(--color-bg-white);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.cart-header {
  display: grid;
  grid-template-columns: 100px 1fr 120px 120px 120px 100px;
  align-items: center;
  padding: var(--spacing-3) var(--spacing-4);
  background: #f7f7f7;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  border-bottom: 1px solid var(--color-border-light);
}

.cart-row {
  display: grid;
  grid-template-columns: 100px 1fr 120px 120px 120px 100px;
  align-items: center;
  padding: var(--spacing-4);
  border-bottom: 1px solid var(--color-border-light);
  transition: background 0.15s;
}
.cart-row:last-child { border-bottom: none; }
.cart-row.row-selected { background: #fff8f8; }

.check-cell {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  font-size: var(--font-size-sm);
  cursor: pointer;
  user-select: none;
}
.check-cell input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: var(--color-primary);
  cursor: pointer;
}

.col-info {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-3);
}
.item-img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border-light);
  flex-shrink: 0;
}
.item-name {
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  cursor: pointer;
  line-height: var(--line-height-base);
  max-width: 260px;
}
.item-name:hover { color: var(--color-primary); }

.col-price,
.col-subtotal,
.col-qty,
.col-action {
  text-align: center;
  font-size: var(--font-size-sm);
}

.qty-ctrl {
  display: inline-flex;
  align-items: center;
  border: 1px solid var(--color-border-base);
  border-radius: var(--radius-sm);
  overflow: hidden;
}
.qty-btn {
  width: 28px;
  height: 28px;
  background: #f5f5f5;
  font-size: 16px;
  border: none;
  cursor: pointer;
  transition: var(--transition-fast);
}
.qty-btn:hover:not(:disabled) { background: var(--color-primary-light); }
.qty-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.qty-val {
  width: 40px;
  text-align: center;
  font-size: var(--font-size-sm);
  border-left: 1px solid var(--color-border-base);
  border-right: 1px solid var(--color-border-base);
  line-height: 28px;
}

.del-btn {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  background: none;
  border: none;
  cursor: pointer;
  transition: var(--transition-fast);
}
.del-btn:hover { color: var(--color-primary); }

/* 结算栏 */
.checkout-bar {
  display: flex;
  align-items: center;
  gap: var(--spacing-5);
  background: var(--color-bg-white);
  padding: var(--spacing-4) var(--spacing-5);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  position: sticky;
  bottom: 0;
}
.check-all-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  font-size: var(--font-size-sm);
  cursor: pointer;
  user-select: none;
}
.check-all-label input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: var(--color-primary);
}
.del-selected-btn {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  background: none;
  border: none;
  cursor: pointer;
  transition: var(--transition-fast);
}
.del-selected-btn:hover { color: var(--color-primary); }

.checkout-summary {
  display: flex;
  align-items: center;
  gap: var(--spacing-5);
  margin-left: auto;
}
.summary-text { font-size: var(--font-size-sm); color: var(--color-text-regular); }
.primary-text { color: var(--color-primary); }
.price-main {
  color: var(--color-price);
  font-size: var(--font-size-2xl);
  font-weight: 700;
}
.checkout-btn { min-width: 160px; }
.checkout-btn:disabled { opacity: 0.5; cursor: not-allowed; }
</style>

