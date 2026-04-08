<template>
  <div class="auth-page">
    <el-card class="auth-card" shadow="never">
      <div class="auth-logo" @click="$router.push('/')">
        <span class="logo-jd">京东</span>
      </div>
      <h2 class="auth-title">账号登录</h2>

      <el-form @submit.prevent="handleLogin" label-position="top">
        <el-form-item label="用户名" :error="errors.username">
          <el-input
            v-model="form.username"
            placeholder="请输入用户名"
            autocomplete="username"
            maxlength="20"
          />
        </el-form-item>

        <el-form-item label="密码" :error="errors.password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码（至少6位）"
            autocomplete="current-password"
            maxlength="30"
            show-password
          />
        </el-form-item>

        <el-alert v-if="errorMsg" :title="errorMsg" type="error" :closable="false" show-icon />

        <el-button type="danger" size="large" class="btn-block" :loading="loading" native-type="submit">
          {{ loading ? '登录中...' : '立即登录' }}
        </el-button>
      </el-form>

      <div class="auth-footer">
        <span class="auth-footer-text">还没有账号？</span>
        <router-link to="/register" class="auth-link">免费注册</router-link>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const form = reactive({ username: '', password: '' })
const errors = reactive({ username: '', password: '' })
const errorMsg = ref('')
const loading = ref(false)

function validate() {
  let ok = true
  errors.username = ''
  errors.password = ''
  if (!form.username.trim()) {
    errors.username = '请输入用户名'
    ok = false
  }
  if (form.password.length < 6) {
    errors.password = '密码至少 6 位'
    ok = false
  }
  return ok
}

async function handleLogin() {
  if (!validate()) return
  loading.value = true
  errorMsg.value = ''
  try {
    await userStore.login(form.username, form.password)
    const redirect = route.query.redirect || '/'
    router.push(redirect)
  } catch (e) {
    errorMsg.value = e.message || '登录失败，请重试'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-page {
  min-height: calc(100vh - 200px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-10) 0;
  background: var(--color-bg-page);
}

.auth-card {
  width: 420px;
  max-width: 100%;
}

.auth-logo {
  text-align: center;
  cursor: pointer;
  margin-bottom: var(--spacing-4);
}

.logo-jd {
  font-size: 42px;
  font-weight: 900;
  color: var(--color-primary);
  letter-spacing: -2px;
}

.auth-title {
  text-align: center;
  font-size: var(--font-size-2xl);
  font-weight: 700;
  margin-bottom: var(--spacing-6);
}

.btn-block {
  width: 100%;
}

.auth-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);
  margin-top: var(--spacing-5);
  font-size: var(--font-size-sm);
}

.auth-footer-text {
  color: var(--color-text-secondary);
}

.auth-link {
  color: var(--color-primary);
  font-weight: 600;
  text-decoration: none;
}
</style>
