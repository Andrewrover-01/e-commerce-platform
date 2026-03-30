<template>
  <div class="detail-page">
    <div class="container">

      <!-- 加载 -->
      <div v-if="loading" class="detail-loading">
        <span class="loading-spinner" />
      </div>

      <!-- 未找到 -->
      <div v-else-if="!product" class="detail-not-found">
        <p class="not-found-icon">😕</p>
        <p class="not-found-text">商品不存在或已下架</p>
        <button class="btn btn-primary" @click="$router.push('/products')">返回商品列表</button>
      </div>

      <template v-else>

        <!-- 面包屑 -->
        <nav class="breadcrumb">
          <span class="bc-link" @click="$router.push('/')">首页</span>
          <span class="bc-sep">›</span>
          <span class="bc-link" @click="$router.push({ path: '/products', query: { category: product.category } })">{{ product.category }}</span>
          <span class="bc-sep">›</span>
          <span class="bc-current text-ellipsis">{{ product.name }}</span>
        </nav>

        <!-- 主区：图片 + 信息 -->
        <div class="detail-main">

          <!-- 左：图片区 -->
          <div class="image-section">
            <div class="image-main-wrap">
              <img
                :src="activeImage"
                :alt="product.name"
                class="image-main"
              />
              <div class="image-badges">
                <span v-if="product.isHot" class="badge badge-primary">热销</span>
                <span v-if="product.isNew" class="badge badge-new">新品</span>
              </div>
            </div>
            <div class="image-thumbs">
              <img
                v-for="(img, idx) in product.images"
                :key="idx"
                :src="img"
                :alt="`图片${idx + 1}`"
                class="image-thumb"
                :class="{ active: activeImage === img }"
                @mouseenter="activeImage = img"
                @click="activeImage = img"
              />
            </div>
          </div>

          <!-- 右：商品信息 -->
          <div class="info-section">
            <div class="info-brand">{{ product.brand }}</div>
            <h1 class="info-name">{{ product.name }}</h1>
            <p class="info-desc">{{ product.description }}</p>

            <!-- 评分行 -->
            <div class="info-rating-row">
              <span class="stars">{{ renderStars(product.rating) }}</span>
              <span class="rating-val">{{ product.rating }}</span>
              <span class="rating-sep">|</span>
              <span class="review-count">{{ formatCount(product.reviewCount) }} 条评价</span>
              <span class="rating-sep">|</span>
              <span class="sales-count">已售 {{ formatCount(product.sales) }}</span>
            </div>

            <!-- 价格区 -->
            <div class="price-block">
              <div class="price-row">
                <span class="price-label">促销价</span>
                <span class="price-main">
                  <em class="price-sym">¥</em>{{ formatPrice(product.price) }}
                </span>
                <span v-if="product.originalPrice > product.price" class="price-origin">
                  ¥{{ formatPrice(product.originalPrice) }}
                </span>
                <span v-if="discountRate" class="price-discount">{{ discountRate }}折</span>
              </div>
              <div v-if="savedAmount > 0" class="price-save">
                立省 <strong>¥{{ formatPrice(savedAmount) }}</strong>
              </div>
            </div>

            <!-- 规格 -->
            <table class="spec-table">
              <tbody>
                <tr v-for="spec in product.specs" :key="spec.label">
                  <th>{{ spec.label }}</th>
                  <td>{{ spec.value }}</td>
                </tr>
              </tbody>
            </table>

            <!-- 数量 + 加购 -->
            <div class="action-row">
              <div class="qty-ctrl">
                <button class="qty-btn" :disabled="qty <= 1" @click="qty--">−</button>
                <input
                  v-model.number="qty"
                  type="number"
                  min="1"
                  :max="product.stock"
                  class="qty-input"
                  @blur="qty = Math.max(1, Math.min(qty, product.stock))"
                />
                <button class="qty-btn" :disabled="qty >= product.stock" @click="qty++">＋</button>
              </div>
              <span class="stock-tip">库存 {{ product.stock }} 件</span>
            </div>
            <div class="action-btns">
              <button class="btn btn-large btn-primary" @click="handleAddToCart">
                🛒 加入购物车
              </button>
              <button class="btn btn-large btn-buy" @click="handleBuyNow">
                立即购买
              </button>
            </div>
            <p v-if="addedTip" class="added-tip">✓ 已加入购物车</p>
          </div>
        </div>

        <!-- 评价区 -->
        <section class="reviews-section">
          <h2 class="reviews-title">商品评价 <span class="reviews-count">({{ product.reviewCount }} 条)</span></h2>
          <div class="reviews-list">
            <div v-for="review in product.reviews" :key="review.id" class="review-item">
              <div class="review-header">
                <img :src="review.avatar" :alt="review.user" class="review-avatar" />
                <div class="review-meta">
                  <span class="review-user">{{ review.user }}</span>
                  <span class="review-stars">{{ renderStars(review.rating) }}</span>
                </div>
                <span class="review-date">{{ review.date }}</span>
              </div>
              <p class="review-content">{{ review.content }}</p>
            </div>
          </div>
        </section>

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
  } catch {
    product.value = null
  } finally {
    loading.value = false
  }
}

function handleAddToCart() {
  cartStore.addToCart(product.value, qty.value)
  addedTip.value = true
  setTimeout(() => { addedTip.value = false }, 2000)
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

function renderStars(rating) {
  const full = Math.floor(rating)
  const half = rating - full >= 0.5 ? 1 : 0
  const empty = 5 - full - half
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty)
}

onMounted(loadProduct)
watch(() => route.params.id, loadProduct)
</script>

<style scoped>
.detail-page {
  padding: var(--spacing-6) 0 var(--spacing-10);
}

.detail-loading,
.detail-not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-12) 0;
  gap: var(--spacing-4);
}
.not-found-icon { font-size: 48px; }
.not-found-text { color: var(--color-text-secondary); font-size: var(--font-size-lg); }

/* 面包屑 */
.breadcrumb {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  margin-bottom: var(--spacing-5);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}
.bc-link {
  cursor: pointer;
  transition: var(--transition-fast);
}
.bc-link:hover { color: var(--color-primary); }
.bc-sep { color: #ccc; }
.bc-current {
  color: var(--color-text-primary);
  max-width: 300px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

/* ── 主区布局 ── */
.detail-main {
  display: flex;
  gap: var(--spacing-8);
  background: var(--color-bg-white);
  border-radius: var(--radius-md);
  padding: var(--spacing-6);
  box-shadow: var(--shadow-sm);
  margin-bottom: var(--spacing-6);
}

/* 图片区 */
.image-section {
  flex-shrink: 0;
  width: 400px;
}
.image-main-wrap {
  position: relative;
  width: 400px;
  height: 400px;
  overflow: hidden;
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  background: #fafafa;
}
.image-main {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}
.image-main-wrap:hover .image-main {
  transform: scale(1.08);
}
.image-badges {
  position: absolute;
  top: var(--spacing-2);
  left: var(--spacing-2);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
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
  object-fit: cover;
  border: 2px solid var(--color-border-light);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: var(--transition-fast);
}
.image-thumb:hover,
.image-thumb.active {
  border-color: var(--color-primary);
}

/* 信息区 */
.info-section {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}
.info-brand {
  font-size: var(--font-size-xs);
  color: var(--color-info);
  font-weight: 600;
}
.info-name {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: var(--line-height-tight);
}
.info-desc {
  font-size: var(--font-size-sm);
  color: var(--color-text-regular);
  line-height: var(--line-height-base);
}

/* 评分 */
.info-rating-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}
.stars { color: #f5a623; letter-spacing: -1px; }
.rating-val { color: var(--color-warning); font-weight: 700; }
.rating-sep { color: #ddd; }

/* 价格 */
.price-block {
  background: #fff8f8;
  border-radius: var(--radius-md);
  padding: var(--spacing-4);
}
.price-row {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-3);
  flex-wrap: wrap;
}
.price-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  flex-shrink: 0;
}
.price-main {
  color: var(--color-price);
  font-size: 32px;
  font-weight: 700;
  line-height: 1;
}
.price-sym {
  font-style: normal;
  font-size: var(--font-size-lg);
  vertical-align: middle;
}
.price-origin {
  color: var(--color-price-origin);
  text-decoration: line-through;
  font-size: var(--font-size-sm);
}
.price-discount {
  background: var(--color-primary-light);
  color: var(--color-primary);
  font-size: var(--font-size-xs);
  font-weight: 600;
  padding: 2px 5px;
  border-radius: var(--radius-sm);
}
.price-save {
  margin-top: var(--spacing-2);
  font-size: var(--font-size-sm);
  color: var(--color-primary);
}

/* 规格表 */
.spec-table {
  border-collapse: collapse;
  width: 100%;
  font-size: var(--font-size-sm);
}
.spec-table th,
.spec-table td {
  padding: var(--spacing-2) var(--spacing-3);
  text-align: left;
  border-bottom: 1px solid var(--color-border-light);
}
.spec-table th {
  color: var(--color-text-secondary);
  width: 80px;
  background: #fafafa;
  font-weight: 500;
}
.spec-table td { color: var(--color-text-primary); }

/* 数量控制 */
.action-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
}
.qty-ctrl {
  display: flex;
  align-items: center;
  border: 1px solid var(--color-border-base);
  border-radius: var(--radius-sm);
  overflow: hidden;
}
.qty-btn {
  width: 36px;
  height: 36px;
  font-size: 18px;
  background: #f5f5f5;
  color: var(--color-text-primary);
  border: none;
  cursor: pointer;
  transition: var(--transition-fast);
  flex-shrink: 0;
}
.qty-btn:hover:not(:disabled) { background: var(--color-primary-light); }
.qty-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.qty-input {
  width: 60px;
  height: 36px;
  text-align: center;
  border: none;
  border-left: 1px solid var(--color-border-base);
  border-right: 1px solid var(--color-border-base);
  font-size: var(--font-size-base);
  outline: none;
}
.qty-input::-webkit-inner-spin-button { display: none; }
.stock-tip { font-size: var(--font-size-xs); color: var(--color-text-secondary); }

/* 按钮 */
.action-btns {
  display: flex;
  gap: var(--spacing-4);
}
.btn-buy {
  background: #ff6700;
  color: #fff;
  border: none;
  border-radius: var(--radius-md);
  font-weight: 700;
  cursor: pointer;
  transition: var(--transition-fast);
}
.btn-buy:hover { background: #e55c00; }
.added-tip {
  color: var(--color-success);
  font-size: var(--font-size-sm);
  animation: fadeIn 0.2s ease;
}
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

/* ── 评价 ── */
.reviews-section {
  background: var(--color-bg-white);
  border-radius: var(--radius-md);
  padding: var(--spacing-6);
  box-shadow: var(--shadow-sm);
}
.reviews-title {
  font-size: var(--font-size-xl);
  font-weight: 700;
  margin-bottom: var(--spacing-5);
  padding-bottom: var(--spacing-3);
  border-bottom: 2px solid var(--color-primary);
}
.reviews-count { font-size: var(--font-size-sm); color: var(--color-text-secondary); font-weight: 400; }
.reviews-list { display: flex; flex-direction: column; gap: var(--spacing-5); }
.review-item { padding-bottom: var(--spacing-5); border-bottom: 1px solid var(--color-border-light); }
.review-item:last-child { border-bottom: none; }
.review-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  margin-bottom: var(--spacing-2);
}
.review-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}
.review-meta { display: flex; flex-direction: column; gap: 2px; flex: 1; }
.review-user { font-size: var(--font-size-sm); font-weight: 600; color: var(--color-text-primary); }
.review-stars { color: #f5a623; font-size: 12px; letter-spacing: -1px; }
.review-date { font-size: var(--font-size-xs); color: var(--color-text-secondary); }
.review-content { font-size: var(--font-size-sm); color: var(--color-text-regular); line-height: var(--line-height-base); }
</style>

