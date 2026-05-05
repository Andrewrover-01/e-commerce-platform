<template>
  <div class="admin-login-page">
    <div class="login-box">
      <div class="login-logo">
        <el-icon size="40" color="#409EFF"><Setting /></el-icon>
        <h2>电商平台管理后台</h2>
      </div>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="0">
        <el-form-item prop="username">
          <el-input
            v-model="form.username"
            placeholder="请输入管理员账号"
            size="large"
            :prefix-icon="User"
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            size="large"
            :prefix-icon="Lock"
            show-password
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            style="width: 100%"
            :loading="loading"
            @click="handleLogin"
          >
            登 录
          </el-button>
        </el-form-item>
      </el-form>
      <p class="login-hint">测试账号：admin / operator / finance，密码任意6位以上</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Setting, User, Lock } from '@element-plus/icons-vue'
import { useAdminUserStore } from '@/admin/stores/adminUser'

const router = useRouter()
const route = useRoute()
const adminUserStore = useAdminUserStore()

const formRef = ref(null)
const loading = ref(false)
const form = ref({ username: '', password: '' })

const rules = {
  username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, min: 6, message: '密码至少6位', trigger: 'blur' }],
}

async function handleLogin() {
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    loading.value = true
    try {
      await adminUserStore.login(form.value.username, form.value.password)
      ElMessage.success('登录成功')
      const redirect = route.query.redirect || '/admin/dashboard'
      router.push(redirect)
    } catch (e) {
      ElMessage.error(e.message)
    } finally {
      loading.value = false
    }
  })
}
</script>

<style scoped>
.admin-login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a2a4a 0%, #2d5a9e 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}
.login-box {
  background: #fff;
  border-radius: 12px;
  padding: 48px 40px 36px;
  width: 400px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
}
.login-logo {
  text-align: center;
  margin-bottom: 32px;
}
.login-logo h2 {
  margin-top: 10px;
  font-size: 20px;
  color: #303133;
  font-weight: 600;
}
.login-hint {
  text-align: center;
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}
</style>
