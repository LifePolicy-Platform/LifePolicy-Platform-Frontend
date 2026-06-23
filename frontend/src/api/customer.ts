import { http } from '@/api/http'
import type { ApiEnvelope } from '@/types/auth'
import type {
  AptRecordListResponse,
  AptRecordListRequest,
  AptBatchUpdateRequest,
  AptBatchUpdateResponse,
  PolicyAppointmentContext,
  ActiveProjectOption,
  CallAppointmentItem,
  CallAppointmentCreateRequest,
  CallAppointmentCreateResponse,
  CallAppointmentConfirmRequest,
  CallAppointmentConfirmResponse,
} from '@/types/customer'

function unwrapCustomerData<T>(response: { data: ApiEnvelope<T> }): T {
  return response.data.DATA
}

/** 查詢約訪名單 */
export async function fetchAptRecords(params: AptRecordListRequest) {
  const response = await http.get<ApiEnvelope<AptRecordListResponse[]>>(
    '/api/apt-records',
    { params },
  )
  return unwrapCustomerData(response)
}

/** 依客戶姓名查詢約訪歷程 */
export async function fetchAptRecordsByCustName(custName: string) {
  const response = await http.get<ApiEnvelope<AptRecordListResponse[]>>(
    '/api/apt-records/history',
    { params: { name: custName } },
  )
  return unwrapCustomerData(response) ?? []
}

/** 批次更新約訪時間 */
export async function updateAptRecords(payload: AptBatchUpdateRequest) {
  const response = await http.post<ApiEnvelope<AptBatchUpdateResponse[]>>(
    '/api/customer/updateAppoint',
    payload,
  )
  return unwrapCustomerData(response)
}

/** 保單約訪自動帶入欄位 */
export async function fetchPolicyAppointmentContext(policyNo: string) {
  const response = await http.get<ApiEnvelope<PolicyAppointmentContext | null>>(
    '/api/apt-records/policy-context',
    { params: { policyNo } },
  )
  return unwrapCustomerData(response)
}

/** 期限內專案選項 */
export async function fetchActiveProjects() {
  const response = await http.get<ApiEnvelope<ActiveProjectOption[]>>(
    '/api/apt-records/active-projects',
  )
  return unwrapCustomerData(response)
}

/** 名單約訪歷程 */
export async function fetchAppointmentsByListNo(listNo: string) {
  const response = await http.get<ApiEnvelope<CallAppointmentItem[]>>(
    `/api/apt-records/by-list/${encodeURIComponent(listNo)}`,
  )
  return unwrapCustomerData(response) ?? []
}

/** 新增約訪 */
export async function createCallAppointment(payload: CallAppointmentCreateRequest) {
  const response = await http.post<ApiEnvelope<CallAppointmentCreateResponse>>(
    '/api/customer/createAppoint',
    payload,
  )
  return unwrapCustomerData(response)
}

/** 確認約訪結果 */
export async function confirmCallAppointmentResult(payload: CallAppointmentConfirmRequest) {
  const response = await http.post<ApiEnvelope<CallAppointmentConfirmResponse>>(
    '/api/customer/confirmAppointResult',
    payload,
  )
  return unwrapCustomerData(response)
}
