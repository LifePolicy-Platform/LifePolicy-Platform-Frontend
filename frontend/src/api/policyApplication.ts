import { requestJson } from '@/api/http'
import http from '@/api/http'
import type {
  PolicyCreateResult,
  PolicyQueryResult,
  PolicyRecord,
  PolicyReviewResult,
  PolicyUpdateResult,
} from '@/types/policyApplication'

const BASE = '/api/v1/insurance/policy-applications'

export async function createPolicyApplication(payload: Record<string, unknown>) {
  const response = await requestJson<PolicyCreateResult>(BASE, 'POST', payload)
  return response.DATA
}

export async function queryPolicyApplications(payload: Record<string, unknown>) {
  const response = await requestJson<PolicyQueryResult>(`${BASE}/query`, 'POST', payload)
  return response.DATA
}

export async function fetchPolicyApplicationById(applicationId: string): Promise<PolicyRecord | null> {
  const result = await queryPolicyApplications({
    APPLICATION_ID: applicationId.trim(),
    PAGE_NO: 1,
    PAGE_SIZE: 1,
    SORT_DIRECTION: 'DESC',
  })
  return result.RECORDS?.[0] ?? null
}

export async function updatePolicyApplication(applicationId: string, payload: Record<string, unknown>) {
  const response = await requestJson<PolicyUpdateResult>(`${BASE}/${applicationId}`, 'PUT', payload)
  return response.DATA
}

export async function reviewPolicyApplication(payload: Record<string, unknown>) {
  const response = await requestJson<PolicyReviewResult>(`${BASE}/review`, 'POST', payload)
  return response.DATA
}

export async function uploadPolicyFile(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  const response = await http.post(`${BASE}/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data.DATA as { fileName: string; filePath: string }
}

function triggerBlobDownload(blob: Blob, filename: string) {
  const blobUrl = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = blobUrl
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(blobUrl)
}

export async function downloadPolicyFile(path?: string | null, filename?: string | null) {
  if (!path?.trim()) return

  const response = await http.get(`${BASE}/files/download`, {
    params: {
      path: path.trim(),
      filename: filename?.trim() || undefined,
    },
    responseType: 'blob',
  })

  triggerBlobDownload(response.data as Blob, filename?.trim() || 'document')
}

export async function fetchIncompleteApplications(): Promise<PolicyRecord[]> {
  const response = await requestJson<PolicyRecord[]>(`${BASE}/incomplete`, 'GET')
  return response.DATA ?? []
}
