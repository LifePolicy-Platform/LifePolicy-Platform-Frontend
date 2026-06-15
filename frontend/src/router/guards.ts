import type { Router } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

/**
 * 路由導航守衛設定
 *
 * 若路由 meta.requiresAuth = true，則必須已登入才能進入；
 * 若路由 meta.requiresAuth = false 且已登入（如 /login），則導向首頁。
 */
export function setupRouterGuards(router: Router): void {
  router.beforeEach(async (to, _from, next) => {
    const auth = useAuthStore()

    // 頁面重新整理時，若 localStorage 有 token，先向後端確認使用者
    if (auth.accessToken && !auth.currentUser) {
      await auth.hydrateFromBackend()
    }

    const requiresAuth = to.meta.requiresAuth === true
    const isGuestOnly = to.meta.guestOnly === true

    if (requiresAuth && !auth.isAuthenticated) {
      // 未登入，導向登入頁並帶上 redirect 參數
      next({ path: '/login', query: { redirect: to.fullPath } })
      return
    }

    if (isGuestOnly && auth.isAuthenticated) {
      // 已登入但嘗試進入登入/註冊頁，導向首頁
      next({ path: '/' })
      return
    }

    next()
  })
}
