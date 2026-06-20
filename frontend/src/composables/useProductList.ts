import { ref } from 'vue'
import { fetchProducts } from '@/api/product'
import type { ProductListItem, ProductSearchFilter } from '@/types/productMgmt'

function emptyFilter(): ProductSearchFilter {
  return { code: '', name: '', productType: '', status: '' }
}

export function useProductList() {
  const filter = ref<ProductSearchFilter>(emptyFilter())
  const allProducts = ref<ProductListItem[]>([])
  const list = ref<ProductListItem[]>([])
  const isSearching = ref(false)
  const hasSearched = ref(false)
  const errorMessage = ref('')

  async function search() {
    isSearching.value = true
    hasSearched.value = true
    errorMessage.value = ''
    try {
      if (allProducts.value.length === 0) {
        allProducts.value = await fetchProducts()
      }
      list.value = allProducts.value.filter((row) => {
        if (filter.value.code && !row.code.includes(filter.value.code)) return false
        if (filter.value.name && !row.name.includes(filter.value.name)) return false
        if (filter.value.productType && row.productType !== filter.value.productType) return false
        if (filter.value.status && row.status !== filter.value.status) return false
        return true
      })
    } catch {
      errorMessage.value = '載入商品失敗，請確認後端服務是否正常'
    } finally {
      isSearching.value = false
    }
  }

  function resetFilter() {
    filter.value = emptyFilter()
    list.value = []
    hasSearched.value = false
    errorMessage.value = ''
    allProducts.value = []
  }

  return { filter, list, isSearching, hasSearched, errorMessage, search, resetFilter }
}