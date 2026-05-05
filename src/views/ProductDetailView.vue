<template>
  <div class="detail-page">
    <div class="container">
      <el-skeleton v-if="loading" :rows="10" animated />

      <el-empty v-else-if="!product" description="商品不存在或已下架">
        <el-button type="primary" @click="$router.push('/products')">返回商品列表</el-button>
      </el-empty>

      <template v-else>
        <el-breadcrumb class="breadcrumb" separator=">">
          <el-breadcrumb-item><a @click.prevent="$router.push('/')">首页</a></el-breadcrumb-item>
          <el-breadcrumb-item>
            <a @click.prevent="$router.push({ path: '/products', query: { category: product.category } })">{{ product.category }}</a>
          </el-breadcrumb-item>
          <el-breadcrumb-item>{{ product.name }}</el-breadcrumb-item>
        </el-breadcrumb>

        <el-card shadow="never" class="detail-main">
          <el-row :gutter="32">
            <el-col :span="10">
              <el-image :src="activeImage" :alt="product.name" fit="cover" class="image-main" />
              <div class="image-thumbs">
                <el-image
                  v-for="(img, idx) in product.images"
                  :key="idx"
                  :src="img"
                  fit="cover"
                  class="image-thumb"
                  :class="{ active: activeImage === img }"
                  @mouseenter="activeImage = img"
                  @click="activeImage = img"
                />
              </div>
            </el-col>

            <el-col :span="14">
              <el-space direction="vertical" fill :size="16">
                <el-text type="primary">{{ product.brand }}</el-text>
                <h1 class="info-name">{{ product.name }}</h1>
                <p class="info-desc">{{ product.description }}</p>

                <div class="rating-row">
                  <el-rate :model-value="product.rating" disabled allow-half />
                  <el-text>{{ product.rating }}</el-text>
                  <el-divider direction="vertical" />
                  <el-text type="info">{{ formatCount(product.reviewCount) }} 条评价</el-text>
                  <el-divider direction="vertical" />
                  <el-text type="info">已售 {{ formatCount(product.sales) }}</el-text>
                </div>

                <el-card shadow="never" class="price-block">
                  <el-space wrap>
                    <el-text>促销价</el-text>
                    <span class="price-main">¥{{ formatPrice(product.price) }}</span>
                    <span v-if="product.originalPrice > product.price" class="price-origin">¥{{ formatPrice(product.originalPrice) }}</span>
                    <el-tag v-if="discountRate" type="danger">{{ discountRate }}折</el-tag>
                  </el-space>
                  <div v-if="savedAmount > 0" class="price-save">立省 ¥{{ formatPrice(savedAmount) }}</div>
                </el-card>

                <el-descriptions :column="1" border>
                  <el-descriptions-item v-for="spec in product.specs" :key="spec.label" :label="spec.label">
                    {{ spec.value }}
                  </el-descriptions-item>
                </el-descriptions>

                <el-space>
                  <el-text>数量</el-text>
                  <el-input-number v-model="qty" :min="1" :max="product.stock" />
                  <el-text type="info">库存 {{ product.stock }} 件</el-text>
                </el-space>

                <el-space>
                  <el-button type="danger" size="large" @click="handleAddToCart">加入购物车</el-button>
                  <el-button type="warning" size="large" @click="handleBuyNow">立即购买</el-button>
                </el-space>

                <el-alert v-if="addedTip" title="已加入购物车" type="success" :closable="false" show-icon />
              </el-space>
            </el-col>
          </el-row>
        </el-card>

        <el-card shadow="never" class="reviews-section">
          <template #header>
            <strong>商品评价 ({{ product.reviewCount }} 条)</strong>
          </template>
          <div class="reviews-list">
            <div v-for="review in product.reviews" :key="review.id" class="review-item">
              <el-avatar :src="review.avatar" :size="36" />
              <div class="review-main">
                <div class="review-head">
                  <el-text>{{ review.user }}</el-text>
                  <el-rate :model-value="review.rating" disabled allow-half size="small" />
                  <el-text type="info">{{ review.date }}</el-text>
                </div>
                <p class="review-content">{{ review.content }}</p>
              </div>
            </div>
          </div>
        </el-card>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { getProductById } from '@/api/mock'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()

const product = ref(null)
const loading = ref(true)
const activeImage = ref('')
const qty = ref(1)
const addedTip = ref(false)

const discountRate = computed(() => {
  if (!product.value) return null
  const { price, originalPrice } = product.value
  if (!originalPrice || originalPrice <= price) return null
  const rate = Math.round((price / originalPrice) * 10)
  return rate < 10 ? rate : null
})

const savedAmount = computed(() => {
  if (!product.value) return 0
  return Math.max(0, product.value.originalPrice - product.value.price)
})

async function loadProduct() {
  loading.value = true
  try {
    product.value = await getProductById(route.params.id)
    activeImage.value = product.value.images[0]
    qty.value = 1
  } catch {
    product.value = null
  } finally {
    loading.value = false
  }
}

function handleAddToCart() {
  cartStore.addToCart(product.value, qty.value)
  addedTip.value = true
  setTimeout(() => {
    addedTip.value = false
  }, 2000)
}

function handleBuyNow() {
  cartStore.addToCart(product.value, qty.value)
  router.push('/cart')
}

function formatPrice(val) {
  return Number(val).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatCount(val) {
  if (val >= 10000) return (val / 10000).toFixed(1) + '万'
  return val
}

onMounted(loadProduct)
watch(() => route.params.id, loadProduct)
</script>

<style scoped>
.detail-page {
  padding: var(--spacing-6) 0 var(--spacing-10);
}

.breadcrumb {
  margin-bottom: var(--spacing-5);
}

.detail-main {
  margin-bottom: var(--spacing-6);
}

.image-main {
  width: 100%;
  height: 400px;
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
}

.image-thumbs {
  display: flex;
  gap: var(--spacing-2);
  margin-top: var(--spacing-3);
  flex-wrap: wrap;
}

.image-thumb {
  width: 72px;
  height: 72px;
  border: 2px solid var(--color-border-light);
  border-radius: var(--radius-sm);
  cursor: pointer;
}

.image-thumb.active {
  border-color: var(--color-primary);
}

.info-name {
  font-size: var(--font-size-2xl);
}

.info-desc {
  color: var(--color-text-regular);
}

.rating-row {
  display: flex;
  align-items: center;
}

.price-block {
  background: #fff8f8;
  border: none;
}

.price-main {
  color: var(--color-price);
  font-size: 32px;
  font-weight: 700;
  line-height: 1;
}

.price-origin {
  color: var(--color-price-origin);
  text-decoration: line-through;
}

.price-save {
  margin-top: var(--spacing-2);
  color: var(--color-primary);
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.review-item {
  display: flex;
  gap: var(--spacing-3);
  padding-bottom: var(--spacing-4);
  border-bottom: 1px solid var(--color-border-light);
}

.review-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.review-main {
  flex: 1;
}

.review-head {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  margin-bottom: var(--spacing-1);
}

.review-content {
  color: var(--color-text-regular);
}
</style>
