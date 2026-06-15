<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import shoppingCartIcon from '../assets/shoppingCart.png'
import { useCartStore } from '../stores/cart'

const router = useRouter()
const cartStore = useCartStore()
const { cartLineCount } = storeToRefs(cartStore)

function goCart() {
  router.push('/cart')
}
</script>

<template>
  <button
    type="button"
    class="cart-icon-btn"
    :aria-label="cartLineCount > 0 ? `前往購物車，共 ${cartLineCount} 項` : '前往購物車'"
    @click="goCart"
  >
    <img :src="shoppingCartIcon" alt="" width="20" height="20" class="cart-icon-btn__img" />
    <span v-if="cartLineCount > 0" class="cart-icon-btn__badge">{{ cartLineCount }}</span>
  </button>
</template>

<style scoped>
.cart-icon-btn {
  position: relative;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
}

.cart-icon-btn:hover {
  border-color: var(--accent, #0f766e);
  background: #f0fdfa;
}

.cart-icon-btn__img {
  display: block;
}

.cart-icon-btn__badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 999px;
  background: #e11d48;
  color: #fff;
  font-size: 0.7rem;
  font-weight: 700;
  line-height: 16px;
  text-align: center;
}
</style>
