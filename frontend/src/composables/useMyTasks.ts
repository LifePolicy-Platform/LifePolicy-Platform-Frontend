import { computed, ref } from 'vue'
import type { MyTaskItem, MyTaskSearchFilter } from '@/types/task'

const MOCK_TASKS: MyTaskItem[] = [
  { taskNo: 'T-001', taskName: 'POL-2026-002 核保補件追蹤', status: 'pending' },
  { taskNo: 'T-002', taskName: 'POL-2026-003 健檢報告催收', status: 'in_progress' },
  { taskNo: 'T-003', taskName: '王小明 約訪確認', status: 'pending' },
  { taskNo: 'T-004', taskName: '旅平險新件審核', status: 'done' },
]

function emptyFilter(): MyTaskSearchFilter {
  return { keyword: '', status: '' }
}

export function useMyTasks() {
  const filter = ref<MyTaskSearchFilter>(emptyFilter())
  const tasks = ref<MyTaskItem[]>([...MOCK_TASKS])
  const isLoading = ref(false)

  const pendingCount = computed(
    () => tasks.value.filter((t) => t.status !== 'done').length,
  )

  const filteredTasks = computed(() => {
    return tasks.value.filter((task) => {
      if (filter.value.keyword) {
        const kw = filter.value.keyword.toLowerCase()
        if (
          !task.taskNo.toLowerCase().includes(kw) &&
          !task.taskName.toLowerCase().includes(kw)
        ) {
          return false
        }
      }
      if (filter.value.status && task.status !== filter.value.status) return false
      return true
    })
  })

  function search() {
    isLoading.value = true
    setTimeout(() => {
      isLoading.value = false
    }, 200)
  }

  function resetFilter() {
    filter.value = emptyFilter()
  }

  return {
    filter,
    tasks,
    filteredTasks,
    pendingCount,
    isLoading,
    search,
    resetFilter,
  }
}
