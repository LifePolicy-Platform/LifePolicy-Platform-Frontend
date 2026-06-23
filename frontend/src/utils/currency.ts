export function formatCurrency(
  value: number | string | null | undefined,
  emptyDisplay = '—',
): string {
  if (value == null || value === '') return emptyDisplay
  const num = typeof value === 'string' ? Number(value.replace(/,/g, '')) : value
  if (Number.isNaN(num)) return emptyDisplay
  return num.toLocaleString('zh-TW')
}

export function parseCurrencyInput(value: string): string {
  const digits = value.replace(/[^\d]/g, '')
  return digits ? String(Number(digits)) : ''
}
