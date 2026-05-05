<template>
  <div class="admin-activities-page">
    <div class="page-header">
      <span class="page-title">秒杀/拼团活动</span>
      <el-button type="primary" :icon="Plus" @click="openDialog()">创建活动</el-button>
    </div>

    <!-- Filter -->
    <el-card shadow="never" class="filter-card">
      <el-form inline>
        <el-form-item label="活动类型">
          <el-select v-model="filter.type" placeholder="全部类型" clearable style="width:130px">
            <el-option v-for="(label, val) in ACTIVITY_TYPES" :key="val" :label="label" :value="val" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filter.status" placeholder="全部状态" clearable style="width:110px">
            <el-option v-for="(label, val) in ACTIVITY_STATUS" :key="val" :label="label" :value="val" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="currentPage = 1">搜索</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- Cards grid -->
    <div v-loading="store.loading" class="activity-grid">
      <el-card
        v-for="act in pagedList"
        :key="act.id"
        shadow="hover"
        class="activity-card"
      >
        <div class="act-header">
          <div class="act-title">{{ act.name }}</div>
          <div class="act-badges">
            <el-tag size="small" :type="act.type === 'flashsale' ? 'danger' : 'warning'">
              {{ ACTIVITY_TYPES[act.type] }}
            </el-tag>
            <el-tag size="small" :type="statusTagType(act.status)" style="margin-left:4px">
              {{ ACTIVITY_STATUS[act.status] }}
            </el-tag>
          </div>
        </div>
        <div class="act-time">
          <el-icon><Clock /></el-icon>
          {{ act.startTime }} ~ {{ act.endTime }}
        </div>
        <div v-if="act.type === 'groupbuy'" class="act-group-info">
          拼团人数：{{ act.groupSize }} 人 &nbsp;|&nbsp; 拼团价：¥{{ act.groupPrice }}
        </div>
        <div class="act-products">
          <div v-for="p in act.products" :key="p.id" class="act-product-row">
            <el-image :src="p.image" class="act-product-img" fit="cover" />
            <div class="act-product-info">
              <div class="act-product-name">{{ p.name }}</div>
              <div class="act-product-price">
                <span class="sale-price">¥{{ p.salePrice }}</span>
                <span class="orig-price">¥{{ p.originalPrice }}</span>
              </div>
            </div>
            <div class="act-product-stock">剩余 {{ p.stock }} 件</div>
          </div>
        </div>
        <div class="act-actions">
          <el-button size="small" :icon="Edit" @click="openDialog(act)">编辑</el-button>
          <el-popconfirm title="确认删除该活动？" @confirm="store.deleteActivity(act.id)">
            <template #reference>
              <el-button size="small" type="danger" :icon="Delete">删除</el-button>
            </template>
          </el-popconfirm>
        </div>
      </el-card>

      <el-empty v-if="!pagedList.length && !store.loading" description="暂无活动数据" />
    </div>

    <el-pagination
      v-if="filteredList.length > pageSize"
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :total="filteredList.length"
      layout="total, prev, pager, next"
      style="margin-top:16px; justify-content:flex-end"
    />

    <!-- Add / Edit Dialog -->
    <el-dialog v-model="dialogVisible" :title="editId ? '编辑活动' : '创建活动'" width="580px" destroy-on-close>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="活动名称" prop="name">
          <el-input v-model="form.name" placeholder="如：618超级秒杀" />
        </el-form-item>
        <el-form-item label="活动类型" prop="type">
          <el-radio-group v-model="form.type">
            <el-radio v-for="(label, val) in ACTIVITY_TYPES" :key="val" :value="val">{{ label }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="活动时间" prop="timeRange">
          <el-date-picker
            v-model="form.timeRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            value-format="YYYY/MM/DD HH:mm:ss"
            style="width:100%"
          />
        </el-form-item>
        <template v-if="form.type === 'groupbuy'">
          <el-form-item label="拼团人数">
            <el-input-number v-model="form.groupSize" :min="2" :max="100" style="width:130px" />
          </el-form-item>
          <el-form-item label="拼团价(¥)">
            <el-input-number v-model="form.groupPrice" :min="0" :precision="2" style="width:150px" />
          </el-form-item>
        </template>

        <el-divider>活动商品</el-divider>
        <div v-for="(p, idx) in form.products" :key="idx" class="product-row">
          <el-row :gutter="8" align="middle">
            <el-col :span="9">
              <el-input v-model="p.name" placeholder="商品名称" size="small" />
            </el-col>
            <el-col :span="5">
              <el-input-number v-model="p.originalPrice" :min="0" placeholder="原价" size="small" style="width:100%" />
            </el-col>
            <el-col :span="5">
              <el-input-number v-model="p.salePrice" :min="0" placeholder="活动价" size="small" style="width:100%" />
            </el-col>
            <el-col :span="3">
              <el-input-number v-model="p.stock" :min="0" placeholder="库存" size="small" style="width:100%" />
            </el-col>
            <el-col :span="2">
              <el-button link type="danger" :icon="Delete" @click="form.products.splice(idx, 1)" />
            </el-col>
          </el-row>
        </div>
        <el-button size="small" :icon="Plus" @click="addProduct" style="margin-top:8px">添加商品</el-button>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Edit, Delete, Search, Clock } from '@element-plus/icons-vue'
import { useAdminMarketingStore, ACTIVITY_TYPES, ACTIVITY_STATUS } from '@/admin/stores/adminMarketing'

const store = useAdminMarketingStore()
onMounted(() => store.init())

const filter = ref({ type: '', status: '' })
function resetFilter() { filter.value = { type: '', status: '' } }

const filteredList = computed(() => {
  let list = store.activities
  if (filter.value.type) list = list.filter(a => a.type === filter.value.type)
  if (filter.value.status) list = list.filter(a => a.status === filter.value.status)
  return list
})

const currentPage = ref(1)
const pageSize = ref(9)
const pagedList = computed(() => {
  const s = (currentPage.value - 1) * pageSize.value
  return filteredList.value.slice(s, s + pageSize.value)
})

function statusTagType(s) { return { upcoming: 'info', active: 'success', ended: '' }[s] ?? '' }

// dialog
const dialogVisible = ref(false)
const editId = ref(null)
const formRef = ref(null)
const form = ref(newForm())
const rules = {
  name: [{ required: true, message: '请输入活动名称', trigger: 'blur' }],
  timeRange: [{ required: true, message: '请选择活动时间', trigger: 'change' }],
}

function newForm() {
  return { name: '', type: 'flashsale', timeRange: null, groupSize: 3, groupPrice: 0, products: [] }
}
function newProduct() {
  return { id: Date.now(), name: '', originalPrice: 0, salePrice: 0, stock: 100, image: `https://picsum.photos/60/60?random=${Date.now()}` }
}
function addProduct() { form.value.products.push(newProduct()) }

function openDialog(row) {
  editId.value = row?.id ?? null
  if (row) {
    form.value = {
      ...row,
      timeRange: row.startTime && row.endTime ? [row.startTime, row.endTime] : null,
      products: row.products ? row.products.map(p => ({ ...p })) : [],
    }
  } else {
    form.value = newForm()
  }
  dialogVisible.value = true
}

async function handleSubmit() {
  await formRef.value.validate()
  const [startTime, endTime] = form.value.timeRange || []
  const now = new Date().toLocaleString('zh-CN', { hour12: false })
  const status = !startTime ? 'upcoming'
    : startTime > now ? 'upcoming'
    : endTime && endTime < now ? 'ended'
    : 'active'
  const data = { ...form.value, startTime, endTime, status }
  delete data.timeRange
  if (editId.value) {
    store.updateActivity(editId.value, data)
    ElMessage.success('活动已更新')
  } else {
    store.addActivity(data)
    ElMessage.success('活动已创建')
  }
  dialogVisible.value = false
}
</script>

<style scoped>
.admin-activities-page { padding: 24px; }
.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.page-title { font-size: 20px; font-weight: 600; color: #303133; }
.filter-card { margin-bottom: 12px; }
.filter-card :deep(.el-card__body) { padding: 16px 16px 0; }
.activity-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; margin-top: 4px; }
.activity-card { }
.act-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 8px; }
.act-title { font-size: 15px; font-weight: 600; color: #303133; }
.act-time { font-size: 12px; color: #909399; margin-bottom: 6px; display: flex; align-items: center; gap: 4px; }
.act-group-info { font-size: 12px; color: #e6a23c; margin-bottom: 6px; }
.act-products { border-top: 1px solid #f0f0f0; margin-top: 8px; padding-top: 8px; }
.act-product-row { display: flex; align-items: center; gap: 8px; padding: 4px 0; }
.act-product-img { width: 40px; height: 40px; border-radius: 4px; flex-shrink: 0; }
.act-product-name { font-size: 12px; color: #303133; }
.act-product-price { margin-top: 2px; }
.sale-price { color: #f56c6c; font-weight: 600; font-size: 13px; }
.orig-price { color: #c0c4cc; font-size: 11px; text-decoration: line-through; margin-left: 4px; }
.act-product-stock { margin-left: auto; font-size: 11px; color: #909399; white-space: nowrap; }
.act-actions { display: flex; gap: 8px; margin-top: 10px; justify-content: flex-end; }
.product-row { margin-bottom: 8px; padding: 8px; background: #fafafa; border-radius: 4px; }
</style>
