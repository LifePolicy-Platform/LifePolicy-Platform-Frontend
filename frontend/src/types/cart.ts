export type CartCouponType = 'rate' | 'fixed'

export interface CartCoupon {
  code: string
  label: string
  type: CartCouponType
  /** rate：乘數（0.8、0.6）；fixed：折抵金額（如 200） */
  value: number
}

