/** 約訪名單查詢條件（對應 tb_call_list + tb_call_appointment，日期區間為 RECALL_TIME） */
export interface CallListSearchFilter {
  custName: string
  listNo: string
  recallDateFrom: string
  recallDateTo: string
}

/** 約訪名單列表列（tb_call_appointment JOIN tb_call_list JOIN tb_cust_user） */
export interface CallListRow {
  sno: number | string
  listNo: string
  custName: string
  contactPhone: string
  projectCode: string
  listStatus: number
  appointmentTime: string
  recallTime: string
}
