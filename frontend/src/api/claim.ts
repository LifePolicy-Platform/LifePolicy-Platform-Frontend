import { requestJson } from '@/api/http'
import http from '@/api/http' // 引用你原本的 http instance

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
  memberName?: string;     // 客戶姓名
  productCode?: string;    // 商品代碼
  productName?: string;    // 商品名稱
  agentName?: string;      // 經辦人姓名
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

/** 取得下拉選單資料 */
export function fetchMemberOptions() {
  return requestJson<any[]>('/api/admin/claim/member-options', 'GET')
}
export function fetchPolicyOptions() {
  return requestJson<any[]>('/api/admin/claim/policy-options', 'GET')
}
export function fetchAgentOptions() {
  return requestJson<any[]>('/api/admin/claim/agent-options', 'GET')
}

/** 檔案上傳 (特殊處理) */
export function uploadFileApi(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  // 這裡直接使用 http instance，因為它會自動帶入 Token，且 headers 會由瀏覽器自動處理 multipart
  return http.post('/api/admin/claim/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}