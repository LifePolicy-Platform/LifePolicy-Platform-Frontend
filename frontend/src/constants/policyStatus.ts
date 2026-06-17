import type { PolicyStatus } from '@/types/policyMgmt'

export const POLICY_STATUS_LABEL: Record<PolicyStatus, string> = {
  draft: '草稿',
  pending_review: '審核中',
  pending_docs: '待補件',
  active: '已承保',
  rejected: '已拒保',
  expired: '已到期',
}
