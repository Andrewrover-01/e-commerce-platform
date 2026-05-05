<template>
  <div class="analytics-page">
    <div class="page-title">数据统计</div>

    <el-tabs v-model="activeTab" type="border-card">
      <!-- Sales Reports -->
      <el-tab-pane label="销售报表" name="sales">
        <div class="tab-content">
          <div class="section-toolbar">
            <el-radio-group v-model="salesPeriod" size="small">
              <el-radio-button value="daily">日报</el-radio-button>
              <el-radio-button value="weekly">周报</el-radio-button>
              <el-radio-button value="monthly">月报</el-radio-button>
            </el-radio-group>
          </div>
          <!-- Summary Cards -->
          <el-row :gutter="16" class="stats-row" v-if="salesSummary">
            <el-col :span="6" v-for="card in salesSummary" :key="card.label">
              <el-card shadow="never" class="stat-card">
                <div class="stat-value" :style="{ color: card.color }">{{ card.value }}</div>
                <div class="stat-label">{{ card.label }}</div>
                <div class="stat-sub">较前期 <span :style="{ color: card.trend >= 0 ? '#67c23a' : '#f56c6c' }">{{ card.trend >= 0 ? '+' : '' }}{{ card.trend }}%</span></div>
              </el-card>
            </el-col>
          </el-row>
          <!-- Table -->
          <el-table :data="currentSalesData" stripe v-loading="store.loading" max-height="420">
            <el-table-column :prop="salesPeriod === 'daily' ? 'date' : salesPeriod === 'weekly' ? 'week' : 'month'" label="时间" width="140" />
            <el-table-column label="销售额" width="140">
              <template #default="{ row }">¥{{ row.revenue.toLocaleString() }}</template>
            </el-table-column>
            <el-table-column prop="orders" label="订单数" width="100" align="center" />
            <el-table-column prop="refunds" label="退款数" width="100" align="center" />
            <el-table-column label="客单价" width="120">
              <template #default="{ row }">¥{{ (row.revenue / row.orders).toFixed(2) }}</template>
            </el-table-column>
            <el-table-column label="退款率" width="100">
              <template #default="{ row }">
                <el-progress :percentage="+(row.refunds / row.orders * 100).toFixed(1)" :stroke-width="8" :show-text="false" status="exception" style="width:80px;display:inline-block" />
                <span style="font-size:12px;margin-left:4px">{{ (row.refunds / row.orders * 100).toFixed(1) }}%</span>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>

      <!-- User Growth -->
      <el-tab-pane label="用户增长" name="users">
        <div class="tab-content">
          <!-- Summary -->
          <el-row :gutter="16" class="stats-row">
            <el-col :span="6" v-for="card in userGrowthSummary" :key="card.label">
              <el-card shadow="never" class="stat-card">
                <div class="stat-value" :style="{ color: card.color }">{{ card.value }}</div>
                <div class="stat-label">{{ card.label }}</div>
              </el-card>
            </el-col>
          </el-row>
          <el-table :data="store.userGrowth" stripe v-loading="store.loading" max-height="420">
            <el-table-column prop="date" label="日期" width="130" />
            <el-table-column prop="newUsers" label="新增用户" width="110" align="center" />
            <el-table-column label="活跃用户" width="140" align="center">
              <template #default="{ row }">
                <div class="bar-cell">
                  <el-progress :percentage="Math.round(row.activeUsers / maxActiveUsers * 100)" :show-text="false" :stroke-width="10" style="width:100px;display:inline-block" />
                  <span style="font-size:12px;margin-left:6px">{{ row.activeUsers }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="churnUsers" label="流失用户" width="100" align="center" />
            <el-table-column label="净增长" width="100" align="center">
              <template #default="{ row }">
                <span :style="{ color: row.newUsers - row.churnUsers >= 0 ? '#67c23a' : '#f56c6c' }">
                  {{ row.newUsers - row.churnUsers >= 0 ? '+' : '' }}{{ row.newUsers - row.churnUsers }}
                </span>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>

      <!-- Product Visit Ranking -->
      <el-tab-pane label="商品访问排行" name="products">
        <div class="tab-content">
          <el-table :data="store.productVisits" stripe v-loading="store.loading">
            <el-table-column prop="rank" label="排名" width="70" align="center">
              <template #default="{ row }">
                <el-tag :type="row.rank <= 3 ? 'danger' : 'info'" size="small">{{ row.rank }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="name" label="商品名称" min-width="180" />
            <el-table-column prop="category" label="分类" width="110">
              <template #default="{ row }">
                <el-tag size="small" type="info">{{ row.category }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="访问量" width="160">
              <template #default="{ row }">
                <el-progress :percentage="Math.round(row.visits / maxVisits * 100)" :show-text="false" :stroke-width="10" style="width:90px;display:inline-block" />
                <span style="font-size:12px;margin-left:6px">{{ row.visits.toLocaleString() }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="sales" label="销量" width="90" align="center" />
            <el-table-column label="销售额" width="130" align="right">
              <template #default="{ row }">¥{{ row.revenue.toLocaleString() }}</template>
            </el-table-column>
            <el-table-column label="转化率" width="90" align="center">
              <template #default="{ row }">{{ row.conversion }}%</template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>

      <!-- Inventory Alerts -->
      <el-tab-pane name="inventory">
        <template #label>
          库存预警
          <el-badge :value="alertCount" :max="99" type="danger" style="margin-left:4px" v-if="alertCount > 0" />
        </template>
        <div class="tab-content">
          <el-table :data="store.inventoryAlerts" stripe v-loading="store.loading">
            <el-table-column prop="productId" label="商品ID" width="90" align="center" />
            <el-table-column prop="name" label="商品名称" min-width="180" />
            <el-table-column prop="category" label="分类" width="110">
              <template #default="{ row }">
                <el-tag size="small" type="info">{{ row.category }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="当前库存" width="100" align="center">
              <template #default="{ row }">
                <span :style="{ fontWeight: 600, color: row.stock === 0 ? '#f56c6c' : '#e6a23c' }">{{ row.stock }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="threshold" label="预警阈值" width="100" align="center" />
            <el-table-column label="价格" width="110" align="right">
              <template #default="{ row }">¥{{ row.price.toLocaleString() }}</template>
            </el-table-column>
            <el-table-column label="预警状态" width="120">
              <template #default="{ row }">
                <el-tag :type="row.status === 'out' ? 'danger' : 'warning'" size="small">
                  {{ row.status === 'out' ? '已断货' : '库存不足' }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>

      <!-- Finance Reconciliation -->
      <el-tab-pane label="财务对账" name="finance">
        <div class="tab-content">
          <!-- Totals -->
          <el-row :gutter="16" class="stats-row">
            <el-col :span="6" v-for="card in financeSummary" :key="card.label">
              <el-card shadow="never" class="stat-card">
                <div class="stat-value" :style="{ color: card.color }">¥{{ card.value.toLocaleString() }}</div>
                <div class="stat-label">{{ card.label }}</div>
              </el-card>
            </el-col>
          </el-row>
          <el-table :data="store.financeReconciliation" stripe v-loading="store.loading" max-height="420">
            <el-table-column prop="date" label="日期" width="130" />
            <el-table-column prop="orderCount" label="订单数" width="90" align="center" />
            <el-table-column label="收入" width="130" align="right">
              <template #default="{ row }">
                <span style="color:#67c23a">¥{{ row.income.toLocaleString() }}</span>
              </template>
            </el-table-column>
            <el-table-column label="退款" width="110" align="right">
              <template #default="{ row }">
                <span style="color:#f56c6c">¥{{ row.refund.toLocaleString() }}</span>
              </template>
            </el-table-column>
            <el-table-column label="手续费" width="110" align="right">
              <template #default="{ row }">
                <span style="color:#e6a23c">¥{{ row.fee.toLocaleString() }}</span>
              </template>
            </el-table-column>
            <el-table-column label="净收入" width="130" align="right">
              <template #default="{ row }">
                <strong style="color:#409eff">¥{{ row.net.toLocaleString() }}</strong>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAdminAnalyticsStore } from '@/admin/stores/adminAnalytics'

const store = useAdminAnalyticsStore()
onMounted(() => store.init())

const activeTab = ref('sales')
const salesPeriod = ref('daily')

// ---- Sales ----
const currentSalesData = computed(() => store.salesData[salesPeriod.value] || [])

const salesSummary = computed(() => {
  const data = currentSalesData.value
  if (!data.length) return null
  const totalRevenue = data.reduce((s, r) => s + r.revenue, 0)
  const totalOrders = data.reduce((s, r) => s + r.orders, 0)
  const totalRefunds = data.reduce((s, r) => s + r.refunds, 0)
  const avgOrder = totalOrders ? totalRevenue / totalOrders : 0
  return [
    { label: '总销售额', value: '¥' + totalRevenue.toLocaleString(), color: '#409eff', trend: 12 },
    { label: '总订单数', value: totalOrders.toLocaleString(), color: '#67c23a', trend: 8 },
    { label: '总退款数', value: totalRefunds.toLocaleString(), color: '#f56c6c', trend: -3 },
    { label: '平均客单价', value: '¥' + avgOrder.toFixed(0), color: '#e6a23c', trend: 5 },
  ]
})

// ---- Users ----
const maxActiveUsers = computed(() => Math.max(...store.userGrowth.map(r => r.activeUsers), 1))

const userGrowthSummary = computed(() => {
  const data = store.userGrowth
  if (!data.length) return []
  const totalNew = data.reduce((s, r) => s + r.newUsers, 0)
  const totalChurn = data.reduce((s, r) => s + r.churnUsers, 0)
  const avgActive = Math.round(data.reduce((s, r) => s + r.activeUsers, 0) / data.length)
  return [
    { label: '累计新增用户', value: totalNew.toLocaleString(), color: '#67c23a' },
    { label: '累计流失用户', value: totalChurn.toLocaleString(), color: '#f56c6c' },
    { label: '平均日活跃', value: avgActive.toLocaleString(), color: '#409eff' },
    { label: '净增用户', value: (totalNew - totalChurn).toLocaleString(), color: '#e6a23c' },
  ]
})

// ---- Products ----
const maxVisits = computed(() => Math.max(...store.productVisits.map(p => p.visits), 1))

// ---- Inventory ----
const alertCount = computed(() => store.inventoryAlerts.length)

// ---- Finance ----
const financeSummary = computed(() => {
  const data = store.financeReconciliation
  if (!data.length) return []
  return [
    { label: '总收入', value: data.reduce((s, r) => s + r.income, 0), color: '#67c23a' },
    { label: '总退款', value: data.reduce((s, r) => s + r.refund, 0), color: '#f56c6c' },
    { label: '总手续费', value: data.reduce((s, r) => s + r.fee, 0), color: '#e6a23c' },
    { label: '净收入', value: data.reduce((s, r) => s + r.net, 0), color: '#409eff' },
  ]
})
</script>

<style scoped>
.analytics-page { padding: 24px; }
.page-title { font-size: 20px; font-weight: 600; color: #303133; margin-bottom: 20px; }
.tab-content { padding: 16px 0; }
.section-toolbar { margin-bottom: 16px; }
.stats-row { margin-bottom: 20px; }
.stat-card { text-align: center; padding: 4px 0; }
.stat-value { font-size: 26px; font-weight: 700; line-height: 1.2; }
.stat-label { font-size: 13px; color: #909399; margin-top: 4px; }
.stat-sub { font-size: 12px; color: #909399; margin-top: 2px; }
.bar-cell { display: flex; align-items: center; }
</style>
