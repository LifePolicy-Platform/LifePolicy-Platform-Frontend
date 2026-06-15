import { createRouter, createWebHistory, type RouteMeta } from 'vue-router'
import { setupRouterGuards } from './guards'
import UpdTime from '../views/UpdTime.vue'
import PolicySearchView from '../views/PolicySearchView.vue'
import CartTotalView from '../views/CartTotalView.vue'
import RegistView from '../views/RegistView.vue'
import LoginView from '../views/LoginView.vue'
import TodoListView from '../views/TodoListView.vue'
import SearchView from '../views/SearchView.vue'
import ProductDetailView from '../views/ProductDetailView.vue'

export interface DemoRouteMeta extends Record<string, unknown> {
  shortLabel?: string
  label?: string
  title: string
}

declare module 'vue-router' {
  interface RouteMeta extends Partial<DemoRouteMeta> {
    /** true = 需要登入才能進入 */
    requiresAuth?: boolean
    /** true = 已登入時不可進入（如登入/註冊頁） */
    guestOnly?: boolean
    /** true = 隱藏 sidebar（登入頁等） */
    hideSidebar?: boolean
  }
}

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/policies',
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { title: '登入', guestOnly: true, hideSidebar: true },
    },
    {
      path: '/policies',
      name: 'policies',
      component: PolicySearchView,
      meta: { title: '保單查詢元件拆分示範', label: '保單查詢練習' },
    },
    {
      path: '/updTime',
      name: 'updTime',
      component: UpdTime,
      meta: { title: '重新安排約訪時間', label: '重新安排約訪時間', requiresAuth: true },
    },
    {
      path: '/cart',
      name: 'cart',
      component: CartTotalView,
      meta: { title: '購物車', label: '購物車結帳' },
    },
    {
      path: '/regist',
      name: 'regist',
      component: RegistView,
      meta: { title: '建立帳號', label: '註冊帳號', guestOnly: true },
    },
    {
      path: '/todoList',
      name: 'todoList',
      component: TodoListView,
      meta: { title: '代辦事項清單', label: '代辦事項清單' },
    },
    {
      path: '/search',
      name: 'search',
      component: SearchView,
      meta: { title: '即時搜尋', label: '即時搜尋與分類篩選' },
    },
    {
      path: '/product/:id',
      name: 'product-detail',
      component: ProductDetailView,
      meta: { title: '商品詳情', description: '單一商品數量與金額試算' },
    },
  ],
})

setupRouterGuards(router)

export default router
