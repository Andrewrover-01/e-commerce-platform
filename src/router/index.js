import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes = [
  { path: '/', name: 'Home', component: () => import('@/views/HomeView.vue') },
  { path: '/products', name: 'ProductList', component: () => import('@/views/ProductListView.vue') },
  { path: '/product/:id', name: 'ProductDetail', component: () => import('@/views/ProductDetailView.vue') },
  { path: '/cart', name: 'Cart', component: () => import('@/views/CartView.vue') },
  { path: '/login', name: 'Login', component: () => import('@/views/LoginView.vue') },
  { path: '/register', name: 'Register', component: () => import('@/views/RegisterView.vue') },
  { path: '/order', name: 'Order', component: () => import('@/views/OrderView.vue'), meta: { requiresAuth: true } },
  { path: '/user', name: 'UserCenter', component: () => import('@/views/UserCenterView.vue'), meta: { requiresAuth: true } },
  { path: '/coupons', name: 'UserCoupon', component: () => import('@/views/UserCoupon.vue'), meta: { requiresAuth: true } }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
  } else {
    next()
  }
})

export default router
