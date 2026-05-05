import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// Order status constants
export const ORDER_STATUS = {
  pending_payment: '待付款',
  paid: '待发货',
  shipped: '待收货',
  delivered: '已完成',
  cancelled: '已取消',
  refunding: '退款中',
  refunded: '已退款',
}

export const REFUND_STATUS = {
  pending: '待审核',
  approved: '已同意',
  rejected: '已拒绝',
  completed: '退款完成',
}

function randomDate(daysAgo) {
  const d = new Date()
  d.setDate(d.getDate() - Math.floor(Math.random() * daysAgo))
  d.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60))
  return d.toLocaleString('zh-CN', { hour12: false })
}

const BUYERS = ['张三', '李四', '王五', '赵六', '陈七', '周八', '吴九', '郑十', '刘一一', '陈二二']
const PRODUCTS_SAMPLE = [
  { name: 'iPhone 15 Pro Max', price: 9999 },
  { name: '华为 Mate 60 Pro', price: 6999 },
  { name: '小米14 Pro', price: 4999 },
  { name: 'MacBook Pro 14"', price: 16999 },
  { name: '联想小新Pro 16', price: 6499 },
  { name: '戴森 V15 吸尘器', price: 3999 },
  { name: 'Nike Air Max 2024', price: 899 },
  { name: '海蓝之谜精华液', price: 2200 },
]
const LOGISTICS = ['顺丰速运', '京东快递', '中通快递', '圆通速递', '韵达快递']
const REFUND_REASONS = ['商品质量问题', '七天无理由退货', '发货错误', '商品与描述不符', '买家误拍']
const STATUSES = ['paid', 'paid', 'shipped', 'shipped', 'delivered', 'delivered', 'cancelled', 'refunding']

function generateOrders(count = 80) {
  return Array.from({ length: count }, (_, i) => {
    const id = 10000000 + i + 1
    const status = STATUSES[i % STATUSES.length]
    const buyer = BUYERS[i % BUYERS.length]
    const itemCount = (i % 3) + 1
    const items = Array.from({ length: itemCount }, (_, j) => {
      const p = PRODUCTS_SAMPLE[(i + j) % PRODUCTS_SAMPLE.length]
      return { ...p, quantity: (j % 2) + 1, image: `https://picsum.photos/60/60?random=${i + j}` }
    })
    const totalAmount = items.reduce((s, it) => s + it.price * it.quantity, 0)
    const createdAt = randomDate(60)

    const order = {
      id,
      orderNo: `JD${String(id).padStart(10, '0')}`,
      buyer,
      buyerPhone: `138${String(13800000000 + i).slice(3)}`,
      address: `${buyer}收 北京市朝阳区某街道某小区${i + 1}号`,
      items,
      totalAmount,
      status,
      createdAt,
      paymentTime: status !== 'pending_payment' ? createdAt : null,
    }

    if (status === 'shipped' || status === 'delivered') {
      order.shippingCompany = LOGISTICS[i % LOGISTICS.length]
      order.trackingNo = `SF${String(100000000000 + i)}`
      order.shippedAt = randomDate(30)
    }
    if (status === 'delivered') {
      order.deliveredAt = randomDate(10)
    }
    if (status === 'refunding' || status === 'refunded') {
      order.refund = {
        reason: REFUND_REASONS[i % REFUND_REASONS.length],
        amount: totalAmount,
        applyTime: randomDate(5),
        refundStatus: status === 'refunding' ? 'pending' : 'completed',
        remark: '',
      }
    }
    return order
  })
}

export const useAdminOrdersStore = defineStore('adminOrders', () => {
  const orders = ref([])
  const loading = ref(false)

  function init() {
    if (orders.value.length) return
    loading.value = true
    setTimeout(() => {
      orders.value = generateOrders(80)
      loading.value = false
    }, 200)
  }

  const refundOrders = computed(() =>
    orders.value.filter(o => o.status === 'refunding' || o.status === 'refunded')
  )

  // ---------- Order actions ----------
  function shipOrder(id, { shippingCompany, trackingNo }) {
    const o = orders.value.find(o => o.id === id)
    if (!o) return
    o.status = 'shipped'
    o.shippingCompany = shippingCompany
    o.trackingNo = trackingNo
    o.shippedAt = new Date().toLocaleString('zh-CN', { hour12: false })
  }

  function confirmDelivery(id) {
    const o = orders.value.find(o => o.id === id)
    if (!o) return
    o.status = 'delivered'
    o.deliveredAt = new Date().toLocaleString('zh-CN', { hour12: false })
  }

  function cancelOrder(id) {
    const o = orders.value.find(o => o.id === id)
    if (o && (o.status === 'pending_payment' || o.status === 'paid')) {
      o.status = 'cancelled'
    }
  }

  // ---------- Refund actions ----------
  function approveRefund(id) {
    const o = orders.value.find(o => o.id === id)
    if (!o || !o.refund) return
    o.refund.refundStatus = 'completed'
    o.status = 'refunded'
  }

  function rejectRefund(id, remark) {
    const o = orders.value.find(o => o.id === id)
    if (!o || !o.refund) return
    o.refund.refundStatus = 'rejected'
    o.refund.remark = remark
    o.status = 'delivered'
  }

  return {
    orders, loading, refundOrders,
    init, shipOrder, confirmDelivery, cancelOrder,
    approveRefund, rejectRefund,
  }
})
