<template>
  <div class="admin-banners-page">
    <el-tabs v-model="activeTab">
      <!-- =================== BANNERS =================== -->
      <el-tab-pane label="Banner 管理" name="banners">
        <div class="tab-header">
          <el-button type="primary" :icon="Plus" @click="openBannerDialog()">添加 Banner</el-button>
        </div>
        <el-table :data="store.banners" border v-loading="store.loading">
          <el-table-column label="排序" prop="sort" width="70" />
          <el-table-column label="预览" width="160">
            <template #default="{ row }">
              <el-image :src="row.image" fit="cover" style="width:140px;height:46px;border-radius:4px" />
            </template>
          </el-table-column>
          <el-table-column label="标题" prop="title" />
          <el-table-column label="副标题" prop="subtitle" show-overflow-tooltip />
          <el-table-column label="跳转链接" prop="link" show-overflow-tooltip />
          <el-table-column label="显示" width="80">
            <template #default="{ row }">
              <el-switch :model-value="row.enabled" @change="store.toggleBanner(row.id)" />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120">
            <template #default="{ row }">
              <el-button link type="primary" :icon="Edit" @click="openBannerDialog(row)">编辑</el-button>
              <el-popconfirm title="确认删除该 Banner？" @confirm="store.deleteBanner(row.id)">
                <template #reference>
                  <el-button link type="danger" :icon="Delete">删除</el-button>
                </template>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <!-- =================== PROMO FLOORS =================== -->
      <el-tab-pane label="促销楼层" name="floors">
        <div class="tab-header">
          <el-button type="primary" :icon="Plus" @click="openFloorDialog()">添加楼层</el-button>
        </div>
        <el-table :data="store.promoFloors" border v-loading="store.loading">
          <el-table-column label="排序" prop="sort" width="70" />
          <el-table-column label="楼层标题" prop="title" />
          <el-table-column label="类型" prop="type" width="100">
            <template #default="{ row }">
              <el-tag size="small">{{ FLOOR_TYPES[row.type] || row.type }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="背景色" width="90">
            <template #default="{ row }">
              <div :style="{ background: row.bgColor, width: '60px', height: '24px', borderRadius: '4px', border: '1px solid #eee' }" />
            </template>
          </el-table-column>
          <el-table-column label="关联商品数" width="110">
            <template #default="{ row }">{{ row.productIds?.length || 0 }} 件</template>
          </el-table-column>
          <el-table-column label="显示" width="80">
            <template #default="{ row }">
              <el-switch :model-value="row.enabled" @change="store.toggleFloor(row.id)" />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120">
            <template #default="{ row }">
              <el-button link type="primary" :icon="Edit" @click="openFloorDialog(row)">编辑</el-button>
              <el-popconfirm title="确认删除该楼层？" @confirm="store.deleteFloor(row.id)">
                <template #reference>
                  <el-button link type="danger" :icon="Delete">删除</el-button>
                </template>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>

    <!-- Banner Dialog -->
    <el-dialog v-model="bannerDialogVisible" :title="bannerEditId ? '编辑 Banner' : '添加 Banner'" width="500px" destroy-on-close>
      <el-form :model="bannerForm" label-width="90px">
        <el-form-item label="标题">
          <el-input v-model="bannerForm.title" placeholder="Banner 标题" />
        </el-form-item>
        <el-form-item label="副标题">
          <el-input v-model="bannerForm.subtitle" placeholder="副标题/描述" />
        </el-form-item>
        <el-form-item label="图片URL">
          <el-input v-model="bannerForm.image" placeholder="https://..." />
          <div v-if="bannerForm.image" style="margin-top:8px">
            <el-image :src="bannerForm.image" fit="cover" style="width:100%;height:60px;border-radius:4px" />
          </div>
        </el-form-item>
        <el-form-item label="跳转链接">
          <el-input v-model="bannerForm.link" placeholder="/products?category=xxx" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="bannerForm.sort" :min="1" style="width:120px" />
        </el-form-item>
        <el-form-item label="显示">
          <el-switch v-model="bannerForm.enabled" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="bannerDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveBanner">保存</el-button>
      </template>
    </el-dialog>

    <!-- Floor Dialog -->
    <el-dialog v-model="floorDialogVisible" :title="floorEditId ? '编辑楼层' : '添加楼层'" width="480px" destroy-on-close>
      <el-form :model="floorForm" label-width="90px">
        <el-form-item label="楼层标题">
          <el-input v-model="floorForm.title" placeholder="如：热销爆款" />
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="floorForm.type" style="width:100%">
            <el-option v-for="(label, val) in FLOOR_TYPES" :key="val" :label="label" :value="val" />
          </el-select>
        </el-form-item>
        <el-form-item label="背景色">
          <el-color-picker v-model="floorForm.bgColor" />
          <span style="margin-left:8px;font-size:12px;color:#909399">{{ floorForm.bgColor }}</span>
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="floorForm.sort" :min="1" style="width:120px" />
        </el-form-item>
        <el-form-item label="显示">
          <el-switch v-model="floorForm.enabled" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="floorDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveFloor">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Edit, Delete } from '@element-plus/icons-vue'
import { useAdminMarketingStore } from '@/admin/stores/adminMarketing'

const store = useAdminMarketingStore()
onMounted(() => store.init())

const activeTab = ref('banners')

const FLOOR_TYPES = { hot: '热销专区', new: '新品上市', clearance: '特价清仓', custom: '自定义' }

// ---- banners ----
const bannerDialogVisible = ref(false)
const bannerEditId = ref(null)
const bannerForm = ref(newBannerForm())
function newBannerForm() { return { title: '', subtitle: '', image: '', link: '', sort: 1, enabled: true } }
function openBannerDialog(row) {
  bannerEditId.value = row?.id ?? null
  bannerForm.value = row ? { ...row } : newBannerForm()
  bannerDialogVisible.value = true
}
function saveBanner() {
  if (!bannerForm.value.title.trim()) { ElMessage.error('请输入标题'); return }
  if (!bannerForm.value.image.trim()) { ElMessage.error('请输入图片 URL'); return }
  if (bannerEditId.value) {
    store.updateBanner(bannerEditId.value, bannerForm.value)
    ElMessage.success('Banner 已更新')
  } else {
    store.addBanner(bannerForm.value)
    ElMessage.success('Banner 已添加')
  }
  bannerDialogVisible.value = false
}

// ---- floors ----
const floorDialogVisible = ref(false)
const floorEditId = ref(null)
const floorForm = ref(newFloorForm())
function newFloorForm() { return { title: '', type: 'hot', bgColor: '#ffffff', sort: 1, enabled: true, productIds: [] } }
function openFloorDialog(row) {
  floorEditId.value = row?.id ?? null
  floorForm.value = row ? { ...row, productIds: [...(row.productIds || [])] } : newFloorForm()
  floorDialogVisible.value = true
}
function saveFloor() {
  if (!floorForm.value.title.trim()) { ElMessage.error('请输入楼层标题'); return }
  if (floorEditId.value) {
    store.updateFloor(floorEditId.value, floorForm.value)
    ElMessage.success('楼层已更新')
  } else {
    store.addFloor(floorForm.value)
    ElMessage.success('楼层已添加')
  }
  floorDialogVisible.value = false
}
</script>

<style scoped>
.admin-banners-page { padding: 24px; }
.tab-header { margin-bottom: 12px; }
</style>
