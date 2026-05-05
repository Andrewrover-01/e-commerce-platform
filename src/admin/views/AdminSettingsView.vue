<template>
  <div class="settings-page">
    <div class="page-title">系统设置</div>

    <el-tabs v-model="activeTab" type="border-card">
      <!-- Shipping Templates -->
      <el-tab-pane label="运费模板" name="shipping">
        <div class="tab-content">
          <div class="tab-toolbar">
            <el-button type="primary" :icon="Plus" size="small" @click="openShippingDialog()">新增模板</el-button>
          </div>
          <el-table :data="store.shippingTemplates" stripe v-loading="store.loading">
            <el-table-column prop="name" label="模板名称" min-width="150" />
            <el-table-column label="类型" width="110">
              <template #default="{ row }">
                <el-tag size="small" :type="{ free: 'success', fixed: '', tiered: 'warning' }[row.type]">{{ SHIPPING_TYPES[row.type] }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="基础运费" width="100" align="center">
              <template #default="{ row }">
                <span v-if="row.type === 'free'">—</span>
                <span v-else>¥{{ row.basePrice }}</span>
              </template>
            </el-table-column>
            <el-table-column label="免运费门槛" width="120" align="center">
              <template #default="{ row }">
                <span v-if="row.freeThreshold === 0">无门槛</span>
                <span v-else>满¥{{ row.freeThreshold }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="regions" label="适用地区" min-width="150" show-overflow-tooltip />
            <el-table-column label="状态" width="80">
              <template #default="{ row }">
                <el-switch :model-value="row.enabled" @change="store.toggleShipping(row.id)" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="130" fixed="right">
              <template #default="{ row }">
                <el-button text type="primary" size="small" @click="openShippingDialog(row)">编辑</el-button>
                <el-popconfirm title="确认删除该模板？" @confirm="store.deleteShipping(row.id)">
                  <template #reference>
                    <el-button text type="danger" size="small">删除</el-button>
                  </template>
                </el-popconfirm>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- Tax Settings -->
        <div style="margin-top:32px">
          <div class="section-title">税费设置</div>
          <el-table :data="store.taxSettings" stripe style="max-width:600px">
            <el-table-column prop="category" label="商品分类" min-width="120" />
            <el-table-column label="税率" width="100" align="center">
              <template #default="{ row }">
                <el-input-number v-model="row.rate" :min="0" :max="100" :step="1" size="small" style="width:80px" @change="store.updateTax(row.id, { rate: row.rate })" />
                <span style="margin-left:4px">%</span>
              </template>
            </el-table-column>
            <el-table-column label="启用" width="80" align="center">
              <template #default="{ row }">
                <el-switch :model-value="row.enabled" @change="store.toggleTax(row.id)" />
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>

      <!-- Admin Accounts / RBAC -->
      <el-tab-pane label="管理员与权限" name="rbac">
        <div class="tab-content">
          <!-- Roles -->
          <div class="section-title">角色管理</div>
          <div class="tab-toolbar">
            <el-button type="primary" :icon="Plus" size="small" @click="openRoleDialog()">新增角色</el-button>
          </div>
          <el-table :data="store.roles" stripe style="margin-bottom:32px">
            <el-table-column prop="name" label="角色名称" width="140" />
            <el-table-column prop="description" label="描述" min-width="180" />
            <el-table-column label="权限" min-width="280">
              <template #default="{ row }">
                <el-tag v-for="perm in row.permissions" :key="perm" size="small" type="info" style="margin:2px">{{ permLabel(perm) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="adminCount" label="管理员数" width="100" align="center" />
            <el-table-column label="操作" width="130" fixed="right">
              <template #default="{ row }">
                <el-button text type="primary" size="small" :disabled="row.isSystem" @click="openRoleDialog(row)">编辑</el-button>
                <el-popconfirm title="确认删除该角色？" @confirm="store.deleteRole(row.id)" :disabled="row.isSystem || row.adminCount > 0">
                  <template #reference>
                    <el-button text type="danger" size="small" :disabled="row.isSystem || row.adminCount > 0">删除</el-button>
                  </template>
                </el-popconfirm>
              </template>
            </el-table-column>
          </el-table>

          <!-- Admins -->
          <div class="section-title">管理员账号</div>
          <div class="tab-toolbar">
            <el-button type="primary" :icon="Plus" size="small" @click="openAdminDialog()">新增管理员</el-button>
          </div>
          <el-table :data="store.admins" stripe>
            <el-table-column prop="name" label="姓名" width="100" />
            <el-table-column prop="email" label="邮箱" min-width="180" />
            <el-table-column prop="roleName" label="角色" width="130">
              <template #default="{ row }">
                <el-tag size="small">{{ row.roleName }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="90">
              <template #default="{ row }">
                <el-tag :type="row.status === 'active' ? 'success' : 'info'" size="small">
                  {{ row.status === 'active' ? '正常' : '禁用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="lastLogin" label="最近登录" min-width="160" show-overflow-tooltip />
            <el-table-column label="操作" width="170" fixed="right">
              <template #default="{ row }">
                <el-button text type="primary" size="small" :disabled="row.id === 1" @click="openAdminDialog(row)">编辑</el-button>
                <el-button text :type="row.status === 'active' ? 'warning' : 'success'" size="small" :disabled="row.id === 1" @click="store.toggleAdmin(row.id)">
                  {{ row.status === 'active' ? '禁用' : '启用' }}
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>

      <!-- Audit Logs -->
      <el-tab-pane label="日志审计" name="logs">
        <div class="tab-content">
          <div class="tab-toolbar">
            <el-select v-model="logTypeFilter" placeholder="操作类型" clearable style="width:130px" size="small">
              <el-option label="登录认证" value="auth" />
              <el-option label="商品管理" value="product" />
              <el-option label="内容管理" value="content" />
              <el-option label="营销工具" value="marketing" />
              <el-option label="订单管理" value="order" />
              <el-option label="用户管理" value="user" />
              <el-option label="系统设置" value="settings" />
              <el-option label="财务管理" value="finance" />
            </el-select>
            <el-select v-model="logAdminFilter" placeholder="操作管理员" clearable style="width:140px" size="small">
              <el-option v-for="a in store.admins" :key="a.id" :label="a.name" :value="a.id" />
            </el-select>
            <el-select v-model="logStatusFilter" placeholder="操作结果" clearable style="width:120px" size="small">
              <el-option label="成功" value="success" />
              <el-option label="失败" value="fail" />
            </el-select>
          </div>
          <el-table :data="filteredLogs" stripe v-loading="store.loading" max-height="500">
            <el-table-column prop="time" label="时间" width="160" />
            <el-table-column prop="adminName" label="操作人" width="100" />
            <el-table-column prop="action" label="操作" width="130" />
            <el-table-column prop="target" label="模块" width="110">
              <template #default="{ row }">
                <el-tag size="small" type="info">{{ row.target }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="ip" label="IP地址" width="130" />
            <el-table-column prop="detail" label="详情" min-width="200" show-overflow-tooltip />
            <el-table-column label="结果" width="80">
              <template #default="{ row }">
                <el-tag :type="row.status === 'success' ? 'success' : 'danger'" size="small">
                  {{ row.status === 'success' ? '成功' : '失败' }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- Shipping Dialog -->
    <el-dialog v-model="shippingDialogVisible" :title="shippingForm.id ? '编辑运费模板' : '新增运费模板'" width="520px">
      <el-form :model="shippingForm" :rules="shippingRules" ref="shippingFormRef" label-width="100px">
        <el-form-item label="模板名称" prop="name">
          <el-input v-model="shippingForm.name" placeholder="请输入模板名称" />
        </el-form-item>
        <el-form-item label="运费类型" prop="type">
          <el-select v-model="shippingForm.type" style="width:100%">
            <el-option v-for="(label, key) in SHIPPING_TYPES" :key="key" :label="label" :value="key" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="shippingForm.type !== 'free'" label="基础运费">
          <el-input-number v-model="shippingForm.basePrice" :min="0" :step="1" />
          <span style="margin-left:8px">元</span>
        </el-form-item>
        <el-form-item label="免邮门槛">
          <el-input-number v-model="shippingForm.freeThreshold" :min="0" :step="10" />
          <span style="margin-left:8px">元（0表示无免邮）</span>
        </el-form-item>
        <el-form-item label="适用地区" prop="regions">
          <el-input v-model="shippingForm.regions" placeholder="如：全国 或 新疆、西藏" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="shippingForm.description" placeholder="模板描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="shippingDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitShipping">确认</el-button>
      </template>
    </el-dialog>

    <!-- Role Dialog -->
    <el-dialog v-model="roleDialogVisible" :title="roleForm.id ? '编辑角色' : '新增角色'" width="520px">
      <el-form :model="roleForm" :rules="roleRules" ref="roleFormRef" label-width="80px">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="roleForm.name" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="roleForm.description" placeholder="角色描述" />
        </el-form-item>
        <el-form-item label="权限" prop="permissions">
          <el-checkbox-group v-model="roleForm.permissions">
            <el-checkbox v-for="p in ALL_PERMISSIONS" :key="p.key" :value="p.key">{{ p.label }}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="roleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitRole">确认</el-button>
      </template>
    </el-dialog>

    <!-- Admin Dialog -->
    <el-dialog v-model="adminDialogVisible" :title="adminForm.id ? '编辑管理员' : '新增管理员'" width="480px">
      <el-form :model="adminForm" :rules="adminRules" ref="adminFormRef" label-width="80px">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="adminForm.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="adminForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="角色" prop="roleId">
          <el-select v-model="adminForm.roleId" style="width:100%">
            <el-option v-for="r in store.roles" :key="r.id" :label="r.name" :value="r.id" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="!adminForm.id" label="初始密码">
          <el-input model-value="Admin@123456" readonly />
          <div style="font-size:12px;color:#909399;margin-top:4px">管理员首次登录后请修改密码</div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="adminDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAdmin">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { useAdminSettingsStore, SHIPPING_TYPES, ALL_PERMISSIONS } from '@/admin/stores/adminSettings'

const store = useAdminSettingsStore()
onMounted(() => store.init())

const activeTab = ref('shipping')

// ---- Shipping ----
const shippingDialogVisible = ref(false)
const shippingFormRef = ref(null)
const shippingForm = ref({})
const shippingRules = {
  name: [{ required: true, message: '请输入模板名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择类型', trigger: 'change' }],
  regions: [{ required: true, message: '请填写适用地区', trigger: 'blur' }],
}

function openShippingDialog(tmpl = null) {
  shippingForm.value = tmpl
    ? { ...tmpl }
    : { id: null, name: '', type: 'fixed', basePrice: 10, freeThreshold: 99, regions: '全国', description: '', enabled: true }
  shippingDialogVisible.value = true
}

function submitShipping() {
  shippingFormRef.value.validate(valid => {
    if (!valid) return
    if (shippingForm.value.id) {
      store.updateShipping(shippingForm.value.id, { ...shippingForm.value })
      ElMessage.success('模板已更新')
    } else {
      store.addShipping({ ...shippingForm.value })
      ElMessage.success('模板已添加')
    }
    shippingDialogVisible.value = false
  })
}

// ---- Roles ----
const roleDialogVisible = ref(false)
const roleFormRef = ref(null)
const roleForm = ref({})
const roleRules = {
  name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
  permissions: [{ type: 'array', min: 1, message: '请至少选择一个权限', trigger: 'change' }],
}

function openRoleDialog(role = null) {
  roleForm.value = role
    ? { ...role, permissions: [...role.permissions] }
    : { id: null, name: '', description: '', permissions: [] }
  roleDialogVisible.value = true
}

function submitRole() {
  roleFormRef.value.validate(valid => {
    if (!valid) return
    if (roleForm.value.id) {
      store.updateRole(roleForm.value.id, { ...roleForm.value })
      ElMessage.success('角色已更新')
    } else {
      store.addRole({ ...roleForm.value })
      ElMessage.success('角色已添加')
    }
    roleDialogVisible.value = false
  })
}

function permLabel(key) {
  return ALL_PERMISSIONS.find(p => p.key === key)?.label || key
}

// ---- Admins ----
const adminDialogVisible = ref(false)
const adminFormRef = ref(null)
const adminForm = ref({})
const adminRules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' },
  ],
  roleId: [{ required: true, message: '请选择角色', trigger: 'change' }],
}

function openAdminDialog(admin = null) {
  adminForm.value = admin
    ? { ...admin }
    : { id: null, name: '', email: '', roleId: null }
  adminDialogVisible.value = true
}

function submitAdmin() {
  adminFormRef.value.validate(valid => {
    if (!valid) return
    if (adminForm.value.id) {
      store.updateAdmin(adminForm.value.id, { ...adminForm.value })
      ElMessage.success('管理员已更新')
    } else {
      store.addAdmin({ ...adminForm.value })
      ElMessage.success('管理员已添加')
    }
    adminDialogVisible.value = false
  })
}

// ---- Audit Logs ----
const logTypeFilter = ref('')
const logAdminFilter = ref(null)
const logStatusFilter = ref('')

const filteredLogs = computed(() => {
  return store.auditLogs.filter(log => {
    if (logTypeFilter.value && log.type !== logTypeFilter.value) return false
    if (logAdminFilter.value && log.adminId !== logAdminFilter.value) return false
    if (logStatusFilter.value && log.status !== logStatusFilter.value) return false
    return true
  })
})
</script>

<style scoped>
.settings-page { padding: 24px; }
.page-title { font-size: 20px; font-weight: 600; color: #303133; margin-bottom: 20px; }
.tab-content { padding: 16px 0; }
.tab-toolbar { margin-bottom: 12px; display: flex; gap: 8px; align-items: center; }
.section-title { font-size: 15px; font-weight: 600; color: #303133; margin-bottom: 12px; }
</style>
