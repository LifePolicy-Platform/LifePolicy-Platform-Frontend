import { http } from '@/api/http'
import type { ApiEnvelope } from '@/types/auth'
import type { NotificationItem, UnreadCountResponse } from '@/types/notification'

export async function fetchUnreadCount(): Promise<number> {
  const res = await http.get<ApiEnvelope<UnreadCountResponse>>('/api/notifications/unread-count')
  return res.data.DATA?.count ?? 0
}

export async function fetchNotifications(page = 0, size = 10): Promise<NotificationItem[]> {
  const res = await http.get<ApiEnvelope<NotificationItem[]>>('/api/notifications', {
    params: { page, size },
  })
  return res.data.DATA ?? []
}

export async function markAsRead(notifNo: number): Promise<void> {
  await http.put(`/api/notifications/${notifNo}/read`)
}

export async function markAllAsRead(): Promise<void> {
  await http.put('/api/notifications/read-all')
}