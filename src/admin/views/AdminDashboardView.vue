<template>
  <div class="admin-dashboard">
    <div class="page-title">控制台总览</div>

    <!-- Stat cards -->
    <el-row :gutter="20" class="stat-row">
      <el-col :span="6" v-for="stat in stats" :key="stat.label">
        <el-card class="stat-card" shadow="never">
          <div class="stat-inner">
            <el-icon :size="36" :color="stat.color"><component :is="stat.icon" /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-label">{{ stat.label }}</div>
            </div>
          </div>
          <div class="stat-trend" :style="{ color: stat.trendColor }">
            {{ stat.trend }}
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Placeholder charts row -->
    <el-row :gutter="20" class="chart-row">
      <el-col :span="16">
        <el-card shadow="never">
          <template #header><span>近7日订单趋势</span></template>
          <div class="chart-placeholder">图表区域（待接入图表库）</div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="never">
          <template #header><span>商品分类占比</span></template>
          <div class="chart-placeholder">图表区域（待接入图表库）</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Recent orders placeholder -->
    <el-card shadow="never" class="recent-card">
      <template #header><span>最新订单</span></template>
      <el-empty description="暂无数据，功能开发中" />
    </el-card>
  </div>
</template>

<script setup>
import { ShoppingBag, User, Money, TrendCharts } from '@element-plus/icons-vue'

const stats = [
  { label: '今日订单', value: '—', icon: ShoppingBag, color: '#409EFF', trend: '功能开发中', trendColor: '#909399' },
  { label: '今日用户', value: '—', icon: User,         color: '#67C23A', trend: '功能开发中', trendColor: '#909399' },
  { label: '今日销售额', value: '—', icon: Money,      color: '#E6A23C', trend: '功能开发中', trendColor: '#909399' },
  { label: '商品总数',  value: '—', icon: TrendCharts, color: '#F56C6C', trend: '功能开发中', trendColor: '#909399' },
]
</script>

<style scoped>
.admin-dashboard {
  padding: 24px;
}
.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 20px;
}
.stat-row {
  margin-bottom: 20px;
}
.stat-card {
  border-radius: 8px;
}
.stat-inner {
  display: flex;
  align-items: center;
  gap: 16px;
}
.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #303133;
  line-height: 1.2;
}
.stat-label {
  font-size: 13px;
  color: #909399;
  margin-top: 4px;
}
.stat-trend {
  margin-top: 12px;
  font-size: 12px;
}
.chart-row {
  margin-bottom: 20px;
}
.chart-placeholder {
  height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #c0c4cc;
  font-size: 14px;
  background: #f5f7fa;
  border-radius: 4px;
}
.recent-card {
  border-radius: 8px;
}
</style>
