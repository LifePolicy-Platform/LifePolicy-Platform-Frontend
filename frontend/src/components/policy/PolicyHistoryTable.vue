<script setup lang="ts">
import type { PolicyHistoryItem } from '@/types/policyMgmt'
import { applicationStatusColor } from '@/constants/applicationStatus'

defineProps<{
  rows: PolicyHistoryItem[]
}>()

const columns = [
  { name: 'time', label: '審核時間', field: 'time', align: 'left' as const, style: 'width: 168px' },
  { name: 'status', label: '狀態', field: 'status', align: 'left' as const, style: 'width: 120px' },
  { name: 'handler', label: '處理人', field: 'handler', align: 'left' as const, style: 'width: 140px' },
  { name: 'remark', label: '備註', field: 'remark', align: 'left' as const },
]

function resolveStatusColor(row: PolicyHistoryItem): string {
  if (row.statusCode) {
    return applicationStatusColor(row.statusCode)
  }
  return 'grey'
}

function rowKey(row: PolicyHistoryItem): string {
  return row.id != null ? String(row.id) : row.time
}
</script>

<template>
  <q-table
    class="policy-history-table"
    :rows="rows"
    :columns="columns"
    :row-key="rowKey"
    flat
    bordered
    dense
    hide-pagination
    :pagination="{ rowsPerPage: 0 }"
    no-data-label="尚無歷程資料"
  >
    <template #no-data>
      <div class="policy-history-table__empty column items-center q-py-lg text-grey-6">
        <q-icon name="info_outline" size="32px" class="q-mb-sm" />
        <span>尚無歷程資料</span>
      </div>
    </template>

    <template #body-cell-status="props">
      <q-td :props="props">
        <q-chip
          dense
          size="sm"
          :color="resolveStatusColor(props.row)"
          text-color="white"
          class="policy-history-table__status-chip"
        >
          {{ props.row.status || '—' }}
        </q-chip>
      </q-td>
    </template>

    <template #body-cell-remark="props">
      <q-td :props="props" class="policy-history-table__remark-cell">
        {{ props.row.remark || '—' }}
      </q-td>
    </template>
  </q-table>
</template>

<style scoped>
.policy-history-table {
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #cbd5e0;
  background: #fff;
}

.policy-history-table :deep(.q-table__top),
.policy-history-table :deep(.q-table__bottom) {
  display: none;
}

.policy-history-table :deep(thead tr) {
  background: #f7f8fa;
}

.policy-history-table :deep(thead th) {
  font-size: 0.8125rem;
  font-weight: 700;
  color: #4a5568;
  padding: 10px 14px;
  border-bottom: 1px solid #cbd5e0;
  border-right: 1px solid #cbd5e0;
}

.policy-history-table :deep(thead th:last-child) {
  border-right: none;
}

.policy-history-table :deep(tbody td) {
  font-size: 0.875rem;
  color: #2d3748;
  padding: 12px 14px;
  border-bottom: 1px solid #d8dee6;
  border-right: 1px solid #cbd5e0;
  vertical-align: middle;
}

.policy-history-table :deep(tbody td:last-child) {
  border-right: none;
}

.policy-history-table :deep(tbody tr:last-child td) {
  border-bottom: none;
}

.policy-history-table :deep(tbody tr:hover td) {
  background: #f9fafb;
}

.policy-history-table__status-chip {
  font-weight: 600;
  letter-spacing: 0.02em;
}

.policy-history-table__remark-cell {
  white-space: normal;
  word-break: break-word;
  line-height: 1.5;
  color: #4a5568;
}

.policy-history-table__empty {
  width: 100%;
  min-height: 120px;
  justify-content: center;
}
</style>
