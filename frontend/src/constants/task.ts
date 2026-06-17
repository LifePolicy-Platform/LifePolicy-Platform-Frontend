import type { TaskStatus } from '@/types/task'

export const TASK_STATUS_LABEL: Record<TaskStatus, string> = {
  pending: '待處理',
  in_progress: '處理中',
  done: '已完成',
}

export const TASK_STATUS_OPTIONS = Object.entries(TASK_STATUS_LABEL).map(
  ([value, label]) => ({ value: value as TaskStatus, label }),
)
