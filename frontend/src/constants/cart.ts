import type { CartCoupon } from '../types/cart'

/** 示範用折價碼（輸入 code 比對，不分大小寫） */
export const CART_COUPONS: readonly CartCoupon[] = [
  { code: 'SALE80', label: '8 折', type: 'rate', value: 0.8 },
  { code: 'SALE60', label: '6 折', type: 'rate', value: 0.6 },
  { code: 'OFF200', label: '折抵 200 元', type: 'fixed', value: 200 },
] as const

export function findCartCoupon(input: string): CartCoupon | undefined {
  const normalized = input.trim().toUpperCase()
  if (!normalized) {
    return undefined
  }
  return CART_COUPONS.find((coupon) => coupon.code === normalized)
}

export function calcCouponDiscount(productTotal: number, coupon: CartCoupon): number {
  if (productTotal <= 0) {
    return 0
  }
  if (coupon.type === 'rate') {
    return Math.round(productTotal * (1 - coupon.value))
  }
  return Math.min(coupon.value, productTotal)
}
