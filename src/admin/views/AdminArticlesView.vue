<template>
  <div class="articles-page">
    <div class="page-title">帮助中心文章</div>

    <el-card shadow="never" class="toolbar-card">
      <div class="toolbar">
        <div class="toolbar-left">
          <el-select v-model="filterCategory" placeholder="文章分类" clearable style="width:140px">
            <el-option v-for="(label, key) in ARTICLE_CATEGORIES" :key="key" :label="label" :value="key" />
          </el-select>
          <el-select v-model="filterStatus" placeholder="发布状态" clearable style="width:120px">
            <el-option label="已发布" value="published" />
            <el-option label="草稿" value="draft" />
          </el-select>
          <el-input v-model="searchKeyword" placeholder="搜索标题..." clearable style="width:200px" :prefix-icon="Search" />
        </div>
        <el-button type="primary" :icon="Plus" @click="openDialog()">新增文章</el-button>
      </div>
    </el-card>

    <el-card shadow="never" v-loading="store.loading">
      <el-table :data="filteredArticles" stripe>
        <el-table-column prop="title" label="文章标题" min-width="200" />
        <el-table-column label="分类" width="120">
          <template #default="{ row }">
            <el-tag size="small" type="info">{{ ARTICLE_CATEGORIES[row.category] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="row.status === 'published' ? 'success' : 'info'" size="small">
              {{ row.status === 'published' ? '已发布' : '草稿' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="views" label="浏览量" width="90" align="center" />
        <el-table-column prop="updatedAt" label="更新时间" width="120" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button text type="primary" size="small" @click="viewArticle(row)">查看</el-button>
            <el-button text type="primary" size="small" @click="openDialog(row)">编辑</el-button>
            <el-popconfirm title="确认删除该文章？" @confirm="store.deleteArticle(row.id)">
              <template #reference>
                <el-button text type="danger" size="small">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- Edit Dialog -->
    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑文章' : '新增文章'" width="660px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入文章标题" maxlength="80" show-word-limit />
        </el-form-item>
        <el-form-item label="分类" prop="category">
          <el-select v-model="form.category" style="width:100%">
            <el-option v-for="(label, key) in ARTICLE_CATEGORIES" :key="key" :label="label" :value="key" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio value="published">立即发布</el-radio>
            <el-radio value="draft">保存草稿</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input v-model="form.content" type="textarea" :rows="6" placeholder="请输入文章内容" maxlength="5000" show-word-limit />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确认</el-button>
      </template>
    </el-dialog>

    <!-- View Dialog -->
    <el-dialog v-model="viewDialogVisible" :title="viewingArticle?.title" width="640px">
      <div class="article-meta">
        <el-tag size="small" type="info">{{ ARTICLE_CATEGORIES[viewingArticle?.category] }}</el-tag>
        <span class="meta-info">更新：{{ viewingArticle?.updatedAt }}</span>
        <span class="meta-info">浏览 {{ viewingArticle?.views }} 次</span>
      </div>
      <div class="article-content">{{ viewingArticle?.content }}</div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Plus } from '@element-plus/icons-vue'
import { useAdminContentStore, ARTICLE_CATEGORIES } from '@/admin/stores/adminContent'

const store = useAdminContentStore()
onMounted(() => store.init())

const filterCategory = ref('')
const filterStatus = ref('')
const searchKeyword = ref('')

const filteredArticles = computed(() => {
  return store.articles.filter(a => {
    if (filterCategory.value && a.category !== filterCategory.value) return false
    if (filterStatus.value && a.status !== filterStatus.value) return false
    if (searchKeyword.value && !a.title.includes(searchKeyword.value)) return false
    return true
  })
})

const dialogVisible = ref(false)
const formRef = ref(null)
const form = ref({})
const rules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  content: [{ required: true, message: '请输入内容', trigger: 'blur' }],
}

function openDialog(article = null) {
  form.value = article
    ? { ...article }
    : { id: null, title: '', category: 'shipping', status: 'published', content: '' }
  dialogVisible.value = true
}

function submitForm() {
  formRef.value.validate(valid => {
    if (!valid) return
    if (form.value.id) {
      store.updateArticle(form.value.id, { ...form.value })
      ElMessage.success('文章已更新')
    } else {
      store.addArticle({ ...form.value })
      ElMessage.success('文章已发布')
    }
    dialogVisible.value = false
  })
}

const viewDialogVisible = ref(false)
const viewingArticle = ref(null)
function viewArticle(article) {
  viewingArticle.value = article
  viewDialogVisible.value = true
}
</script>

<style scoped>
.articles-page { padding: 24px; }
.page-title { font-size: 20px; font-weight: 600; color: #303133; margin-bottom: 20px; }
.toolbar-card { margin-bottom: 16px; }
.toolbar { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.toolbar-left { display: flex; align-items: center; gap: 8px; }
.article-meta { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.meta-info { font-size: 13px; color: #909399; }
.article-content { line-height: 1.8; color: #303133; white-space: pre-wrap; }
</style>
