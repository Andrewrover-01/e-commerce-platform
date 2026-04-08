<template>
  <div class="cart-page">
    <div class="container">
      <h1 class="page-title">我的购物车</h1>

      <el-empty v-if="items.length === 0" description="购物车空空如也，快去选购吧！">
        <router-link to="/products">
          <el-button type="primary" size="large">去购物</el-button>
        </router-link>
      </el-empty>

      <template v-else>
        <el-card shadow="never">
          <el-table :data="items" style="width: 100%">
            <el-table-column width="90">
              <template #header>
                <el-checkbox :model-value="allSelected" @change="cartStore.selectAll" />
              </template>
              <template #default="{ row }">
                <el-checkbox :model-value="row.selected" @change="() => cartStore.toggleSelect(row.productId)" />
              </template>
            </el-table-column>

            <el-table-column label="商品信息" min-width="320">
              <template #default="{ row }">
                <div class="item-info">
                  <el-image :src="row.image" :alt="row.name" class="item-img" fit="cover" />
                  <el-button
                    link
                    type="primary"
                    class="item-name"
                    @click="$router.push({ name: 'ProductDetail', params: { id: row.productId } })"
                  >
                    {{ row.name }}
                  </el-button>
                </div>
              </template>
            </el-table-column>

            <el-table-column label="单价" width="130">
              <template #default="{ row }">¥{{ formatPrice(row.price) }}</template>
            </el-table-column>

            <el-table-column label="数量" width="160">
              <template #default="{ row }">
                <el-input-number
                  :model-value="row.quantity"
                  :min="1"
                  @change="val => updateQty(row.productId, val)"
                />
              </template>
            </el-table-column>

            <el-table-column label="小计" width="150">
              <template #default="{ row }">
                <span class="price">¥{{ formatPrice(row.price * row.quantity) }}</span>
              </template>
            </el-table-column>

            <el-table-column label="操作" width="100">
              <template #default="{ row }">
                <el-button link type="danger" @click="cartStore.removeFromCart(row.productId)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>

        <el-card shadow="never" class="checkout-bar">
          <el-space>
            <el-checkbox :model-value="allSelected" @change="cartStore.selectAll">全选</el-checkbox>
            <el-button link type="danger" @click="deleteSelected">删除选中</el-button>
          </el-space>

          <el-space>
            <span>已选 <strong class="primary-text">{{ selectedCount }}</strong> 件商品，</span>
            <span>合计：<strong class="price-main">¥{{ formatPrice(selectedPrice) }}</strong></span>
            <el-button type="danger" size="large" :disabled="selectedCount === 0" @click="handleCheckout">
              去结算
            </el-button>
          </el-space>
        </el-card>
      </template>
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

function updateQty(productId, val) {
  cartStore.updateQuantity(productId, Math.max(1, Number(val || 1)))
}

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

.item-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.item-img {
  width: 80px;
  height: 80px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border-light);
  flex-shrink: 0;
}

.item-name {
  text-align: left;
  white-space: normal;
}

.checkout-bar {
  margin-top: var(--spacing-4);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.primary-text {
  color: var(--color-primary);
}

.price-main {
  color: var(--color-price);
  font-size: var(--font-size-xl);
  font-weight: 700;
}
</style>
