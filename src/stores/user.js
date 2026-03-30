import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  const userInfo = ref(JSON.parse(localStorage.getItem('jd_user') || 'null'))
  const token = ref(localStorage.getItem('jd_token') || '')

  const isLoggedIn = computed(() => !!token.value && !!userInfo.value)

  function login(username, password) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (username && password.length >= 6) {
          const user = { id: 1, username, avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}` }
          userInfo.value = user
          token.value = 'mock-token-' + Date.now()
          localStorage.setItem('jd_user', JSON.stringify(user))
          localStorage.setItem('jd_token', token.value)
          resolve(user)
        } else {
          reject(new Error('用户名或密码错误'))
        }
      }, 500)
    })
  }

  function register(username, password) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (username && password.length >= 6) {
          const user = { id: Date.now(), username, avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}` }
          userInfo.value = user
          token.value = 'mock-token-' + Date.now()
          localStorage.setItem('jd_user', JSON.stringify(user))
          localStorage.setItem('jd_token', token.value)
          resolve(user)
        } else {
          reject(new Error('注册失败，密码至少6位'))
        }
      }, 500)
    })
  }

  function logout() {
    userInfo.value = null
    token.value = ''
    localStorage.removeItem('jd_user')
    localStorage.removeItem('jd_token')
  }

  return { userInfo, token, isLoggedIn, login, register, logout }
})
