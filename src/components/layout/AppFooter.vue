<template>
  <footer class="app-footer">
    <!-- 服务保障区 -->
    <div class="footer-services">
      <div class="container">
        <div class="services-grid">
          <div
            v-for="svc in services"
            :key="svc.label"
            class="service-item"
          >
            <span class="service-icon" :aria-label="svc.label">{{ svc.icon }}</span>
            <div class="service-text">
              <span class="service-label">{{ svc.label }}</span>
              <span class="service-desc">{{ svc.desc }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 链接区 -->
    <div class="footer-main">
      <div class="container">
        <div class="footer-body">
          <!-- 品牌区 -->
          <div class="footer-brand">
            <div class="footer-logo">京东</div>
            <p class="footer-brand-desc">京东是中国最大的自营电商企业，提供正品、低价、快速配送服务。</p>
            <div class="footer-social">
              <a href="#" class="social-link" title="微信">💬</a>
              <a href="#" class="social-link" title="微博">🐦</a>
              <a href="#" class="social-link" title="抖音">🎵</a>
              <a href="#" class="social-link" title="APP下载">📱</a>
            </div>
          </div>

          <!-- 链接列 -->
          <div class="footer-columns">
            <div v-for="col in footerLinks" :key="col.title" class="footer-col">
              <h4 class="footer-col-title">{{ col.title }}</h4>
              <ul>
                <li v-for="link in col.links" :key="link">
                  <a href="#">{{ link }}</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 版权区 -->
    <div class="footer-bottom">
      <div class="container">
        <div class="footer-bottom-links">
          <a v-for="lnk in bottomLinks" :key="lnk" href="#">{{ lnk }}</a>
        </div>
        <p class="copyright">
          Copyright © 2004–{{ currentYear }} 京东 JD.com 版权所有 |
          本项目为仿制学习项目，非商业用途
        </p>
      </div>
    </div>
  </footer>
</template>

<script setup>
const currentYear = new Date().getFullYear()

const services = [
  { icon: '🚚', label: '极速配送', desc: '多仓就近，最快当日达' },
  { icon: '✅', label: '正品保障', desc: '正品低价，自营商品' },
  { icon: '🔄', label: '无忧退换', desc: '7天无理由退换货' },
  { icon: '💳', label: '安心支付', desc: '多种安全支付方式' },
  { icon: '📞', label: '客服支持', desc: '7×24小时专业服务' },
]

const footerLinks = [
  {
    title: '购物指南',
    links: ['购物流程', '会员介绍', '生活旅行', 'PLUS会员', '企业采购'],
  },
  {
    title: '配送方式',
    links: ['上门自提', '211限时达', '配送服务查询', '海外配送', '京东物流'],
  },
  {
    title: '支付方式',
    links: ['货到付款', '在线支付', '分期付款', '京东白条', '礼品卡'],
  },
  {
    title: '售后服务',
    links: ['售后政策', '价格保护', '退款说明', '返修/退换货', '取消订单'],
  },
  {
    title: '特色服务',
    links: ['夺宝岛', 'DIY装机', '延保服务', '京东E卡', '京东超市'],
  },
]

const bottomLinks = [
  '关于京东', '联系我们', '联系客服', '商家合作', '诚聘英才',
  '投资者关系', '网站地图', '营业执照', '隐私政策',
]
</script>

<style scoped>
.app-footer {
  background: #fff;
  margin-top: var(--spacing-8);
  border-top: 3px solid var(--color-primary);
}

/* ── 服务保障 ── */
.footer-services {
  padding: var(--spacing-6) 0;
  border-bottom: 1px solid var(--color-border-light);
}

.services-grid {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-4);
}

.service-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  flex: 1;
  min-width: 0;
}

.service-icon {
  font-size: 30px;
  line-height: 1;
  flex-shrink: 0;
}

.service-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.service-label {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--color-text-primary);
  white-space: nowrap;
}

.service-desc {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  white-space: nowrap;
}

/* ── 主体链接区 ── */
.footer-main {
  padding: var(--spacing-8) 0;
  border-bottom: 1px solid var(--color-border-light);
}

.footer-body {
  display: flex;
  gap: var(--spacing-8);
  align-items: flex-start;
}

/* 品牌区 */
.footer-brand {
  flex-shrink: 0;
  width: 200px;
}

.footer-logo {
  font-size: 32px;
  font-weight: 900;
  color: var(--color-primary);
  letter-spacing: -2px;
  line-height: 1;
  margin-bottom: var(--spacing-3);
}

.footer-brand-desc {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  line-height: var(--line-height-loose);
  margin-bottom: var(--spacing-4);
}

.footer-social {
  display: flex;
  gap: var(--spacing-3);
}

.social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--color-bg-page);
  font-size: 16px;
  transition: var(--transition-fast);
  text-decoration: none;
}
.social-link:hover {
  background: var(--color-primary-pale);
}

/* 链接列 */
.footer-columns {
  flex: 1;
  display: flex;
  gap: var(--spacing-4);
  justify-content: space-between;
}

.footer-col-title {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-4);
  padding-bottom: var(--spacing-2);
  border-bottom: 1px solid var(--color-border-light);
}

.footer-col ul {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.footer-col ul li a {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  transition: var(--transition-fast);
  text-decoration: none;
}
.footer-col ul li a:hover {
  color: var(--color-primary);
}

/* ── 版权区 ── */
.footer-bottom {
  background: #f5f5f5;
  padding: var(--spacing-4) 0;
  text-align: center;
}

.footer-bottom-links {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: var(--spacing-1) var(--spacing-4);
  margin-bottom: var(--spacing-2);
}
.footer-bottom-links a {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: var(--transition-fast);
}
.footer-bottom-links a:hover {
  color: var(--color-primary);
}

.copyright {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}
</style>
