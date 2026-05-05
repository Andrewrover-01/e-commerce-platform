<template>
  <div class="admin-users-page">
    <div class="page-header">
      <span class="page-title">用户管理</span>
      <div class="stat-pills">
        <el-tag type="success">活跃用户 {{ store.activeCount }}</el-tag>
        <el-tag type="danger">已禁用 {{ store.disabledCount }}</el-tag>
      </div>
    </div>

    <!-- Filter bar -->
    <el-card shadow="never" class="filter-card">
      <el-form inline>
        <el-form-item label="关键词">
          <el-input v-model="filter.keyword" placeholder="姓名/手机/邮箱" clearable style="width:200px" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filter.status" placeholder="全部" clearable style="width:110px">
            <el-option label="正常" value="active" />
            <el-option label="已禁用" value="disabled" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="currentPage = 1">搜索</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- Table -->
    <el-card shadow="never" class="table-card">
      <el-table v-loading="store.loading" :data="pagedList" row-key="id">
        <el-table-column label="用户" min-width="200">
          <template #default="{ row }">
            <div class="user-cell">
              <el-avatar :src="row.avatar" :size="36" />
              <div class="user-info">
                <div class="user-name">{{ row.name }}</div>
                <div class="user-meta">{{ row.email }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="手机" prop="phone" width="130" />
        <el-table-column label="注册时间" prop="registerDate" width="110" />
        <el-table-column label="最近登录" prop="lastLogin" width="110" />
        <el-table-column label="订单数" prop="orderCount" width="80" />
        <el-table-column label="累计消费" width="110">
          <template #default="{ row }">
            <span class="spend">¥{{ row.totalSpent.toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'danger'" size="small">
              {{ row.status === 'active' ? '正常' : '已禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="viewBehavior(row)">行为记录</el-button>
            <el-popconfirm
              :title="row.status === 'active' ? '确认禁用该账号？' : '确认启用该账号？'"
              @confirm="store.toggleStatus(row.id)"
            >
              <template #reference>
                <el-button link :type="row.status === 'active' ? 'danger' : 'success'">
                  {{ row.status === 'active' ? '禁用' : '启用' }}
                </el-button>
              </template>
            </el-popconfirm>
            <el-button link type="warning" @click="handleResetPwd(row)">重置密码</el-button>
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

    <!-- Reset Password Dialog -->
    <el-dialog v-model="resetPwdVisible" title="重置密码" width="380px" destroy-on-close>
      <div v-if="newPassword" class="pwd-result">
        <el-alert
          title="密码已重置，请将新密码告知用户"
          type="success"
          :closable="false"
          show-icon
          style="margin-bottom:12px"
        />
        <div class="new-pwd-box">
          <span class="pwd-label">新临时密码</span>
          <el-tag type="success" size="large" class="pwd-value">{{ newPassword }}</el-tag>
          <el-button size="small" @click="copyPwd">复制</el-button>
        </div>
        <p class="pwd-tip">用户下次登录后需修改密码</p>
      </div>
      <div v-else>
        <p>确认重置用户 <strong>{{ resetTarget?.name }}</strong> 的密码？系统将生成随机临时密码。</p>
      </div>
      <template #footer>
        <el-button @click="resetPwdVisible = false">关闭</el-button>
        <el-button v-if="!newPassword" type="primary" @click="confirmResetPwd">确认重置</el-button>
      </template>
    </el-dialog>

    <!-- Behavior Drawer -->
    <el-drawer v-model="behaviorDrawerVisible" :title="`${behaviorUser?.name} 的行为记录`" size="480px">
      <div v-if="behaviorUser" class="behavior-content">
        <el-tabs>
          <el-tab-pane :label="`购物车 (${behaviorUser.cart.length})`">
            <el-empty v-if="!behaviorUser.cart.length" description="购物车为空" />
            <div v-for="item in behaviorUser.cart" :key="item.productId" class="behavior-item">
              <el-image :src="item.image" class="b-item-img" fit="cover" />
              <div class="b-item-info">
                <div class="b-item-name">{{ item.name }}</div>
                <div class="b-item-meta">¥{{ item.price }} × {{ item.quantity }}</div>
              </div>
              <div class="b-item-subtotal">¥{{ (item.price * item.quantity).toLocaleString() }}</div>
            </div>
            <div v-if="behaviorUser.cart.length" class="b-cart-total">
              购物车合计：<strong>¥{{ cartTotal(behaviorUser).toLocaleString() }}</strong>
            </div>
          </el-tab-pane>
          <el-tab-pane :label="`收藏夹 (${behaviorUser.wishlist.length})`">
            <el-empty v-if="!behaviorUser.wishlist.length" description="收藏夹为空" />
            <div v-for="item in behaviorUser.wishlist" :key="item.productId" class="behavior-item">
              <el-image :src="item.image" class="b-item-img" fit="cover" />
              <div class="b-item-info">
                <div class="b-item-name">{{ item.name }}</div>
                <div class="b-item-meta">¥{{ item.price }}</div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { useAdminUsersStore } from '@/admin/stores/adminUsers'

const store = useAdminUsersStore()
onMounted(() => store.init())

// filter
const filter = ref({ keyword: '', status: '' })
function resetFilter() { filter.value = { keyword: '', status: '' } }

const filteredList = computed(() => {
  let list = store.users
  const { keyword, status } = filter.value
  if (keyword) {
    const kw = keyword.toLowerCase()
    list = list.filter(u =>
      u.name.includes(keyword) ||
      u.phone.includes(keyword) ||
      u.email.toLowerCase().includes(kw)
    )
  }
  if (status) list = list.filter(u => u.status === status)
  return list
})

const currentPage = ref(1)
const pageSize = ref(15)
const pagedList = computed(() => {
  const s = (currentPage.value - 1) * pageSize.value
  return filteredList.value.slice(s, s + pageSize.value)
})

// reset password
const resetPwdVisible = ref(false)
const resetTarget = ref(null)
const newPassword = ref('')
function handleResetPwd(user) {
  resetTarget.value = user
  newPassword.value = ''
  resetPwdVisible.value = true
}
function confirmResetPwd() {
  newPassword.value = store.resetPassword(resetTarget.value.id)
}
function copyPwd() {
  navigator.clipboard?.writeText(newPassword.value)
  ElMessage.success('已复制到剪贴板')
}

// behavior drawer
const behaviorDrawerVisible = ref(false)
const behaviorUser = ref(null)
function viewBehavior(user) {
  behaviorUser.value = user
  behaviorDrawerVisible.value = true
}
function cartTotal(user) {
  return user.cart.reduce((s, i) => s + i.price * i.quantity, 0)
}
</script>

<style scoped>
.admin-users-page { padding: 24px; }
.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.page-title { font-size: 20px; font-weight: 600; color: #303133; }
.stat-pills { display: flex; gap: 8px; }
.filter-card { margin-bottom: 12px; }
.filter-card :deep(.el-card__body) { padding: 16px 16px 0; }
.table-card :deep(.el-card__body) { padding: 0; }
.user-cell { display: flex; align-items: center; gap: 10px; padding: 6px 0; }
.user-name { font-size: 13px; font-weight: 500; color: #303133; }
.user-meta { font-size: 12px; color: #909399; }
.spend { color: #f56c6c; font-weight: 600; }
.pwd-result { }
.new-pwd-box { display: flex; align-items: center; gap: 10px; padding: 12px; background: #f9f9f9; border-radius: 6px; }
.pwd-label { font-size: 13px; color: #606266; }
.pwd-value { font-size: 16px; letter-spacing: 2px; }
.pwd-tip { font-size: 12px; color: #909399; margin-top: 8px; }
.behavior-content { padding: 0; }
.behavior-item { display: flex; align-items: center; gap: 10px; padding: 10px 0; border-bottom: 1px solid #f0f0f0; }
.b-item-img { width: 48px; height: 48px; border-radius: 4px; flex-shrink: 0; }
.b-item-name { font-size: 13px; color: #303133; }
.b-item-meta { font-size: 12px; color: #909399; margin-top: 3px; }
.b-item-subtotal { font-size: 13px; font-weight: 600; color: #f56c6c; margin-left: auto; }
.b-cart-total { text-align: right; margin-top: 12px; font-size: 14px; color: #606266; }
.b-cart-total strong { color: #f56c6c; font-size: 16px; }
</style>
