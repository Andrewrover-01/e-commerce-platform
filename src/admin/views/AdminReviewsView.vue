<template>
  <div class="reviews-page">
    <div class="page-title">用户评价管理</div>

    <!-- Stats Row -->
    <el-row :gutter="16" class="stats-row">
      <el-col :span="6" v-for="stat in stats" :key="stat.label">
        <el-card shadow="never" class="stat-card">
          <div class="stat-value" :style="{ color: stat.color }">{{ stat.value }}</div>
          <div class="stat-label">{{ stat.label }}</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Toolbar -->
    <el-card shadow="never" class="toolbar-card">
      <div class="toolbar">
        <div class="toolbar-left">
          <el-select v-model="filterStatus" placeholder="审核状态" clearable style="width:120px">
            <el-option v-for="(label, key) in REVIEW_STATUS" :key="key" :label="label" :value="key" />
          </el-select>
          <el-select v-model="filterRating" placeholder="星级筛选" clearable style="width:120px">
            <el-option v-for="i in 5" :key="i" :label="`${i}星`" :value="i" />
          </el-select>
          <el-input v-model="searchKeyword" placeholder="搜索商品/用户..." clearable style="width:200px" :prefix-icon="Search" />
        </div>
      </div>
    </el-card>

    <!-- Table -->
    <el-card shadow="never" v-loading="store.loading">
      <el-table :data="filteredReviews" stripe>
        <el-table-column label="用户" width="100">
          <template #default="{ row }">
            <div class="user-cell">
              <el-avatar :size="28" style="background:#e6f7ff;color:#1890ff">{{ row.userName.charAt(0) }}</el-avatar>
              <span style="font-size:13px">{{ row.userName }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="productName" label="商品" min-width="160" show-overflow-tooltip />
        <el-table-column label="星级" width="130">
          <template #default="{ row }">
            <el-rate v-model="row.rating" disabled :max="5" size="small" />
          </template>
        </el-table-column>
        <el-table-column label="评价内容" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            <span>{{ row.content }}</span>
            <el-tag v-if="row.images.length" type="info" size="small" style="margin-left:4px">含图片</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)" size="small">{{ REVIEW_STATUS[row.status] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="置顶" width="70" align="center">
          <template #default="{ row }">
            <el-icon v-if="row.isPinned" color="#f56c6c" size="16"><Top /></el-icon>
            <span v-else style="color:#c0c4cc">—</span>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="时间" width="110" />
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button v-if="row.status === 'pending'" text type="success" size="small" @click="handleApprove(row.id)">通过</el-button>
            <el-button v-if="row.status !== 'hidden'" text type="warning" size="small" @click="handleHide(row.id)">隐藏</el-button>
            <el-button v-if="row.status === 'hidden'" text type="primary" size="small" @click="handleApprove(row.id)">恢复</el-button>
            <el-button text :type="row.isPinned ? 'info' : 'primary'" size="small" @click="handlePin(row.id)">
              {{ row.isPinned ? '取消置顶' : '置顶' }}
            </el-button>
            <el-popconfirm title="确认删除该评价？" @confirm="store.deleteReview(row.id)">
              <template #reference>
                <el-button text type="danger" size="small">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Top } from '@element-plus/icons-vue'
import { useAdminContentStore, REVIEW_STATUS } from '@/admin/stores/adminContent'

const store = useAdminContentStore()
onMounted(() => store.init())

const filterStatus = ref('')
const filterRating = ref(null)
const searchKeyword = ref('')

const filteredReviews = computed(() => {
  return store.reviews.filter(r => {
    if (filterStatus.value && r.status !== filterStatus.value) return false
    if (filterRating.value && r.rating !== filterRating.value) return false
    if (searchKeyword.value) {
      const kw = searchKeyword.value
      if (!r.productName.includes(kw) && !r.userName.includes(kw)) return false
    }
    return true
  })
})

const stats = computed(() => {
  const all = store.reviews
  return [
    { label: '全部评价', value: all.length, color: '#303133' },
    { label: '待审核', value: all.filter(r => r.status === 'pending').length, color: '#e6a23c' },
    { label: '已通过', value: all.filter(r => r.status === 'approved').length, color: '#67c23a' },
    { label: '已隐藏', value: all.filter(r => r.status === 'hidden').length, color: '#909399' },
  ]
})

function statusTagType(status) {
  return { pending: 'warning', approved: 'success', hidden: 'info' }[status] || ''
}

function handleApprove(id) {
  store.approveReview(id)
  ElMessage.success('评价已通过审核')
}
function handleHide(id) {
  store.hideReview(id)
  ElMessage.warning('评价已隐藏')
}
function handlePin(id) {
  store.pinReview(id)
  const r = store.reviews.find(r => r.id === id)
  ElMessage.success(r?.isPinned ? '已置顶' : '已取消置顶')
}
</script>

<style scoped>
.reviews-page { padding: 24px; }
.page-title { font-size: 20px; font-weight: 600; color: #303133; margin-bottom: 20px; }
.stats-row { margin-bottom: 16px; }
.stat-card { text-align: center; padding: 8px 0; }
.stat-value { font-size: 28px; font-weight: 700; line-height: 1.2; }
.stat-label { font-size: 13px; color: #909399; margin-top: 4px; }
.toolbar-card { margin-bottom: 16px; }
.toolbar { display: flex; align-items: center; gap: 8px; }
.toolbar-left { display: flex; align-items: center; gap: 8px; }
.user-cell { display: flex; align-items: center; gap: 6px; }
</style>
