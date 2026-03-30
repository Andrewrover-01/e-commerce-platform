<template>
  <nav class="app-nav">
    <div class="container flex-between">
      <div class="nav-categories">
        <div
          v-for="cat in navCategories"
          :key="cat.id"
          class="nav-item"
          @mouseenter="hoveredCat = cat.id"
          @mouseleave="hoveredCat = null"
        >
          <router-link :to="{ path: '/products', query: { category: cat.name } }" class="nav-link">
            {{ cat.name }}
          </router-link>
          <div v-if="hoveredCat === cat.id && cat.sub" class="nav-dropdown">
            <router-link
              v-for="sub in cat.sub"
              :key="sub"
              :to="{ path: '/products', query: { category: sub } }"
              class="dropdown-item"
            >
              {{ sub }}
            </router-link>
          </div>
        </div>
      </div>
      <div class="nav-links">
        <router-link to="/">首页</router-link>
        <router-link :to="{ path: '/products', query: { sort: 'sales' } }">热销</router-link>
        <router-link :to="{ path: '/products', query: { sort: 'newest' } }">新品</router-link>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref } from 'vue'

const hoveredCat = ref(null)

const navCategories = [
  { id: 1, name: '手机数码', sub: ['手机', '平板', '耳机', '智能手表'] },
  { id: 2, name: '电脑办公', sub: ['笔记本', '台式机', '显示器', '键盘鼠标'] },
  { id: 3, name: '家用电器', sub: ['电视', '冰箱', '洗衣机', '空调'] },
  { id: 4, name: '服装配饰', sub: ['男装', '女装', '童装', '箱包'] },
  { id: 5, name: '食品生鲜', sub: ['肉禽蛋奶', '水果', '零食饮料'] },
  { id: 6, name: '图书音像', sub: ['小说文学', '教育考试', '计算机'] },
  { id: 7, name: '运动户外', sub: ['跑步', '健身', '球类'] },
  { id: 8, name: '美妆护肤', sub: ['护肤', '彩妆', '香水'] }
]
</script>

<style scoped>
.app-nav {
  background: var(--color-primary);
  height: var(--nav-height);
  display: flex;
  align-items: center;
}

.nav-categories {
  display: flex;
  gap: 0;
}

.nav-item {
  position: relative;
}

.nav-link {
  display: block;
  padding: 0 var(--spacing-4);
  height: var(--nav-height);
  line-height: var(--nav-height);
  color: #fff;
  font-size: var(--font-size-base);
  white-space: nowrap;
  transition: var(--transition-fast);
}
.nav-link:hover {
  background: var(--color-primary-dark);
  color: #fff;
}

.nav-dropdown {
  position: absolute;
  top: var(--nav-height);
  left: 0;
  min-width: 120px;
  background: #fff;
  border: 1px solid var(--color-border-light);
  box-shadow: var(--shadow-md);
  z-index: var(--z-dropdown);
  border-radius: 0 0 var(--radius-md) var(--radius-md);
  padding: var(--spacing-2) 0;
}

.dropdown-item {
  display: block;
  padding: var(--spacing-2) var(--spacing-4);
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  white-space: nowrap;
}
.dropdown-item:hover {
  background: var(--color-primary-pale);
  color: var(--color-primary);
}

.nav-links {
  display: flex;
  gap: var(--spacing-5);
}
.nav-links a {
  color: rgba(255, 255, 255, 0.85);
  font-size: var(--font-size-sm);
}
.nav-links a:hover {
  color: #fff;
}
</style>
