export interface SidebarNavItem {
  label: string
  title: string
  icon: string
  group: string
  groupOrder: number
  path?: string
  disabled?: boolean
  roles?: string[]
}

/** Sidebar 選單（依 groupOrder 排序，數字越小越上面） */
export const sidebarNavItems: SidebarNavItem[] = [
  // 專案練習（置頂）
  { group: '專案練習', groupOrder: 0, path: '/updTime', label: '重新安排約訪時間', title: '重新安排約訪時間', icon: 'schedule' },
  { group: '專案練習', groupOrder: 0, path: '/todoList', label: '代辦事項清單', title: '代辦事項清單', icon: 'checklist' },
  { group: '專案練習', groupOrder: 0, path: '/search', label: '即時搜尋與分類篩選', title: '即時搜尋', icon: 'manage_search' },
  { group: '專案練習', groupOrder: 0, path: '/cart', label: '購物車結帳', title: '購物車', icon: 'shopping_cart' },
  { group: '專案練習', groupOrder: 0, path: '/policies', label: '保單查詢練習', title: '保單查詢元件拆分示範', icon: 'policy' },

  // 我的工作台
  { group: '我的工作台', groupOrder: 1, path: '/home', label: '首頁 Dashboard', title: '首頁 Dashboard', icon: 'dashboard' },
  { group: '我的工作台', groupOrder: 1, path: '/my-tasks', label: '個人待辦案件', title: '個人待辦案件', icon: 'assignment' },

  // 保單作業（無「保單管理」群組名稱，僅兩項獨立入口）
  { group: '保單作業', groupOrder: 2, path: '/policy-mgmt', label: '保單查詢', title: '保單查詢', icon: 'description' },
  { group: '保單作業', groupOrder: 2, path: '/updTime', label: '重新安排約訪', title: '重新安排約訪', icon: 'schedule' },

  // 理賠管理
  { group: '理賠管理', groupOrder: 3, path: '/claims', label: '理賠查詢', title: '理賠查詢', icon: 'receipt_long', disabled: true },
  { group: '理賠管理', groupOrder: 3, path: '/claims/review', label: '理賠審核', title: '理賠審核', icon: 'rule', disabled: true },

  // 商品管理
  { group: '商品管理', groupOrder: 4, path: '/products', label: '商品維護', title: '商品維護', icon: 'inventory_2' },

  // 系統管理
  { group: '系統管理', groupOrder: 5, path: '/users', label: '使用者權限管理', title: '使用者權限管理', icon: 'admin_panel_settings', roles: ['REVIEWER'] },
]
