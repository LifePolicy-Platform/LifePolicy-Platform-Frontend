export type ApplicationStatusCode = 'SUBMIT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'RETURN'

export const APPLICATION_STATUS_LABEL: Record<ApplicationStatusCode, string> = {
  SUBMIT: '已送件',
  PENDING: '待審核',
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
      return 'grey'
    default:
      return 'grey'
  }
}

export function reviewSuccessMessage(status?: string | null): string {
  if (status === 'APPROVED') return '審核完成，案件已核准'
  if (status === 'REJECTED') return '審核完成，案件已拒絕'
  return `審核完成，目前狀態：${applicationStatusLabel(status)}`
}
