import { requestJson } from '@/api/http'
import type { PolicyAprvLogItem } from '@/types/policyAprvLog'

export async function fetchPolicyAprvLogs(policyNo: string) {
  const response = await requestJson<PolicyAprvLogItem[]>(`/api/policy-log/${encodeURIComponent(policyNo)}`, 'GET')
  return response.DATA ?? []
}
