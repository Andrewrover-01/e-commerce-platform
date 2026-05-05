<template>
  <div class="admin-header">
    <div class="header-left">
      <el-button
        :icon="isCollapsed ? Expand : Fold"
        text
        size="large"
        @click="$emit('toggle-sidebar')"
      />
      <el-breadcrumb separator="/" class="breadcrumb">
        <el-breadcrumb-item :to="{ path: '/admin/dashboard' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item v-if="currentRoute">{{ currentRoute }}</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <div class="header-right">
      <el-dropdown @command="handleCommand">
        <div class="admin-user-info">
          <el-avatar :size="30" :src="adminInfo?.avatar || undefined">
            {{ adminInfo?.name?.charAt(0) || 'A' }}
          </el-avatar>
          <span class="admin-name">{{ adminInfo?.name || '管理员' }}</span>
          <el-tag size="small" type="info" class="role-tag">{{ roleLabel }}</el-tag>
          <el-icon class="el-icon--right"><ArrowDown /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile" :icon="User">个人信息</el-dropdown-item>
            <el-dropdown-item command="logout" :icon="SwitchButton" divided>退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import { Fold, Expand, ArrowDown, User, SwitchButton } from '@element-plus/icons-vue'
import { useAdminUserStore } from '@/admin/stores/adminUser'

defineProps({ isCollapsed: { type: Boolean, default: false } })
defineEmits(['toggle-sidebar'])

const route = useRoute()
const router = useRouter()
const adminUserStore = useAdminUserStore()
const adminInfo = computed(() => adminUserStore.adminInfo)

const roleMap = { admin: '超级管理员', operator: '运营人员', finance: '财务人员' }
const roleLabel = computed(() => roleMap[adminUserStore.role] || adminUserStore.role)

const routeNameMap = {
  AdminDashboard: '控制台',
  AdminProducts: '商品列表',
  AdminProductCategories: '商品分类',
  AdminOrders: '订单列表',
  AdminRefunds: '退款管理',
  AdminUsers: '用户列表',
  AdminFinanceOverview: '财务概览',
  AdminFinanceStatements: '账单明细',
  AdminBanners: 'Banner管理',
  AdminNotices: '公告管理',
  AdminSettings: '系统设置',
  AdminCoupons: '优惠券管理',
  AdminActivities: '秒杀/拼团活动',
}
const currentRoute = computed(() => routeNameMap[route.name] || '')

async function handleCommand(cmd) {
  if (cmd === 'logout') {
    await ElMessageBox.confirm('确认退出登录？', '提示', { type: 'warning' })
    adminUserStore.logout()
    ElMessage.success('已退出登录')
    router.push('/admin/login')
  }
}
</script>

<style scoped>
.admin-header {
  height: 60px;
  background: #fff;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px 0 8px;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}
.breadcrumb {
  font-size: 14px;
}
.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}
.admin-user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}
.admin-name {
  font-size: 14px;
  color: #303133;
}
.role-tag {
  font-size: 12px;
}
</style>
