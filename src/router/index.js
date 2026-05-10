import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { adminRoutes, setupAdminGuard } from '@/admin/router/routes'

const routes = [
  { path: '/', name: 'Home', component: () => import('@/views/HomeView.vue') },
  { path: '/products', name: 'ProductList', component: () => import('@/views/ProductListView.vue') },
  { path: '/product/:id', name: 'ProductDetail', component: () => import('@/views/ProductDetailView.vue'), props: true },
  { path: '/cart', name: 'Cart', component: () => import('@/views/CartView.vue') },
  { path: '/login', name: 'Login', component: () => import('@/views/LoginView.vue') },
  { path: '/register', name: 'Register', component: () => import('@/views/RegisterView.vue') },
  { path: '/order', name: 'Order', component: () => import('@/views/OrderView.vue'), meta: { requiresAuth: true } },
  { path: '/order/success', name: 'OrderSuccess', component: () => import('@/views/OrderSuccess.vue'), meta: { requiresAuth: true } },
  { path: '/user', name: 'UserCenter', component: () => import('@/views/UserCenterView.vue'), meta: { requiresAuth: true } },
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: () => import('@/views/NotFound.vue') },
  ...adminRoutes,
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

setupAdminGuard(router)

export default router
