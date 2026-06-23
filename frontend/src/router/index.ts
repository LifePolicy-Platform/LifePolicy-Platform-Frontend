import { createRouter, createWebHistory, type RouteMeta } from 'vue-router'
import { setupRouterGuards } from './guards'
import HomeView from '../views/HomeView.vue'
import MyTasksView from '../views/MyTasksView.vue'
import ProductListView from '../views/product/ProductListView.vue'
import UpdTime from '../views/UpdTime.vue'
import PolicySearchView from '../views/PolicySearchView.vue'
import CartTotalView from '../views/CartTotalView.vue'
import RegistView from '../views/RegistView.vue'
import LoginView from '../views/LoginView.vue'
import TodoListView from '../views/TodoListView.vue'
import SearchView from '../views/SearchView.vue'
import ProductDetailView from '../views/ProductDetailView.vue'
import UsersView from '../views/UsersView.vue'
import Workbench from '../views/Workbench.vue'
import PolicyContentView from '../views/PolicyContentView.vue'

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
    /** true = 主內容區頂部為 Notus 大綠色區塊（Header 透明疊在上面） */
    hasTopHero?: boolean
    /** 指定角色才能進入（e.g. 'ADMIN'），需搭配 requiresAuth: true */
    requiresRole?: string
  }
}

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0, left: 0 }
  },
  routes: [
    {
      path: '/',
      redirect: '/home',
    },
    {
      path: '/home',
      name: 'home',
      component: HomeView,
      meta: { title: '首頁 數據分析', label: '首頁 數據分析', hasTopHero: true },
    },
    {
      path: '/my-tasks',
      name: 'my-tasks',
      component: MyTasksView,
      meta: { title: '個人待辦案件', label: '個人待辦案件', hasTopHero: true, requiresAuth: true },
    },
    {
      path: '/policy-mgmt',
      name: 'policy-mgmt',
      component: Workbench,
      meta: { title: '保單管理', label: '保單管理', hasTopHero: true, requiresAuth: true },
    },
    {
      path: '/policy-mgmt/policy/:policyNo',
      name: 'policy-mgmt-detail',
      component: PolicyContentView,
      meta: { title: '保單內容', requiresAuth: true },
    },
    {
      path: '/policy-mgmt/search',
      redirect: { path: '/policy-mgmt', query: { tab: 'query' } },
    },
    {
      path: '/policy-mgmt/create',
      redirect: { path: '/policy-mgmt', query: { tab: 'create' } },
    },
    {
      path: '/policy-mgmt/review',
      redirect: { path: '/policy-mgmt', query: { tab: 'review' } },
    },
    {
      path: '/workbench',
      redirect: (to) => ({ path: '/policy-mgmt', query: to.query }),
    },
    {
      path: '/workbench/policy/:policyNo',
      redirect: (to) => ({
        path: `/policy-mgmt/policy/${String(to.params.policyNo)}`,
      }),
    },
    {
      path: '/products',
      name: 'products',
      component: ProductListView,
      meta: { title: '商品維護', label: '商品維護', hasTopHero: true, requiresAuth: true },
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
      meta: { title: '保單查詢元件拆分示範', label: '保單查詢練習', hasTopHero: true },
    },
    {
      path: '/visit-mgmt/reschedule',
      name: 'visit-reschedule',
      component: UpdTime,
      meta: { title: '重新安排約訪', label: '重新安排約訪', hasTopHero: true, requiresAuth: true },
    },
    {
      path: '/updTime',
      redirect: '/visit-mgmt/reschedule',
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
    {
      path: '/users',
      name: 'users',
      component: UsersView,
      meta: { title: '使用者管理', label: '使用者權限管理', requiresAuth: true, requiresRole: 'ADMIN' },
    },
    {
      path: '/workbench',
      name: 'workbench',
      component: Workbench,
      meta: { title: '投保申請工作台', label: '投保申請工作台', hasTopHero: true, requiresAuth: true },
    },
    {
    path: '/claim/ClaimManagement',
    name: 'ClaimManagement',
    component: () => import('@/views/claim/ClaimManagement.vue'),
    meta: { title: '理賠管理', label: '理賠管理', hasTopHero: true },
    },
    {
    path: '/claim/ClaimAuditManager',
    name: 'ClaimAuditManager',
    component: () => import('@/views/claim/ClaimAuditManager.vue'),
    meta: { title: '理賠審核', label: '理賠審核', hasTopHero: true },
    }
  ],
})



setupRouterGuards(router)

export default router
