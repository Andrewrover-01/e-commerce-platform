import { useAdminUserStore } from '@/admin/stores/adminUser'

export const adminRoutes = [
  {
    path: '/admin',
    redirect: '/admin/dashboard',
  },
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: () => import('@/admin/views/AdminLoginView.vue'),
    meta: { isAdmin: true },
  },
  {
    path: '/admin',
    component: () => import('@/admin/components/layout/AdminLayout.vue'),
    meta: { isAdmin: true, requiresAdminAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: () => import('@/admin/views/AdminDashboardView.vue'),
      },
      // Products
      {
        path: 'products',
        name: 'AdminProducts',
        component: () => import('@/admin/views/AdminProductsView.vue'),
      },
      {
        path: 'products/categories',
        name: 'AdminProductCategories',
        component: () => import('@/admin/views/AdminProductCategoriesView.vue'),
      },
      // Orders
      {
        path: 'orders',
        name: 'AdminOrders',
        component: () => import('@/admin/views/AdminOrdersView.vue'),
      },
      {
        path: 'orders/refunds',
        name: 'AdminRefunds',
        component: () => import('@/admin/views/AdminRefundsView.vue'),
      },
      // Users
      {
        path: 'users',
        name: 'AdminUsers',
        component: () => import('@/admin/views/AdminUsersView.vue'),
      },
      // Marketing
      {
        path: 'marketing/coupons',
        name: 'AdminCoupons',
        component: () => import('@/admin/views/AdminCouponsView.vue'),
      },
      {
        path: 'marketing/activities',
        name: 'AdminActivities',
        component: () => import('@/admin/views/AdminActivitiesView.vue'),
      },
      // Finance
      {
        path: 'finance/overview',
        name: 'AdminFinanceOverview',
        component: () => import('@/admin/views/AdminFinanceOverviewView.vue'),
      },
      {
        path: 'finance/statements',
        name: 'AdminFinanceStatements',
        component: () => import('@/admin/views/AdminFinanceStatementsView.vue'),
      },
      // Content
      {
        path: 'content/banners',
        name: 'AdminBanners',
        component: () => import('@/admin/views/AdminBannersView.vue'),
      },
      {
        path: 'content/notices',
        name: 'AdminNotices',
        component: () => import('@/admin/views/AdminNoticesView.vue'),
      },
      // Settings
      {
        path: 'settings',
        name: 'AdminSettings',
        component: () => import('@/admin/views/AdminSettingsView.vue'),
      },
    ],
  },
]

export function setupAdminGuard(router) {
  router.beforeEach((to, from, next) => {
    if (to.meta.requiresAdminAuth) {
      const adminUserStore = useAdminUserStore()
      if (!adminUserStore.isLoggedIn) {
        return next({ name: 'AdminLogin', query: { redirect: to.fullPath } })
      }
    }
    next()
  })
}
