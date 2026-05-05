<template>
  <el-container class="admin-layout">
    <!-- Sidebar -->
    <el-aside :width="sidebarWidth" class="layout-aside">
      <AdminSidebar :is-collapsed="isCollapsed" />
    </el-aside>

    <!-- Main -->
    <el-container class="layout-main-container">
      <el-header height="60px" class="layout-header">
        <AdminHeader :is-collapsed="isCollapsed" @toggle-sidebar="toggleSidebar" />
      </el-header>
      <el-main class="layout-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import AdminSidebar from './AdminSidebar.vue'
import AdminHeader from './AdminHeader.vue'

const isCollapsed = ref(false)
const sidebarWidth = computed(() => isCollapsed.value ? '64px' : '220px')

function toggleSidebar() {
  isCollapsed.value = !isCollapsed.value
}
</script>

<style scoped>
.admin-layout {
  height: 100vh;
  overflow: hidden;
}
.layout-aside {
  transition: width 0.25s ease;
  overflow: hidden;
}
.layout-main-container {
  flex: 1;
  overflow: hidden;
  flex-direction: column;
}
.layout-header {
  padding: 0;
  border-bottom: 1px solid #e6e6e6;
}
.layout-main {
  background: #f0f2f5;
  overflow-y: auto;
  padding: 0;
}
</style>
