<template>
  <div class="admin-categories-page">
    <el-tabs v-model="activeTab">
      <!-- =================== CATEGORIES =================== -->
      <el-tab-pane label="商品分类" name="categories">
        <div class="tab-header">
          <el-button type="primary" :icon="Plus" @click="openCatDialog()">添加分类</el-button>
        </div>
        <el-table :data="store.categories" border>
          <el-table-column label="ID" prop="id" width="60" />
          <el-table-column label="图标" prop="icon" width="60" />
          <el-table-column label="分类名称" prop="name" />
          <el-table-column label="子分类">
            <template #default="{ row }">
              <el-tag
                v-for="s in (row.sub || [])"
                :key="s"
                size="small"
                style="margin:2px"
              >{{ s }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="130">
            <template #default="{ row }">
              <el-button link type="primary" :icon="Edit" @click="openCatDialog(row)">编辑</el-button>
              <el-popconfirm title="确认删除该分类？" @confirm="store.deleteCategory(row.id)">
                <template #reference>
                  <el-button link type="danger" :icon="Delete">删除</el-button>
                </template>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <!-- =================== BRANDS =================== -->
      <el-tab-pane label="品牌管理" name="brands">
        <div class="tab-header">
          <el-button type="primary" :icon="Plus" @click="openBrandDialog()">添加品牌</el-button>
        </div>
        <el-table :data="store.brands" border>
          <el-table-column label="品牌名称" prop="name" />
          <el-table-column label="简介" prop="description" show-overflow-tooltip />
          <el-table-column label="操作" width="130">
            <template #default="{ row }">
              <el-button link type="primary" :icon="Edit" @click="openBrandDialog(row)">编辑</el-button>
              <el-popconfirm title="确认删除该品牌？" @confirm="store.deleteBrand(row.id)">
                <template #reference>
                  <el-button link type="danger" :icon="Delete">删除</el-button>
                </template>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>

    <!-- Category Dialog -->
    <el-dialog v-model="catDialogVisible" :title="catEditId ? '编辑分类' : '添加分类'" width="460px" destroy-on-close>
      <el-form :model="catForm" label-width="80px">
        <el-form-item label="分类名称">
          <el-input v-model="catForm.name" placeholder="如：手机数码" />
        </el-form-item>
        <el-form-item label="图标">
          <el-input v-model="catForm.icon" placeholder="如：📱" />
        </el-form-item>
        <el-form-item label="子分类">
          <div class="sub-tags">
            <el-tag
              v-for="(s, i) in catForm.sub"
              :key="i"
              closable
              @close="catForm.sub.splice(i, 1)"
              style="margin:2px"
            >{{ s }}</el-tag>
          </div>
          <el-input
            v-model="subInput"
            placeholder="输入子分类后回车"
            style="margin-top:6px"
            @keyup.enter="addSubCategory"
          >
            <template #append>
              <el-button @click="addSubCategory">添加</el-button>
            </template>
          </el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="catDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveCat">保存</el-button>
      </template>
    </el-dialog>

    <!-- Brand Dialog -->
    <el-dialog v-model="brandDialogVisible" :title="brandEditId ? '编辑品牌' : '添加品牌'" width="420px" destroy-on-close>
      <el-form :model="brandForm" label-width="80px">
        <el-form-item label="品牌名称">
          <el-input v-model="brandForm.name" placeholder="如：Apple" />
        </el-form-item>
        <el-form-item label="简介">
          <el-input v-model="brandForm.description" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="brandDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveBrand">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Edit, Delete } from '@element-plus/icons-vue'
import { useAdminProductsStore } from '@/admin/stores/adminProducts'

const store = useAdminProductsStore()
onMounted(() => store.init())

const activeTab = ref('categories')

// ---- categories ----
const catDialogVisible = ref(false)
const catEditId = ref(null)
const catForm = ref({ name: '', icon: '📦', sub: [] })
const subInput = ref('')

function openCatDialog(row) {
  catEditId.value = row?.id ?? null
  catForm.value = row ? { name: row.name, icon: row.icon, sub: [...(row.sub || [])] } : { name: '', icon: '📦', sub: [] }
  catDialogVisible.value = true
}
function addSubCategory() {
  const v = subInput.value.trim()
  if (v && !catForm.value.sub.includes(v)) catForm.value.sub.push(v)
  subInput.value = ''
}
function saveCat() {
  if (!catForm.value.name.trim()) { ElMessage.error('分类名称不能为空'); return }
  if (catEditId.value) {
    store.updateCategory(catEditId.value, catForm.value)
    ElMessage.success('分类已更新')
  } else {
    store.addCategory(catForm.value)
    ElMessage.success('分类已添加')
  }
  catDialogVisible.value = false
}

// ---- brands ----
const brandDialogVisible = ref(false)
const brandEditId = ref(null)
const brandForm = ref({ name: '', description: '' })

function openBrandDialog(row) {
  brandEditId.value = row?.id ?? null
  brandForm.value = row ? { name: row.name, description: row.description } : { name: '', description: '' }
  brandDialogVisible.value = true
}
function saveBrand() {
  if (!brandForm.value.name.trim()) { ElMessage.error('品牌名称不能为空'); return }
  if (brandEditId.value) {
    store.updateBrand(brandEditId.value, brandForm.value)
    ElMessage.success('品牌已更新')
  } else {
    store.addBrand(brandForm.value)
    ElMessage.success('品牌已添加')
  }
  brandDialogVisible.value = false
}
</script>

<style scoped>
.admin-categories-page { padding: 24px; }
.tab-header { margin-bottom: 12px; }
.sub-tags { display: flex; flex-wrap: wrap; gap: 4px; }
</style>
