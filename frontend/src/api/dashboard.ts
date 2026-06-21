import { requestJson } from '@/api/http'
import type { DashboardSummary } from '@/types/dashboard'

export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  const response = await requestJson<DashboardSummary>('/api/dashboard/summary', 'GET')
  if (!response.DATA) {
    throw new Error('Dashboard 資料為空')
  }
  return response.DATA
}
