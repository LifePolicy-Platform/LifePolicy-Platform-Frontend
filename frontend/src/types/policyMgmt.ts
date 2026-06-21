export type PolicyStatus =
  | 'draft'
  | 'pending_review'
  | 'pending_docs'
  | 'active'
  | 'rejected'
  | 'expired'

export interface PolicyListItem {
  policyNo: string
  productName: string
  applicantName: string
  policyStatus: PolicyStatus
  annualPremium: number
  agentName: string
  effectiveDate: string
}

export interface PolicyDetail {
  policyNo: string
  productName: string
  policyStatus: PolicyStatus
  applicantName: string
  applicantGender: string
  applicantBirthday: string
  contactPhone: string
  relationship: string
  insuredIdNo: string
  insuredName: string
  insuredGender: string
  insuredBirthday: string
  sumInsured: number
  annualPremium: number
  effectiveDate: string
  expiryDate: string
  agentName: string
  riskLevel: string
  remark: string
  createdAt: string
}

export interface PolicyHistoryItem {
  id?: string | number
  time: string
  status: string
  statusCode?: string
  handler: string
  remark: string
  /** @deprecated 歷程表已移除事件欄，mock 資料相容用 */
  eventName?: string
  /** @deprecated 歷程表已移除原因欄，mock 資料相容用 */
  reason?: string
}

export interface PolicySearchFilter {
  policyNo: string
  applicantName: string
  policyStatus: PolicyStatus | ''
  effectiveDateFrom: string
  effectiveDateTo: string
}

export interface PolicyCreateForm {
  productCode: string
  sumInsured: number | null
  annualPremium: number | null
  effectiveDate: string
  applicantName: string
  applicantGender: string
  applicantBirthday: string
  contactPhone: string
  relationship: string
  insuredIdNo: string
  insuredName: string
  insuredGender: string
  insuredBirthday: string
  remark: string
}

export interface PolicyReviewItem {
  policyNo: string
  productName: string
  applicantName: string
  appliedAt: string
  policyStatus: PolicyStatus
  agentName: string
}

export interface PolicyVisitForm {
  visitDate: string
  visitTime: string
  remark: string
}
