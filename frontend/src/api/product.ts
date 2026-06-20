import { http, requestJson } from '@/api/http'
import type { ProductApiResponse, ProductListItem, ProductStatus, ProductType } from '@/types/productMgmt'
import type { ApiEnvelope } from '@/types/auth'

/** 對應後端 ProductEntity（/api/products/active） */
function mapProduct(item: Record<string, unknown>): ProductListItem {
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
export async function fetchActiveProducts(): Promise<ProductListItem[]> {
  const response = await http.get<ProductApiResponse>('/api/products/active')
  const body = response.data
  if (body.code !== 0) {
    throw new Error(body.message || '載入商品失敗')
  }
  return (body.data ?? []).map((item) => mapProduct(item as unknown as Record<string, unknown>))
}

/** 商品列表（供商品維護頁等使用） */
export async function fetchProducts(): Promise<ProductListItem[]> {
  return fetchActiveProducts()
}

export function fetchProductByCode(code: string): Promise<ApiEnvelope<ProductListItem>> {
  return requestJson<ProductListItem>(`/api/v1/products/${code}`, 'GET')
}
