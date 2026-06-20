import type { ProductStatus, ProductType } from '@/types/productMgmt'

export const PRODUCT_TYPE_LABEL: Record<ProductType, string> = {
  LIFE: '壽險',
  HEALTH: '醫療險',
  ACCIDENT: '意外險',
  ANNUITY: '年金險',
  TRAVEL: '旅平險',
}

export const PRODUCT_STATUS_LABEL: Record<ProductStatus, string> = {
  ACTIVE: '上架',
  INACTIVE: '下架',
}

export const PRODUCT_TYPE_OPTIONS = Object.entries(PRODUCT_TYPE_LABEL).map(
  ([value, label]) => ({ value: value as ProductType, label }),
)

export const PRODUCT_STATUS_OPTIONS = Object.entries(PRODUCT_STATUS_LABEL).map(
  ([value, label]) => ({ value: value as ProductStatus, label }),
)