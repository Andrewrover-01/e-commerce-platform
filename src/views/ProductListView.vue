<template>
  <div class="product-list-page">
    <div class="container">
      <div class="list-layout">

        <!-- ── 左侧分类侧栏 ── -->
        <aside class="sidebar">
          <div class="sidebar-box">
            <h3 class="sidebar-title">商品分类</h3>
            <ul class="cat-list">
              <li
                class="cat-item"
                :class="{ active: !activeCategoryId }"
                @click="selectCategory(null)"
              >全部商品</li>
              <li
                v-for="cat in categories"
                :key="cat.id"
                class="cat-item"
                :class="{ active: activeCategoryId === cat.id }"
                @click="selectCategory(cat)"
              >
                <span class="cat-icon">{{ cat.icon }}</span>{{ cat.name }}
              </li>
            </ul>
          </div>
        </aside>

        <!-- ── 右侧主内容 ── -->
        <main class="list-main">

          <!-- 面包屑 + 结果数 -->
          <div class="list-breadcrumb">
            <span class="breadcrumb-home" @click="$router.push('/')">首页</span>
            <span class="breadcrumb-sep">›</span>
            <span v-if="activeCategoryName" class="breadcrumb-cat">{{ activeCategoryName }}</span>
            <span v-else class="breadcrumb-cat">全部商品</span>
            <span v-if="keyword" class="breadcrumb-kw"> — "{{ keyword }}"</span>
            <span class="breadcrumb-total">共 {{ total }} 件商品</span>
          </div>

          <!-- 排序栏 -->
          <div class="sort-bar">
            <button
              v-for="opt in sortOptions"
              :key="opt.value"
              class="sort-btn"
              :class="{ active: sortKey === opt.value }"
              @click="setSort(opt.value)"
            >{{ opt.label }}</button>
          </div>

          <!-- 商品网格 -->
          <div v-if="loading" class="list-loading">
            <span class="loading-spinner" />
          </div>
          <template v-else>
            <div v-if="products.length === 0" class="list-empty">
              <p class="empty-icon">🔍</p>
              <p class="empty-text">没有找到符合条件的商品</p>
              <button class="btn btn-outline" @click="clearFilters">清除筛选</button>
            </div>
            <div v-else class="product-grid">
              <ProductCard
                v-for="product in products"
                :key="product.id"
                :product="product"
              />
            </div>

            <!-- 分页 -->
            <div v-if="totalPages > 1" class="pagination">
              <button
                class="page-btn"
                :disabled="page === 1"
                @click="goPage(page - 1)"
              >‹ 上一页</button>
              <button
                v-for="p in pageNumbers"
                :key="p"
                class="page-btn"
                :class="{ active: p === page, ellipsis: p === '...' }"
                :disabled="p === '...'"
                @click="p !== '...' && goPage(p)"
              >{{ p }}</button>
              <button
                class="page-btn"
                :disabled="page === totalPages"
                @click="goPage(page + 1)"
              >下一页 ›</button>
            </div>
          </template>

        </main>
      </div>
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
const pageNumbers = computed(() => {
  const all = []
  const tp = totalPages.value
  const cur = page.value
  if (tp <= 7) {
    for (let i = 1; i <= tp; i++) all.push(i)
  } else {
    all.push(1)
    if (cur > 3) all.push('...')
    for (let i = Math.max(2, cur - 1); i <= Math.min(tp - 1, cur + 1); i++) all.push(i)
    if (cur < tp - 2) all.push('...')
    all.push(tp)
  }
  return all
})

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
  // Sync state from URL query
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

.list-layout {
  display: flex;
  gap: var(--spacing-6);
  align-items: flex-start;
}

/* ── 侧栏 ── */
.sidebar {
  flex-shrink: 0;
  width: 180px;
}
.sidebar-box {
  background: var(--color-bg-white);
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}
.sidebar-title {
  padding: var(--spacing-3) var(--spacing-4);
  font-size: var(--font-size-base);
  font-weight: 700;
  background: var(--color-primary);
  color: #fff;
}
.cat-list {
  padding: var(--spacing-2) 0;
}
.cat-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-4);
  font-size: var(--font-size-sm);
  color: var(--color-text-regular);
  cursor: pointer;
  transition: var(--transition-fast);
}
.cat-item:hover {
  color: var(--color-primary);
  background: var(--color-primary-pale);
}
.cat-item.active {
  color: var(--color-primary);
  font-weight: 600;
  background: var(--color-primary-pale);
  border-right: 2px solid var(--color-primary);
}
.cat-icon {
  font-size: 14px;
}

/* ── 主区 ── */
.list-main {
  flex: 1;
  min-width: 0;
}

.list-breadcrumb {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  margin-bottom: var(--spacing-4);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}
.breadcrumb-home {
  cursor: pointer;
  color: var(--color-text-secondary);
  transition: var(--transition-fast);
}
.breadcrumb-home:hover { color: var(--color-primary); }
.breadcrumb-sep { color: #ccc; }
.breadcrumb-cat { color: var(--color-text-primary); font-weight: 500; }
.breadcrumb-kw { color: var(--color-primary); }
.breadcrumb-total { margin-left: auto; color: var(--color-text-secondary); }

/* 排序 */
.sort-bar {
  display: flex;
  gap: var(--spacing-2);
  margin-bottom: var(--spacing-4);
  padding: var(--spacing-3) var(--spacing-4);
  background: var(--color-bg-white);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
}
.sort-btn {
  padding: var(--spacing-1) var(--spacing-4);
  border: 1px solid var(--color-border-base);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  color: var(--color-text-regular);
  background: #fff;
  cursor: pointer;
  transition: var(--transition-fast);
}
.sort-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}
.sort-btn.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: #fff;
}

/* 商品格 */
.product-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-4);
}

/* 空态 */
.list-empty {
  text-align: center;
  padding: var(--spacing-12) 0;
  background: var(--color-bg-white);
  border-radius: var(--radius-md);
}
.empty-icon { font-size: 48px; margin-bottom: var(--spacing-3); }
.empty-text { color: var(--color-text-secondary); margin-bottom: var(--spacing-4); }

/* 加载 */
.list-loading {
  display: flex;
  justify-content: center;
  padding: var(--spacing-12) 0;
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: center;
  gap: var(--spacing-2);
  margin-top: var(--spacing-6);
}
.page-btn {
  min-width: 36px;
  height: 36px;
  padding: 0 var(--spacing-3);
  border: 1px solid var(--color-border-base);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  background: #fff;
  color: var(--color-text-regular);
  cursor: pointer;
  transition: var(--transition-fast);
}
.page-btn:hover:not(:disabled) {
  border-color: var(--color-primary);
  color: var(--color-primary);
}
.page-btn.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: #fff;
  font-weight: 700;
}
.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.page-btn.ellipsis {
  border: none;
  cursor: default;
  background: transparent;
}
</style>

