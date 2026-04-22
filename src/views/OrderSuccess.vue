<template>
  <div class="order-success-page">
    <div class="container content">
      <h1>订单提交成功</h1>
      <p>订单已提交，订单号为：{{ orderNo }}</p>
      <el-button type="primary" @click="$router.push('/')">返回首页</el-button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const orderNo = computed(() => route.query.orderNo || '未知订单号')
</script>

<style scoped>
.order-success-page {
  min-height: 60vh;
  display: flex;
  align-items: center;
}

.content {
  text-align: center;
}

h1 {
  margin: 0 0 12px;
}

p {
  margin: 0 0 20px;
  color: var(--color-text-regular);
}
</style>
