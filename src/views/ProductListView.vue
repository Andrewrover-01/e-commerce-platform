<template>
  <div class="product-list-page">
    <div class="container">
      <el-row :gutter="24" align="top">
        <el-col :span="5">
          <el-card shadow="never">
            <template #header>
              <strong>商品分类</strong>
            </template>
            <el-menu :default-active="activeMenuKey" @select="onCategorySelect">
              <el-menu-item index="all">全部商品</el-menu-item>
              <el-menu-item v-for="cat in categories" :key="cat.id" :index="String(cat.id)">
                <span class="cat-icon">{{ cat.icon }}</span>{{ cat.name }}
              </el-menu-item>
            </el-menu>
          </el-card>
        </el-col>

        <el-col :span="19">
          <el-breadcrumb class="list-breadcrumb" separator=">">
            <el-breadcrumb-item><a @click.prevent="$router.push('/')">首页</a></el-breadcrumb-item>
            <el-breadcrumb-item>{{ activeCategoryName || '全部商品' }}</el-breadcrumb-item>
            <el-breadcrumb-item v-if="keyword">{{ keyword }}</el-breadcrumb-item>
          </el-breadcrumb>

          <el-card shadow="never" class="sort-card">
            <el-space wrap>
              <el-button
                v-for="opt in sortOptions"
                :key="opt.value"
                :type="sortKey === opt.value ? 'danger' : 'default'"
                @click="setSort(opt.value)"
              >
                {{ opt.label }}
              </el-button>
              <el-text type="info">共 {{ total }} 件商品</el-text>
            </el-space>
          </el-card>

          <el-skeleton v-if="loading" :rows="6" animated />

          <template v-else>
            <el-empty v-if="products.length === 0" description="没有找到符合条件的商品">
              <el-button @click="clearFilters">清除筛选</el-button>
            </el-empty>

            <el-row v-else :gutter="16">
              <el-col v-for="product in products" :key="product.id" :xs="24" :sm="12" :md="8" :lg="6">
                <ProductCard :product="product" />
              </el-col>
            </el-row>

            <div v-if="totalPages > 1" class="pagination">
              <el-pagination
                v-model:current-page="page"
                :page-size="pageSize"
                layout="prev, pager, next"
                :total="total"
                background
                @current-change="goPage"
              />
            </div>
          </template>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ProductCard from '@/components/common/ProductCard.vue'
import { getProducts, getCategories } from '@/api/mock'

const route = useRoute()
const router = useRouter()

const products = ref([])
const categories = ref([])
const loading = ref(false)
const total = ref(0)

const page = ref(1)
const pageSize = 12

const sortKey = ref('')
const activeCategoryId = ref(null)
const activeCategoryName = ref('')
const keyword = computed(() => route.query.keyword || '')

const sortOptions = [
  { label: '综合', value: '' },
  { label: '销量', value: 'sales' },
  { label: '价格↑', value: 'price_asc' },
  { label: '价格↓', value: 'price_desc' },
  { label: '好评', value: 'rating' },
  { label: '新品', value: 'newest' },
]

const totalPages = computed(() => Math.ceil(total.value / pageSize))
const activeMenuKey = computed(() => (activeCategoryId.value ? String(activeCategoryId.value) : 'all'))

async function load() {
  loading.value = true
  const cat = categories.value.find(c => c.id === activeCategoryId.value)
  const res = await getProducts({
    category: cat ? cat.name : undefined,
    categoryId: activeCategoryId.value || undefined,
    keyword: keyword.value || undefined,
    sort: sortKey.value || undefined,
    page: page.value,
    pageSize,
  })
  products.value = res.list
  total.value = res.total
  loading.value = false
}

function selectCategory(cat) {
  activeCategoryId.value = cat ? cat.id : null
  activeCategoryName.value = cat ? cat.name : ''
  page.value = 1
  router.replace({ query: { ...route.query, category: cat ? cat.name : undefined, page: undefined } })
  load()
}

function onCategorySelect(index) {
  if (index === 'all') {
    selectCategory(null)
    return
  }
  const cat = categories.value.find(c => String(c.id) === index)
  if (cat) selectCategory(cat)
}

function setSort(val) {
  sortKey.value = val
  page.value = 1
  load()
}

function goPage(p) {
  page.value = p
  window.scrollTo({ top: 0, behavior: 'smooth' })
  load()
}

function clearFilters() {
  activeCategoryId.value = null
  activeCategoryName.value = ''
  sortKey.value = ''
  page.value = 1
  router.replace({ path: '/products' })
  load()
}

onMounted(async () => {
  categories.value = await getCategories()
  const q = route.query
  if (q.sort) sortKey.value = q.sort
  if (q.category) {
    const cat = categories.value.find(c => c.name === q.category)
    if (cat) {
      activeCategoryId.value = cat.id
      activeCategoryName.value = cat.name
    }
  }
  await load()
})

watch(() => route.query.keyword, () => {
  page.value = 1
  load()
})
</script>

<style scoped>
.product-list-page {
  padding: var(--spacing-6) 0 var(--spacing-10);
}

.list-breadcrumb {
  margin-bottom: var(--spacing-4);
}

.sort-card {
  margin-bottom: var(--spacing-4);
}

.cat-icon {
  margin-right: var(--spacing-1);
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: var(--spacing-6);
}
</style>
