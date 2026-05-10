import axios from 'axios'

const request = axios.create({
  // Backend API base URL — update to your deployed URL in production.
  // In development the backend runs on port 3001 (cd backend && npm run dev).
  // For mock data, use empty string to access frontend public directory
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
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
