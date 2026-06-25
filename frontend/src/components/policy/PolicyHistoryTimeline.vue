<script setup lang="ts">
import { computed } from 'vue'
import type { PolicyHistoryItem } from '@/types/policyMgmt'
import type { ApplicationStatusCode } from '@/constants/applicationStatus'

const props = defineProps<{
  rows: PolicyHistoryItem[]
  currentStatus?: string
}>()

type FlowStatusCode = ApplicationStatusCode

type StepEntry = {
  key: string
  statusCode: FlowStatusCode
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

function stepColor(code: FlowStatusCode): string {
  return isErrorStatus(code) ? 'negative' : 'positive'
}

function stepActiveColor(code: FlowStatusCode): string {
  return isErrorStatus(code) ? 'negative' : 'primary'
}

function sortRows(rows: PolicyHistoryItem[]): PolicyHistoryItem[] {
  return [...rows].sort((a, b) => {
    const timeCompare = (a.time || '').localeCompare(b.time || '')
    if (timeCompare !== 0) return timeCompare
    return String(a.id ?? '').localeCompare(String(b.id ?? ''), undefined, { numeric: true })
  })
}

function buildRawEntries(rows: PolicyHistoryItem[], currentStatus?: string) {
  const sortedRows = sortRows(rows)
  const entries: Omit<StepEntry, 'done' | 'error' | 'active'>[] = []
  const latestStatus = currentStatus || sortedRows[sortedRows.length - 1]?.statusCode || ''

  for (const [index, row] of sortedRows.entries()) {
    const code = row.statusCode
    const next = sortedRows[index + 1]
    const isLast = index === sortedRows.length - 1

    if (code === 'SUBMIT') {
      const resubmit = isResubmitLog(row)
      entries.push({
        key: `submit-${row.id ?? index}`,
        statusCode: 'SUBMIT',
        title: '申請送出',
        time: row.time,
        handler: row.handler,
        remark: row.remark || (resubmit ? '補件後重新送審' : '業務送件'),
        icon: resubmit ? 'replay' : 'send',
      })

      if (next && ['PENDING', 'APPROVED', 'REJECTED'].includes(next.statusCode || '')) {
        entries.push({
          key: `business-${row.id ?? index}`,
          statusCode: 'SUBMIT',
          title: '業務審核中',
          time: next.time,
          handler: next.handler,
          remark:
            next.statusCode === 'PENDING'
              ? '業務審核通過，送交主管審核'
              : '業務審核完成',
          icon: 'manage_accounts',
        })
      } else if (isLast && latestStatus === 'SUBMIT') {
        entries.push({
          key: `business-active-${row.id ?? index}`,
          statusCode: 'SUBMIT',
          title: '業務審核中',
          time: row.time,
          handler: '—',
          remark: '等待業務審核',
          icon: 'hourglass_top',
        })
      }
      continue
    }

    if (code === 'RETURN') {
      entries.push({
        key: `return-${row.id ?? index}`,
        statusCode: 'RETURN',
        title: '退回補件中',
        time: row.time,
        handler: row.handler,
        remark: row.remark || '—',
        icon: 'assignment_return',
      })
      continue
    }

    if (code === 'PENDING') {
      entries.push({
        key: `pending-${row.id ?? index}`,
        statusCode: 'PENDING',
        title: '主管審核中',
        time: row.time,
        handler: row.handler,
        remark: row.remark || '等待主管審核',
        icon: 'supervisor_account',
      })
      continue
    }

    if (code === 'REJECTED') {
      entries.push({
        key: `rejected-${row.id ?? index}`,
        statusCode: 'REJECTED',
        title: '審核駁回',
        time: row.time,
        handler: row.handler,
        remark: row.remark || '—',
        icon: 'cancel',
      })
      continue
    }

    if (code === 'APPROVED') {
      entries.push({
        key: `approved-${row.id ?? index}`,
        statusCode: 'APPROVED',
        title: '審核通過',
        time: row.time,
        handler: row.handler,
        remark: row.remark || '主管核准',
        icon: 'check_circle',
      })
      entries.push({
        key: `effective-${row.id ?? index}`,
        statusCode: 'APPROVED',
        title: '保單生效',
        time: row.time,
        handler: row.handler,
        remark: '保單已核准並生效',
        icon: 'verified',
      })
    }
  }

  return { entries, latestStatus }
}

function resolveActiveIndex(
  entries: Omit<StepEntry, 'done' | 'error' | 'active'>[],
  latestStatus: string,
): number {
  if (!entries.length) return 0

  if (latestStatus === 'SUBMIT') {
    const idx = entries.findIndex(
      (e) => e.statusCode === 'SUBMIT' && e.title === '業務審核中' && e.remark === '等待業務審核',
    )
    if (idx >= 0) return idx
  }

  if (latestStatus === 'PENDING') {
    const idx = [...entries].reverse().findIndex((e) => e.statusCode === 'PENDING')
    if (idx >= 0) return entries.length - 1 - idx
  }

  if (latestStatus === 'RETURN') {
    const idx = [...entries].reverse().findIndex((e) => e.statusCode === 'RETURN')
    if (idx >= 0) return entries.length - 1 - idx
  }

  if (latestStatus === 'REJECTED') {
    const idx = [...entries].reverse().findIndex((e) => e.statusCode === 'REJECTED')
    if (idx >= 0) return entries.length - 1 - idx
  }

  return entries.length - 1
}

function applyStepStates(
  entries: Omit<StepEntry, 'done' | 'error' | 'active'>[],
  latestStatus: string,
): StepEntry[] {
  const activeIndex = resolveActiveIndex(entries, latestStatus)
  const isTerminal = latestStatus === 'APPROVED' || latestStatus === 'REJECTED'

  return entries.map((entry, index) => {
    const isNegative = isErrorStatus(entry.statusCode)
    const isActive = !isTerminal && index === activeIndex

    if (isNegative) {
      return {
        ...entry,
        active: isActive,
        done: false,
        error: true,
      }
    }

    let done = false

    if (isTerminal) {
      done = latestStatus === 'APPROVED' || index < activeIndex
    } else if (!isActive && index < activeIndex) {
      done = true
    }

    return {
      ...entry,
      active: isActive,
      done: isActive ? false : done,
      error: false,
    }
  })
}

function buildEntries(rows: PolicyHistoryItem[], currentStatus?: string): StepEntry[] {
  if (!rows.length) return []
  const { entries, latestStatus } = buildRawEntries(rows, currentStatus)
  return applyStepStates(entries, latestStatus)
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

    <q-stepper
      :model-value="activeStep"
      flat
      bordered
      alternative-labels
      color="positive"
      done-color="positive"
      active-color="primary"
      error-color="negative"
      class="policy-history-stepper__panel"
    >
      <q-step
        v-for="entry in stepEntries"
        :key="entry.key"
        :name="entry.key"
        :title="entry.title"
        :caption="entry.time || '—'"
        :icon="entry.icon"
        :done="entry.done"
        :error="entry.error"
        :color="stepColor(entry.statusCode)"
        :active-color="stepActiveColor(entry.statusCode)"
        :done-color="stepColor(entry.statusCode)"
        :error-color="'negative'"
        :header-nav="false"
      />
    </q-stepper>

    <div v-if="activeEntry" class="policy-history-stepper__detail">
      <q-badge
        v-if="activeEntry.active"
        color="grey-6"
        text-color="white"
        label="進行中"
        class="q-mt-xs"
      />
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

/* Quasar 預設 --done 會強制 primary，需覆寫以讓 QStep done-color 生效 */
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
