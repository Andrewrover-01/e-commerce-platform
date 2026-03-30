<template>
  <div class="home-page">

    <!-- ── 顶部横幅轮播 ── -->
    <div class="home-banner">
      <div class="container">
        <Carousel :slides="bannerSlides" :interval="4500" />
      </div>
    </div>

    <!-- ── 秒杀 / 热销 ── -->
    <div class="container">
      <section class="home-section">
        <div class="section-header">
          <h2 class="section-title">
            <span class="title-icon">🔥</span>热销爆款
          </h2>
          <router-link :to="{ path: '/products', query: { sort: 'sales' } }" class="section-more">
            查看全部 →
          </router-link>
        </div>
        <div v-if="hotLoading" class="section-loading">
          <span class="loading-spinner" />
        </div>
        <div v-else class="product-grid">
          <ProductCard
            v-for="product in hotProducts"
            :key="product.id"
            :product="product"
          />
        </div>
      </section>

      <!-- ── 新品首发 ── -->
      <section class="home-section">
        <div class="section-header">
          <h2 class="section-title">
            <span class="title-icon">✨</span>新品首发
          </h2>
          <router-link :to="{ path: '/products', query: { sort: 'newest' } }" class="section-more">
            查看全部 →
          </router-link>
        </div>
        <div v-if="newLoading" class="section-loading">
          <span class="loading-spinner" />
        </div>
        <div v-else class="product-grid product-grid-4">
          <ProductCard
            v-for="product in newProducts"
            :key="product.id"
            :product="product"
          />
        </div>
      </section>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Carousel from '@/components/common/Carousel.vue'
import ProductCard from '@/components/common/ProductCard.vue'
import { getHotProducts, getNewProducts } from '@/api/mock'

const hotProducts = ref([])
const newProducts = ref([])
const hotLoading = ref(true)
const newLoading = ref(true)

const bannerSlides = [
  {
    image: 'https://picsum.photos/1190/447?random=101',
    title: '年货节 · 超值大促',
    subtitle: '品质好货，低价直送到家',
    link: '/products?sort=sales',
  },
  {
    image: 'https://picsum.photos/1190/447?random=102',
    title: '数码旗舰 · 首发优惠',
    subtitle: '最新手机 / 笔记本 / 耳机 全场特价',
    link: '/products?category=手机数码',
  },
  {
    image: 'https://picsum.photos/1190/447?random=103',
    title: '家电焕新季',
    subtitle: '以旧换新享补贴，品牌正品放心买',
    link: '/products?category=家用电器',
  },
  {
    image: 'https://picsum.photos/1190/447?random=104',
    title: '图书知识节',
    subtitle: '好书好价，开卷有益',
    link: '/products?category=图书音像',
  },
]

onMounted(async () => {
  const [hot, newArr] = await Promise.all([getHotProducts(), getNewProducts()])
  hotProducts.value = hot
  newProducts.value = newArr
  hotLoading.value = false
  newLoading.value = false
})
</script>

<style scoped>
.home-page {
  padding-bottom: var(--spacing-10);
}

/* ── 轮播横幅 ── */
.home-banner {
  background: #fff;
  padding: var(--spacing-4) 0;
  margin-bottom: var(--spacing-6);
  border-bottom: 1px solid var(--color-border-light);
}

/* ── 板块公用 ── */
.home-section {
  margin-bottom: var(--spacing-8);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-4);
  padding-bottom: var(--spacing-3);
  border-bottom: 2px solid var(--color-primary);
}

.section-title {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--color-text-primary);
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}
.title-icon {
  font-size: var(--font-size-xl);
}

.section-more {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  transition: var(--transition-fast);
  text-decoration: none;
}
.section-more:hover {
  color: var(--color-primary);
}

/* ── 商品网格 ── */
.product-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-4);
}

.product-grid-4 {
  grid-template-columns: repeat(4, 1fr);
}

/* ── 加载中 ── */
.section-loading {
  display: flex;
  justify-content: center;
  padding: var(--spacing-10) 0;
}
</style>
