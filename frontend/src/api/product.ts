import { http, requestJson } from '@/api/http'
import type { ProductApiResponse, ProductListItem, ProductStatus, ProductType, ProductListItem1 } from '@/types/productMgmt'
import type { ApiEnvelope } from '@/types/auth'

export interface ProductCreatePayload {
  PRODUCT_CODE: string
  PRODUCT_NAME: string
  PRODUCT_TYPE: string
  BASE_PREMIUM: number
  MIN_AMOUNT: number
  MAX_AMOUNT: number
  MIN_AGE: number
  MAX_AGE: number
  REMARK?: string
}

export interface ProductUpdatePayload {
  PRODUCT_NAME: string
  PRODUCT_TYPE: string
  BASE_PREMIUM: number
  MIN_AMOUNT: number
  MAX_AMOUNT: number
  MIN_AGE: number
  MAX_AGE: number
  STATUS: string
  REMARK?: string
}

export function fetchProducts(): Promise<ApiEnvelope<ProductListItem[]>> {
  return requestJson<ProductListItem[]>('/api/v1/products', 'GET')
}

export function fetchProductByCode(code: string): Promise<ApiEnvelope<ProductListItem>> {
  return requestJson<ProductListItem>(`/api/v1/products/${code}`, 'GET')
}

export function createProduct(payload: ProductCreatePayload): Promise<ApiEnvelope<ProductListItem>> {
  return requestJson<ProductListItem>('/api/v1/products', 'POST', payload)
}

export function updateProduct(code: string, payload: ProductUpdatePayload): Promise<ApiEnvelope<ProductListItem>> {
  return requestJson<ProductListItem>(`/api/v1/products/${code}`, 'PUT', payload)
}

export function activateProduct(code: string): Promise<ApiEnvelope<ProductListItem>> {
  return requestJson<ProductListItem>(`/api/v1/products/${code}/activate`, 'PATCH')
}

export function deactivateProduct(code: string): Promise<ApiEnvelope<ProductListItem>> {
  return requestJson<ProductListItem>(`/api/v1/products/${code}/deactivate`, 'PATCH')
}

/** 對應後端 ProductEntity（/api/products/active） */
function mapProduct(item: Record<string, unknown>): ProductListItem1 {
  return {
    code: String(item.productCode ?? ''),
    name: String(item.productName ?? ''),
    productType: (String(item.productType ?? 'LIFE').toUpperCase() as ProductType),
    basePremium: Number(item.basePremium ?? 0),
    minSumInsured: Number(item.minAmount ?? 0),
    maxSumInsured: Number(item.maxAmount ?? 0),
    minInsuredAge: Number(item.minAge ?? 0),
    maxInsuredAge: Number(item.maxAge ?? 0),
    status: (String(item.status ?? 'ACTIVE').toUpperCase() as ProductStatus),
    remark: item.remark != null ? String(item.remark) : null,
    createTime: item.createTime != null ? String(item.createTime) : '',
  }
}

/** 取得上架中商品（/api/products/active） */
export async function fetchActiveProducts(): Promise<ProductListItem1[]> {
  const response = await http.get<ProductApiResponse>('/api/products/active')
  const body = response.data
  if (body.code !== 0) {
    throw new Error(body.message || '載入商品失敗')
  }
  return (body.data ?? []).map((item) => mapProduct(item as unknown as Record<string, unknown>))
}