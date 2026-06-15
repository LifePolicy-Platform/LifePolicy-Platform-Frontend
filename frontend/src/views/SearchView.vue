<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { CATEGORY_LIST, MOCK_PRODUCTS, PRODUCT_Category_LABEL } from '../constants/search'
import type { ProductCategory } from '../types/search'
import CartIconButton from '../components/CartIconButton.vue'

const router = useRouter()

// 不變的完整商品陣列庫存
const products = MOCK_PRODUCTS

// 使用者目前輸入的關鍵字
const searchQuery = ref('')
// 目前選中的分類（'全部' 或 ProductCategory）
const selectedCategory = ref<'全部' | ProductCategory>('全部')

// 分類按鈕列表
const categoryOptions: { value: '全部' | ProductCategory; label: string }[] = [
  { value: '全部', label: '全部' },
  ...CATEGORY_LIST.map((key) => ({
    value: key,
    label: PRODUCT_Category_LABEL[key],
  })),
]

const filteredProducts = computed(() => {
  return products.filter((item) => {
    const matchKey = item.pdName.includes(searchQuery.value)
    const matchCate =
      selectedCategory.value === '全部' || item.pdCategory === selectedCategory.value
    return matchKey && matchCate
  })
})

function formatPrice(price: number) {
  return price.toLocaleString('zh-TW', { style: 'currency', currency: 'TWD' })
}

function openProductDetail(productId: string) {
  router.push({ name: 'product-detail', params: { id: productId } })
}
</script>

<template>
  <section class="search-page">
    <article class="search-card">
      <div class="search-card-header">
        <h2 class="search-title">商品搜尋</h2>
        <CartIconButton />
      </div>
      <p class="search-desc">輸入關鍵字或點選分類，列表會即時更新。</p>

      <div class="search-toolbar">
        <input v-model="searchQuery" type="text" class="search-input" placeholder="輸入商品名稱關鍵字" />

        <div class="search-categories" role="group" aria-label="商品分類">
          <button v-for="option in categoryOptions" :key="option.value" type="button" class="category-btn"
            :class="{ 'category-btn--active': selectedCategory === option.value }"
            @click="selectedCategory = option.value">
            {{ option.label }}
          </button>
        </div>
      </div>

      <p class="search-result-count">共 {{ filteredProducts.length }} 筆商品</p>

      <div v-if="filteredProducts.length" class="row q-col-gutter-md product-list">
        <div v-for="product in filteredProducts" :key="product.id" class="col-md-3">
          <q-card bordered flat class="product-card cursor-pointer" @click="openProductDetail(product.id)">
            <q-img :src="product.image" :alt="product.pdName" :ratio="1" />
            <q-card-section class="q-pt-sm q-pb-sm">
              <div class="product-item__name">{{ product.pdName }}</div>
              <div class="product-item__desc">{{ product.pdDesc }}</div>
              <div class="product-item__price">{{ formatPrice(product.pdPrice) }}</div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <div v-else class="search-empty">
        沒有符合條件的商品，請調整關鍵字或分類。
      </div>
    </article>
  </section>
</template>

<style scoped>
.search-page {
  max-width: 100%;
}

.search-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 24px;
}

.search-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}

.search-title {
  margin: 0;
  font-size: 1.35rem;
}

.search-desc {
  margin: 0 0 20px;
  color: #6b7280;
  font-size: 0.95rem;
}

.search-toolbar {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 16px;
}

.search-input {
  width: 100%;
  padding: 10px 12px;
  font-size: 1rem;
  border: 1px solid #9ca3af;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
}

.search-input:focus {
  outline: none;
  border-color: var(--accent, #0f766e);
}

.search-categories {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.category-btn {
  padding: 8px 14px;
  font-size: 0.9rem;
  border: 1px solid #d1d5db;
  border-radius: 999px;
  background: #fff;
  cursor: pointer;
}

.category-btn:hover {
  border-color: var(--accent, #0f766e);
}

.category-btn--active {
  color: #fff;
  background: var(--accent, #0f766e);
  border-color: var(--accent, #0f766e);
}

.search-result-count {
  margin: 0 0 12px;
  font-size: 0.9rem;
  color: #6b7280;
}

.product-list {
  margin: 0;
}

.product-card {
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}

.product-card:hover {
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.product-item__name {
  margin: 0 0 6px;
  font-size: 0.95rem;
  font-weight: 400;
  line-height: 1.4;
  color: #1e3a5f;
  text-align: left;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-item__desc {
  margin: 0 0 8px;
  font-size: 0.85rem;
  line-height: 1.4;
  color: #6b7280;
  text-align: left;
}

.product-item__price {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #e11d48;
  text-align: left;
}

.search-empty {
  background-color: #f5f5f5;
  color: #666;
  padding: 16px;
  border-radius: 8px;
  text-align: center;
}
</style>
