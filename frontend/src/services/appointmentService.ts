import { fetchAptRecords, fetchAptRecordsByIdentityCard, updateAptRecords } from '@/api/customer'
import type { AptBatchUpdateRequest, AptBatchUpdateResponse, AptRecordListRequest, AptRecordListResponse } from '@/types/customer'

/** 查詢約訪名單 */
export async function searchAptRecords(params: AptRecordListRequest): Promise<AptRecordListResponse[]> {
  return fetchAptRecords(params)
}

/** 依身分證字號查詢約訪歷程 */
export async function searchAptRecordsByIdentityCard(identityCard: string): Promise<AptRecordListResponse[]> {
  return fetchAptRecordsByIdentityCard(identityCard)
}

/** 批次更新約訪時間 */
export async function batchUpdateAptRecords(
  payload: AptBatchUpdateRequest,
): Promise<AptBatchUpdateResponse[]> {
  return updateAptRecords(payload)
}
