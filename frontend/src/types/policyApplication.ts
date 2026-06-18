export interface PolicyRecord {
  APPLICATION_ID: string
  APPLICANT_ID_NO?: string
  APPLICANT_NAME?: string
  APPLICANT_GENDER?: string
  APPLICANT_BIRTHDATE?: string
  RELATIONSHIP_TO_INSURED?: string
  INSURED_ID_NO?: string
  INSURED_NAME?: string
  INSURED_GENDER?: string
  INSURED_BIRTHDATE?: string
  PRODUCT_CODE?: string
  PRODUCT_NAME?: string
  SUM_INSURED?: number
  ANNUAL_PREMIUM?: number
  CONTACT_PHONE?: string
  APPLICATION_STATUS?: string
  REJECTION_REASON?: string
  RISK_LEVEL?: string
  PREMIUM_RATIO?: number
}

export interface PolicyQueryResult {
  RECORDS: PolicyRecord[]
  PAGE_NO: number
  TOTAL_PAGES: number
  TOTAL_COUNT: number
}

export interface PolicyCreateResult {
  APPLICATION_ID: string
}

export interface PolicyUpdateResult {
  RISK_LEVEL: string
}

export interface PolicyReviewResult {
  APPLICATION_STATUS: string
}
