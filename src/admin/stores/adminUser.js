import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAdminUserStore = defineStore('adminUser', () => {
  const adminInfo = ref(JSON.parse(localStorage.getItem('admin_user') || 'null'))
  const token = ref(localStorage.getItem('admin_token') || '')

  const isLoggedIn = computed(() => !!token.value && !!adminInfo.value)
  const role = computed(() => adminInfo.value?.role || '')

  function login(username, password) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Mock admin accounts
        const accounts = {
          admin:    { id: 1, username: 'admin',    name: '超级管理员', role: 'admin',    avatar: '' },
          operator: { id: 2, username: 'operator', name: '运营人员',   role: 'operator', avatar: '' },
          finance:  { id: 3, username: 'finance',  name: '财务人员',   role: 'finance',  avatar: '' },
        }
        const user = accounts[username]
        if (user && password.length >= 6) {
          adminInfo.value = user
          token.value = 'admin-token-' + Date.now()
          localStorage.setItem('admin_user', JSON.stringify(user))
          localStorage.setItem('admin_token', token.value)
          resolve(user)
        } else {
          reject(new Error('用户名或密码错误'))
        }
      }, 500)
    })
  }

  function logout() {
    adminInfo.value = null
    token.value = ''
    localStorage.removeItem('admin_user')
    localStorage.removeItem('admin_token')
  }

  return { adminInfo, token, isLoggedIn, role, login, logout }
})
