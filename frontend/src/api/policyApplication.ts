import { requestJson } from '@/api/http'
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
