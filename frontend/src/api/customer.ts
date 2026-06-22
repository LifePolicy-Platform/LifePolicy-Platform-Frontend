import { http } from '@/api/http'
import type {
  AptRecordListResponse,
  AptRecordListRequest,
  AptBatchUpdateRequest,
  AptBatchUpdateResponse,
  ApiResponse,
  PolicyAppointmentContext,
  ActiveProjectOption,
  CallAppointmentItem,
  CallAppointmentCreateRequest,
  CallAppointmentCreateResponse,
  CallAppointmentConfirmRequest,
  CallAppointmentConfirmResponse,
} from '@/types/customer'

/** 查詢約訪名單 */
export async function fetchAptRecords(params: AptRecordListRequest) {
  const response = await http.get<ApiResponse<AptRecordListResponse[]>>(
    '/api/apt-records',
    { params },
  )
  return response.data.data
}

/** 批次更新約訪時間 */
export async function updateAptRecords(payload: AptBatchUpdateRequest) {
  const response = await http.post<ApiResponse<AptBatchUpdateResponse[]>>(
    '/api/customer/updateAppoint',
    payload,
  )
  return response.data.data
}

/** 保單約訪自動帶入欄位 */
export async function fetchPolicyAppointmentContext(policyNo: string) {
  const response = await http.get<ApiResponse<PolicyAppointmentContext | null>>(
    '/api/apt-records/policy-context',
    { params: { policyNo } },
  )
  return response.data.data
}

/** 期限內專案選項 */
export async function fetchActiveProjects() {
  const response = await http.get<ApiResponse<ActiveProjectOption[]>>(
    '/api/apt-records/active-projects',
  )
  return response.data.data
}

/** 名單約訪歷程 */
export async function fetchAppointmentsByListNo(listNo: string) {
  const response = await http.get<ApiResponse<CallAppointmentItem[]>>(
    `/api/apt-records/by-list/${encodeURIComponent(listNo)}`,
  )
  return response.data.data
}

/** 新增約訪 */
export async function createCallAppointment(payload: CallAppointmentCreateRequest) {
  const response = await http.post<ApiResponse<CallAppointmentCreateResponse>>(
    '/api/customer/createAppoint',
    payload,
  )
  return response.data.data
}

/** 確認約訪結果 */
export async function confirmCallAppointmentResult(payload: CallAppointmentConfirmRequest) {
  const response = await http.post<ApiResponse<CallAppointmentConfirmResponse>>(
    '/api/customer/confirmAppointResult',
    payload,
  )
  return response.data.data
}