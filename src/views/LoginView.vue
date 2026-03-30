<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-logo" @click="$router.push('/')">
        <span class="logo-jd">京东</span>
      </div>
      <h2 class="auth-title">账号登录</h2>

      <form class="auth-form" @submit.prevent="handleLogin">
        <div class="form-group">
          <label class="form-label">用户名</label>
          <input
            v-model="form.username"
            type="text"
            class="form-input"
            placeholder="请输入用户名"
            autocomplete="username"
            maxlength="20"
          />
          <p v-if="errors.username" class="form-error">{{ errors.username }}</p>
        </div>

        <div class="form-group">
          <label class="form-label">密码</label>
          <div class="input-with-icon">
            <input
              v-model="form.password"
              :type="showPwd ? 'text' : 'password'"
              class="form-input"
              placeholder="请输入密码（至少6位）"
              autocomplete="current-password"
              maxlength="30"
            />
            <button type="button" class="pwd-toggle" @click="showPwd = !showPwd">
              {{ showPwd ? '👁' : '🙈' }}
            </button>
          </div>
          <p v-if="errors.password" class="form-error">{{ errors.password }}</p>
        </div>

        <p v-if="errorMsg" class="form-error global-error">{{ errorMsg }}</p>

        <button
          type="submit"
          class="btn btn-primary btn-large btn-block"
          :disabled="loading"
        >
          {{ loading ? '登录中...' : '立即登录' }}
        </button>
      </form>

      <div class="auth-footer">
        <span class="auth-footer-text">还没有账号？</span>
        <router-link to="/register" class="auth-link">免费注册</router-link>
      </div>
    </div>
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
const showPwd = ref(false)

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
  background: var(--color-bg-white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  padding: var(--spacing-10) var(--spacing-12);
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
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-6);
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-5);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.form-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-regular);
  font-weight: 500;
}

.input-with-icon {
  position: relative;
}
.input-with-icon .form-input {
  padding-right: 40px;
}
.pwd-toggle {
  position: absolute;
  right: var(--spacing-3);
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
  opacity: 0.6;
  transition: opacity 0.15s;
}
.pwd-toggle:hover { opacity: 1; }

.form-error {
  font-size: var(--font-size-xs);
  color: var(--color-danger);
}
.global-error {
  text-align: center;
  font-size: var(--font-size-sm);
  padding: var(--spacing-2);
  background: #fff0ef;
  border-radius: var(--radius-sm);
}

.auth-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);
  margin-top: var(--spacing-5);
  font-size: var(--font-size-sm);
}
.auth-footer-text { color: var(--color-text-secondary); }
.auth-link {
  color: var(--color-primary);
  font-weight: 600;
  text-decoration: none;
  transition: var(--transition-fast);
}
.auth-link:hover { color: var(--color-primary-dark); text-decoration: underline; }
</style>

