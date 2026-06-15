import { computed, ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import { batchUpdateAptRecords, searchAptRecords } from '@/services/appointmentService'
import type {
  AptBatchUpdateResponse,
  AptRecordListRequest,
  AptRecordListResponse,
  AptUpdateItem,
  UpdateMode,
} from '@/types/customer'
import {
  formatDate,
  formatTime,
  normalizeRecallTime,
  parseDateOnly,
  diffCalendarDays,
  todayDateOnly,
  timePart,
} from '@/utils/appointmentDateTime'

const MODE_MAP = { today: 'TODAY', workdays: 'WORKDAYS', specific: 'SPECIFIC' } as const

/**
 * 約訪時間更新頁的頁面邏輯。
 * 負責 loading / error / submit flow；畫面互動留在 Feature Component。
 */
export function useUpdTime() {
  const $q = useQuasar()

  // --- 查詢表單狀態 ---
  const now = new Date()
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)

  const searchStartDate = ref(formatDate(yesterday))
  const searchStartTime = ref(formatTime(now))
  const searchEndDate = ref(formatDate(now))
  const searchEndTime = ref('22:00')

  // --- 查詢結果與勾選 ---
  const rows = ref<AptRecordListResponse[]>([])
  const selectedRowIds = ref<number[]>([])
  const updateResults = ref<Map<number, AptBatchUpdateResponse>>(new Map())

  // --- 查詢流程狀態 ---
  const isLoading = ref(false)
  const errorMsg = ref('')
  const rangeError = ref('')
  const hasSearched = ref(false)

  // --- 儲存表單狀態 ---
  const updateMode = ref<UpdateMode>('today')
  const workdaysCount = ref(1)
  const specificDate = ref('')
  const specificTime = ref('')

  // --- 儲存流程狀態 ---
  const isSaving = ref(false)
  const saveError = ref('')

  // --- 勾選相關 computed ---
  const selectedCountLabel = computed(() => `目前勾選 ${selectedRowIds.value.length} 筆`)
  const hasPartialSelection = computed(
    () => selectedRowIds.value.length > 0 && selectedRowIds.value.length < rows.value.length,
  )
  const allSelected = computed({
    get: () => rows.value.length > 0 && selectedRowIds.value.length === rows.value.length,
    set: (checked: boolean) => {
      selectedRowIds.value = checked ? rows.value.map((_, i) => i) : []
    },
  })

  function compareRowIndexByRecallTime(a: number, b: number) {
    const timeA = rows.value[a]?.recallTime ?? ''
    const timeB = rows.value[b]?.recallTime ?? ''
    return timeA.localeCompare(timeB)
  }

  function keepOnlyOldestSelectedRow() {
    if (selectedRowIds.value.length <= 1) return

    const oldestIdx = [...selectedRowIds.value].sort(compareRowIndexByRecallTime)[0]!
    selectedRowIds.value = [oldestIdx]

    $q.notify({
      message: '指定約訪時間僅處理一筆，已保留約訪時間最早的一筆',
      color: 'positive',
      position: 'top',
      timeout: 4000,
      group: false,
    })
  }

  function getSelectedIndicesForUpdate(): number[] {
    const indices = [...selectedRowIds.value]
    if (indices.length === 0) return []

    if (updateMode.value === 'specific') {
      return [[...indices].sort(compareRowIndexByRecallTime)[0]!]
    }

    return indices
  }

  function getSelectedRecordsForUpdate(): AptUpdateItem[] {
    return getSelectedIndicesForUpdate().flatMap((idx) => {
      const row = rows.value[idx]
      if (!row) return []
      const recallTime = normalizeRecallTime(row.recallTime)
      if (!recallTime) return []
      return [{ sno: row.sno, listNo: row.listNo, recallTime }]
    })
  }

  function applyUpdateResults(results: AptBatchUpdateResponse[]) {
    const resultBySno = new Map(results.map((r) => [Number(r.sno), r]))

    rows.value = rows.value.map((row) => {
      const r = resultBySno.get(Number(row.sno))
      if (!r || r.result !== 'success') return row

      const recallTime = normalizeRecallTime(r.recallTime)
      if (!recallTime) return row

      return { ...row, recallTime }
    })
  }

    // reponse 為success 就更新列表  workday 後端有回傳時間 其他mode在下方計算
  function enrichResultsWithRecallTime(
    results: AptBatchUpdateResponse[],
    specificDateTime?: string,
  ): AptBatchUpdateResponse[] {
    return results.map((r) => {
      if (r.result !== 'success' || normalizeRecallTime(r.recallTime)) return r

      const row = rows.value.find((item) => Number(item.sno) === Number(r.sno))
      if (!row) return r

      if (updateMode.value === 'specific' && specificDateTime) {
        return { ...r, recallTime: specificDateTime }
      }

      if (updateMode.value === 'today') {
        const today = formatDate(new Date()).replace(/\//g, '-')
        const oldTime = timePart(row.recallTime) || '00:00'
        return { ...r, recallTime: `${today} ${oldTime}:00` }
      }

      return r
    })
  }

  watch(updateMode, (mode) => {
    if (mode === 'specific') keepOnlyOldestSelectedRow()
  })

  watch(selectedRowIds, () => {
    if (updateMode.value === 'specific') keepOnlyOldestSelectedRow()
  }, { deep: true })

  /** 查詢流程：驗證 → loading → 呼叫 service → 更新結果 */
  async function searchAppointments() {
    selectedRowIds.value = []
    updateResults.value = new Map()
    errorMsg.value = ''
    rangeError.value = ''

    if (!searchStartDate.value) {
      rangeError.value = '開始日期不得為空，請重新輸入'
      return
    }

    if (!searchEndDate.value) {
      rangeError.value = '結束日期不得為空，請重新輸入'
      return
    }

    const startD = parseDateOnly(searchStartDate.value)
    const endD = parseDateOnly(searchEndDate.value)

    if (!startD || !endD) {
      rangeError.value = '查詢日期格式不正確，請重新輸入'
      return
    }

    const today = todayDateOnly()
    const earliestAllowed = new Date(today)
    earliestAllowed.setDate(earliestAllowed.getDate() - 60)
    const latestAllowed = new Date(today)
    latestAllowed.setDate(latestAllowed.getDate() + 60)

    if (startD < earliestAllowed) {
      rangeError.value = '開始日期不得早於 60 日前，請重新輸入'
      return
    }

    if (endD > latestAllowed) {
      rangeError.value = '結束日期不得晚於 60 日後，請重新輸入'
      return
    }

    if (startD > endD) {
      rangeError.value = '開始日期不得晚於結束日期，請重新輸入'
      return
    }

    const rangeDays = diffCalendarDays(startD, endD)
    if (rangeDays > 60) {
      rangeError.value = '查詢期間僅能兩個月，請重新輸入'
      return
    }

    const params: AptRecordListRequest = {
      startDate: searchStartDate.value.replace(/\//g, '-'),
      endDate: searchEndDate.value.replace(/\//g, '-'),
      startTime: searchStartTime.value ? `${searchStartTime.value}:00` : undefined,
      endTime: searchEndTime.value ? `${searchEndTime.value}:00` : undefined,
    }

    isLoading.value = true
    try {
      rows.value = await searchAptRecords(params)
      hasSearched.value = true
    } catch {
      errorMsg.value = '查詢失敗，請稍後再試'
      rows.value = []
      hasSearched.value = true
    } finally {
      isLoading.value = false
    }
  }

  /** 儲存流程：驗證 → loading → 呼叫 service → 更新結果 */
  async function saveUpdate() {
    saveError.value = ''

    if (selectedRowIds.value.length === 0) {
      saveError.value = '請至少勾選一筆資料'
      return
    }

    if (updateMode.value === 'specific' && (!specificDate.value || !specificTime.value)) {
      saveError.value = '請選擇指定約訪的日期與時間'
      return
    }

    const specificDateTime =
      updateMode.value === 'specific'
        ? `${specificDate.value.replace(/\//g, '-')} ${specificTime.value}:00`
        : undefined

    const payload = {
      mode: MODE_MAP[updateMode.value],
      ...(updateMode.value === 'workdays' ? { workDays: workdaysCount.value } : {}),
      ...(specificDateTime ? { specificDateTime } : {}),
      records: getSelectedRecordsForUpdate(),
    }

    isSaving.value = true
    try {
      const results = await batchUpdateAptRecords(payload)

      const total = results.length
      const successCount = results.filter((r) => r.result === 'success').length
      const failCount = total - successCount

      $q.notify({
        message: `勾選 ${total} 筆，完成 ${successCount} 筆，失敗 ${failCount} 筆`,
        color: failCount > 0 ? 'warning' : 'positive',
        position: 'top',
        timeout: 4000,
        group: false,
      })

      selectedRowIds.value = []
      const enrichedResults = enrichResultsWithRecallTime(results, specificDateTime)
      updateResults.value = new Map(enrichedResults.map((r) => [Number(r.sno), r]))
      applyUpdateResults(enrichedResults)
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } }
      saveError.value = err?.response?.data?.message ?? '儲存失敗，請稍後再試'
    } finally {
      isSaving.value = false
    }
  }

  return {
    searchStartDate,
    searchStartTime,
    searchEndDate,
    searchEndTime,
    selectedRowIds,
    updateMode,
    workdaysCount,
    specificDate,
    specificTime,
    rows,
    isLoading,
    errorMsg,
    rangeError,
    hasSearched,
    isSaving,
    saveError,
    updateResults,
    selectedCountLabel,
    hasPartialSelection,
    allSelected,
    searchAppointments,
    saveUpdate,
  }
}
