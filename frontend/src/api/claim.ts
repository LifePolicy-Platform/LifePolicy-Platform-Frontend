import { requestJson } from '@/api/http'

export interface ClaimFilter {
  status: string
  policyNo: string
  applyDate: string
}

export interface ClaimModel {
  claimNo?: string
  memberId: number | null
  policyNo: string
  claimAmount: number
  approveAmount: number | null
  claimStatus?: string
  agentId: number | null
  remark: string
  updateUser: string
  file01Name?: string
  file01Path?: string
  file02Name?: string
  file02Path?: string
}

/** 查詢清單 */
export function fetchClaims(filters: ClaimFilter) {
  const query = new URLSearchParams(filters as any).toString()
  return requestJson<ClaimModel[]>(`/api/admin/claim/list?${query}`, 'GET')
}

/** 取得詳情 */
export function fetchClaimDetail(claimNo: string) {
  return requestJson<ClaimModel>(`/api/admin/claim/${claimNo}`, 'GET')
}

/** 新增理賠 */
export function createClaimApi(data: ClaimModel) {
  return requestJson('/api/admin/claim', 'POST', data)
}

/** 更新理賠 */
export function updateClaimApi(claimNo: string, data: ClaimModel) {
  return requestJson(`/api/admin/claim/${claimNo}`, 'PUT', data)
}

/** 刪除案件 */
export function deleteClaimApi(claimNo: string) {
  return requestJson(`/api/admin/claim/${claimNo}`, 'DELETE')
}