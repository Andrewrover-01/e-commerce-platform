<template>
  <div class="admin-orders-page">
    <div class="page-title">订单管理</div>

    <!-- Filter bar -->
    <el-card shadow="never" class="filter-card">
      <el-form inline>
        <el-form-item label="订单号">
          <el-input v-model="filter.orderNo" placeholder="输入订单号" clearable style="width:170px" />
        </el-form-item>
        <el-form-item label="买家">
          <el-input v-model="filter.buyer" placeholder="买家姓名" clearable style="width:110px" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filter.status" placeholder="全部状态" clearable style="width:120px">
            <el-option v-for="(label, val) in ORDER_STATUS" :key="val" :label="label" :value="val" />
          </el-select>
        </el-form-item>
        <el-form-item label="下单时间">
          <el-date-picker
            v-model="filter.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始"
            end-placeholder="结束"
            style="width:240px"
            value-format="YYYY-MM-DD"
          />
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
        <el-table-column label="订单号" prop="orderNo" width="160" />
        <el-table-column label="买家" prop="buyer" width="80" />
        <el-table-column label="商品" min-width="200">
          <template #default="{ row }">
            <div v-for="item in row.items" :key="item.name" class="order-item-row">
              <el-image :src="item.image" class="order-item-img" fit="cover" />
              <span class="order-item-name">{{ item.name }} ×{{ item.quantity }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="金额" width="100">
          <template #default="{ row }">
            <span class="order-amount">¥{{ row.totalAmount.toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)" size="small">{{ ORDER_STATUS[row.status] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="下单时间" prop="createdAt" width="160" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="viewDetail(row)">详情</el-button>
            <el-button v-if="row.status === 'paid'" link type="success" @click="openShipDialog(row)">发货</el-button>
            <el-button v-if="row.status === 'shipped'" link type="warning" @click="confirmDelivery(row)">确认收货</el-button>
            <el-button v-if="row.status === 'shipped' || row.status === 'delivered'" link @click="printLabel(row)">打印快递单</el-button>
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

    <!-- Ship Dialog -->
    <el-dialog v-model="shipDialogVisible" title="填写发货信息" width="420px" destroy-on-close>
      <el-form :model="shipForm" label-width="90px">
        <el-form-item label="快递公司">
          <el-select v-model="shipForm.shippingCompany" style="width:100%">
            <el-option v-for="c in LOGISTICS_LIST" :key="c" :label="c" :value="c" />
          </el-select>
        </el-form-item>
        <el-form-item label="快递单号">
          <el-input v-model="shipForm.trackingNo" placeholder="请输入快递单号" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="shipDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitShip">确认发货</el-button>
      </template>
    </el-dialog>

    <!-- Order Detail Drawer -->
    <el-drawer v-model="detailDrawerVisible" title="订单详情" size="480px">
      <div v-if="detailOrder" class="detail-content">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="订单号">{{ detailOrder.orderNo }}</el-descriptions-item>
          <el-descriptions-item label="买家">{{ detailOrder.buyer }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ detailOrder.buyerPhone }}</el-descriptions-item>
          <el-descriptions-item label="收货地址">{{ detailOrder.address }}</el-descriptions-item>
          <el-descriptions-item label="订单状态">
            <el-tag :type="statusTagType(detailOrder.status)" size="small">{{ ORDER_STATUS[detailOrder.status] }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="下单时间">{{ detailOrder.createdAt }}</el-descriptions-item>
          <el-descriptions-item v-if="detailOrder.shippingCompany" label="快递公司">{{ detailOrder.shippingCompany }}</el-descriptions-item>
          <el-descriptions-item v-if="detailOrder.trackingNo" label="快递单号">{{ detailOrder.trackingNo }}</el-descriptions-item>
          <el-descriptions-item v-if="detailOrder.shippedAt" label="发货时间">{{ detailOrder.shippedAt }}</el-descriptions-item>
          <el-descriptions-item v-if="detailOrder.deliveredAt" label="签收时间">{{ detailOrder.deliveredAt }}</el-descriptions-item>
        </el-descriptions>

        <div class="detail-section-title">商品明细</div>
        <div v-for="item in detailOrder.items" :key="item.name" class="detail-item">
          <el-image :src="item.image" class="detail-item-img" fit="cover" />
          <div class="detail-item-info">
            <div>{{ item.name }}</div>
            <div class="detail-item-meta">¥{{ item.price }} × {{ item.quantity }}</div>
          </div>
          <div class="detail-item-subtotal">¥{{ (item.price * item.quantity).toLocaleString() }}</div>
        </div>
        <div class="detail-total">合计：<span>¥{{ detailOrder.totalAmount.toLocaleString() }}</span></div>
      </div>
    </el-drawer>

    <!-- Print Dialog -->
    <el-dialog v-model="printDialogVisible" title="快递单打印预览" width="480px">
      <div v-if="printOrder" class="print-preview" id="print-area">
        <div class="print-header">
          <strong>电商平台 快递单</strong>
        </div>
        <el-descriptions :column="1" border size="small">
          <el-descriptions-item label="快递公司">{{ printOrder.shippingCompany }}</el-descriptions-item>
          <el-descriptions-item label="快递单号">{{ printOrder.trackingNo }}</el-descriptions-item>
          <el-descriptions-item label="收件人">{{ printOrder.buyer }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ printOrder.buyerPhone }}</el-descriptions-item>
          <el-descriptions-item label="收货地址">{{ printOrder.address }}</el-descriptions-item>
          <el-descriptions-item label="订单号">{{ printOrder.orderNo }}</el-descriptions-item>
          <el-descriptions-item label="商品">
            {{ printOrder.items.map(i => `${i.name}×${i.quantity}`).join('、') }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <el-button @click="printDialogVisible = false">关闭</el-button>
        <el-button type="primary" :icon="Printer" @click="doPrint">打印</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Printer } from '@element-plus/icons-vue'
import { useAdminOrdersStore, ORDER_STATUS } from '@/admin/stores/adminOrders'

const store = useAdminOrdersStore()
onMounted(() => store.init())

const LOGISTICS_LIST = ['顺丰速运', '京东快递', '中通快递', '圆通速递', '韵达快递', '百世快递', 'EMS']

// ---------- filter ----------
const filter = ref({ orderNo: '', buyer: '', status: '', dateRange: null })
function resetFilter() { filter.value = { orderNo: '', buyer: '', status: '', dateRange: null } }

const filteredList = computed(() => {
  let list = store.orders
  const { orderNo, buyer, status, dateRange } = filter.value
  if (orderNo) list = list.filter(o => o.orderNo.includes(orderNo))
  if (buyer) list = list.filter(o => o.buyer.includes(buyer))
  if (status) list = list.filter(o => o.status === status)
  if (dateRange && dateRange[0]) {
    const [start, end] = dateRange
    list = list.filter(o => {
      const d = o.createdAt.slice(0, 10)
      return d >= start && d <= end
    })
  }
  return list
})

const currentPage = ref(1)
const pageSize = ref(15)
const pagedList = computed(() => {
  const s = (currentPage.value - 1) * pageSize.value
  return filteredList.value.slice(s, s + pageSize.value)
})

function statusTagType(status) {
  const map = { pending_payment: 'info', paid: 'warning', shipped: '', delivered: 'success', cancelled: 'danger', refunding: 'danger', refunded: 'info' }
  return map[status] ?? ''
}

// ---------- ship ----------
const shipDialogVisible = ref(false)
const shipTargetId = ref(null)
const shipForm = ref({ shippingCompany: '顺丰速运', trackingNo: '' })

function openShipDialog(order) {
  shipTargetId.value = order.id
  shipForm.value = { shippingCompany: '顺丰速运', trackingNo: '' }
  shipDialogVisible.value = true
}
function submitShip() {
  if (!shipForm.value.trackingNo.trim()) { ElMessage.error('请输入快递单号'); return }
  store.shipOrder(shipTargetId.value, shipForm.value)
  ElMessage.success('发货成功')
  shipDialogVisible.value = false
}

// ---------- confirm delivery ----------
async function confirmDelivery(order) {
  await ElMessageBox.confirm(`确认订单 ${order.orderNo} 已签收？`, '确认收货', { type: 'warning' })
  store.confirmDelivery(order.id)
  ElMessage.success('已确认收货')
}

// ---------- detail drawer ----------
const detailDrawerVisible = ref(false)
const detailOrder = ref(null)
function viewDetail(order) {
  detailOrder.value = order
  detailDrawerVisible.value = true
}

// ---------- print ----------
const printDialogVisible = ref(false)
const printOrder = ref(null)
function printLabel(order) {
  printOrder.value = order
  printDialogVisible.value = true
}
function doPrint() {
  window.print()
}
</script>

<style scoped>
.admin-orders-page { padding: 24px; }
.page-title { font-size: 20px; font-weight: 600; color: #303133; margin-bottom: 16px; }
.filter-card { margin-bottom: 12px; }
.filter-card :deep(.el-card__body) { padding: 16px 16px 0; }
.table-card :deep(.el-card__body) { padding: 0; }
.order-item-row { display: flex; align-items: center; gap: 6px; padding: 2px 0; }
.order-item-img { width: 36px; height: 36px; border-radius: 4px; flex-shrink: 0; }
.order-item-name { font-size: 12px; color: #606266; }
.order-amount { color: #f56c6c; font-weight: 600; }
.detail-content { padding: 0 4px; }
.detail-section-title { font-size: 14px; font-weight: 600; color: #303133; margin: 16px 0 8px; }
.detail-item { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid #f0f0f0; }
.detail-item-img { width: 52px; height: 52px; border-radius: 4px; flex-shrink: 0; }
.detail-item-info { flex: 1; font-size: 13px; }
.detail-item-meta { font-size: 12px; color: #909399; margin-top: 4px; }
.detail-item-subtotal { font-size: 14px; font-weight: 600; color: #f56c6c; }
.detail-total { text-align: right; margin-top: 12px; font-size: 14px; }
.detail-total span { color: #f56c6c; font-size: 18px; font-weight: 700; }
.print-header { text-align: center; font-size: 18px; padding: 12px 0 16px; border-bottom: 2px solid #303133; margin-bottom: 12px; }
@media print {
  body > * { display: none !important; }
  #print-area { display: block !important; position: fixed; top: 0; left: 0; width: 100%; padding: 24px; }
}
</style>
