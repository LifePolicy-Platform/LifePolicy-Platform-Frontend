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
  /** 約訪結果：0=尚未完成，1=約訪成功，2=約訪失敗 */
  recallResult?: number
}

export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

export interface AptUpdateItem {
  sno: number
  listNo: string
  /** 原始約訪時間，格式 yyyy-MM-dd HH:mm:ss（TODAY/WORKDAYS 用於保留時分） */
  recallTime: string
}

export type ScheduleMode = 'TODAY' | 'WORKDAYS' | 'SPECIFIC'

/** 前端安排方式（對應 ScheduleMode，不含 TODAY） */
export type UpdateMode = 'workdays' | 'specific'

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

export interface PolicyAppointmentContext {
  policyNo: string
  listNo: string
  memberId: number
  custName: string
  listLastPhone: string
  /** 0=未處理，1=已約訪，2=已結案 */
  listStatus: number
  pendingAppointmentSno?: number | null
  pendingAppointmentUser?: string | null
}

export interface ActiveProjectOption {
  campCode: string
  campName: string
  campServiceDt: string
}

export interface CallAppointmentItem {
  sno: number
  recNo: string
  listNo: string
  projectCode: string
  projectName: string
  recallTime: string
  recTime: string | null
  /** 0=尚未完成，1=約訪成功，2=約訪失敗 */
  recallResult: number
}

export interface CallAppointmentCreateRequest {
  policyNo: string
  campCode: string
  recallTime: string
}

export interface CallAppointmentCreateResponse {
  sno: number
  recNo: string
  listNo: string
  campCode: string
  recallTime: string
}

export interface CallAppointmentConfirmRequest {
  policyNo: string
  /** 1=約訪成功，2=約訪失敗 */
  recallResult: number
  /** 實際約訪時間（選填，格式 yyyy-MM-dd HH:mm:ss） */
  recTime?: string
}

export interface CallAppointmentConfirmResponse {
  sno: number
  listNo: string
  recallResult: number
  listStatus: number
  recTime: string
}