export type ProductStatus = 'active' | 'inactive'

export type ProductType = 'life' | 'health' | 'accident' | 'annuity' | 'travel'

export interface ProductListItem {
  code: string
  name: string
  productType: ProductType
  status: ProductStatus
  minInsuredAge: number
  maxInsuredAge: number
  minSumInsured: number
  maxSumInsured: number
  createdAt: string
}

export interface ProductSearchFilter {
  code: string
  name: string
  productType: ProductType | ''
  status: ProductStatus | ''
}
