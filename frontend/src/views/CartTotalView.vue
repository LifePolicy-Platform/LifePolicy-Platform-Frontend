<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useQuasar } from 'quasar'
import { CART_COUPONS } from '../constants/cart'
import { useCartStore } from '../stores/cart'
import { PRODUCT_Category_LABEL } from '../constants/search'

const $q = useQuasar()
const cartStore = useCartStore()

const {
  lineViews,
  selectedCount,
  allSelected,
  productTotal,
  appliedCoupon,
  couponDiscount,
  checkoutTotal,
} = storeToRefs(cartStore)

const couponInput = ref('')
const isEmpty = computed(() => lineViews.value.length === 0)

onMounted(() => {
  if (cartStore.appliedCouponCode) {
    couponInput.value = cartStore.appliedCouponCode
  }
})

const couponHint = computed(() =>
  CART_COUPONS.map((item) => item.code).join(' / '),
)

function onApplyCoupon() {
  const result = cartStore.applyCoupon(couponInput.value)
  if (result.ok) {
    couponInput.value = result.coupon.code
    $q.notify({ type: 'positive', message: `已套用：${result.coupon.label}` })
    return
  }
  $q.notify({ type: 'negative', message: '折價碼無效，請重新輸入' })
}

function onClearCoupon() {
  couponInput.value = ''
  cartStore.clearCoupon()
}

function formatMoney(n: number) {
  return n.toLocaleString('zh-TW', {
    style: 'currency',
    currency: 'TWD',
    maximumFractionDigits: 0,
  })
}

function formatMoneySigned(n: number) {
  if (n === 0) {
    return formatMoney(0)
  }
  return n < 0 ? `-${formatMoney(Math.abs(n))}` : formatMoney(n)
}

function onCheckout() {
  if (selectedCount.value === 0) {
    $q.notify({ type: 'warning', message: '請先勾選要結帳的商品' })
    return
  }
  $q.notify({
    type: 'positive',
    message: `結帳成功（示範）共 ${formatMoney(checkoutTotal.value)}`,
  })
}
</script>

<template>
  <section class="cart-page">
    <div class="text-h5 q-mb-md">購物車</div>

    <div v-if="!isEmpty" class="row q-col-gutter-lg cart-layout">
      <div class="col-12 col-lg-8">
        <q-card flat bordered class="q-mb-md">
          <q-card-section class="row items-center q-gutter-sm">
            <q-checkbox :model-value="allSelected" label="全選" @update:model-value="cartStore.setSelectAll" />
            <span class="text-caption text-grey-7">
              已選 {{ selectedCount }} 項商品
            </span>
          </q-card-section>
        </q-card>

        <q-card v-for="line in lineViews" :key="line.lineKey" flat bordered class="cart-line-card q-mb-md">
          <q-card-section class="row items-start q-col-gutter-md no-wrap">
            <q-checkbox :model-value="line.selected" class="cart-line-card__check"
              @update:model-value="(val) => cartStore.toggleLine(line.lineKey, !!val)" />

            <q-img :src="line.product.image" :alt="line.product.pdName" class="cart-line-card__img" ratio="1" />

            <div class="col cart-line-card__info">
              <div class="text-caption text-grey-7">
                {{ PRODUCT_Category_LABEL[line.product.pdCategory] }}
              </div>  
              <div class="text-subtitle1 text-weight-medium cart-line-card__name">
                {{ line.product.pdName }}
              </div>
              <div class="text-caption text-grey-8 q-mt-xs">
                {{ line.product.pdDesc }}
              </div>
              <div class="text-caption text-grey-7 q-mt-xs">
                {{ line.useDiscount ? '已使用優惠' : '未使用優惠' }}
              </div>
            </div>

            <div class="column items-end cart-line-card__side">
              <div class="cart-line-card__prices">
                <span class="cart-line-card__price">{{ formatMoney(line.lineSubtotal) }}</span>
                <span v-if="line.useDiscount" class="cart-line-card__list-price">
                  {{ formatMoney(line.originalSubtotal) }}
                </span>
              </div>

              <div class="row items-center q-gutter-xs q-mt-sm">
                <q-btn round dense flat icon="remove" :disable="line.quantity <= 1"
                  @click="cartStore.setQuantity(line.lineKey, line.quantity - 1)" />
                <q-input :model-value="line.quantity" type="number" dense outlined class="cart-line-card__qty-input"
                  min="1" @update:model-value="
                    (val) => cartStore.setQuantity(line.lineKey, Number(val) || 1)
                  " />
                <q-btn round dense flat icon="add" @click="cartStore.setQuantity(line.lineKey, line.quantity + 1)" />
              </div>

              <q-btn flat dense color="grey-8" label="移除" class="q-mt-sm"
                @click="cartStore.removeLine(line.lineKey)" />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-lg-4">
        <q-card bordered class="checkout-panel">
          <q-card-section>
            <div class="text-h6">結帳明細</div>
          </q-card-section>

          <q-separator />

          <q-card-section class="checkout-panel__coupon">
            <div class="text-subtitle2 q-mb-sm">優惠碼</div>
            <div class="coupon-form">
              <q-input v-model="couponInput" dense outlined placeholder="輸入優惠碼" clearable class="coupon-form__input"
                @keyup.enter="onApplyCoupon" />
              <q-btn unelevated color="primary" label="套用" class="coupon-form__btn" @click="onApplyCoupon" />
            </div>
            <p class="text-caption text-grey-7 q-mt-xs q-mb-none">
              示範代碼：{{ couponHint }}
            </p>
            <div v-if="appliedCoupon" class="row items-center q-gutter-sm q-mt-sm">
              <span class="text-positive text-caption">
                ✓ {{ appliedCoupon.label }}
              </span>
              <q-btn flat dense size="sm" color="grey-8" label="清除" @click="onClearCoupon" />
            </div>
          </q-card-section>

          <q-separator />

          <q-card-section class="checkout-panel__rows">
            <div class="checkout-panel__row">
              <span>商品總金額</span>
              <strong>{{ formatMoney(productTotal) }}</strong>
            </div>
            <div v-if="couponDiscount > 0" class="checkout-panel__row checkout-panel__row--discount">
              <span>優惠碼折扣</span>
              <strong>{{ formatMoneySigned(-couponDiscount) }}</strong>
            </div>
          </q-card-section>

          <q-separator />

          <q-card-section class="checkout-panel__summary">
            <div class="checkout-panel__total-row">
              <span class="text-subtitle1">結帳總金額</span>
              <strong class="checkout-panel__total">{{ formatMoney(checkoutTotal) }}</strong>
            </div>
          </q-card-section>

          <q-card-section class="checkout-panel__actions">
            <q-btn unelevated color="pink-5" text-color="white" :label="`結帳(${selectedCount})`"
              class="checkout-panel__checkout-btn" :disable="selectedCount === 0" @click="onCheckout" />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <q-banner v-else class="bg-grey-2 text-grey-9" rounded>
      購物車是空的，請先到商品搜尋頁選購。
    </q-banner>
  </section>
</template>

<style scoped>
.cart-page {
  max-width: 1200px;
}

.cart-line-card__img {
  width: 96px;
  min-width: 96px;
  border-radius: 6px;
  align-self: center;
}

.cart-line-card__check {
  margin-top: 8px;
}

.cart-line-card__info {
  min-width: 0;
}

.cart-line-card__name {
  line-height: 1.35;
}

.cart-line-card__side {
  min-width: 148px;
}

.cart-line-card__prices {
  display: flex;
  align-items: baseline;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.cart-line-card__price {
  color: #e11d48;
  font-size: 1.15rem;
  font-weight: 700;
}

.cart-line-card__list-price {
  color: #9ca3af;
  font-size: 0.85rem;
  text-decoration: line-through;
}

.cart-line-card__qty-input {
  width: 56px;
}

.checkout-panel {
  position: sticky;
  top: 16px;
}

.checkout-panel__rows {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.checkout-panel__row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  font-size: 0.95rem;
}

.checkout-panel__row--discount strong {
  color: #e11d48;
}

.checkout-panel__total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.checkout-panel__total {
  color: #e11d48;
  font-size: 1.5rem;
}

.checkout-panel__summary {
  padding-bottom: 8px;
}

.checkout-panel__actions {
  padding-top: 0;
  display: flex;
  justify-content: flex-end;
}

.checkout-panel__checkout-btn {
  font-weight: 700;
  min-height: 44px;
  min-width: 160px;
}

.coupon-form {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.coupon-form__input {
  width: 100%;
  min-width: 0;
}

.coupon-form__btn {
  width: 100%;
  flex-shrink: 0;
}

@media (min-width: 360px) {
  .coupon-form {
    flex-direction: row;
    align-items: flex-start;
  }

  .coupon-form__input {
    flex: 1;
  }

  .coupon-form__btn {
    width: auto;
    min-width: 72px;
  }
}

@media (max-width: 1023px) {
  .checkout-panel {
    position: static;
  }

  .cart-line-card__side {
    width: 100%;
    align-items: flex-start;
    margin-top: 8px;
  }

  .cart-line-card :deep(.q-card__section) {
    flex-wrap: wrap;
  }
}
</style>
