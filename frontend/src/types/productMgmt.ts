export type ProductStatus = 'ACTIVE' | 'INACTIVE'

export type ProductType = 'LIFE' | 'HEALTH' | 'ACCIDENT' | 'ANNUITY' | 'TRAVEL'

export interface ProductListItem {
  productCode: string
  productName: string
  productType: ProductType
  basePremium: number
  minAmount: number
  maxAmount: number
  minAge: number
  maxAge: number
  status: ProductStatus
  remark: string | null
  createTime: string
  updateTime: string | null
  updateUser: string | null
}

export interface ProductSearchFilter {
  productCode: string
  productName: string
  productType: ProductType | ''
  status: ProductStatus | ''
}

export interface ProductListItem1 {
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
