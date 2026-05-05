<template>
  <div class="admin-sidebar">
    <div class="sidebar-logo">
      <el-icon size="22" color="#fff"><Setting /></el-icon>
      <span class="logo-text">管理后台</span>
    </div>

    <el-menu
      :default-active="activeMenu"
      :collapse="isCollapsed"
      background-color="#1a2a4a"
      text-color="#c0ccda"
      active-text-color="#ffffff"
      router
      class="sidebar-menu"
    >
      <el-menu-item index="/admin/dashboard">
        <el-icon><Odometer /></el-icon>
        <template #title>控制台</template>
      </el-menu-item>

      <el-sub-menu index="products">
        <template #title>
          <el-icon><Goods /></el-icon>
          <span>商品管理</span>
        </template>
        <el-menu-item index="/admin/products">商品列表</el-menu-item>
        <el-menu-item index="/admin/products/categories">商品分类</el-menu-item>
      </el-sub-menu>

      <el-sub-menu index="orders">
        <template #title>
          <el-icon><List /></el-icon>
          <span>订单管理</span>
        </template>
        <el-menu-item index="/admin/orders">订单列表</el-menu-item>
        <el-menu-item index="/admin/orders/refunds">退款管理</el-menu-item>
      </el-sub-menu>

      <el-sub-menu index="users">
        <template #title>
          <el-icon><UserFilled /></el-icon>
          <span>用户管理</span>
        </template>
        <el-menu-item index="/admin/users">用户列表</el-menu-item>
      </el-sub-menu>

      <el-sub-menu index="finance">
        <template #title>
          <el-icon><Money /></el-icon>
          <span>财务管理</span>
        </template>
        <el-menu-item index="/admin/finance/overview">财务概览</el-menu-item>
        <el-menu-item index="/admin/finance/statements">账单明细</el-menu-item>
      </el-sub-menu>

      <el-sub-menu index="content">
        <template #title>
          <el-icon><Document /></el-icon>
          <span>内容管理</span>
        </template>
        <el-menu-item index="/admin/content/banners">Banner管理</el-menu-item>
        <el-menu-item index="/admin/content/notices">公告管理</el-menu-item>
      </el-sub-menu>

      <el-menu-item index="/admin/settings">
        <el-icon><Setting /></el-icon>
        <template #title>系统设置</template>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import {
  Setting, Odometer, Goods, List,
  UserFilled, Money, Document
} from '@element-plus/icons-vue'

defineProps({
  isCollapsed: { type: Boolean, default: false }
})

const route = useRoute()
const activeMenu = computed(() => route.path)
</script>

<style scoped>
.admin-sidebar {
  height: 100%;
  background: #1a2a4a;
  display: flex;
  flex-direction: column;
}
.sidebar-logo {
  height: 60px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  overflow: hidden;
  white-space: nowrap;
}
.logo-text {
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 1px;
}
.sidebar-menu {
  flex: 1;
  border-right: none;
  overflow-y: auto;
  overflow-x: hidden;
}
</style>
