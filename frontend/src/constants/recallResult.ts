/** tb_call_appointment.RECALL_RESULT：0=尚未完成，1=約訪成功，2=約訪失敗 */
export const RECALL_RESULT_LABEL: Record<number, string> = {
  0: '尚未完成',
  1: '約訪成功',
  2: '約訪失敗',
}

export function recallResultLabel(result: number | null | undefined): string {
  if (result == null) return '—'
  return RECALL_RESULT_LABEL[result] ?? String(result)
}

export function recallResultColor(result: number | null | undefined): string {
  switch (result) {
    case 0:
      return 'orange'
    case 1:
      return 'positive'
    case 2:
      return 'negative'
    default:
      return 'grey-7'
  }
}
