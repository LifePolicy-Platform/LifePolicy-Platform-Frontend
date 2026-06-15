<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import CartIconButton from '../components/CartIconButton.vue'
import { MOCK_PRODUCTS, PRODUCT_Category_LABEL } from '../constants/search'
import { useCartStore } from '../stores/cart'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const cartStore = useCartStore()

const product = computed(() =>
  MOCK_PRODUCTS.find((item) => item.id === route.params.id),
)

const quantity = ref(1)
const hasDiscount = ref(false)

const subtotal = computed(() => (product.value?.pdPrice ?? 0) * quantity.value)
const discountRate = computed(() => (hasDiscount.value ? 0.8 : 1))
const totalPrice = computed(() => subtotal.value * discountRate.value)

function formatMoney(n: number) {
  return n.toLocaleString('zh-TW', { style: 'currency', currency: 'TWD' })
}

function increaseQuantity() {
  quantity.value++
}

function decreaseQuantity() {
  if (quantity.value > 1) {
    quantity.value--
  }
}

function goBack() {
  router.push('/search')
}

function addToCart() {
  if (!product.value) {
    return
  }
  cartStore.addLine(product.value.id, quantity.value, hasDiscount.value)
  $q.notify({ type: 'positive', message: '已加入購物車' })
}

</script>

<template>
  <section class="product-detail-page">
    <q-btn flat color="primary" icon="arrow_back" label="返回搜尋" class="q-mb-md" @click="goBack" />

    <q-card v-if="product" bordered class="detail-card">
      <q-card-section>
        <div class="detail-card-header">
          <div>
            <div class="text-h6">商品詳情</div>
            <div class="text-caption text-grey-7">
              {{ PRODUCT_Category_LABEL[product.pdCategory] }}
            </div>
          </div>
          <CartIconButton />
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section class="detail-product">
        <q-img :src="product.image" :alt="product.pdName" class="detail-product__img" ratio="1"
          style="max-width: 200px" />
        <h3 class="detail-product__name">{{ product.pdName }}</h3>
        <p class="detail-product__desc">{{ product.pdDesc }}</p>
        <p class="cart-label">售價</p>
        <strong class="detail-product__price">{{ formatMoney(product.pdPrice) }}</strong>

        <div class="detail-qty q-mt-md">
          <q-btn round color="primary" icon="remove" :disable="quantity <= 1" @click="decreaseQuantity" />
          <span class="detail-qty__num">{{ quantity }}</span>
          <q-btn round color="primary" icon="add" @click="increaseQuantity" />
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <div class="detail-summary">
          <div class="detail-summary__item">
            <span>金額</span>
            <strong>{{ formatMoney(product.pdPrice) }}</strong>
          </div>
          <div class="detail-summary__item">
            <span>數量</span>
            <strong>{{ quantity }}</strong>
          </div>
          <div class="detail-summary__item">
            <span>小計</span>
            <strong>{{ formatMoney(subtotal) }}</strong>
          </div>
          <div class="detail-summary__item detail-summary__item--total">
            <span>總金額</span>
            <strong>{{ formatMoney(totalPrice) }}</strong>
          </div>
        </div>

        <q-checkbox v-model="hasDiscount" label="是否使用打折券" class="q-mt-md" />

        <q-btn color="primary" label="加入購物車" class="q-mt-md full-width" unelevated @click="addToCart" />
      </q-card-section>
    </q-card>

    <q-banner v-else class="bg-grey-3 text-dark q-mt-md" rounded>
      找不到此商品。
      <template #action>
        <q-btn flat color="primary" label="返回搜尋" @click="goBack" />
      </template>
    </q-banner>
  </section>
</template>

<style scoped>
.product-detail-page {
  max-width: 560px;
}

.detail-card {
  background: #fff;
}

.detail-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.detail-product {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}

.detail-product__name {
  margin: 0;
  font-size: 1.2rem;
}

.detail-product__desc {
  margin: 0;
  color: #6b7280;
  font-size: 0.95rem;
  line-height: 1.5;
}

.detail-product__price {
  font-size: 1.1rem;
  color: #e11d48;
}

.cart-label {
  margin: 0;
  font-size: 0.85rem;
  color: #6b7280;
}

.detail-qty {
  display: flex;
  align-items: center;
  gap: 16px;
}

.detail-qty__num {
  min-width: 2ch;
  text-align: center;
  font-size: 1.25rem;
  font-weight: 700;
}

.detail-summary {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.detail-summary__item {
  padding: 12px;
  border-radius: 8px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-summary__item span {
  font-size: 0.8rem;
  color: #6b7280;
}

.detail-summary__item--total strong {
  color: var(--accent-strong, #115e59);
  font-size: 1.1rem;
}

@media (min-width: 520px) {
  .detail-summary {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>
