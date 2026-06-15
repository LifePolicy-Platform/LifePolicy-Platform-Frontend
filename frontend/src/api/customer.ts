import { http } from '@/api/http'
import type {
  AptRecordListResponse,
  AptRecordListRequest,
  AptBatchUpdateRequest,
  AptBatchUpdateResponse,
  ApiResponse,
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