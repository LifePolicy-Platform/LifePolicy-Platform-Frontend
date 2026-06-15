import { defineStore } from 'pinia'
import { calcCouponDiscount, findCartCoupon } from '../constants/cart'
import { MOCK_PRODUCTS } from '../constants/search'
import type { Product } from '../types/search'
import type { CartCoupon } from '../types/cart'

export interface CartLine {
  productId: string
  quantity: number
  selected: boolean
  useDiscount: boolean
  lineKey: string
}

export interface CartLineView extends CartLine {
  product: Product
  lineSubtotal: number
  originalSubtotal: number
}

const ITEM_DISCOUNT_RATE = 0.8

// 還沒了解寫法
export const useCartStore = defineStore('cart', {
  state: () => ({
    lines: [
      { productId: 'threeCPd-1', quantity: 1, selected: true, useDiscount: false, lineKey: 'threeCPd-1::N' },
      { productId: 'food-2', quantity: 1, selected: true, useDiscount: false, lineKey: 'food-2::N' },
    ] as CartLine[],
    appliedCouponCode: '' as string,
  }),

  getters: {
    lineViews(state): CartLineView[] {
      return state.lines
        .map((line) => {
          const product = MOCK_PRODUCTS.find((item) => item.id === line.productId)
          if (!product) {
            return null
          }
          const rate = line.useDiscount ? ITEM_DISCOUNT_RATE : 1
          const originalSubtotal = product.pdPrice * line.quantity
          return {
            ...line,
            product,
            lineSubtotal: Math.round(product.pdPrice * line.quantity * rate),
            originalSubtotal,
          }
        })
        .filter((line): line is CartLineView => line !== null)
    },

    selectedLines(): CartLineView[] {
      return this.lineViews.filter((line) => line.selected)
    },

    selectedCount(): number {
      return this.selectedLines.length
    },

    /** 購物車品項數（每一列算 1 項，含未勾選） */
    cartLineCount(state): number {
      return state.lines.length
    },

    allSelected(): boolean {
      return this.lineViews.length > 0 && this.lineViews.every((line) => line.selected)
    },

    productTotal(): number {
      return this.selectedLines.reduce((sum, line) => sum + line.lineSubtotal, 0)
    },

    appliedCoupon(): CartCoupon | null {
      if (!this.appliedCouponCode) {
        return null
      }
      return findCartCoupon(this.appliedCouponCode) ?? null
    },

    couponDiscount(): number {
      const coupon = this.appliedCoupon
      if (!coupon || this.selectedCount < 1) {
        return 0
      }
      return calcCouponDiscount(this.productTotal, coupon)
    },

    checkoutTotal(): number {
      return this.productTotal - this.couponDiscount
    },
  },

  actions: {
    addLine(productId: string, quantity = 1, useDiscount = false) {
      const lineKey = `${productId}::${useDiscount ? 'D' : 'N'}`
      const existing = this.lines.find((line) => line.lineKey === lineKey)
      if (existing) {
        existing.quantity += quantity
        existing.selected = true
        return
      }
      this.lines.push({ productId, quantity, selected: true, useDiscount, lineKey })
    },

    removeLine(lineKey: string) {
      this.lines = this.lines.filter((line) => line.lineKey !== lineKey)
    },

    setQuantity(lineKey: string, quantity: number) {
      const line = this.lines.find((item) => item.lineKey === lineKey)
      if (!line) {
        return
      }
      line.quantity = Math.max(1, quantity)
    },

    toggleLine(lineKey: string, selected: boolean) {
      const line = this.lines.find((item) => item.lineKey === lineKey)
      if (line) {
        line.selected = selected
      }
    },

    setSelectAll(selected: boolean) {
      this.lines.forEach((line) => {
        line.selected = selected
      })
    },

    applyCoupon(input: string): { ok: true; coupon: CartCoupon } | { ok: false } {
      const coupon = findCartCoupon(input)
      if (!coupon) {
        this.appliedCouponCode = ''
        return { ok: false }
      }
      this.appliedCouponCode = coupon.code
      return { ok: true, coupon }
    },

    clearCoupon() {
      this.appliedCouponCode = ''
    },
  },
})
