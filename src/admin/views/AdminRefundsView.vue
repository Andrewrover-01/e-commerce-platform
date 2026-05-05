<template>
  <div class="admin-refunds-page">
    <div class="page-title">退款/售后管理</div>

    <!-- Filter bar -->
    <el-card shadow="never" class="filter-card">
      <el-form inline>
        <el-form-item label="订单号">
          <el-input v-model="filter.orderNo" placeholder="输入订单号" clearable style="width:170px" />
        </el-form-item>
        <el-form-item label="买家">
          <el-input v-model="filter.buyer" placeholder="买家姓名" clearable style="width:110px" />
        </el-form-item>
        <el-form-item label="退款状态">
          <el-select v-model="filter.refundStatus" placeholder="全部" clearable style="width:110px">
            <el-option v-for="(label, val) in REFUND_STATUS" :key="val" :label="label" :value="val" />
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
        <el-table-column label="订单号" prop="orderNo" width="160" />
        <el-table-column label="买家" prop="buyer" width="80" />
        <el-table-column label="退款原因" min-width="160">
          <template #default="{ row }">{{ row.refund?.reason }}</template>
        </el-table-column>
        <el-table-column label="退款金额" width="110">
          <template #default="{ row }">
            <span class="refund-amount">¥{{ row.refund?.amount?.toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column label="申请时间" width="160">
          <template #default="{ row }">{{ row.refund?.applyTime }}</template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="refundTagType(row.refund?.refundStatus)" size="small">
              {{ REFUND_STATUS[row.refund?.refundStatus] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="viewDetail(row)">详情</el-button>
            <template v-if="row.refund?.refundStatus === 'pending'">
              <el-popconfirm title="确认同意退款？退款将直接原路返回。" @confirm="approve(row)">
                <template #reference>
                  <el-button link type="success">同意退款</el-button>
                </template>
              </el-popconfirm>
              <el-button link type="danger" @click="openRejectDialog(row)">拒绝</el-button>
            </template>
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

    <!-- Reject Dialog -->
    <el-dialog v-model="rejectDialogVisible" title="拒绝退款" width="400px" destroy-on-close>
      <el-form label-width="80px">
        <el-form-item label="拒绝原因">
          <el-input v-model="rejectRemark" type="textarea" :rows="3" placeholder="请填写拒绝原因，将通知买家" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="rejectDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="submitReject">确认拒绝</el-button>
      </template>
    </el-dialog>

    <!-- Detail Drawer -->
    <el-drawer v-model="detailDrawerVisible" title="退款详情" size="440px">
      <div v-if="detailOrder" class="detail-content">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="订单号">{{ detailOrder.orderNo }}</el-descriptions-item>
          <el-descriptions-item label="买家">{{ detailOrder.buyer }}</el-descriptions-item>
          <el-descriptions-item label="退款原因">{{ detailOrder.refund?.reason }}</el-descriptions-item>
          <el-descriptions-item label="退款金额">
            <span class="refund-amount">¥{{ detailOrder.refund?.amount?.toLocaleString() }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="申请时间">{{ detailOrder.refund?.applyTime }}</el-descriptions-item>
          <el-descriptions-item label="退款状态">
            <el-tag :type="refundTagType(detailOrder.refund?.refundStatus)" size="small">
              {{ REFUND_STATUS[detailOrder.refund?.refundStatus] }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item v-if="detailOrder.refund?.remark" label="处理备注">
            {{ detailOrder.refund?.remark }}
          </el-descriptions-item>
        </el-descriptions>

        <div class="detail-section-title">商品明细</div>
        <div v-for="item in detailOrder.items" :key="item.name" class="detail-item">
          <el-image :src="item.image" class="detail-item-img" fit="cover" />
          <div class="detail-item-info">
            <div>{{ item.name }}</div>
            <div class="detail-item-meta">¥{{ item.price }} × {{ item.quantity }}</div>
          </div>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { useAdminOrdersStore, REFUND_STATUS } from '@/admin/stores/adminOrders'

const store = useAdminOrdersStore()
onMounted(() => store.init())

// ---------- filter ----------
const filter = ref({ orderNo: '', buyer: '', refundStatus: '' })
function resetFilter() { filter.value = { orderNo: '', buyer: '', refundStatus: '' } }

const filteredList = computed(() => {
  let list = store.refundOrders
  const { orderNo, buyer, refundStatus } = filter.value
  if (orderNo) list = list.filter(o => o.orderNo.includes(orderNo))
  if (buyer) list = list.filter(o => o.buyer.includes(buyer))
  if (refundStatus) list = list.filter(o => o.refund?.refundStatus === refundStatus)
  return list
})

const currentPage = ref(1)
const pageSize = ref(15)
const pagedList = computed(() => {
  const s = (currentPage.value - 1) * pageSize.value
  return filteredList.value.slice(s, s + pageSize.value)
})

function refundTagType(st) {
  const map = { pending: 'warning', approved: 'success', rejected: 'danger', completed: 'info' }
  return map[st] ?? ''
}

// ---------- actions ----------
function approve(order) {
  store.approveRefund(order.id)
  ElMessage.success('已同意退款，退款将原路返回')
}

const rejectDialogVisible = ref(false)
const rejectTargetId = ref(null)
const rejectRemark = ref('')

function openRejectDialog(order) {
  rejectTargetId.value = order.id
  rejectRemark.value = ''
  rejectDialogVisible.value = true
}
function submitReject() {
  if (!rejectRemark.value.trim()) { ElMessage.error('请填写拒绝原因'); return }
  store.rejectRefund(rejectTargetId.value, rejectRemark.value)
  ElMessage.success('已拒绝退款申请')
  rejectDialogVisible.value = false
}

// ---------- detail ----------
const detailDrawerVisible = ref(false)
const detailOrder = ref(null)
function viewDetail(order) {
  detailOrder.value = order
  detailDrawerVisible.value = true
}
</script>

<style scoped>
.admin-refunds-page { padding: 24px; }
.page-title { font-size: 20px; font-weight: 600; color: #303133; margin-bottom: 16px; }
.filter-card { margin-bottom: 12px; }
.filter-card :deep(.el-card__body) { padding: 16px 16px 0; }
.table-card :deep(.el-card__body) { padding: 0; }
.refund-amount { color: #f56c6c; font-weight: 600; }
.detail-content { padding: 0 4px; }
.detail-section-title { font-size: 14px; font-weight: 600; color: #303133; margin: 16px 0 8px; }
.detail-item { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid #f0f0f0; }
.detail-item-img { width: 52px; height: 52px; border-radius: 4px; flex-shrink: 0; }
.detail-item-info { flex: 1; font-size: 13px; }
.detail-item-meta { font-size: 12px; color: #909399; margin-top: 4px; }
</style>
