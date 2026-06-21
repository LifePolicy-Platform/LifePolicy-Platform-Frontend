export type ApplicationStatusCode = 'SUBMIT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'RETURN'

export const APPLICATION_STATUS_LABEL: Record<ApplicationStatusCode, string> = {
  SUBMIT: '待業務審核',
  PENDING: '待主管審核',
  APPROVED: '已核准',
  REJECTED: '已拒絕',
  RETURN: '退回補件',
}

export function applicationStatusLabel(status?: string | null): string {
  if (!status) return '—'
  return APPLICATION_STATUS_LABEL[status as ApplicationStatusCode] ?? status
}

export function applicationStatusColor(status?: string | null): string {
  switch (status) {
    case 'PENDING':
      return 'warning'
    case 'APPROVED':
      return 'positive'
    case 'REJECTED':
      return 'negative'
    case 'RETURN':
      return 'orange'
    case 'SUBMIT':
      return 'info'
    default:
      return 'grey'
  }
}

export function reviewSuccessMessage(status?: string | null): string {
  if (status === 'APPROVED') return '審核完成，案件已核准'
  if (status === 'REJECTED') return '審核完成，案件已駁回'
  if (status === 'PENDING') return '業務審核通過，案件已送交主管審核'
  if (status === 'RETURN') return '業務審核完成，案件已退回補件'
  return `審核完成，目前狀態：${applicationStatusLabel(status)}`
}

export const BUSINESS_REVIEW_OPTIONS = [
  { label: '核准', value: 'PENDING' },
  { label: '退回補件', value: 'RETURN' },
] as const

export const SUPERVISOR_REVIEW_OPTIONS = [
  { label: '主管核准', value: 'APPROVED' },
  { label: '主管駁回', value: 'REJECTED' },
] as const
