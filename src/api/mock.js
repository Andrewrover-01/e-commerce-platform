// Mock product data and API helpers

const categories = [
  { id: 1, name: '手机数码', icon: '📱', sub: ['手机', '平板', '耳机', '智能手表'] },
  { id: 2, name: '电脑办公', icon: '💻', sub: ['笔记本', '台式机', '显示器', '键盘鼠标'] },
  { id: 3, name: '家用电器', icon: '🏠', sub: ['电视', '冰箱', '洗衣机', '空调'] },
  { id: 4, name: '服装配饰', icon: '👔', sub: ['男装', '女装', '童装', '箱包'] },
  { id: 5, name: '食品生鲜', icon: '🥩', sub: ['肉禽蛋奶', '水果蔬菜', '零食饮料', '粮油调味'] },
  { id: 6, name: '图书音像', icon: '📚', sub: ['小说文学', '教育考试', '计算机', '音乐影视'] },
  { id: 7, name: '运动户外', icon: '🏃', sub: ['跑步', '健身', '球类', '户外装备'] },
  { id: 8, name: '美妆护肤', icon: '💄', sub: ['护肤', '彩妆', '香水', '个人护理'] },
  { id: 9, name: '母婴玩具', icon: '🍼', sub: ['奶粉辅食', '玩具', '童车', '孕妇装'] },
  { id: 10, name: '汽车用品', icon: '🚗', sub: ['车载电器', '汽车装饰', '轮胎配件', '安全座椅'] },
  { id: 11, name: '家居家装', icon: '🛋️', sub: ['家具', '床上用品', '收纳', '厨具'] },
  { id: 12, name: '医药保健', icon: '💊', sub: ['维生素', '中药', '医疗器械', '成人保健'] }
]

const products = [
  { id: 1, name: 'Apple iPhone 15 Pro Max 256GB 黑钛色', price: 9999, originalPrice: 10999, image: 'https://picsum.photos/300/300?random=1', rating: 4.9, reviewCount: 28650, category: '手机数码', categoryId: 1, description: '苹果最新旗舰手机，A17 Pro芯片，钛金属边框，ProMotion自适应刷新率', stock: 100, brand: 'Apple', sales: 15600, isNew: false, isHot: true },
  { id: 2, name: '华为 Mate 60 Pro 512GB 雅川青', price: 6999, originalPrice: 7499, image: 'https://picsum.photos/300/300?random=2', rating: 4.8, reviewCount: 19820, category: '手机数码', categoryId: 1, description: '麒麟9000S芯片，卫星通话，超强影像系统', stock: 80, brand: '华为', sales: 12300, isNew: true, isHot: true },
  { id: 3, name: '小米14 Pro 512GB 钛金属版', price: 4999, originalPrice: 5299, image: 'https://picsum.photos/300/300?random=3', rating: 4.7, reviewCount: 9630, category: '手机数码', categoryId: 1, description: '骁龙8 Gen3处理器，徕卡光学镜头', stock: 200, brand: '小米', sales: 8900, isNew: true, isHot: false },
  { id: 4, name: 'MacBook Pro 14英寸 M3 Pro芯片 18G+512G', price: 16999, originalPrice: 17999, image: 'https://picsum.photos/300/300?random=4', rating: 4.9, reviewCount: 5420, category: '电脑办公', categoryId: 2, description: 'M3 Pro芯片，Liquid Retina XDR显示屏，22小时续航', stock: 50, brand: 'Apple', sales: 3200, isNew: false, isHot: true },
  { id: 5, name: '联想小新Pro 16 2024 i7-13700H 32G+1TB', price: 6499, originalPrice: 7299, image: 'https://picsum.photos/300/300?random=5', rating: 4.6, reviewCount: 7810, category: '电脑办公', categoryId: 2, description: '第13代英特尔酷睿，2.5K高刷屏，独显MX550', stock: 150, brand: '联想', sales: 5600, isNew: false, isHot: false },
  { id: 6, name: '索尼 A7M4 全画幅微单相机 套机(28-70mm)', price: 17999, originalPrice: 19999, image: 'https://picsum.photos/300/300?random=6', rating: 4.8, reviewCount: 2340, category: '手机数码', categoryId: 1, description: '3300万像素BSI CMOS，4K60P视频，AI自动对焦', stock: 30, brand: 'Sony', sales: 1200, isNew: false, isHot: true },
  { id: 7, name: '海尔 532升十字对开门冰箱 BCD-532WDPD', price: 3299, originalPrice: 4199, image: 'https://picsum.photos/300/300?random=7', rating: 4.7, reviewCount: 6520, category: '家用电器', categoryId: 3, description: '变频压缩机，风冷无霜，智能控温，超大容量', stock: 60, brand: '海尔', sales: 4300, isNew: false, isHot: false },
  { id: 8, name: '美的 智慧眼 1.5匹 新一级变频冷暖空调挂机', price: 2699, originalPrice: 3199, image: 'https://picsum.photos/300/300?random=8', rating: 4.6, reviewCount: 11200, category: '家用电器', categoryId: 3, description: 'WiFi智能控制，超省电，快速制冷制热', stock: 100, brand: '美的', sales: 9800, isNew: false, isHot: true },
  { id: 9, name: '波司登男士羽绒服2024新款加厚防风保暖外套', price: 1299, originalPrice: 1699, image: 'https://picsum.photos/300/300?random=9', rating: 4.5, reviewCount: 3890, category: '服装配饰', categoryId: 4, description: '90%白鸭绒，防泼水面料，时尚修身版型', stock: 300, brand: '波司登', sales: 6700, isNew: true, isHot: false },
  { id: 10, name: '耐克 Air Max 270 男子运动鞋', price: 899, originalPrice: 1099, image: 'https://picsum.photos/300/300?random=10', rating: 4.7, reviewCount: 8920, category: '运动户外', categoryId: 7, description: '大底气垫缓震，网面透气鞋面，舒适日常穿着', stock: 200, brand: 'Nike', sales: 12000, isNew: false, isHot: true },
  { id: 11, name: '三只松鼠 坚果大礼包 年货礼盒 1358g', price: 129, originalPrice: 159, image: 'https://picsum.photos/300/300?random=11', rating: 4.8, reviewCount: 45600, category: '食品生鲜', categoryId: 5, description: '混合坚果，核桃腰果开心果碧根果等多种坚果组合', stock: 5000, brand: '三只松鼠', sales: 85000, isNew: false, isHot: true },
  { id: 12, name: '《活着》余华 著 精装典藏版', price: 42, originalPrice: 59, image: 'https://picsum.photos/300/300?random=12', rating: 4.9, reviewCount: 128900, category: '图书音像', categoryId: 6, description: '余华经典代表作，荣获意大利格林扎纳-卡佛文学奖', stock: 2000, brand: '作家出版社', sales: 230000, isNew: false, isHot: false },
  { id: 13, name: '戴森 V15 Detect无线吸尘器 宠物版', price: 4990, originalPrice: 5490, image: 'https://picsum.photos/300/300?random=13', rating: 4.8, reviewCount: 7850, category: '家用电器', categoryId: 3, description: '激光除尘技术，HEPA过滤，60分钟续航', stock: 80, brand: 'Dyson', sales: 5200, isNew: false, isHot: true },
  { id: 14, name: '兰蔻 小黑瓶精华肌底液 100ml', price: 980, originalPrice: 1200, image: 'https://picsum.photos/300/300?random=14', rating: 4.6, reviewCount: 32000, category: '美妆护肤', categoryId: 8, description: '夜间修护精华，提亮肤色，改善暗沉', stock: 500, brand: 'Lancôme', sales: 45000, isNew: false, isHot: false },
  { id: 15, name: '乐高 星球大战千年隼 75192', price: 1699, originalPrice: 1799, image: 'https://picsum.photos/300/300?random=15', rating: 4.9, reviewCount: 5600, category: '母婴玩具', categoryId: 9, description: '7541个颗粒，精密还原千年隼飞船，收藏级套装', stock: 100, brand: 'LEGO', sales: 3400, isNew: false, isHot: true },
  { id: 16, name: 'iPad Pro 12.9英寸 M2芯片 256GB WiFi', price: 8999, originalPrice: 9499, image: 'https://picsum.photos/300/300?random=16', rating: 4.8, reviewCount: 12300, category: '手机数码', categoryId: 1, description: 'Liquid Retina XDR显示屏，M2芯片，支持Apple Pencil', stock: 60, brand: 'Apple', sales: 7800, isNew: false, isHot: false },
  { id: 17, name: '索尼 WH-1000XM5 头戴式蓝牙降噪耳机', price: 2399, originalPrice: 2699, image: 'https://picsum.photos/300/300?random=17', rating: 4.8, reviewCount: 19800, category: '手机数码', categoryId: 1, description: '行业领先降噪，30小时续航，高解析音频', stock: 200, brand: 'Sony', sales: 15000, isNew: false, isHot: true },
  { id: 18, name: '小米电视 S85 MiniLED 2024款', price: 5999, originalPrice: 6999, image: 'https://picsum.photos/300/300?random=18', rating: 4.7, reviewCount: 8900, category: '家用电器', categoryId: 3, description: 'MiniLED背光，4K 144Hz，MEMC运动补偿', stock: 50, brand: '小米', sales: 4200, isNew: true, isHot: false },
  { id: 19, name: '安踏 丁宁系列乒乓球鞋 男款', price: 349, originalPrice: 499, image: 'https://picsum.photos/300/300?random=19', rating: 4.5, reviewCount: 4500, category: '运动户外', categoryId: 7, description: '专业乒乓球运动鞋，氮科技中底，耐磨橡胶大底', stock: 300, brand: '安踏', sales: 8900, isNew: false, isHot: false },
  { id: 20, name: '茅台 飞天茅台酒 53度酱香型 500ml', price: 2499, originalPrice: 2599, image: 'https://picsum.photos/300/300?random=20', rating: 5.0, reviewCount: 68900, category: '食品生鲜', categoryId: 5, description: '贵州茅台酒股份有限公司出品，酱香典型，回味悠长', stock: 200, brand: '茅台', sales: 120000, isNew: false, isHot: true },
  { id: 21, name: 'OPPO Find X7 Ultra 1TB 海阔天空', price: 7999, originalPrice: 8499, image: 'https://picsum.photos/300/300?random=21', rating: 4.8, reviewCount: 6700, category: '手机数码', categoryId: 1, description: '天玑9300旗舰芯片，哈苏四主摄系统', stock: 70, brand: 'OPPO', sales: 4500, isNew: true, isHot: false },
  { id: 22, name: '雅诗兰黛 小棕瓶眼霜 15ml', price: 580, originalPrice: 720, image: 'https://picsum.photos/300/300?random=22', rating: 4.7, reviewCount: 88000, category: '美妆护肤', categoryId: 8, description: '改善细纹，淡化黑眼圈，明亮双眸', stock: 800, brand: '雅诗兰黛', sales: 160000, isNew: false, isHot: true },
  { id: 23, name: 'Kindle Scribe 电子书阅读器 64GB', price: 2499, originalPrice: 2799, image: 'https://picsum.photos/300/300?random=23', rating: 4.6, reviewCount: 3400, category: '电脑办公', categoryId: 2, description: '10.2英寸300PPI电子墨水屏，支持手写笔记', stock: 100, brand: 'Amazon', sales: 2100, isNew: true, isHot: false },
  { id: 24, name: '格力 大松N15电饭煲 4L', price: 299, originalPrice: 399, image: 'https://picsum.photos/300/300?random=24', rating: 4.6, reviewCount: 15600, category: '家用电器', categoryId: 3, description: 'IH电磁加热，24h预约，多种烹饪模式', stock: 500, brand: '格力', sales: 28000, isNew: false, isHot: false }
]

export function getCategories() {
  return Promise.resolve(categories)
}

export function getProducts(params = {}) {
  return new Promise(resolve => {
    setTimeout(() => {
      let list = [...products]
      if (params.category) {
        list = list.filter(p => p.category === params.category || p.categoryId === params.categoryId)
      }
      if (params.keyword) {
        const kw = params.keyword.toLowerCase()
        list = list.filter(p => p.name.toLowerCase().includes(kw) || p.brand.toLowerCase().includes(kw))
      }
      if (params.sort === 'price_asc') list.sort((a, b) => a.price - b.price)
      else if (params.sort === 'price_desc') list.sort((a, b) => b.price - a.price)
      else if (params.sort === 'sales') list.sort((a, b) => b.sales - a.sales)
      else if (params.sort === 'rating') list.sort((a, b) => b.rating - a.rating)
      else if (params.sort === 'newest') list.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0) || b.id - a.id)
      const page = params.page || 1
      const pageSize = params.pageSize || 12
      const total = list.length
      const paginated = list.slice((page - 1) * pageSize, page * pageSize)
      resolve({ list: paginated, total, page, pageSize })
    }, 200)
  })
}

export function getProductById(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const product = products.find(p => p.id === Number(id))
      if (product) {
        resolve({
          ...product,
          images: [
            product.image,
            `https://picsum.photos/300/300?random=${id}0`,
            `https://picsum.photos/300/300?random=${id}1`,
            `https://picsum.photos/300/300?random=${id}2`
          ],
          specs: [
            { label: '品牌', value: product.brand },
            { label: '类别', value: product.category },
            { label: '库存', value: `${product.stock}件` }
          ],
          reviews: [
            { id: 1, user: '用户***001', rating: 5, content: '非常好用，物超所值，强烈推荐！', date: '2024-01-15', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user1' },
            { id: 2, user: '买家***abc', rating: 4, content: '包装很好，发货很快，质量不错', date: '2024-01-10', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user2' },
            { id: 3, user: '匿名用户', rating: 5, content: '京东自营，放心购买，下次还会再来', date: '2024-01-08', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user3' }
          ]
        })
      } else {
        reject(new Error('商品不存在'))
      }
    }, 200)
  })
}

// ──────────────────────────────────────────────────────────────────
// Coupon mock data & API helpers
// ──────────────────────────────────────────────────────────────────

const coupons = [
  {
    id: 1,
    name: '全场通用券',
    value: 10,
    minAmount: 100,
    startDate: '2026-03-01',
    endDate: '2026-04-30',
    category: '全场通用',
    type: 'general',
    totalCount: 5000,
    remainCount: 1238,
  },
  {
    id: 2,
    name: '手机数码专属券',
    value: 50,
    minAmount: 500,
    startDate: '2026-03-15',
    endDate: '2026-04-15',
    category: '手机数码',
    type: 'category',
    totalCount: 2000,
    remainCount: 356,
  },
  {
    id: 3,
    name: '家用电器优惠券',
    value: 100,
    minAmount: 1000,
    startDate: '2026-03-01',
    endDate: '2026-03-31',
    category: '家用电器',
    type: 'category',
    totalCount: 1000,
    remainCount: 0,
  },
  {
    id: 4,
    name: '新人专享券',
    value: 20,
    minAmount: 50,
    startDate: '2026-03-20',
    endDate: '2026-05-20',
    category: '全场通用',
    type: 'newuser',
    totalCount: 10000,
    remainCount: 4521,
  },
  {
    id: 5,
    name: '服装配饰折扣券',
    value: 30,
    minAmount: 200,
    startDate: '2026-02-01',
    endDate: '2026-02-28',
    category: '服装配饰',
    type: 'category',
    totalCount: 3000,
    remainCount: 420,
  },
  {
    id: 6,
    name: '美妆护肤专属券',
    value: 80,
    minAmount: 600,
    startDate: '2026-03-08',
    endDate: '2026-04-08',
    category: '美妆护肤',
    type: 'category',
    totalCount: 1500,
    remainCount: 721,
  },
  {
    id: 7,
    name: '满200减15通用券',
    value: 15,
    minAmount: 200,
    startDate: '2026-04-01',
    endDate: '2026-04-30',
    category: '全场通用',
    type: 'general',
    totalCount: 8000,
    remainCount: 7850,
  },
  {
    id: 8,
    name: '图书音像专享券',
    value: 5,
    minAmount: 30,
    startDate: '2026-03-10',
    endDate: '2026-05-10',
    category: '图书音像',
    type: 'category',
    totalCount: 5000,
    remainCount: 2134,
  },
]

// Returns all coupons with claim status merged from localStorage
export function getCoupons() {
  return new Promise(resolve => {
    setTimeout(() => {
      const claimedIds = JSON.parse(localStorage.getItem('jd_claimed_coupons') || '[]')
      const today = new Date().toISOString().slice(0, 10)
      const list = coupons.map(c => {
        const isClaimed = claimedIds.includes(c.id)
        let status = 'available'
        if (c.endDate < today) {
          status = 'expired'
        } else if (isClaimed) {
          status = 'claimed'
        } else if (c.remainCount <= 0) {
          status = 'soldout'
        }
        return { ...c, status, isClaimed }
      })
      resolve(list)
    }, 200)
  })
}

// Claims a coupon by id, persists to localStorage
export function claimCoupon(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const claimedIds = JSON.parse(localStorage.getItem('jd_claimed_coupons') || '[]')
      if (claimedIds.includes(id)) {
        reject(new Error('已领取过该优惠券'))
        return
      }
      const coupon = coupons.find(c => c.id === id)
      if (!coupon) {
        reject(new Error('优惠券不存在'))
        return
      }
      if (coupon.remainCount <= 0) {
        reject(new Error('优惠券已抢完'))
        return
      }
      coupon.remainCount -= 1
      claimedIds.push(id)
      localStorage.setItem('jd_claimed_coupons', JSON.stringify(claimedIds))
      resolve({ success: true })
    }, 300)
  })
}

export function getFlashSaleProducts() {
  return Promise.resolve(products.filter(p => p.isHot).slice(0, 6))
}

export function getHotProducts() {
  return Promise.resolve([...products].sort((a, b) => b.sales - a.sales).slice(0, 8))
}

export function getNewProducts() {
  return Promise.resolve(products.filter(p => p.isNew).slice(0, 4))
}
