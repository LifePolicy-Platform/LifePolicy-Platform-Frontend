import { requestJson } from '@/api/http'
import type { ProductListItem } from '@/types/productMgmt'
import type { ApiEnvelope } from '@/types/auth'

export function fetchProducts(): Promise<ApiEnvelope<ProductListItem[]>> {
  return requestJson<ProductListItem[]>('/api/v1/products', 'GET')
}

export function fetchProductByCode(code: string): Promise<ApiEnvelope<ProductListItem>> {
  return requestJson<ProductListItem>(`/api/v1/products/${code}`, 'GET')
}