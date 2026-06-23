export interface NotificationItem {
  notifNo: number
  notifType: string
  title: string
  content: string
  refNo: string | null
  recipientUsername: string
  isRead: number
  sendTime: string | null
  createTime: string
}

export interface UnreadCountResponse {
  count: number
}