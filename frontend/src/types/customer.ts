export interface AptRecordListRequest {
  startDate: string
  endDate: string
  startTime?: string
  endTime?: string
}

export interface AptRecordListResponse {
  sno: number     /** 流水號 */
  listNo: string  /** 名單序號 */
  recNo: string  /** 約訪紀錄序號（保單序號） */
  custName: string    /** 客戶姓名 */
  campName: string    /** 專案名稱 */
  recallTime: string  /** 預定約訪時間，格式 yyyy-MM-dd HH:mm:ss */
  recTime: string | null  /** 實際約訪時間，未完成為 null */
  listLastphone: string    /** 撥出電話 */
  campServiceDt: string  /** 名單回收日，格式 yyyy-MM-dd */
}

export interface ApiResponse<T> {
  CODE: string
  MESSAGE: string
  DATA: T
  SUCCESS: boolean
}

export interface AptUpdateItem {
  sno: number
  listNo: string
  /** 原始約訪時間，格式 yyyy-MM-dd HH:mm:ss（TODAY/WORKDAYS 用於保留時分） */
  recallTime: string
}

export type ScheduleMode = 'TODAY' | 'WORKDAYS' | 'SPECIFIC'

/** 前端安排方式（對應 ScheduleMode） */
export type UpdateMode = 'today' | 'workdays' | 'specific'

export interface AptBatchUpdateRequest {
  mode: ScheduleMode
  workDays?: number
  specificDateTime?: string   // "yyyy-MM-dd HH:mm:ss"
  records: AptUpdateItem[]
}

export interface AptBatchUpdateResponse {
  sno: number
  result: string              // 'success' | 'fail'
  errorMsg: string | null
  recallTime: string | null   // 成功時回傳新約訪時間 "yyyy-MM-dd HH:mm:ss"
}