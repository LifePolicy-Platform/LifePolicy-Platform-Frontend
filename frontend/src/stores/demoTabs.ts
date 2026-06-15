import { defineStore } from 'pinia'

// 保留 store 供未來全域 UI 狀態使用
export const useDemoUiStore = defineStore('demoUi', {
  state: () => ({}),
  actions: {},
})
