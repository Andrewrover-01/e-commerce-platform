<template>
  <div class="admin-products-page">
    <div class="page-header">
      <span class="page-title">商品列表</span>
      <div class="header-actions">
        <el-button type="primary" :icon="Plus" @click="openAddDialog">添加商品</el-button>
        <el-button :icon="Upload" @click="triggerImport">导入CSV</el-button>
        <el-button :icon="Download" @click="handleExport">导出CSV</el-button>
        <input ref="csvInput" type="file" accept=".csv" style="display:none" @change="handleImport" />
      </div>
    </div>

    <!-- Low-stock alert banner -->
    <el-alert
      v-if="lowStockProducts.length"
      :title="`⚠️ 共 ${lowStockProducts.length} 件商品库存不足，请及时补货`"
      type="warning"
      show-icon
      :closable="false"
      style="margin-bottom:16px"
    />

    <!-- Filter bar -->
    <el-card shadow="never" class="filter-card">
      <el-form inline>
        <el-form-item label="关键词">
          <el-input v-model="filter.keyword" placeholder="商品名称/品牌" clearable style="width:180px" />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="filter.category" placeholder="全部分类" clearable style="width:130px">
            <el-option v-for="c in store.categories" :key="c.id" :label="c.name" :value="c.name" />
          </el-select>
        </el-form-item>
        <el-form-item label="品牌">
          <el-select v-model="filter.brand" placeholder="全部品牌" clearable style="width:120px">
            <el-option v-for="b in store.brands" :key="b.id" :label="b.name" :value="b.name" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filter.status" placeholder="全部状态" clearable style="width:110px">
            <el-option label="已上架" value="on" />
            <el-option label="已下架" value="off" />
          </el-select>
        </el-form-item>
        <el-form-item label="库存">
          <el-select v-model="filter.stock" placeholder="全部" clearable style="width:110px">
            <el-option label="库存不足" value="low" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="currentPage = 1">搜索</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- Batch toolbar -->
    <div v-if="selectedIds.length" class="batch-bar">
      <span>已选 {{ selectedIds.length }} 项</span>
      <el-button size="small" @click="batchOn">批量上架</el-button>
      <el-button size="small" @click="batchOff">批量下架</el-button>
      <el-button size="small" type="danger" @click="batchDelete">批量删除</el-button>
    </div>

    <!-- Table -->
    <el-card shadow="never" class="table-card">
      <el-table
        v-loading="store.loading"
        :data="pagedList"
        @selection-change="handleSelectionChange"
        row-key="id"
      >
        <el-table-column type="selection" width="48" />
        <el-table-column label="商品" min-width="260">
          <template #default="{ row }">
            <div class="product-cell">
              <el-image :src="row.image" class="product-img" fit="cover" />
              <div class="product-info">
                <div class="product-name">{{ row.name }}</div>
                <div class="product-meta">{{ row.category }} · {{ row.brand }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="价格" width="110">
          <template #default="{ row }">
            <span class="price-main">¥{{ row.price }}</span>
            <span class="price-orig">¥{{ row.originalPrice }}</span>
          </template>
        </el-table-column>
        <el-table-column label="库存" width="110">
          <template #default="{ row }">
            <el-tag :type="row.stock <= row.minStock ? 'danger' : 'info'" size="small">
              {{ row.stock }}
            </el-tag>
            <span class="min-stock-hint">/ 最低{{ row.minStock }}</span>
          </template>
        </el-table-column>
        <el-table-column label="销量" prop="sales" width="80" />
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-switch
              :model-value="row.status === 'on'"
              active-text=""
              inactive-text=""
              @change="store.toggleStatus(row.id)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" :icon="Edit" @click="openEditDialog(row)">编辑</el-button>
            <el-popconfirm title="确认删除该商品？" @confirm="store.deleteProduct(row.id)">
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
        :page-sizes="[15, 30, 50]"
        layout="total, sizes, prev, pager, next"
        style="margin-top:16px; justify-content:flex-end"
      />
    </el-card>

    <!-- Add / Edit Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="editId ? '编辑商品' : '添加商品'"
      width="600px"
      destroy-on-close
    >
      <el-form :model="form" :rules="formRules" ref="formRef" label-width="90px">
        <el-row :gutter="16">
          <el-col :span="24">
            <el-form-item label="商品名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入商品名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="分类" prop="category">
              <el-select v-model="form.category" style="width:100%">
                <el-option v-for="c in store.categories" :key="c.id" :label="c.name" :value="c.name" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="品牌" prop="brand">
              <el-select v-model="form.brand" allow-create filterable style="width:100%">
                <el-option v-for="b in store.brands" :key="b.id" :label="b.name" :value="b.name" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="售价(¥)" prop="price">
              <el-input-number v-model="form.price" :min="0" :precision="2" style="width:100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="原价(¥)" prop="originalPrice">
              <el-input-number v-model="form.originalPrice" :min="0" :precision="2" style="width:100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="库存" prop="stock">
              <el-input-number v-model="form.stock" :min="0" style="width:100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="最小库存" prop="minStock">
              <el-input-number v-model="form.minStock" :min="1" style="width:100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态">
              <el-radio-group v-model="form.status">
                <el-radio value="on">上架</el-radio>
                <el-radio value="off">下架</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="描述">
              <el-input v-model="form.description" type="textarea" :rows="2" />
            </el-form-item>
          </el-col>
        </el-row>
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
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Upload, Download, Search, Edit, Delete } from '@element-plus/icons-vue'
import { useAdminProductsStore } from '@/admin/stores/adminProducts'

const store = useAdminProductsStore()
onMounted(() => store.init())

// ---------- filter ----------
const filter = ref({ keyword: '', category: '', brand: '', status: '', stock: '' })
function resetFilter() {
  filter.value = { keyword: '', category: '', brand: '', status: '', stock: '' }
}

const filteredList = computed(() => {
  let list = store.products
  const { keyword, category, brand, status, stock } = filter.value
  if (keyword) {
    const kw = keyword.toLowerCase()
    list = list.filter(p => p.name.toLowerCase().includes(kw) || p.brand.toLowerCase().includes(kw))
  }
  if (category) list = list.filter(p => p.category === category)
  if (brand) list = list.filter(p => p.brand === brand)
  if (status) list = list.filter(p => p.status === status)
  if (stock === 'low') list = list.filter(p => p.stock <= p.minStock)
  return list
})

const currentPage = ref(1)
const pageSize = ref(15)
const pagedList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredList.value.slice(start, start + pageSize.value)
})

const lowStockProducts = computed(() => store.lowStockProducts)

// ---------- selection ----------
const selectedIds = ref([])
function handleSelectionChange(rows) {
  selectedIds.value = rows.map(r => r.id)
}
function batchOn() { store.batchSetStatus(selectedIds.value, 'on'); selectedIds.value = [] }
function batchOff() { store.batchSetStatus(selectedIds.value, 'off'); selectedIds.value = [] }
async function batchDelete() {
  await ElMessageBox.confirm(`确认删除选中的 ${selectedIds.value.length} 件商品？`, '提示', { type: 'warning' })
  store.deleteProducts(selectedIds.value)
  selectedIds.value = []
  ElMessage.success('已删除')
}

// ---------- export / import ----------
function handleExport() {
  store.exportCSV(filteredList.value)
  ElMessage.success(`已导出 ${filteredList.value.length} 条商品数据`)
}

const csvInput = ref(null)
function triggerImport() { csvInput.value?.click() }
function handleImport(e) {
  const file = e.target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = ev => {
    const count = store.importCSV(ev.target.result)
    ElMessage.success(`成功导入 ${count} 件商品`)
  }
  reader.readAsText(file, 'utf-8')
  e.target.value = ''
}

// ---------- add / edit dialog ----------
const dialogVisible = ref(false)
const editId = ref(null)
const formRef = ref(null)
const form = ref(newForm())
const formRules = {
  name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  brand: [{ required: true, message: '请输入品牌', trigger: 'blur' }],
  price: [{ required: true, message: '请输入售价', trigger: 'blur' }],
  stock: [{ required: true, message: '请输入库存', trigger: 'blur' }],
}

function newForm() {
  return { name: '', category: '', brand: '', price: 0, originalPrice: 0, stock: 0, minStock: 10, status: 'on', description: '' }
}

function openAddDialog() {
  editId.value = null
  form.value = newForm()
  dialogVisible.value = true
}
function openEditDialog(row) {
  editId.value = row.id
  form.value = { ...row }
  dialogVisible.value = true
}
async function handleSubmit() {
  await formRef.value.validate()
  if (editId.value) {
    store.updateProduct(editId.value, form.value)
    ElMessage.success('商品已更新')
  } else {
    store.addProduct(form.value)
    ElMessage.success('商品已添加')
  }
  dialogVisible.value = false
}
</script>

<style scoped>
.admin-products-page { padding: 24px; }
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.page-title { font-size: 20px; font-weight: 600; color: #303133; }
.header-actions { display: flex; gap: 8px; }
.filter-card { margin-bottom: 12px; }
.filter-card :deep(.el-card__body) { padding: 16px 16px 0; }
.batch-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #ecf5ff;
  border: 1px solid #b3d8ff;
  border-radius: 4px;
  padding: 8px 12px;
  margin-bottom: 8px;
  font-size: 13px;
  color: #409eff;
}
.table-card :deep(.el-card__body) { padding: 0; }
.product-cell { display: flex; align-items: center; gap: 10px; padding: 6px 0; }
.product-img { width: 52px; height: 52px; border-radius: 4px; flex-shrink: 0; }
.product-name { font-size: 13px; color: #303133; line-height: 1.4; }
.product-meta { font-size: 12px; color: #909399; margin-top: 2px; }
.price-main { color: #f56c6c; font-weight: 600; font-size: 14px; }
.price-orig { color: #c0c4cc; font-size: 12px; text-decoration: line-through; margin-left: 4px; }
.min-stock-hint { font-size: 11px; color: #909399; margin-left: 4px; }
</style>
