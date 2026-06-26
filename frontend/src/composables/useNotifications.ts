import { ref, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import {
  fetchUnreadCount,
  fetchNotifications,
  markAsRead as apiMarkAsRead,
  markAllAsRead as apiMarkAllAsRead,
} from '@/api/notification'
import type { NotificationItem } from '@/types/notification'

const POLL_INTERVAL_MS = 20_000

export function useNotifications() {
  const authStore = useAuthStore()
  const unreadCount = ref(0)
  const notifications = ref<NotificationItem[]>([])
  const isLoading = ref(false)

  let timer: ReturnType<typeof setInterval> | null = null

  async function refreshCount() {
    if (!authStore.isAuthenticated) return
    try {
      unreadCount.value = await fetchUnreadCount()
    } catch {
      // 靜默失敗，不中斷畫面
    }
  }

  async function loadNotifications() {
    if (!authStore.isAuthenticated) return
    isLoading.value = true
    try {
      notifications.value = await fetchNotifications(0, 15)
    } finally {
      isLoading.value = false
    }
  }

  async function markAsRead(notifNo: number) {
    await apiMarkAsRead(notifNo)
    const item = notifications.value.find(n => n.notifNo === notifNo)
    if (item) item.isRead = 1
    unreadCount.value = Math.max(0, unreadCount.value - 1)
  }

  async function markAllAsRead() {
    await apiMarkAllAsRead()
    notifications.value.forEach(n => (n.isRead = 1))
    unreadCount.value = 0
  }

  onMounted(() => {
    refreshCount()
    timer = setInterval(refreshCount, POLL_INTERVAL_MS)
  })

  onUnmounted(() => {
    if (timer) clearInterval(timer)
  })

  return {
    unreadCount,
    notifications,
    isLoading,
    refreshCount,
    loadNotifications,
    markAsRead,
    markAllAsRead,
  }
}
