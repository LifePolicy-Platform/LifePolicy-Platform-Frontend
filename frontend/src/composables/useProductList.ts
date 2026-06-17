import { ref } from 'vue'
import type { ProductListItem, ProductSearchFilter } from '@/types/productMgmt'

const MOCK_PRODUCTS: ProductListItem[] = [
  {
    code: 'LIFE-001',
    name: '安心終身壽險',
    productType: 'life',
    status: 'active',
    minInsuredAge: 18,
    maxInsuredAge: 65,
    minSumInsured: 500000,
    maxSumInsured: 5000000,
    createdAt: '2025-06-01',
  },
  {
    code: 'HLTH-002',
    name: '健康醫療險',
    productType: 'health',
    status: 'active',
    minInsuredAge: 0,
    maxInsuredAge: 70,
    minSumInsured: 100000,
    maxSumInsured: 2000000,
    createdAt: '2025-08-15',
  },
  {
    code: 'ACCD-003',
    name: '意外傷害險',
    productType: 'accident',
    status: 'active',
    minInsuredAge: 6,
    maxInsuredAge: 75,
    minSumInsured: 50000,
    maxSumInsured: 1000000,
    createdAt: '2025-10-01',
  },
  {
    code: 'TRVL-004',
    name: '旅平險一年期',
    productType: 'travel',
    status: 'inactive',
    minInsuredAge: 0,
    maxInsuredAge: 80,
    minSumInsured: 100000,
    maxSumInsured: 500000,
    createdAt: '2024-12-20',
  },
]

function emptyFilter(): ProductSearchFilter {
  return { code: '', name: '', productType: '', status: '' }
}

export function useProductList() {
  const filter = ref<ProductSearchFilter>(emptyFilter())
  const list = ref<ProductListItem[]>([])
  const isSearching = ref(false)
  const hasSearched = ref(false)

  function search() {
    isSearching.value = true
    hasSearched.value = true
    setTimeout(() => {
      list.value = MOCK_PRODUCTS.filter((row) => {
        if (filter.value.code && !row.code.includes(filter.value.code)) return false
        if (filter.value.name && !row.name.includes(filter.value.name)) return false
        if (filter.value.productType && row.productType !== filter.value.productType) return false
        if (filter.value.status && row.status !== filter.value.status) return false
        return true
      })
      isSearching.value = false
    }, 300)
  }

  function resetFilter() {
    filter.value = emptyFilter()
    list.value = []
    hasSearched.value = false
  }

  return { filter, list, isSearching, hasSearched, search, resetFilter }
}
