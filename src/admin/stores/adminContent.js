import { defineStore } from 'pinia'
import { ref } from 'vue'

// =================== NOTICES ===================
export const NOTICE_TYPES = { system: '系统通知', promo: '促销活动', maintain: '维护公告', other: '其他' }
export const NOTICE_STATUS = { published: '已发布', draft: '草稿' }

function generateNotices() {
  const now = new Date()
  const dateStr = (daysAgo) => {
    const d = new Date(now)
    d.setDate(d.getDate() - daysAgo)
    return d.toLocaleDateString('zh-CN')
  }
  return [
    { id: 1, title: '平台618大促活动公告', type: 'promo', status: 'published', priority: true, content: '尊敬的用户，平台即将举办618年中大促活动，全场商品低至5折，满300减50，活动时间为6月1日至6月20日，敬请期待！', createdAt: dateStr(2), views: 1240 },
    { id: 2, title: '系统升级维护通知', type: 'maintain', status: 'published', priority: false, content: '为提升平台体验，平台将于本周日凌晨2:00-4:00进行系统升级维护，届时部分功能将暂时不可用，给您带来不便敬请谅解。', createdAt: dateStr(5), views: 856 },
    { id: 3, title: '新版App上线通知', type: 'system', status: 'published', priority: false, content: '全新App v3.0正式上线，带来全新购物体验，新增AR试穿、智能推荐等功能，欢迎下载体验。', createdAt: dateStr(10), views: 2103 },
    { id: 4, title: '节假日客服公告', type: 'other', status: 'draft', priority: false, content: '五一假期期间（5月1日-5月5日），客服工作时间调整为9:00-18:00，其余时间请通过在线客服留言，我们将在工作日优先处理。', createdAt: dateStr(1), views: 0 },
    { id: 5, title: '积分政策更新说明', type: 'system', status: 'published', priority: false, content: '即日起，平台积分兑换比例调整为100积分=1元，同时新增积分有效期规则，请登录账户查看详情。', createdAt: dateStr(15), views: 4521 },
  ]
}

// =================== ARTICLES ===================
export const ARTICLE_CATEGORIES = { shipping: '配送说明', return: '退换货', payment: '支付说明', account: '账号安全', coupon: '优惠券使用', other: '其他' }

function generateArticles() {
  const now = new Date()
  const dateStr = (d) => {
    const dt = new Date(now)
    dt.setDate(dt.getDate() - d)
    return dt.toLocaleDateString('zh-CN')
  }
  return [
    { id: 1, title: '如何申请退款退货？', category: 'return', status: 'published', views: 8902, updatedAt: dateStr(3), content: '退款退货流程：1. 登录账号进入"我的订单"；2. 找到对应订单点击"申请退款"；3. 填写退款原因并提交；4. 等待商家审核（1-3个工作日）；5. 审核通过后按指引寄回商品；6. 退款将在收到商品后3个工作日内原路退回。' },
    { id: 2, title: '支持哪些支付方式？', category: 'payment', status: 'published', views: 6230, updatedAt: dateStr(7), content: '平台支持以下支付方式：微信支付、支付宝、银联卡、花呗分期、积分抵扣。所有支付均采用加密传输，安全可靠。' },
    { id: 3, title: '快递配送时效说明', category: 'shipping', status: 'published', views: 5441, updatedAt: dateStr(10), content: '普通快递：3-7个工作日；次日达：下午3点前下单当天发货，次日送达；当日达：仅限部分城市，当日9:00前下单当日送达。' },
    { id: 4, title: '优惠券使用规则', category: 'coupon', status: 'published', views: 3102, updatedAt: dateStr(5), content: '1. 每笔订单限用一张优惠券；2. 折扣券与满减券不可叠加使用；3. 优惠券有使用有效期，请及时使用；4. 部分商品不参与优惠券活动；5. 优惠券不可转让、不可提现。' },
    { id: 5, title: '账号安全保护指南', category: 'account', status: 'published', views: 2890, updatedAt: dateStr(20), content: '为保护您的账号安全：1. 设置强密码（8位以上含字母数字特殊符号）；2. 开启手机号验证；3. 不在公共设备保存密码；4. 定期检查登录记录；5. 发现异常及时联系客服。' },
    { id: 6, title: '发票开具说明（草稿）', category: 'other', status: 'draft', views: 0, updatedAt: dateStr(1), content: '电子发票可在订单完成后7天内申请，纸质发票需联系客服处理...' },
  ]
}

// =================== REVIEWS ===================
export const REVIEW_STATUS = { pending: '待审核', approved: '已通过', hidden: '已隐藏' }
const PRODUCT_NAMES = ['iPhone 15 Pro Max', '华为 Mate 60 Pro', '小米14 Pro', 'MacBook Pro 14"', 'Nike Air Max', '海蓝之谜精华液', '戴森 V15 吸尘器', 'AirPods Pro 2', '联想拯救者 R9000P', '索尼 WH-1000XM5']
const USER_NAMES = ['张三', '李四', '王五', '赵六', '陈七', '刘八', '孙九', '周十', '吴一', '郑二']
const REVIEW_TEXTS = [
  '质量很好，物流很快，非常满意！',
  '东西不错，和图片一样，下次还买。',
  '包装精美，商品完好，好评！',
  '性价比很高，推荐购买。',
  '有点贵，但质量确实好，值得！',
  '一般般，和描述有点出入。',
  '客服态度很好，解决了我的问题。',
  '已经是第三次购买了，一如既往的好。',
  '很快收到，包装完好，功能正常。',
  '就是等待时间有点长，产品本身不错。',
]

function generateReviews(count = 30) {
  const now = new Date()
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(now)
    d.setDate(d.getDate() - Math.floor(Math.random() * 30))
    return {
      id: 1000 + i + 1,
      userId: 2000 + i,
      userName: USER_NAMES[i % USER_NAMES.length] + (i >= USER_NAMES.length ? i : ''),
      productId: 100 + (i % 10),
      productName: PRODUCT_NAMES[i % PRODUCT_NAMES.length],
      rating: Math.floor(Math.random() * 3) + 3, // 3-5 stars
      content: REVIEW_TEXTS[i % REVIEW_TEXTS.length],
      images: i % 4 === 0 ? [`https://picsum.photos/80/80?random=${i + 100}`] : [],
      status: i % 5 === 0 ? 'pending' : i % 7 === 0 ? 'hidden' : 'approved',
      isPinned: i % 12 === 0 && i > 0,
      createdAt: d.toLocaleDateString('zh-CN'),
    }
  })
}

let noticeCounter = 100
let articleCounter = 100
let reviewCounter = 2000

export const useAdminContentStore = defineStore('adminContent', () => {
  const notices = ref([])
  const articles = ref([])
  const reviews = ref([])
  const loading = ref(false)

  function init() {
    if (notices.value.length) return
    loading.value = true
    setTimeout(() => {
      notices.value = generateNotices()
      articles.value = generateArticles()
      reviews.value = generateReviews(30)
      loading.value = false
    }, 200)
  }

  // ---- Notices ----
  function addNotice(data) {
    noticeCounter++
    const now = new Date().toLocaleDateString('zh-CN')
    notices.value.unshift({ id: noticeCounter, views: 0, createdAt: now, ...data })
  }
  function updateNotice(id, data) {
    const n = notices.value.find(n => n.id === id)
    if (n) Object.assign(n, data)
  }
  function deleteNotice(id) {
    notices.value = notices.value.filter(n => n.id !== id)
  }
  function publishNotice(id) {
    const n = notices.value.find(n => n.id === id)
    if (n) n.status = 'published'
  }

  // ---- Articles ----
  function addArticle(data) {
    articleCounter++
    const now = new Date().toLocaleDateString('zh-CN')
    articles.value.unshift({ id: articleCounter, views: 0, updatedAt: now, ...data })
  }
  function updateArticle(id, data) {
    const a = articles.value.find(a => a.id === id)
    if (a) { Object.assign(a, data); a.updatedAt = new Date().toLocaleDateString('zh-CN') }
  }
  function deleteArticle(id) {
    articles.value = articles.value.filter(a => a.id !== id)
  }

  // ---- Reviews ----
  function approveReview(id) {
    const r = reviews.value.find(r => r.id === id)
    if (r) r.status = 'approved'
  }
  function hideReview(id) {
    const r = reviews.value.find(r => r.id === id)
    if (r) r.status = 'hidden'
  }
  function pinReview(id) {
    const r = reviews.value.find(r => r.id === id)
    if (r) r.isPinned = !r.isPinned
  }
  function deleteReview(id) {
    reviews.value = reviews.value.filter(r => r.id !== id)
  }

  return {
    notices, articles, reviews, loading,
    init,
    addNotice, updateNotice, deleteNotice, publishNotice,
    addArticle, updateArticle, deleteArticle,
    approveReview, hideReview, pinReview, deleteReview,
  }
})
