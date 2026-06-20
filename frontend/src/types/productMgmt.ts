/** 對應後端 ApiResponse 包裝（/api/products/active） */
export interface ProductApiResponse {
  code: number
  message: string
  data: ProductListItem[]
}

export type ProductStatus = 'ACTIVE' | 'INACTIVE'

export type ProductType = 'LIFE' | 'HEALTH' | 'ACCIDENT' | 'ANNUITY' | 'TRAVEL'

export interface ProductListItem {
  code: string
  name: string
  productType: ProductType
  basePremium: number
  minSumInsured: number
  maxSumInsured: number
  minInsuredAge: number
  maxInsuredAge: number
  status: ProductStatus
  remark: string | null
  createTime: string
}

export interface ProductSearchFilter {
  code: string
  name: string
  productType: ProductType | ''
  status: ProductStatus | ''
}