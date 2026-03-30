<template>
  <header class="app-header">
    <div class="header-top">
      <div class="container flex-between">
        <span class="welcome">欢迎来到京东商城！</span>
        <nav class="header-nav">
          <router-link to="/login">请登录</router-link>
          <router-link to="/register">免费注册</router-link>
          <router-link to="/user">我的订单</router-link>
          <router-link to="/cart">购物车
            <span v-if="cartCount > 0" class="cart-count">{{ cartCount }}</span>
          </router-link>
        </nav>
      </div>
    </div>
    <div class="header-main">
      <div class="container flex-between">
        <router-link to="/" class="logo">
          <span class="logo-text">京东</span>
        </router-link>
        <div class="search-bar">
          <input
            v-model="keyword"
            type="text"
            placeholder="搜索商品"
            class="search-input"
            @keyup.enter="doSearch"
          />
          <button class="search-btn" @click="doSearch">搜索</button>
        </div>
        <router-link to="/cart" class="cart-icon">
          <span class="cart-icon-emoji">🛒</span>
          <span class="cart-label">购物车</span>
          <span v-if="cartCount > 0" class="cart-badge">{{ cartCount }}</span>
        </router-link>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { computed } from 'vue'

const router = useRouter()
const cartStore = useCartStore()
const keyword = ref('')
const cartCount = computed(() => cartStore.totalCount)

function doSearch() {
  if (keyword.value.trim()) {
    router.push({ path: '/products', query: { keyword: keyword.value.trim() } })
  }
}
</script>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: var(--z-fixed);
  box-shadow: var(--shadow-sm);
}

.header-top {
  background: #f0f0f0;
  height: 30px;
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
}

.header-top .header-nav {
  display: flex;
  gap: var(--spacing-4);
}
.header-top .header-nav a {
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
}
.header-top .header-nav a:hover {
  color: var(--color-primary);
}

.header-main {
  background: var(--color-bg-white);
  height: 84px;
  display: flex;
  align-items: center;
}

.logo {
  flex-shrink: 0;
}
.logo-text {
  font-size: 36px;
  font-weight: 900;
  color: var(--color-primary);
  letter-spacing: -1px;
}

.search-bar {
  display: flex;
  flex: 1;
  max-width: 650px;
  margin: 0 var(--spacing-8);
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
}
.search-btn:hover {
  background: var(--color-primary-dark);
}

.cart-icon {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: var(--color-text-primary);
  font-size: var(--font-size-xs);
  gap: 2px;
}
.cart-icon-emoji {
  font-size: 24px;
}
.cart-badge {
  position: absolute;
  top: -6px;
  right: -10px;
  background: var(--color-primary);
  color: #fff;
  font-size: 10px;
  min-width: 16px;
  height: 16px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  font-weight: 700;
}
.cart-count {
  background: var(--color-primary);
  color: #fff;
  font-size: 10px;
  padding: 0 4px;
  border-radius: var(--radius-full);
  margin-left: 4px;
}
</style>
