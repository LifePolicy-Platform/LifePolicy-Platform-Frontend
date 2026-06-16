// policyService.ts
// 注意：這裡的 api 是你專案裡已設定好的 axios 實例（會自動帶 JWT、處理 401）
// 請對照 userService.ts 的 import 路徑，改成你實際的位置

// ---- 型別定義 ----

// 新增 / 修改 投保申請用的 payload
export interface PolicyApplicationPayload {
  APPLICANT_ID_NO: string
  APPLICANT_NAME: string
  APPLICANT_GENDER: string
  APPLICANT_BIRTHDATE: string
  RELATIONSHIP_TO_INSURED: string
  INSURED_ID_NO: string
  INSURED_NAME: string
  INSURED_GENDER: string
  INSURED_BIRTHDATE: string
  PRODUCT_CODE: string
  SUM_INSURED: number
  ANNUAL_PREMIUM: number
  CONTACT_PHONE: string
}

// 查詢條件
export interface PolicyQueryPayload {
  APPLICATION_ID?: string
  APPLICANT_ID_NO?: string
  INSURED_ID_NO?: string
  APPLICATION_STATUS?: string
  PRODUCT_CODE?: string
  SUBMISSION_START_TIME?: string | null
  SUBMISSION_END_TIME?: string | null
  PAGE_NO: number
  PAGE_SIZE: number
  SORT_DIRECTION: string
}

// 查詢結果的單筆資料
export interface PolicyRecord {
  APPLICATION_ID: string
  APPLICANT_ID_NO: string
  APPLICANT_NAME: string
  APPLICANT_GENDER: string
  APPLICANT_BIRTHDATE: string
  RELATIONSHIP_TO_INSURED: string
  INSURED_ID_NO: string
  INSURED_NAME: string
  INSURED_GENDER: string
  INSURED_BIRTHDATE: string
  PRODUCT_CODE: string
  PRODUCT_NAME: string
  SUM_INSURED: number
  ANNUAL_PREMIUM: number
  CONTACT_PHONE: string
  APPLICATION_STATUS: string
  RISK_LEVEL: string
  PREMIUM_RATIO: number
  REJECTION_REASON?: string
}

// 查詢回傳的分頁結構
export interface PolicyQueryResult {
  RECORDS: PolicyRecord[]
  PAGE_NO: number
  TOTAL_PAGES: number
  TOTAL_COUNT: number
}

// 審核 payload
export interface PolicyReviewPayload {
  APPLICATION_ID: string
  TARGET_STATUS: string
  REJECTION_REASON: string | null
  DOCUMENTS_CONFIRMED: boolean
}

// 商品
export interface Product {
  code: string
  name: string
  minInsuredAge: number
  maxInsuredAge: number
  minSumInsured: number
  maxSumInsured: number
}

// ---- API 呼叫 ----

// 新增投保申請
export async function createPolicyApplication(
  payload: PolicyApplicationPayload
): Promise<PolicyRecord> {
  const res = await api.post('/api/v1/insurance/policy-applications', payload)
  return res.data.DATA
}

// 查詢投保申請（含分頁）
export async function queryPolicyApplications(
  payload: PolicyQueryPayload
): Promise<PolicyQueryResult> {
  const res = await api.post('/api/v1/insurance/policy-applications/query', payload)
  return res.data.DATA
}

// 修改投保申請
export async function updatePolicyApplication(
  applicationId: string,
  payload: PolicyApplicationPayload
): Promise<PolicyRecord> {
  const res = await api.put(
    `/api/v1/insurance/policy-applications/${applicationId}`,
    payload
  )
  return res.data.DATA
}

// 審核投保申請
export async function reviewPolicyApplication(
  payload: PolicyReviewPayload
): Promise<PolicyRecord> {
  const res = await api.post('/api/v1/insurance/policy-applications/review', payload)
  return res.data.DATA
}

// 取得商品清單
// 如果後端有商品 API，改成實際路徑；目前先用 PRODUCTS 常數，見 PolicyWorkbenchView.vue
// export async function fetchProducts(): Promise<Product[]> {
//   const res = await api.get('/api/v1/insurance/products')
//   return res.data.DATA
// }