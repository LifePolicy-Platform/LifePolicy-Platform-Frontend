import { ref, computed } from 'vue'
import { fetchIncompleteApplications } from '@/api/policyApplication'
import type { PolicyRecord } from '@/types/policyApplication'

const STATUS_LABEL: Record<string, string> = {
  APPLIED:  '待業務審核',
  RETURNED: '已退回',
  PENDING:  '待主管審核',
}

const STATUS_COLOR: Record<string, string> = {
  APPLIED:  'orange',
  RETURNED: 'red',
  PENDING:  'blue',
}

export function useMyTasks() {
  const tasks = ref<PolicyRecord[]>([])
  const isLoading = ref(false)
  const errorMessage = ref('')
  const keyword = ref('')
  const statusFilter = ref('')

  const pendingCount = computed(() => tasks.value.length)

  const filteredTasks = computed(() => {
    return tasks.value.filter((t) => {
      if (keyword.value) {
        const kw = keyword.value.toLowerCase()
        const matchId = t.APPLICATION_ID?.toLowerCase().includes(kw)
        const matchName = t.INSURED_NAME?.toLowerCase().includes(kw) ||
                          t.APPLICANT_NAME?.toLowerCase().includes(kw)
        const matchProduct = t.PRODUCT_NAME?.toLowerCase().includes(kw)
        if (!matchId && !matchName && !matchProduct) return false
      }
      if (statusFilter.value && t.APPLICATION_STATUS !== statusFilter.value) return false
      return true
    })
  })

  async function search() {
    isLoading.value = true
    errorMessage.value = ''
    try {
      tasks.value = await fetchIncompleteApplications()
    } catch (err: unknown) {
      errorMessage.value = err instanceof Error ? err.message : '載入失敗'
    } finally {
      isLoading.value = false
    }
  }

  function resetFilter() {
    keyword.value = ''
    statusFilter.value = ''
  }

  return {
    tasks,
    filteredTasks,
    pendingCount,
    isLoading,
    errorMessage,
    keyword,
    statusFilter,
    search,
    resetFilter,
    STATUS_LABEL,
    STATUS_COLOR,
  }
}