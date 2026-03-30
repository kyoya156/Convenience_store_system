import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  { path: '/',              component: () => import('../views/CatalogueView.vue') },
  { path: '/login',         component: () => import('../views/LoginView.vue') },
  { path: '/register',      component: () => import('../views/RegisterView.vue') },
  { path: '/catalogue',     component: () => import('../views/CatalogueView.vue') },
  { path: '/product/:id',   component: () => import('../views/ProductDetailView.vue') },
  { path: '/cart',          component: () => import('../views/CartView.vue') },
  {
    path: '/checkout',
    component: () => import('../views/CheckoutView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/orders',
    component: () => import('../views/OrdersView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    component: () => import('../views/AdminView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()

  // Restore user from token on page refresh
  if (auth.token && !auth.user) await auth.fetchMe()

  if (to.meta.requiresAuth && !auth.isLoggedIn)  return '/login'
  if (to.meta.requiresAdmin && !auth.isAdmin)     return '/'
})

export default router