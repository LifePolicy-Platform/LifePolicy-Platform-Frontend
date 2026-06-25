/** tb_call_list.LIST_STATUS：0=未處理，1=已約訪，2=已結案 */
export const CALL_LIST_STATUS_LABEL: Record<number, string> = {
  0: '未處理',
  1: '已約訪',
  2: '已結案',
}

export function callListStatusLabel(status: number | null | undefined): string {
  if (status == null) return '—'
  return CALL_LIST_STATUS_LABEL[status] ?? String(status)
}

export function callListStatusColor(status: number | null | undefined): string {
  switch (status) {
    case 0:
      return 'orange'
    case 1:
      return 'blue'
    case 2:
      return 'green'
    default:
      return 'grey-7'
  }
}

/** 將 API / DB 回傳的名單狀態正規化為數字 */
export function normalizeListStatus(status: number | string | null | undefined): number | null {
  if (status == null || status === '') return null
  const value = Number(status)
  return Number.isFinite(value) ? value : null
}

/** 僅 0 未處理、2 已結案 可新增約訪 */
export function canCreateAppointment(listStatus: number | string | null | undefined): boolean {
  const status = normalizeListStatus(listStatus)
  return status === 0 || status === 2
}
