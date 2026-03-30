<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-logo" @click="$router.push('/')">
        <span class="logo-jd">京东</span>
      </div>
      <h2 class="auth-title">免费注册</h2>

      <form class="auth-form" @submit.prevent="handleRegister">
        <div class="form-group">
          <label class="form-label">用户名</label>
          <input
            v-model="form.username"
            type="text"
            class="form-input"
            placeholder="请输入用户名（2-20位）"
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
              autocomplete="new-password"
              maxlength="30"
            />
            <button type="button" class="pwd-toggle" @click="showPwd = !showPwd">
              {{ showPwd ? '👁' : '🙈' }}
            </button>
          </div>
          <p v-if="errors.password" class="form-error">{{ errors.password }}</p>
        </div>

        <div class="form-group">
          <label class="form-label">确认密码</label>
          <input
            v-model="form.confirm"
            :type="showPwd ? 'text' : 'password'"
            class="form-input"
            placeholder="请再次输入密码"
            autocomplete="new-password"
            maxlength="30"
          />
          <p v-if="errors.confirm" class="form-error">{{ errors.confirm }}</p>
        </div>

        <!-- 服务条款 -->
        <div class="form-group agree-row">
          <label class="agree-label">
            <input v-model="form.agreed" type="checkbox" class="agree-check" />
            我已阅读并同意
            <a href="#" class="auth-link" @click.prevent>《用户服务协议》</a>
            和
            <a href="#" class="auth-link" @click.prevent>《隐私政策》</a>
          </label>
          <p v-if="errors.agreed" class="form-error">{{ errors.agreed }}</p>
        </div>

        <p v-if="errorMsg" class="form-error global-error">{{ errorMsg }}</p>

        <button
          type="submit"
          class="btn btn-primary btn-large btn-block"
          :disabled="loading"
        >
          {{ loading ? '注册中...' : '立即注册' }}
        </button>
      </form>

      <div class="auth-footer">
        <span class="auth-footer-text">已有账号？</span>
        <router-link to="/login" class="auth-link">立即登录</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const form = reactive({ username: '', password: '', confirm: '', agreed: false })
const errors = reactive({ username: '', password: '', confirm: '', agreed: '' })
const errorMsg = ref('')
const loading = ref(false)
const showPwd = ref(false)

function validate() {
  let ok = true
  errors.username = ''
  errors.password = ''
  errors.confirm = ''
  errors.agreed = ''
  if (form.username.trim().length < 2) {
    errors.username = '用户名至少 2 位'
    ok = false
  }
  if (form.password.length < 6) {
    errors.password = '密码至少 6 位'
    ok = false
  }
  if (form.confirm !== form.password) {
    errors.confirm = '两次密码不一致'
    ok = false
  }
  if (!form.agreed) {
    errors.agreed = '请先同意服务协议'
    ok = false
  }
  return ok
}

async function handleRegister() {
  if (!validate()) return
  loading.value = true
  errorMsg.value = ''
  try {
    await userStore.register(form.username, form.password)
    router.push('/')
  } catch (e) {
    errorMsg.value = e.message || '注册失败，请重试'
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
.input-with-icon { position: relative; }
.input-with-icon .form-input { padding-right: 40px; }
.pwd-toggle {
  position: absolute;
  right: var(--spacing-3);
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
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
.agree-row { flex-direction: row; align-items: flex-start; flex-wrap: wrap; gap: var(--spacing-1); }
.agree-label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: var(--font-size-sm);
  color: var(--color-text-regular);
  cursor: pointer;
  flex-wrap: wrap;
}
.agree-check {
  width: 14px;
  height: 14px;
  accent-color: var(--color-primary);
  flex-shrink: 0;
}
.auth-link {
  color: var(--color-primary);
  font-weight: 500;
  text-decoration: none;
  transition: var(--transition-fast);
}
.auth-link:hover { text-decoration: underline; }
.auth-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);
  margin-top: var(--spacing-5);
  font-size: var(--font-size-sm);
}
.auth-footer-text { color: var(--color-text-secondary); }
</style>

