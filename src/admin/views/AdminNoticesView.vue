<template>
  <div class="notices-page">
    <div class="page-title">公告管理</div>

    <!-- Toolbar -->
    <el-card shadow="never" class="toolbar-card">
      <div class="toolbar">
        <div class="toolbar-left">
          <el-select v-model="filterType" placeholder="公告类型" clearable style="width:130px">
            <el-option v-for="(label, key) in NOTICE_TYPES" :key="key" :label="label" :value="key" />
          </el-select>
          <el-select v-model="filterStatus" placeholder="发布状态" clearable style="width:120px">
            <el-option v-for="(label, key) in NOTICE_STATUS" :key="key" :label="label" :value="key" />
          </el-select>
          <el-input v-model="searchKeyword" placeholder="搜索标题..." clearable style="width:200px" :prefix-icon="Search" />
        </div>
        <el-button type="primary" :icon="Plus" @click="openDialog()">发布公告</el-button>
      </div>
    </el-card>

    <!-- Table -->
    <el-card shadow="never" v-loading="store.loading">
      <el-table :data="filteredNotices" stripe>
        <el-table-column label="标题" min-width="200">
          <template #default="{ row }">
            <span>{{ row.title }}</span>
            <el-tag v-if="row.priority" type="danger" size="small" style="margin-left:6px">置顶</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="类型" width="110">
          <template #default="{ row }">
            <el-tag :type="typeTagType(row.type)" size="small">{{ NOTICE_TYPES[row.type] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'published' ? 'success' : 'info'" size="small">{{ NOTICE_STATUS[row.status] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="views" label="浏览量" width="90" align="center" />
        <el-table-column prop="createdAt" label="发布时间" width="120" />
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button text type="primary" size="small" @click="viewNotice(row)">查看</el-button>
            <el-button text type="primary" size="small" @click="openDialog(row)">编辑</el-button>
            <el-button v-if="row.status === 'draft'" text type="success" size="small" @click="handlePublish(row.id)">发布</el-button>
            <el-popconfirm title="确认删除该公告？" @confirm="store.deleteNotice(row.id)">
              <template #reference>
                <el-button text type="danger" size="small">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- Edit Dialog -->
    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑公告' : '发布公告'" width="620px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入公告标题" maxlength="60" show-word-limit />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="form.type" style="width:100%">
            <el-option v-for="(label, key) in NOTICE_TYPES" :key="key" :label="label" :value="key" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio value="published">立即发布</el-radio>
            <el-radio value="draft">保存草稿</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="置顶">
          <el-switch v-model="form.priority" />
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input v-model="form.content" type="textarea" :rows="5" placeholder="请输入公告内容" maxlength="2000" show-word-limit />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确认</el-button>
      </template>
    </el-dialog>

    <!-- View Dialog -->
    <el-dialog v-model="viewDialogVisible" :title="viewingNotice?.title" width="580px">
      <div class="notice-meta">
        <el-tag :type="typeTagType(viewingNotice?.type)" size="small">{{ NOTICE_TYPES[viewingNotice?.type] }}</el-tag>
        <span class="meta-date">{{ viewingNotice?.createdAt }}</span>
        <span class="meta-views">浏览 {{ viewingNotice?.views }} 次</span>
      </div>
      <div class="notice-content">{{ viewingNotice?.content }}</div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Plus } from '@element-plus/icons-vue'
import { useAdminContentStore, NOTICE_TYPES, NOTICE_STATUS } from '@/admin/stores/adminContent'

const store = useAdminContentStore()
onMounted(() => store.init())

const filterType = ref('')
const filterStatus = ref('')
const searchKeyword = ref('')

const filteredNotices = computed(() => {
  return store.notices.filter(n => {
    if (filterType.value && n.type !== filterType.value) return false
    if (filterStatus.value && n.status !== filterStatus.value) return false
    if (searchKeyword.value && !n.title.includes(searchKeyword.value)) return false
    return true
  })
})

function typeTagType(type) {
  return { system: '', promo: 'warning', maintain: 'danger', other: 'info' }[type] || ''
}

// Dialog
const dialogVisible = ref(false)
const formRef = ref(null)
const form = ref({})
const rules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  type: [{ required: true, message: '请选择类型', trigger: 'change' }],
  content: [{ required: true, message: '请输入内容', trigger: 'blur' }],
}

function openDialog(notice = null) {
  form.value = notice
    ? { ...notice }
    : { id: null, title: '', type: 'system', status: 'published', priority: false, content: '' }
  dialogVisible.value = true
}

function submitForm() {
  formRef.value.validate(valid => {
    if (!valid) return
    if (form.value.id) {
      store.updateNotice(form.value.id, { ...form.value })
      ElMessage.success('公告已更新')
    } else {
      store.addNotice({ ...form.value })
      ElMessage.success('公告已发布')
    }
    dialogVisible.value = false
  })
}

function handlePublish(id) {
  store.publishNotice(id)
  ElMessage.success('公告已发布')
}

// View
const viewDialogVisible = ref(false)
const viewingNotice = ref(null)
function viewNotice(notice) {
  viewingNotice.value = notice
  viewDialogVisible.value = true
}
</script>

<style scoped>
.notices-page { padding: 24px; }
.page-title { font-size: 20px; font-weight: 600; color: #303133; margin-bottom: 20px; }
.toolbar-card { margin-bottom: 16px; }
.toolbar { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.toolbar-left { display: flex; align-items: center; gap: 8px; }
.notice-meta { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; color: #909399; font-size: 13px; }
.meta-date, .meta-views { font-size: 13px; }
.notice-content { line-height: 1.8; color: #303133; white-space: pre-wrap; }
</style>
