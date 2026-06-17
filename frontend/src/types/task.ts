export type TaskStatus = 'pending' | 'in_progress' | 'done'

export interface MyTaskItem {
  taskNo: string
  taskName: string
  status: TaskStatus
}

export interface MyTaskSearchFilter {
  keyword: string
  status: TaskStatus | ''
}
