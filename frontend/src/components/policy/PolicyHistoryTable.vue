<script setup lang="ts">
import type { PolicyHistoryItem } from '@/types/policyMgmt'

defineProps<{
  rows: PolicyHistoryItem[]
}>()

const columns = [
  { name: 'time', label: '時間', field: 'time', align: 'left' as const },
  { name: 'eventName', label: '事件', field: 'eventName', align: 'left' as const },
  { name: 'status', label: '狀態', field: 'status', align: 'left' as const },
  { name: 'handler', label: '處理人', field: 'handler', align: 'left' as const },
  { name: 'reason', label: '原因', field: 'reason', align: 'left' as const },
  { name: 'remark', label: '備註', field: 'remark', align: 'left' as const },
]
</script>

<template>
  <q-table
    :rows="rows"
    :columns="columns"
    row-key="time"
    flat
    bordered
    dense
    hide-pagination
    :pagination="{ rowsPerPage: 0 }"
    no-data-label="尚無歷程資料"
  />
</template>
