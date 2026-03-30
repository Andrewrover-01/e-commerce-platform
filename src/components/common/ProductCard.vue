<template>
  <div class="product-card" @click="goDetail">
    <!-- 商品图片 -->
    <div class="card-image-wrap">
      <img
        :src="product.image"
        :alt="product.name"
        class="card-image"
        loading="lazy"
        @error="onImgError"
      />
      <!-- 标签 -->
      <div class="card-badges">
        <span v-if="product.isHot" class="badge badge-primary">热销</span>
        <span v-if="product.isNew" class="badge badge-new">新品</span>
      </div>
      <!-- 快捷加购覆盖层 -->
      <div class="card-overlay">
        <button class="add-cart-btn" @click.stop="addToCart">
          🛒 加入购物车
        </button>
      </div>
    </div>

    <!-- 商品信息 -->
    <div class="card-body">
      <!-- 品牌标 -->
      <div v-if="product.brand" class="card-brand">{{ product.brand }}</div>

      <!-- 商品名 -->
      <p class="card-name text-ellipsis-2">{{ product.name }}</p>

      <!-- 评分 & 销量 -->
      <div class="card-meta">
        <span class="card-rating">
          <span class="stars">{{ renderStars(product.rating) }}</span>
          <span class="rating-num">{{ product.rating }}</span>
        </span>
        <span class="card-sales">已售 {{ formatCount(product.sales) }}</span>
      </div>

      <!-- 价格 -->
      <div class="card-price-row">
        <span class="card-price">
          <em class="price-symbol">¥</em>{{ formatPrice(product.price) }}
        </span>
        <span v-if="product.originalPrice && product.originalPrice > product.price" class="card-origin-price">
          ¥{{ formatPrice(product.originalPrice) }}
        </span>
        <span v-if="discountRate" class="card-discount">{{ discountRate }}折</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
})

const router = useRouter()
const cartStore = useCartStore()

// 折扣率（只在折扣 ≥ 10% 时显示，即 ≤9折）
const discountRate = computed(() => {
  const { price, originalPrice } = props.product
  if (!originalPrice || originalPrice <= price) return null
  const rate = Math.round((price / originalPrice) * 10) // 中文"折"制：7折 = 70%
  if (rate >= 10) return null
  return rate
})

function goDetail() {
  router.push({ name: 'ProductDetail', params: { id: props.product.id } })
}

function addToCart() {
  cartStore.addToCart(props.product, 1)
}

function onImgError(e) {
  e.target.src = 'https://picsum.photos/300/300?random=0'
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
</script>

<style scoped>
.product-card {
  background: var(--color-bg-white);
  border-radius: var(--radius-md);
  overflow: hidden;
  cursor: pointer;
  transition: var(--transition-base);
  border: 1px solid transparent;
  position: relative;
}
.product-card:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-card-hover);
  transform: translateY(-2px);
}

/* ── 图片区 ── */
.card-image-wrap {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  background: #f9f9f9;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.35s ease;
}
.product-card:hover .card-image {
  transform: scale(1.05);
}

/* 徽标组 */
.card-badges {
  position: absolute;
  top: var(--spacing-2);
  left: var(--spacing-2);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
  z-index: 2;
}

/* 快捷加购覆盖 */
.card-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: var(--spacing-4);
  opacity: 0;
  transition: opacity 0.2s ease;
  z-index: 3;
}
.product-card:hover .card-overlay {
  opacity: 1;
}

.add-cart-btn {
  background: var(--color-primary);
  color: #fff;
  padding: var(--spacing-2) var(--spacing-5);
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: var(--transition-fast);
  white-space: nowrap;
}
.add-cart-btn:hover {
  background: var(--color-primary-dark);
}

/* ── 信息区 ── */
.card-body {
  padding: var(--spacing-3);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.card-brand {
  font-size: var(--font-size-xs);
  color: var(--color-info);
  font-weight: 600;
  letter-spacing: 0.5px;
}

.card-name {
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  line-height: var(--line-height-base);
  min-height: 2.6em;
}

/* 评分&销量 */
.card-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.card-rating {
  display: flex;
  align-items: center;
  gap: 2px;
}
.stars {
  color: #f5a623;
  letter-spacing: -1px;
  font-size: 11px;
}
.rating-num {
  color: var(--color-text-secondary);
}

/* 价格行 */
.card-price-row {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-2);
  flex-wrap: wrap;
}

.card-price {
  color: var(--color-price);
  font-weight: 700;
  font-size: var(--font-size-lg);
  line-height: 1;
}
.price-symbol {
  font-style: normal;
  font-size: var(--font-size-xs);
  vertical-align: middle;
}

.card-origin-price {
  color: var(--color-price-origin);
  text-decoration: line-through;
  font-size: var(--font-size-xs);
}

.card-discount {
  background: var(--color-primary-light);
  color: var(--color-primary);
  font-size: var(--font-size-xs);
  font-weight: 600;
  padding: 1px 4px;
  border-radius: var(--radius-sm);
}
</style>
