import { fetchAptRecords, updateAptRecords } from '@/api/customer'
import type { AptBatchUpdateRequest, AptBatchUpdateResponse, AptRecordListRequest, AptRecordListResponse } from '@/types/customer'

/** 查詢約訪名單 */
export async function searchAptRecords(params: AptRecordListRequest): Promise<AptRecordListResponse[]> {
  return fetchAptRecords(params)
}

/** 批次更新約訪時間 */
export async function batchUpdateAptRecords(
  payload: AptBatchUpdateRequest,
): Promise<AptBatchUpdateResponse[]> {
  return updateAptRecords(payload)
}
