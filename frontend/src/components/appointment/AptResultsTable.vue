<script setup lang="ts">
import type { AptBatchUpdateResponse, AptRecordListResponse } from '@/types/customer'
import { datePart, timePart } from '@/utils/appointmentDateTime'

defineProps<{
  rows: AptRecordListResponse[]
  hasSearched: boolean
  isLoading: boolean
  errorMsg: string
  selectedCountLabel: string
  hasPartialSelection: boolean
  updateResults: Map<number, AptBatchUpdateResponse>
}>()

const selectedRowIds = defineModel<number[]>('selectedRowIds', { required: true })
const allSelected = defineModel<boolean>('allSelected', { required: true })
</script>

<template>
  <div>
    <div class="result-header">
      <div class="result-title">
        <span>查詢結果：</span>
        <span class="result-badge">{{ selectedCountLabel }}</span>
      </div>
      <div class="result-count">查詢筆數：{{ rows.length }}</div>
    </div>

    <div v-if="isLoading" class="table-state">查詢中…</div>

    <div v-else-if="errorMsg" class="table-state table-state--error">{{ errorMsg }}</div>

    <div v-else class="appt-table-wrap">
      <div class="appt-table-scroll">
        <table class="appt-table">
          <thead>
            <tr>
              <th class="select-cell">
                <q-checkbox v-model="allSelected" dense :indeterminate="hasPartialSelection" />
              </th>
              <th>執行結果</th>
              <th>名單序號</th>
              <th>客戶姓名</th>
              <th>專案名稱</th>
              <th>約訪日期</th>
              <th>約訪時間</th>
              <th>撥出電話</th>
              <th>名單回收日</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="hasSearched && rows.length === 0">
              <td colspan="9" class="table-empty">查無資料，請再確認</td>
            </tr>

            <template v-else>
              <tr v-for="(row, idx) in rows" :key="row.sno">
                <td class="select-cell">
                  <q-checkbox v-model="selectedRowIds" dense :val="idx" />
                </td>

                <td>
                  <template v-if="updateResults.has(row.sno)">
                    <span
                      v-if="updateResults.get(row.sno)?.result === 'success'"
                      class="result-ok"
                    >
                      完成
                    </span>

                    <span
                      v-else
                      class="result-fail"
                      :title="updateResults.get(row.sno)?.errorMsg ?? ''"
                    >
                      失敗
                    </span>
                  </template>

                  <template v-else>-</template>
                </td>

                <td>{{ row.recNo }}</td>
                <td>{{ row.custName }}</td>
                <td>{{ row.campName }}</td>
                <td>{{ datePart(row.recallTime) }}</td>
                <td>{{ timePart(row.recallTime) }}</td>
                <td>{{ row.listLastphone }}</td>
                <td>{{ row.campServiceDt }}</td>
              </tr>
            </template>
            </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.result-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}

.result-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #334155;
  font-weight: 700;
}

.result-badge {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 2px 10px;
  background: #fff7f7;
  color: #334155;
  font-size: 0.88rem;
}

.result-count {
  color: #94a3b8;
  font-weight: 700;
}

.appt-table-wrap {
  width: 100%;
  border: 1px solid #d9e2dc;
}

.appt-table-scroll {
  max-height: 352px;
  overflow: auto;
}

.appt-table {
  width: 100%;
  min-width: 820px;
  border-collapse: collapse;
  background: #ffffff;
}

.appt-table thead tr {
  background: #b7e642;
}

.appt-table th,
.appt-table td {
  height: 32px;
  padding: 4px 10px;
  border: 1px solid #e5e7eb;
  text-align: center;
  white-space: nowrap;
}

.appt-table th {
  position: sticky;
  top: 0;
  z-index: 1;
  color: #365314;
  font-size: 0.85rem;
  font-weight: 700;
  background: #b7e642;
  box-shadow: 0 1px 0 #e5e7eb;
}

.appt-table td {
  color: #334155;
  font-size: 0.84rem;
}

.select-cell {
  width: 42px;
  padding: 0 6px;
}

.table-state {
  padding: 24px;
  text-align: center;
  color: #64748b;
  font-size: 0.9rem;
  border: 1px solid #d9e2dc;
}

.table-state--error {
  color: #b91c1c;
  background: #fef2f2;
  border-color: #fca5a5;
}

.table-empty {
  padding: 24px;
  text-align: center;
  color: #94a3b8;
  font-size: 0.9rem;
}

.result-ok {
  color: #16a34a;
  font-weight: 700;
}

.result-fail {
  color: #dc2626;
  font-weight: 700;
  cursor: help;
}

@media (max-width: 760px) {
  .result-header {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
