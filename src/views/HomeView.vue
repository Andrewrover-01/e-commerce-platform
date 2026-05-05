<template>
  <div class="home-page">
    <div class="home-banner">
      <div class="container">
        <el-card shadow="never" class="banner-card">
          <Carousel :slides="bannerSlides" :interval="4500" />
        </el-card>
      </div>
    </div>

    <div class="container">
      <section class="home-section">
        <div class="section-header">
          <h2 class="section-title"><span class="title-icon">🔥</span>热销爆款</h2>
          <router-link :to="{ path: '/products', query: { sort: 'sales' } }" class="section-more">查看全部 →</router-link>
        </div>

        <el-skeleton v-if="hotLoading" :rows="4" animated />

        <el-row v-else :gutter="16">
          <el-col v-for="product in hotProducts" :key="product.id" :xs="24" :sm="12" :md="8" :lg="6">
            <ProductCard :product="product" />
          </el-col>
        </el-row>
      </section>

      <section class="home-section">
        <div class="section-header">
          <h2 class="section-title"><span class="title-icon">✨</span>新品首发</h2>
          <router-link :to="{ path: '/products', query: { sort: 'newest' } }" class="section-more">查看全部 →</router-link>
        </div>

        <el-skeleton v-if="newLoading" :rows="4" animated />

        <el-row v-else :gutter="16">
          <el-col v-for="product in newProducts" :key="product.id" :xs="24" :sm="12" :md="8" :lg="6">
            <ProductCard :product="product" />
          </el-col>
        </el-row>
      </section>
    </div>

    <CouponDialog v-model:visible="couponVisible" :coupon-data="couponData" @claim="handleClaim">
      <template #default="{ coupon }">
        <el-card shadow="never" class="coupon-card">
          <el-image :src="coupon.image" class="coupon-img" fit="cover" />
          <div class="coupon-main">
            <p class="coupon-money">¥{{ coupon.amount }}</p>
            <p class="coupon-line">满{{ coupon.threshold }}可用</p>
            <p class="coupon-line">有效期至 {{ coupon.expireAt }}</p>
          </div>
        </el-card>
      </template>
      <template #footer>
        <el-button @click="couponVisible = false">稍后再说</el-button>
        <el-button type="danger" @click="handleClaim">立即领取</el-button>
      </template>
    </CouponDialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import Carousel from '@/components/common/Carousel.vue'
import ProductCard from '@/components/common/ProductCard.vue'
import CouponDialog from '@/components/common/CouponDialog.vue'
import { getHotProducts, getNewProducts } from '@/api/mock'

const hotProducts = ref([])
const newProducts = ref([])
const hotLoading = ref(true)
const newLoading = ref(true)

const couponVisible = ref(true)
const couponData = ref({
  image: 'https://picsum.photos/640/320?random=201',
  amount: 50,
  threshold: 299,
  expireAt: '2026-12-31',
})

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

function handleClaim() {
  console.log('领取优惠券', couponData.value)
  ElMessage.success('领取成功')
  couponVisible.value = false
}

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

.home-banner {
  background: #fff;
  padding: var(--spacing-4) 0;
  margin-bottom: var(--spacing-6);
  border-bottom: 1px solid var(--color-border-light);
}

.banner-card {
  border: none;
}

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

.section-more {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  text-decoration: none;
}

.coupon-card {
  border: none;
}

.coupon-img {
  width: 100%;
  height: 180px;
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-3);
}

.coupon-main {
  text-align: center;
}

.coupon-money {
  color: var(--color-price);
  font-size: 36px;
  font-weight: 700;
  line-height: 1;
  margin-bottom: var(--spacing-2);
}

.coupon-line {
  color: var(--color-text-secondary);
}
</style>
