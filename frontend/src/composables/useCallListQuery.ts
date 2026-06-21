import { ref } from 'vue'
import type { CallListRow, CallListSearchFilter } from '@/types/callList'

function emptyFilter(): CallListSearchFilter {
  return {
    custName: '',
    listNo: '',
    recallDateFrom: '',
    recallDateTo: '',
  }
}

export function useCallListQuery() {
  const filter = ref<CallListSearchFilter>(emptyFilter())
  const list = ref<CallListRow[]>([])
  const isSearching = ref(false)
  const hasSearched = ref(false)
  const rangeError = ref('')

  function validateDateRange(): boolean {
    rangeError.value = ''
    const { recallDateFrom, recallDateTo } = filter.value
    if (recallDateFrom && recallDateTo && recallDateFrom > recallDateTo) {
      rangeError.value = '約訪日期起不可晚於約訪日期迄'
      return false
    }
    return true
  }

  async function search() {
    if (!validateDateRange()) return

    isSearching.value = true
    hasSearched.value = true
    try {
      // TODO: 串接後端 API（tb_call_list + tb_call_appointment）
      list.value = []
    } finally {
      isSearching.value = false
    }
  }

  function resetFilter() {
    filter.value = emptyFilter()
    list.value = []
    hasSearched.value = false
    rangeError.value = ''
  }

  return {
    filter,
    list,
    isSearching,
    hasSearched,
    rangeError,
    search,
    resetFilter,
  }
}
