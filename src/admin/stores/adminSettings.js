import { defineStore } from 'pinia'
import { ref } from 'vue'

// =================== SHIPPING ===================
export const SHIPPING_TYPES = { free: '包邮', fixed: '固定运费', tiered: '阶梯运费' }

function generateShippingTemplates() {
  return [
    { id: 1, name: '默认运费模板', type: 'fixed', basePrice: 10, freeThreshold: 99, enabled: true, regions: '全国', description: '满99元包邮，否则收取10元运费' },
    { id: 2, name: '全场包邮', type: 'free', basePrice: 0, freeThreshold: 0, enabled: false, regions: '全国', description: '全场所有商品免运费' },
    { id: 3, name: '偏远地区模板', type: 'tiered', basePrice: 20, freeThreshold: 299, enabled: true, regions: '新疆、西藏、内蒙古、青海', description: '偏远地区加收运费，满299包邮' },
  ]
}

// =================== TAX ===================
function generateTaxSettings() {
  return [
    { id: 1, category: '电子产品', rate: 13, enabled: true },
    { id: 2, category: '服装鞋帽', rate: 13, enabled: true },
    { id: 3, category: '食品饮料', rate: 9, enabled: true },
    { id: 4, category: '图书文具', rate: 9, enabled: false },
    { id: 5, category: '美妆护肤', rate: 13, enabled: true },
  ]
}

// =================== ROLES ===================
export const ALL_PERMISSIONS = [
  { key: 'dashboard', label: '控制台' },
  { key: 'products', label: '商品管理' },
  { key: 'orders', label: '订单管理' },
  { key: 'users', label: '用户管理' },
  { key: 'marketing', label: '营销工具' },
  { key: 'finance', label: '财务管理' },
  { key: 'content', label: '内容管理' },
  { key: 'analytics', label: '数据统计' },
  { key: 'settings', label: '系统设置' },
]

function generateRoles() {
  return [
    { id: 1, name: '超级管理员', description: '拥有所有权限', permissions: ALL_PERMISSIONS.map(p => p.key), adminCount: 1, isSystem: true },
    { id: 2, name: '运营人员', description: '负责商品、营销、内容管理', permissions: ['dashboard', 'products', 'marketing', 'content', 'analytics'], adminCount: 3, isSystem: false },
    { id: 3, name: '财务人员', description: '负责财务与数据统计', permissions: ['dashboard', 'finance', 'analytics'], adminCount: 2, isSystem: false },
    { id: 4, name: '客服人员', description: '负责订单和用户管理', permissions: ['dashboard', 'orders', 'users'], adminCount: 5, isSystem: false },
  ]
}

function generateAdmins() {
  const now = new Date()
  const dateStr = (d) => {
    const dt = new Date(now)
    dt.setDate(dt.getDate() - d)
    return dt.toLocaleString('zh-CN', { hour12: false })
  }
  return [
    { id: 1, name: '系统管理员', email: 'admin@platform.com', roleId: 1, roleName: '超级管理员', status: 'active', lastLogin: dateStr(0), createdAt: '2023-01-01' },
    { id: 2, name: '张运营', email: 'zhang@platform.com', roleId: 2, roleName: '运营人员', status: 'active', lastLogin: dateStr(1), createdAt: '2023-03-15' },
    { id: 3, name: '李运营', email: 'li@platform.com', roleId: 2, roleName: '运营人员', status: 'active', lastLogin: dateStr(3), createdAt: '2023-05-20' },
    { id: 4, name: '王财务', email: 'wang@platform.com', roleId: 3, roleName: '财务人员', status: 'active', lastLogin: dateStr(2), createdAt: '2023-04-10' },
    { id: 5, name: '赵客服', email: 'zhao@platform.com', roleId: 4, roleName: '客服人员', status: 'active', lastLogin: dateStr(0), createdAt: '2023-06-01' },
    { id: 6, name: '陈客服', email: 'chen@platform.com', roleId: 4, roleName: '客服人员', status: 'disabled', lastLogin: dateStr(30), createdAt: '2023-07-01' },
  ]
}

// =================== AUDIT LOGS ===================
const LOG_ACTIONS = [
  { action: '登录系统', target: '登录认证', type: 'auth' },
  { action: '新增商品', target: '商品管理', type: 'product' },
  { action: '修改价格', target: '商品管理', type: 'product' },
  { action: '发布公告', target: '内容管理', type: 'content' },
  { action: '发放优惠券', target: '营销工具', type: 'marketing' },
  { action: '修改订单状态', target: '订单管理', type: 'order' },
  { action: '禁用用户', target: '用户管理', type: 'user' },
  { action: '重置密码', target: '用户管理', type: 'user' },
  { action: '修改系统设置', target: '系统设置', type: 'settings' },
  { action: '导出财务报表', target: '财务管理', type: 'finance' },
]
const ADMIN_NAMES = ['系统管理员', '张运营', '李运营', '王财务', '赵客服']
const IPS = ['192.168.1.100', '10.0.0.15', '172.16.0.32', '192.168.2.50', '10.10.1.8']

function generateAuditLogs(count = 50) {
  const now = new Date()
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(now)
    d.setMinutes(d.getMinutes() - i * 15)
    const action = LOG_ACTIONS[i % LOG_ACTIONS.length]
    return {
      id: 5000 + i + 1,
      adminId: (i % 5) + 1,
      adminName: ADMIN_NAMES[i % ADMIN_NAMES.length],
      action: action.action,
      target: action.target,
      type: action.type,
      ip: IPS[i % IPS.length],
      time: d.toLocaleString('zh-CN', { hour12: false }),
      status: i % 10 === 0 ? 'fail' : 'success',
      detail: `操作详情：${action.action}，操作目标：${action.target}`,
    }
  })
}

let shippingCounter = 100
let taxCounter = 100
let roleCounter = 100
let adminCounter = 100

export const useAdminSettingsStore = defineStore('adminSettings', () => {
  const shippingTemplates = ref([])
  const taxSettings = ref([])
  const roles = ref([])
  const admins = ref([])
  const auditLogs = ref([])
  const loading = ref(false)

  function init() {
    if (shippingTemplates.value.length) return
    loading.value = true
    setTimeout(() => {
      shippingTemplates.value = generateShippingTemplates()
      taxSettings.value = generateTaxSettings()
      roles.value = generateRoles()
      admins.value = generateAdmins()
      auditLogs.value = generateAuditLogs(50)
      loading.value = false
    }, 200)
  }

  // ---- Shipping ----
  function addShipping(data) {
    shippingCounter++
    shippingTemplates.value.push({ id: shippingCounter, ...data })
  }
  function updateShipping(id, data) {
    const s = shippingTemplates.value.find(s => s.id === id)
    if (s) Object.assign(s, data)
  }
  function deleteShipping(id) {
    shippingTemplates.value = shippingTemplates.value.filter(s => s.id !== id)
  }
  function toggleShipping(id) {
    const s = shippingTemplates.value.find(s => s.id === id)
    if (s) s.enabled = !s.enabled
  }

  // ---- Tax ----
  function updateTax(id, data) {
    const t = taxSettings.value.find(t => t.id === id)
    if (t) Object.assign(t, data)
  }
  function toggleTax(id) {
    const t = taxSettings.value.find(t => t.id === id)
    if (t) t.enabled = !t.enabled
  }

  // ---- Roles ----
  function addRole(data) {
    roleCounter++
    roles.value.push({ id: roleCounter, adminCount: 0, isSystem: false, ...data })
  }
  function updateRole(id, data) {
    const r = roles.value.find(r => r.id === id)
    if (r) Object.assign(r, data)
  }
  function deleteRole(id) {
    roles.value = roles.value.filter(r => r.id !== id)
  }

  // ---- Admins ----
  function addAdmin(data) {
    adminCounter++
    const role = roles.value.find(r => r.id === data.roleId)
    admins.value.push({
      id: adminCounter,
      roleName: role?.name || '',
      status: 'active',
      lastLogin: '-',
      createdAt: new Date().toLocaleDateString('zh-CN'),
      ...data,
    })
    if (role) role.adminCount++
  }
  function updateAdmin(id, data) {
    const a = admins.value.find(a => a.id === id)
    if (a) {
      if (data.roleId && data.roleId !== a.roleId) {
        const oldRole = roles.value.find(r => r.id === a.roleId)
        if (oldRole) oldRole.adminCount = Math.max(0, oldRole.adminCount - 1)
        const newRole = roles.value.find(r => r.id === data.roleId)
        if (newRole) { newRole.adminCount++; data.roleName = newRole.name }
      }
      Object.assign(a, data)
    }
  }
  function toggleAdmin(id) {
    const a = admins.value.find(a => a.id === id)
    if (a) a.status = a.status === 'active' ? 'disabled' : 'active'
  }

  return {
    shippingTemplates, taxSettings, roles, admins, auditLogs, loading,
    init,
    addShipping, updateShipping, deleteShipping, toggleShipping,
    updateTax, toggleTax,
    addRole, updateRole, deleteRole,
    addAdmin, updateAdmin, toggleAdmin,
  }
})
