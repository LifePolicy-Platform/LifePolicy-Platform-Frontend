<script setup lang="ts">
import type { PolicyListItem, PolicyStatus } from '@/types/policyMgmt'
import { POLICY_STATUS_LABEL } from '@/constants/policyStatus'

defineProps<{
  rows: PolicyListItem[]
  loading: boolean
}>()

defineEmits<{
  detail: [policyNo: string]
  visit: [policyNo: string]
}>()

function statusLabel(status: PolicyStatus) {
  return POLICY_STATUS_LABEL[status]
}

const columns = [
  { name: 'policyNo', label: '保單號碼', field: 'policyNo', align: 'left' as const },
  { name: 'productName', label: '商品名稱', field: 'productName', align: 'left' as const },
  { name: 'applicantName', label: '投保人', field: 'applicantName', align: 'left' as const },
  { name: 'policyStatus', label: '狀態', field: 'policyStatus', align: 'left' as const },
  {
    name: 'annualPremium',
    label: '年繳保費',
    field: 'annualPremium',
    align: 'right' as const,
    format: (v: number) => v.toLocaleString(),
  },
  { name: 'agentName', label: '業務員', field: 'agentName', align: 'left' as const },
  { name: 'effectiveDate', label: '生效日', field: 'effectiveDate', align: 'left' as const },
  { name: 'actions', label: '操作', field: 'actions', align: 'center' as const },
]
</script>

<template>
  <q-table
    :rows="rows"
    :columns="columns"
    row-key="policyNo"
    flat
    bordered
    :loading="loading"
    no-data-label="尚無資料，請先查詢"
    :rows-per-page-options="[10, 20, 50]"
  >
    <template #body-cell-policyStatus="props">
      <q-td :props="props">
        {{ statusLabel(props.row.policyStatus) }}
      </q-td>
    </template>
    <template #body-cell-actions="props">
      <q-td :props="props">
        <q-btn
          flat
          dense
          color="primary"
          label="保單明細"
          @click="$emit('detail', props.row.policyNo)"
        />
        <q-btn
          flat
          dense
          color="secondary"
          label="安排約訪"
          @click="$emit('visit', props.row.policyNo)"
        />
      </q-td>
    </template>
  </q-table>
</template>
