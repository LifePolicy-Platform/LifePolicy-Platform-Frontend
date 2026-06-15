// PolicySummary 的欄位名稱刻意對齊模擬 API 回傳格式，方便課堂說明前後端契約。
export interface PolicySummary {
  policyNo: string
  productName: string
  policyStatus: 'active' | 'pending' | 'expired'
  applicantName: string
  insuredName: string
  effectiveDate: string
  premium: number
  currency: 'TWD' | 'USD'
}