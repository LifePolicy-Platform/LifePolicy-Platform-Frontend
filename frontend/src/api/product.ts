import { requestJson } from '@/api/http'
import type { ProductListItem } from '@/types/productMgmt'
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