<script setup lang="ts">
import { computed } from 'vue'
import type { PolicyHistoryItem } from '@/types/policyMgmt'
import type { ApplicationStatusCode } from '@/constants/applicationStatus'

const props = defineProps<{
  rows: PolicyHistoryItem[]
  currentStatus?: string
}>()

type StepEntry = {
  key: string
  statusCode: ApplicationStatusCode | string
  title: string
  time?: string
  handler?: string
  remark?: string
  icon: string
  done: boolean
  error: boolean
  active: boolean
}

function isResubmitLog(row: PolicyHistoryItem): boolean {
  return row.statusCode === 'SUBMIT' && (row.remark?.includes('補件') ?? false)
}

function isErrorStatus(code: string): boolean {
  return code === 'RETURN' || code === 'REJECTED'
}

function stepColor(code: string): string {
  return isErrorStatus(code) ? 'negative' : 'positive'
}

function stepActiveColor(code: string): string {
  return isErrorStatus(code) ? 'negative' : 'primary'
}

function sortRows(rows: PolicyHistoryItem[]): PolicyHistoryItem[] {
  return [...rows].sort((a, b) => {
    const timeCompare = (a.time || '').localeCompare(b.time || '')
    if (timeCompare !== 0) return timeCompare
    return String(a.id ?? '').localeCompare(String(b.id ?? ''), undefined, { numeric: true })
  })
}

function logTitle(row: PolicyHistoryItem): string {
  const code = row.statusCode || ''
  if (code === 'SUBMIT') {
    return isResubmitLog(row) ? '補件後重新送審' : '申請送出'
  }
  const titleMap: Record<string, string> = {
    RETURN: '退回補件',
    PENDING: '送主管審核',
    APPROVED: '主管核准',
    REJECTED: '主管駁回',
  }
  return titleMap[code] ?? row.status ?? code
}

function logIcon(row: PolicyHistoryItem): string {
  const code = row.statusCode || ''
  if (code === 'SUBMIT') {
    return isResubmitLog(row) ? 'replay' : 'send'
  }
  const iconMap: Record<string, string> = {
    RETURN: 'assignment_return',
    PENDING: 'supervisor_account',
    APPROVED: 'check_circle',
    REJECTED: 'cancel',
  }
  return iconMap[code] ?? 'history'
}

function rowToEntry(row: PolicyHistoryItem, index: number): Omit<StepEntry, 'done' | 'error' | 'active'> {
  return {
    key: `log-${row.id ?? index}`,
    statusCode: row.statusCode || '',
    title: logTitle(row),
    time: row.time,
    handler: row.handler,
    remark: row.remark && row.remark !== '—' ? row.remark : undefined,
    icon: logIcon(row),
  }
}

function resolveActiveIndex(
  entries: Omit<StepEntry, 'done' | 'error' | 'active'>[],
  currentStatus: string,
): number {
  if (!entries.length) return -1

  if (currentStatus === 'APPROVED' || currentStatus === 'REJECTED') {
    return entries.length - 1
  }

  const matchStatus = currentStatus || entries[entries.length - 1]?.statusCode || ''
  for (let i = entries.length - 1; i >= 0; i -= 1) {
    if (entries[i]?.statusCode === matchStatus) {
      return i
    }
  }

  return entries.length - 1
}

function applyStepStates(
  entries: Omit<StepEntry, 'done' | 'error' | 'active'>[],
  currentStatus: string,
): StepEntry[] {
  const status = currentStatus || entries[entries.length - 1]?.statusCode || ''
  const activeIndex = resolveActiveIndex(entries, status)
  const isTerminal = status === 'APPROVED' || status === 'REJECTED'

  return entries.map((entry, index) => {
    const isNegative = isErrorStatus(entry.statusCode)
    const isLast = index === entries.length - 1

    if (isTerminal) {
      const isFinalNegative = isLast && status === 'REJECTED'
      return {
        ...entry,
        active: false,
        done: true,
        error: isFinalNegative,
      }
    }

    const isActive = index === activeIndex
    if (isActive) {
      return {
        ...entry,
        active: true,
        done: false,
        error: isNegative,
      }
    }

    return {
      ...entry,
      active: false,
      done: true,
      error: false,
    }
  })
}

function buildEntries(rows: PolicyHistoryItem[], currentStatus?: string): StepEntry[] {
  const sortedRows = sortRows(rows)
  if (!sortedRows.length) return []

  const rawEntries = sortedRows.map((row, index) => rowToEntry(row, index))
  const status = currentStatus || sortedRows[sortedRows.length - 1]?.statusCode || ''
  return applyStepStates(rawEntries, status)
}

const stepEntries = computed(() => buildEntries(props.rows, props.currentStatus))

const activeStep = computed(() => {
  const active = stepEntries.value.find((entry) => entry.active)
  if (active) return active.key
  return stepEntries.value[stepEntries.value.length - 1]?.key ?? ''
})

const activeEntry = computed(() => {
  return stepEntries.value.find((entry) => entry.key === activeStep.value)
    ?? stepEntries.value[stepEntries.value.length - 1]
})
</script>

<template>
  <div v-if="stepEntries.length" class="policy-history-stepper">
    <div class="policy-history-stepper__title text-subtitle2 text-weight-bold text-grey-8 q-mb-sm">
      流程進度
    </div>

    <q-stepper :model-value="activeStep" flat bordered alternative-labels color="positive" done-color="positive"
      active-color="primary" error-color="negative" class="policy-history-stepper__panel">
      <q-step v-for="entry in stepEntries" :key="entry.key" :name="entry.key" :title="entry.title"
        :caption="entry.time || '—'" :icon="entry.icon" :done="entry.done" :error="entry.error"
        :color="stepColor(entry.statusCode)" :active-color="stepActiveColor(entry.statusCode)"
        :done-color="stepColor(entry.statusCode)" :error-color="'negative'" :header-nav="false" />
    </q-stepper>

    <div v-if="activeEntry" class="policy-history-stepper__detail">
      <div v-if="activeEntry.remark" class="text-body2 text-grey-8">
        {{ activeEntry.remark }}
      </div>
      <div v-if="activeEntry.handler" class="text-caption text-grey-6 q-mt-xs">
        處理人：{{ activeEntry.handler }}
      </div>
      <q-badge v-if="activeEntry.active" color="grey-6" text-color="white" label="進行中" class="q-mt-sm" />
    </div>
  </div>
</template>

<style scoped>
.policy-history-stepper {
  padding: 12px 4px 4px;
  margin-bottom: 16px;
  border-radius: 8px;
  background: #fff;
  border: 1px solid #e2e8f0;
}

.policy-history-stepper__title {
  padding: 0 12px;
}

.policy-history-stepper__panel :deep(.q-stepper__header) {
  overflow-x: auto;
  flex-wrap: nowrap;
  scrollbar-width: thin;
}

.policy-history-stepper__panel :deep(.q-stepper__step-content) {
  display: none;
}

.policy-history-stepper__panel :deep(.q-stepper__step-inner) {
  padding: 0;
}

.policy-history-stepper__panel :deep(.q-stepper__tab--done:not(.q-stepper__tab--error)) {
  color: var(--q-positive) !important;
}

.policy-history-stepper__panel :deep(.q-stepper__tab--error) {
  color: var(--q-negative) !important;
}

.policy-history-stepper__panel :deep(.q-stepper__tab--active.q-stepper__tab--error) {
  color: var(--q-negative) !important;
}

.policy-history-stepper__panel :deep(.q-stepper__tab--active:not(.q-stepper__tab--error)) {
  color: var(--q-primary) !important;
}

.policy-history-stepper__detail {
  margin: 8px 12px 12px;
  padding: 10px 12px;
  border-radius: 8px;
  background: #f8fafc;
  line-height: 1.5;
}
</style>
