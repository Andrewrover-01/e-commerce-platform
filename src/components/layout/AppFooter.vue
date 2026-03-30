<template>
  <footer class="app-footer">
    <div class="footer-services">
      <div class="container">
        <div class="services-grid">
          <div class="service-item">
            <span class="service-icon">🚚</span>
            <span class="service-label">极速配送</span>
            <span class="service-desc">多仓就近，最快当日达</span>
          </div>
          <div class="service-item">
            <span class="service-icon">✅</span>
            <span class="service-label">正品保障</span>
            <span class="service-desc">正品低价，自营商品</span>
          </div>
          <div class="service-item">
            <span class="service-icon">🔄</span>
            <span class="service-label">无忧退换</span>
            <span class="service-desc">7天无理由退换货</span>
          </div>
          <div class="service-item">
            <span class="service-icon">💳</span>
            <span class="service-label">安心支付</span>
            <span class="service-desc">多种安全支付方式</span>
          </div>
          <div class="service-item">
            <span class="service-icon">📞</span>
            <span class="service-label">客服支持</span>
            <span class="service-desc">7×24小时专业服务</span>
          </div>
        </div>
      </div>
    </div>
    <div class="footer-main">
      <div class="container">
        <div class="footer-columns">
          <div class="footer-col">
            <h4>购物指南</h4>
            <ul>
              <li><a href="#">购物流程</a></li>
              <li><a href="#">会员介绍</a></li>
              <li><a href="#">生活旅行</a></li>
              <li><a href="#">PLUS会员</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h4>配送方式</h4>
            <ul>
              <li><a href="#">上门自提</a></li>
              <li><a href="#">211限时达</a></li>
              <li><a href="#">配送服务查询</a></li>
              <li><a href="#">海外配送</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h4>支付方式</h4>
            <ul>
              <li><a href="#">货到付款</a></li>
              <li><a href="#">在线支付</a></li>
              <li><a href="#">分期付款</a></li>
              <li><a href="#">京东白条</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h4>售后服务</h4>
            <ul>
              <li><a href="#">售后政策</a></li>
              <li><a href="#">价格保护</a></li>
              <li><a href="#">退款说明</a></li>
              <li><a href="#">返修/退换货</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h4>特色服务</h4>
            <ul>
              <li><a href="#">夺宝岛</a></li>
              <li><a href="#">DIY装机</a></li>
              <li><a href="#">延保服务</a></li>
              <li><a href="#">京东E卡</a></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <div class="container">
        <p>Copyright © 2004-2024 京东 JD.com 版权所有 | 本项目为仿制学习项目，非商业用途</p>
      </div>
    </div>
  </footer>
</template>

<script setup>
</script>

<style scoped>
.app-footer {
  background: #fff;
  margin-top: var(--spacing-8);
  border-top: 1px solid var(--color-border-light);
}

.footer-services {
  padding: var(--spacing-6) 0;
  border-bottom: 1px solid var(--color-border-light);
}

.services-grid {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.service-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}
.service-icon {
  font-size: 28px;
}
.service-label {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--color-text-primary);
  display: block;
}
.service-desc {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  display: block;
}

.footer-main {
  padding: var(--spacing-8) 0;
}
.footer-columns {
  display: flex;
  gap: var(--spacing-8);
  justify-content: space-between;
}
.footer-col h4 {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-4);
}
.footer-col ul li {
  margin-bottom: var(--spacing-2);
}
.footer-col ul li a {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}
.footer-col ul li a:hover {
  color: var(--color-primary);
}

.footer-bottom {
  background: #f0f0f0;
  padding: var(--spacing-4) 0;
  text-align: center;
}
.footer-bottom p {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}
</style>
