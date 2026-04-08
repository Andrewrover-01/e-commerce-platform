<template>
  <div class="auth-page">
    <el-card class="auth-card" shadow="never">
      <div class="auth-logo" @click="$router.push('/')">
        <span class="logo-jd">京东</span>
      </div>
      <h2 class="auth-title">免费注册</h2>

      <el-form @submit.prevent="handleRegister" label-position="top">
        <el-form-item label="用户名" :error="errors.username">
          <el-input
            v-model="form.username"
            placeholder="请输入用户名（2-20位）"
            autocomplete="username"
            maxlength="20"
          />
        </el-form-item>

        <el-form-item label="密码" :error="errors.password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码（至少6位）"
            autocomplete="new-password"
            maxlength="30"
            show-password
          />
        </el-form-item>

        <el-form-item label="确认密码" :error="errors.confirm">
          <el-input
            v-model="form.confirm"
            type="password"
            placeholder="请再次输入密码"
            autocomplete="new-password"
            maxlength="30"
          />
        </el-form-item>

        <el-form-item :error="errors.agreed">
          <el-checkbox v-model="form.agreed">
            我已阅读并同意
            <a href="#" class="auth-link" @click.prevent>《用户服务协议》</a>
            和
            <a href="#" class="auth-link" @click.prevent>《隐私政策》</a>
          </el-checkbox>
        </el-form-item>

        <el-alert v-if="errorMsg" :title="errorMsg" type="error" :closable="false" show-icon />

        <el-button type="danger" size="large" class="btn-block" :loading="loading" native-type="submit">
          {{ loading ? '注册中...' : '立即注册' }}
        </el-button>
      </el-form>

      <div class="auth-footer">
        <span class="auth-footer-text">已有账号？</span>
        <router-link to="/login" class="auth-link">立即登录</router-link>
      </div>
    </el-card>
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
  font-weight: 500;
  text-decoration: none;
}
</style>
