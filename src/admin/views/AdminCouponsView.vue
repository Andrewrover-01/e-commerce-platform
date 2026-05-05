<template>
  <div class="admin-coupons-page">
    <div class="page-header">
      <span class="page-title">优惠券管理</span>
      <el-button type="primary" :icon="Plus" @click="openDialog()">新建优惠券</el-button>
    </div>

    <!-- Filter -->
    <el-card shadow="never" class="filter-card">
      <el-form inline>
        <el-form-item label="类型">
          <el-select v-model="filter.type" placeholder="全部类型" clearable style="width:120px">
            <el-option v-for="(label, val) in COUPON_TYPES" :key="val" :label="label" :value="val" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filter.status" placeholder="全部状态" clearable style="width:110px">
            <el-option v-for="(label, val) in COUPON_STATUS" :key="val" :label="label" :value="val" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="currentPage = 1" :icon="Search">搜索</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- Table -->
    <el-card shadow="never" class="table-card">
      <el-table v-loading="store.loading" :data="pagedList" border>
        <el-table-column label="优惠券名称" prop="name" min-width="140" />
        <el-table-column label="类型" width="90">
          <template #default="{ row }">
            <el-tag size="small" :type="typeTagType(row.type)">{{ COUPON_TYPES[row.type] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="优惠规则" min-width="160">
          <template #default="{ row }">
            <span v-if="row.type === 'fullcut'">满 ¥{{ row.threshold }} 减 ¥{{ row.discount }}</span>
            <span v-else-if="row.type === 'discount'">满 ¥{{ row.threshold }} 打 {{ row.discountRate / 10 }} 折</span>
            <span v-else>无门槛 ¥{{ row.discount }} 代金券</span>
          </template>
        </el-table-column>
        <el-table-column label="有效期" min-width="180">
          <template #default="{ row }">{{ row.startDate }} ~ {{ row.endDate }}</template>
        </el-table-column>
        <el-table-column label="发放/已用" width="110">
          <template #default="{ row }">{{ row.usedCount }} / {{ row.quantity }}</template>
        </el-table-column>
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)" size="small">{{ COUPON_STATUS[row.status] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" :icon="Edit" @click="openDialog(row)">编辑</el-button>
            <el-button
              v-if="row.status === 'active'"
              link type="warning"
              @click="store.toggleCoupon(row.id)"
            >停用</el-button>
            <el-button
              v-else-if="row.status === 'disabled'"
              link type="success"
              @click="store.toggleCoupon(row.id)"
            >启用</el-button>
            <el-popconfirm title="确认删除该优惠券？" @confirm="store.deleteCoupon(row.id)">
              <template #reference>
                <el-button link type="danger" :icon="Delete">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="filteredList.length"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        style="margin-top:16px; justify-content:flex-end"
      />
    </el-card>

    <!-- Add/Edit Dialog -->
    <el-dialog v-model="dialogVisible" :title="editId ? '编辑优惠券' : '新建优惠券'" width="520px" destroy-on-close>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="90px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="如：满200减30" />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-radio-group v-model="form.type">
            <el-radio v-for="(label, val) in COUPON_TYPES" :key="val" :value="val">{{ label }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="form.type !== 'cash'" label="使用门槛(¥)" prop="threshold">
          <el-input-number v-model="form.threshold" :min="0" style="width:150px" />
        </el-form-item>
        <el-form-item v-if="form.type === 'discount'" label="折扣比例" prop="discountRate">
          <el-input-number v-model="form.discountRate" :min="10" :max="99" style="width:130px" />
          <span style="margin-left:8px;font-size:12px;color:#909399">整数，如 90 代表九折</span>
        </el-form-item>
        <el-form-item v-else label="优惠金额(¥)" prop="discount">
          <el-input-number v-model="form.discount" :min="1" style="width:150px" />
        </el-form-item>
        <el-form-item label="发放数量" prop="quantity">
          <el-input-number v-model="form.quantity" :min="1" style="width:150px" />
        </el-form-item>
        <el-form-item label="有效期" prop="dateRange">
          <el-date-picker
            v-model="form.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY/MM/DD"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio value="active">启用</el-radio>
            <el-radio value="disabled">停用</el-radio>
          </el-radio-group>
        </el-form-item>
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
import { Plus, Edit, Delete, Search } from '@element-plus/icons-vue'
import { useAdminMarketingStore, COUPON_TYPES, COUPON_STATUS } from '@/admin/stores/adminMarketing'

const store = useAdminMarketingStore()
onMounted(() => store.init())

const filter = ref({ type: '', status: '' })
function resetFilter() { filter.value = { type: '', status: '' } }

const filteredList = computed(() => {
  let list = store.coupons
  if (filter.value.type) list = list.filter(c => c.type === filter.value.type)
  if (filter.value.status) list = list.filter(c => c.status === filter.value.status)
  return list
})

const currentPage = ref(1)
const pageSize = ref(10)
const pagedList = computed(() => {
  const s = (currentPage.value - 1) * pageSize.value
  return filteredList.value.slice(s, s + pageSize.value)
})

function typeTagType(t) { return { fullcut: '', discount: 'warning', cash: 'success' }[t] ?? '' }
function statusTagType(s) { return { active: 'success', expired: 'info', disabled: 'danger' }[s] ?? '' }

// dialog
const dialogVisible = ref(false)
const editId = ref(null)
const formRef = ref(null)
const form = ref(newForm())
const rules = {
  name: [{ required: true, message: '请输入优惠券名称', trigger: 'blur' }],
  dateRange: [{ required: true, message: '请选择有效期', trigger: 'change' }],
}

function newForm() {
  return { name: '', type: 'fullcut', threshold: 100, discount: 20, discountRate: 90, quantity: 100, dateRange: null, status: 'active' }
}

function openDialog(row) {
  editId.value = row?.id ?? null
  if (row) {
    form.value = { ...row, dateRange: row.startDate && row.endDate ? [row.startDate, row.endDate] : null }
  } else {
    form.value = newForm()
  }
  dialogVisible.value = true
}

async function handleSubmit() {
  await formRef.value.validate()
  const [startDate, endDate] = form.value.dateRange || []
  const data = { ...form.value, startDate, endDate }
  delete data.dateRange
  if (editId.value) {
    store.updateCoupon(editId.value, data)
    ElMessage.success('优惠券已更新')
  } else {
    store.addCoupon(data)
    ElMessage.success('优惠券已创建')
  }
  dialogVisible.value = false
}
</script>

<style scoped>
.admin-coupons-page { padding: 24px; }
.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.page-title { font-size: 20px; font-weight: 600; color: #303133; }
.filter-card { margin-bottom: 12px; }
.filter-card :deep(.el-card__body) { padding: 16px 16px 0; }
.table-card :deep(.el-card__body) { padding: 0; }
</style>
