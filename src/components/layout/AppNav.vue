<template>
  <nav class="app-nav">
    <div class="container flex-between">
      <!-- 全部商品分类 -->
      <div
        class="all-categories"
        @mouseenter="showAllMenu = true"
        @mouseleave="showAllMenu = false"
      >
        <span class="all-categories-trigger">
          <span class="hamburger">☰</span>
          全部商品分类
        </span>
        <!-- 全分类侧边大菜单 -->
        <div v-show="showAllMenu" class="all-menu">
          <div
            v-for="cat in categories"
            :key="cat.id"
            class="all-menu-row"
            @mouseenter="activeAllCat = cat.id"
            @mouseleave="activeAllCat = null"
          >
            <router-link
              :to="{ path: '/products', query: { category: cat.name } }"
              class="all-menu-main"
              @click="showAllMenu = false"
            >
              <span class="cat-icon">{{ cat.icon }}</span>
              {{ cat.name }}
            </router-link>
            <!-- 二级悬浮 -->
            <div v-if="activeAllCat === cat.id && cat.sub.length" class="all-menu-sub">
              <router-link
                v-for="sub in cat.sub"
                :key="sub"
                :to="{ path: '/products', query: { category: sub } }"
                class="all-menu-sub-item"
                @click="showAllMenu = false"
              >
                {{ sub }}
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- 常用快捷导航 -->
      <div class="nav-links">
        <router-link to="/" class="nav-lnk" :class="{ active: $route.path === '/' }">首页</router-link>
        <router-link
          :to="{ path: '/products', query: { sort: 'sales' } }"
          class="nav-lnk"
        >热销榜</router-link>
        <router-link
          :to="{ path: '/products', query: { sort: 'newest' } }"
          class="nav-lnk"
        >新品首发</router-link>
        <router-link
          v-for="cat in pinnedCats"
          :key="cat.id"
          :to="{ path: '/products', query: { category: cat.name } }"
          class="nav-lnk"
        >
          {{ cat.icon }} {{ cat.name }}
        </router-link>
        <router-link
          :to="{ path: '/products', query: { sort: 'rating' } }"
          class="nav-lnk"
        >好评优选</router-link>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getCategories } from '@/api/mock'

const categories = ref([])
const showAllMenu = ref(false)
const activeAllCat = ref(null)

onMounted(async () => {
  categories.value = await getCategories()
})

// Show first 4 categories in the quick nav bar
const pinnedCats = computed(() => categories.value.slice(0, 4))
</script>

<style scoped>
.app-nav {
  background: var(--color-primary);
  height: var(--nav-height);
  display: flex;
  align-items: center;
  position: relative;
  z-index: var(--z-sticky);
}

/* ── 全部分类触发区 ── */
.all-categories {
  position: relative;
  flex-shrink: 0;
}

.all-categories-trigger {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  height: var(--nav-height);
  padding: 0 var(--spacing-5);
  color: #fff;
  font-size: var(--font-size-base);
  font-weight: 600;
  cursor: pointer;
  background: rgba(0, 0, 0, 0.15);
  white-space: nowrap;
  transition: var(--transition-fast);
}
.all-categories-trigger:hover,
.all-categories:hover .all-categories-trigger {
  background: rgba(0, 0, 0, 0.25);
}
.hamburger {
  font-size: 16px;
}

/* ── 全分类大菜单 ── */
.all-menu {
  position: absolute;
  top: var(--nav-height);
  left: 0;
  width: 220px;
  background: #fff;
  border: 1px solid var(--color-border-light);
  box-shadow: var(--shadow-lg);
  z-index: var(--z-dropdown);
  border-radius: 0 0 var(--radius-md) var(--radius-md);
  overflow: hidden;
}

.all-menu-row {
  position: relative;
}

.all-menu-main {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-2) var(--spacing-4);
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  text-decoration: none;
  transition: var(--transition-fast);
  white-space: nowrap;
}
.all-menu-main:hover {
  background: var(--color-primary-pale);
  color: var(--color-primary);
}
.cat-icon {
  font-size: 16px;
  width: 20px;
  text-align: center;
  flex-shrink: 0;
}

/* 二级子菜单（悬浮在右侧） */
.all-menu-sub {
  position: absolute;
  top: 0;
  left: 100%;
  min-width: 160px;
  background: #fff;
  border: 1px solid var(--color-border-light);
  box-shadow: var(--shadow-md);
  border-radius: 0 var(--radius-md) var(--radius-md) 0;
  z-index: 1;
  padding: var(--spacing-2) 0;
  display: flex;
  flex-direction: column;
}

.all-menu-sub-item {
  display: block;
  padding: var(--spacing-2) var(--spacing-4);
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  text-decoration: none;
  white-space: nowrap;
  transition: var(--transition-fast);
}
.all-menu-sub-item:hover {
  background: var(--color-primary-pale);
  color: var(--color-primary);
}

/* ── 快捷链接 ── */
.nav-links {
  display: flex;
  align-items: center;
  flex: 1;
  padding-left: var(--spacing-6);
  gap: 0;
  overflow: hidden;
}

.nav-lnk {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-1);
  padding: 0 var(--spacing-4);
  height: var(--nav-height);
  color: rgba(255, 255, 255, 0.9);
  font-size: var(--font-size-sm);
  text-decoration: none;
  white-space: nowrap;
  transition: var(--transition-fast);
  border-bottom: 2px solid transparent;
}
.nav-lnk:hover {
  color: #fff;
  background: rgba(0, 0, 0, 0.12);
}
.nav-lnk.active,
.nav-lnk.router-link-active {
  color: #fff;
  font-weight: 600;
  border-bottom-color: #fff;
}
</style>
