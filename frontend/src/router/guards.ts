import type { Router } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

export function setupRouterGuards(router: Router): void {
  router.beforeEach((to, _from, next) => {
    const auth = useAuthStore()

    const requiresAuth = to.meta.requiresAuth === true
    const isGuestOnly = to.meta.guestOnly === true
    const requiresRole = to.meta.requiresRole as string | undefined

    if (requiresAuth && !auth.isAuthenticated) {
      next({ path: '/login', query: { redirect: to.fullPath } })
      return
    }

    if (requiresRole && !auth.roles.includes(requiresRole)) {
      next({ path: '/' })
      return
    }

    if (isGuestOnly && auth.isAuthenticated) {
      next({ path: '/' })
      return
    }

    next()
  })
}