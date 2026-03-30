<template>
  <header class="app-header">
    <!-- 顶部工具栏 -->
    <div class="header-top">
      <div class="container flex-between">
        <span class="welcome">欢迎来到京东商城！</span>
        <nav class="header-nav">
          <template v-if="isLoggedIn">
            <span class="user-greeting">
              <img :src="userInfo.avatar" class="user-avatar" :alt="userInfo.username" />
              {{ userInfo.username }}
            </span>
            <span class="nav-divider">|</span>
            <a href="#" class="nav-link-btn" @click.prevent="handleLogout">退出登录</a>
          </template>
          <template v-else>
            <router-link to="/login" class="nav-link-btn nav-link-highlight">请登录</router-link>
            <span class="nav-divider">|</span>
            <router-link to="/register" class="nav-link-btn">免费注册</router-link>
          </template>
          <span class="nav-divider">|</span>
          <router-link to="/user" class="nav-link-btn">我的订单</router-link>
          <span class="nav-divider">|</span>
          <router-link to="/user" class="nav-link-btn">我的京东</router-link>
          <span class="nav-divider">|</span>
          <a href="#" class="nav-link-btn">京东会员</a>
          <span class="nav-divider">|</span>
          <a href="#" class="nav-link-btn">企业采购</a>
          <span class="nav-divider">|</span>
          <a href="#" class="nav-link-btn">客户服务</a>
          <span class="nav-divider">|</span>
          <a href="#" class="nav-link-btn">网站导航</a>
        </nav>
      </div>
    </div>

    <!-- 主头部：Logo + 搜索 + 购物车 -->
    <div class="header-main">
      <div class="container flex-between">
        <!-- Logo -->
        <router-link to="/" class="logo" aria-label="京东首页">
          <span class="logo-jd">京东</span>
          <span class="logo-slogan">多·快·好·省</span>
        </router-link>

        <!-- 搜索框 -->
        <div class="search-wrap">
          <div class="search-bar">
            <input
              v-model="keyword"
              type="text"
              placeholder="搜索商品、品牌、店铺"
              class="search-input"
              maxlength="60"
              @keyup.enter="doSearch"
            />
            <button class="search-btn" @click="doSearch">搜索</button>
          </div>
          <!-- 热搜词 -->
          <div v-if="hotKeywords.length" class="hot-keywords">
            <span
              v-for="kw in hotKeywords"
              :key="kw"
              class="hot-kw"
              @click="goKeyword(kw)"
            >{{ kw }}</span>
          </div>
        </div>

        <!-- 购物车入口 -->
        <router-link to="/cart" class="cart-entry">
          <span class="cart-entry-icon">🛒</span>
          <span class="cart-entry-label">购物车</span>
          <span v-if="cartCount > 0" class="cart-entry-badge">{{ cartCount > 99 ? '99+' : cartCount }}</span>
        </router-link>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const cartStore = useCartStore()
const userStore = useUserStore()

const keyword = ref('')
const cartCount = computed(() => cartStore.totalCount)
const isLoggedIn = computed(() => userStore.isLoggedIn)
const userInfo = computed(() => userStore.userInfo)

const hotKeywords = ['iPhone 15', '华为Mate60', '联想笔记本', '空调', '耳机']

function doSearch() {
  const kw = keyword.value.trim()
  if (kw) {
    router.push({ path: '/products', query: { keyword: kw } })
  }
}

function goKeyword(kw) {
  keyword.value = kw
  router.push({ path: '/products', query: { keyword: kw } })
}

function handleLogout() {
  userStore.logout()
  router.push('/')
}
</script>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: var(--z-fixed);
  box-shadow: var(--shadow-sm);
  background: #fff;
}

/* ── 顶部工具栏 ── */
.header-top {
  background: #f0f0f0;
  height: 30px;
  display: flex;
  align-items: center;
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  border-bottom: 1px solid var(--color-border-light);
}

.header-nav {
  display: flex;
  align-items: center;
  gap: 0;
}

.nav-divider {
  color: #d0d0d0;
  margin: 0 var(--spacing-2);
  user-select: none;
}

.nav-link-btn {
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
  white-space: nowrap;
  transition: var(--transition-fast);
  cursor: pointer;
  text-decoration: none;
}
.nav-link-btn:hover {
  color: var(--color-primary);
}
.nav-link-highlight {
  color: var(--color-primary);
  font-weight: 600;
}

.user-greeting {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  color: var(--color-text-primary);
  font-size: var(--font-size-xs);
  max-width: 120px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.user-avatar {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

/* ── 主头部 ── */
.header-main {
  background: #fff;
  height: 84px;
  display: flex;
  align-items: center;
}

/* Logo */
.logo {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  line-height: 1;
  gap: 2px;
  text-decoration: none;
}
.logo-jd {
  font-size: 38px;
  font-weight: 900;
  color: var(--color-primary);
  letter-spacing: -2px;
  line-height: 1;
}
.logo-slogan {
  font-size: 11px;
  color: var(--color-text-secondary);
  letter-spacing: 2px;
  padding-left: 2px;
}

/* 搜索 */
.search-wrap {
  flex: 1;
  max-width: 680px;
  margin: 0 var(--spacing-8);
}
.search-bar {
  display: flex;
  border: 2px solid var(--color-primary);
  border-radius: var(--radius-sm);
  overflow: hidden;
}
.search-input {
  flex: 1;
  height: 38px;
  padding: 0 var(--spacing-4);
  border: none;
  font-size: var(--font-size-base);
  outline: none;
  color: var(--color-text-primary);
  background: #fff;
}
.search-input::placeholder {
  color: var(--color-text-placeholder);
}
.search-btn {
  width: 80px;
  height: 38px;
  background: var(--color-primary);
  color: #fff;
  font-size: var(--font-size-base);
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: var(--transition-fast);
  flex-shrink: 0;
}
.search-btn:hover {
  background: var(--color-primary-dark);
}

.hot-keywords {
  display: flex;
  gap: var(--spacing-3);
  margin-top: var(--spacing-1);
  flex-wrap: wrap;
}
.hot-kw {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  cursor: pointer;
  white-space: nowrap;
  transition: var(--transition-fast);
}
.hot-kw:hover {
  color: var(--color-primary);
}
.hot-kw:first-child {
  color: var(--color-primary);
  font-weight: 600;
}

/* 购物车 */
.cart-entry {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-4);
  border: 1px solid var(--color-border-base);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  text-decoration: none;
  transition: var(--transition-fast);
  flex-shrink: 0;
  min-width: 100px;
}
.cart-entry:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}
.cart-entry-icon {
  font-size: 20px;
  line-height: 1;
}
.cart-entry-label {
  font-size: var(--font-size-base);
  font-weight: 500;
}
.cart-entry-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: var(--color-primary);
  color: #fff;
  font-size: 10px;
  min-width: 18px;
  height: 18px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  font-weight: 700;
  line-height: 1;
}
</style>
