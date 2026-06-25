<script setup lang="ts">
import PageHero from '@/components/layout/PageHero.vue'
import { useCallListQuery } from '@/composables/useCallListQuery'
import { callListStatusColor, callListStatusLabel } from '@/constants/callListStatus'

const {
  filter,
  list,
  isSearching,
  hasSearched,
  rangeError,
  search,
  resetFilter,
} = useCallListQuery()

const columns = [
  { name: 'sno', label: 'SNO', field: 'sno', align: 'left' as const, sortable: true },
  { name: 'listNo', label: '名單序號', field: 'listNo', align: 'left' as const, sortable: true },
  { name: 'custName', label: '客戶姓名', field: 'custName', align: 'left' as const, sortable: true },
  { name: 'contactPhone', label: '聯絡電話', field: 'contactPhone', align: 'left' as const },
  { name: 'projectCode', label: '專案代碼', field: 'projectCode', align: 'left' as const },
  { name: 'listStatus', label: '名單狀態', field: 'listStatus', align: 'left' as const },
  { name: 'appointmentTime', label: '約訪時間', field: 'appointmentTime', align: 'left' as const, sortable: true },
  { name: 'recallTime', label: '實際約訪時間', field: 'recallTime', align: 'left' as const, sortable: true },
]

function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—'
  return value.slice(0, 16).replace('T', ' ')
}
</script>

<template>
  <section class="page-with-hero call-list-page">
    <PageHero title="約訪名單" subtitle="查詢 tb_call_list 與 tb_call_appointment 約訪資料" />

    <div class="page-body">
      <q-card flat class="page-card page-card--filter q-mb-md">
        <q-card-section>
          <div class="page-card__header q-mb-sm">
            <div>
              <p class="page-card__kicker">CALL LIST</p>
              <div class="page-card__title">查詢條件</div>
              <p class="page-card__desc">日期區間對應 tb_call_appointment.RECALL_TIME</p>
            </div>
          </div>

          <div class="form-grid q-mt-md">
            <q-input
              v-model="filter.custName"
              label="客戶姓名"
              outlined
              dense
              clearable
            />
            <q-input
              v-model="filter.listNo"
              label="名單序號"
              outlined
              dense
              clearable
            />
            <q-input
              v-model="filter.recallDateFrom"
              label="約訪日期起"
              outlined
              dense
              type="date"
              stack-label
            />
            <q-input
              v-model="filter.recallDateTo"
              label="約訪日期迄"
              outlined
              dense
              type="date"
              stack-label
              :error="!!rangeError"
              :error-message="rangeError"
            />
          </div>

          <div class="q-mt-md row items-center wrap q-gutter-sm">
            <q-btn
              color="primary"
              unelevated
              label="執行查詢"
              no-caps
              icon="search"
              :loading="isSearching"
              @click="search"
            />
            <q-btn
              outline
              color="primary"
              label="清空條件"
              no-caps
              icon="refresh"
              @click="resetFilter"
            />
          </div>
        </q-card-section>
      </q-card>

      <q-card flat class="page-card">
        <q-card-section>
          <div class="page-card__header q-mb-md">
            <div>
              <p class="page-card__kicker">RESULT</p>
              <div class="page-card__title">約訪名單</div>
              <p v-if="hasSearched" class="page-card__desc">共 {{ list.length }} 筆結果</p>
            </div>
          </div>

          <q-table
            class="app-table call-list-table"
            flat
            bordered
            dense
            :rows="list"
            :columns="columns"
            row-key="sno"
            :loading="isSearching"
            hide-pagination
            :rows-per-page-options="[0]"
            :no-data-label="hasSearched ? '查無資料' : '請輸入條件後執行查詢'"
          >
            <template #body-cell-custName="props">
              <q-td :props="props">
                {{ props.row.custName || '—' }}
              </q-td>
            </template>

            <template #body-cell-contactPhone="props">
              <q-td :props="props">
                {{ props.row.contactPhone || '—' }}
              </q-td>
            </template>

            <template #body-cell-projectCode="props">
              <q-td :props="props">
                {{ props.row.projectCode || '—' }}
              </q-td>
            </template>

            <template #body-cell-listStatus="props">
              <q-td :props="props">
                <q-chip
                  dense
                  size="sm"
                  :color="callListStatusColor(props.row.listStatus)"
                  text-color="white"
                >
                  {{ callListStatusLabel(props.row.listStatus) }}
                </q-chip>
              </q-td>
            </template>

            <template #body-cell-appointmentTime="props">
              <q-td :props="props">
                {{ formatDateTime(props.row.appointmentTime) }}
              </q-td>
            </template>

            <template #body-cell-recallTime="props">
              <q-td :props="props">
                {{ formatDateTime(props.row.recallTime) }}
              </q-td>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </div>
  </section>
</template>

<style scoped>
.call-list-page {
  --call-list-accent: #4299e1;
}

.call-list-table :deep(thead tr) {
  background: #f7fafc;
}

.call-list-table :deep(.q-table thead th) {
  font-weight: 700;
  color: #2d3748;
}
</style>
