<template>
  <div class="not-found">
    <div class="container content">
      <h1>404</h1>
      <p>页面迷路了，可能被外星人带走了 👽</p>
      <el-button type="primary" @click="$router.push('/')">返回首页</el-button>
    </div>
  </div>
</template>

<style scoped>
.not-found {
  min-height: 60vh;
  display: flex;
  align-items: center;
}

.content {
  text-align: center;
}

h1 {
  font-size: 64px;
  margin: 0 0 12px;
}

p {
  margin: 0 0 20px;
  color: var(--color-text-regular);
}
</style>
