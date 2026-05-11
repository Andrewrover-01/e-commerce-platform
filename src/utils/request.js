import axios from 'axios'

const request = axios.create({
  // Use relative path so requests go through Vite proxy
  baseURL: '/',
  timeout: 10000,
})

// Attach JWT token to every request
request.interceptors.request.use(config => {
  const token = localStorage.getItem('jd_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Normalise error responses
request.interceptors.response.use(
  res => res,
  err => {
    const msg = err.response?.data?.message || err.message || '请求失败'
    return Promise.reject(new Error(msg))
  }
)

export default request
