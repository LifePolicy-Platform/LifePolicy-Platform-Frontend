export type ProductCategory = 'threeCPd' | 'homeAppliances' | 'food' | 'book' | 'life'

/** 商品陣列庫存 */
export interface Product {
  id: string
  pdName: string
  pdCategory: ProductCategory
  pdDesc: string
  image: string
  pdPrice: number
}
