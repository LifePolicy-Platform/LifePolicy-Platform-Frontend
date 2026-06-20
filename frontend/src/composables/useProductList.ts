import { ref } from 'vue'
import { fetchProducts } from '@/api/product'
import type { ProductListItem, ProductSearchFilter } from '@/types/productMgmt'

function emptyFilter(): ProductSearchFilter {
  return { code: '', name: '', productType: '', status: '' }
}

export function useProductList() {
  const filter = ref<ProductSearchFilter>(emptyFilter())
  const list = ref<ProductListItem[]>([])
  const isLoading = ref(false)
  const errorMessage = ref('')

  async function reload() {
    isLoading.value = true
    errorMessage.value = ''
    try {
      const response = await fetchProducts()
      const all = response.DATA
      list.value = all.filter((row) => {
        if (filter.value.code && !row.code.includes(filter.value.code)) return false
        if (filter.value.name && !row.name.includes(filter.value.name)) return false
        if (filter.value.productType && row.productType !== filter.value.productType) return false
        if (filter.value.status && row.status !== filter.value.status) return false
        return true
      })
    } catch {
      errorMessage.value = '載入商品失敗，請確認後端服務是否正常'
    } finally {
      isLoading.value = false
    }
  }

  function resetFilter() {
    filter.value = emptyFilter()
    reload()
  }

  return { filter, list, isLoading, errorMessage, reload, resetFilter }
}