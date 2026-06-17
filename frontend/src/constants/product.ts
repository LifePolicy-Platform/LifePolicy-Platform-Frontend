import type { ProductStatus, ProductType } from '@/types/productMgmt'

export const PRODUCT_TYPE_LABEL: Record<ProductType, string> = {
  life: '壽險',
  health: '醫療險',
  accident: '意外險',
  annuity: '年金險',
  travel: '旅平險',
}

export const PRODUCT_STATUS_LABEL: Record<ProductStatus, string> = {
  active: '上架',
  inactive: '下架',
}

export const PRODUCT_TYPE_OPTIONS = Object.entries(PRODUCT_TYPE_LABEL).map(
  ([value, label]) => ({ value: value as ProductType, label }),
)

export const PRODUCT_STATUS_OPTIONS = Object.entries(PRODUCT_STATUS_LABEL).map(
  ([value, label]) => ({ value: value as ProductStatus, label }),
)
