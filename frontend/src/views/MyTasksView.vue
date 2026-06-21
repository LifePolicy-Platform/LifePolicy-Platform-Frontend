<script setup lang="ts">
import { onMounted } from 'vue'
import PageHero from '@/components/layout/PageHero.vue'
import { useMyTasks } from '@/composables/useMyTasks'

const {
  filteredTasks,
  pendingCount,
  isLoading,
  errorMessage,
  keyword,
  statusFilter,
  search,
  resetFilter,
  STATUS_LABEL,
  STATUS_COLOR,
} = useMyTasks()

onMounted(() => search())

const statusOptions = [
  { label: '全部', value: '' },
  { label: '待業務審核', value: 'APPLIED' },
  { label: '已退回',     value: 'RETURNED' },
  { label: '待主管審核', value: 'PENDING' },
]

const columns = [
  { name: 'APPLICATION_ID', label: '保單號碼', field: 'APPLICATION_ID', align: 'left' as const },
  { name: 'APPLICANT_NAME', label: '要保人',   field: 'APPLICANT_NAME', align: 'left' as const },
  { name: 'INSURED_NAME',   label: '被保人',   field: 'INSURED_NAME',   align: 'left' as const },
  { name: 'PRODUCT_NAME',   label: '商品',     field: 'PRODUCT_NAME',   align: 'left' as const },
  {
    name: 'SUM_INSURED',
    label: '保額',
    field: 'SUM_INSURED',
    align: 'right' as const,
    format: (v: number) => v != null ? v.toLocaleString() : '-',
  },
  { name: 'APPLICATION_STATUS', label: '狀態', field: 'APPLICATION_STATUS', align: 'left' as const },
  {
    name: 'SUBMISSION_TIME',
    label: '申請時間',
    field: 'SUBMISSION_TIME',
    align: 'left' as const,
    format: (v: string) => v ? v.slice(0, 16).replace('T', ' ') : '-',
  },
]
</script>

<template>
  <section class="page-with-hero">
    <PageHero title="個人待辦案件" :subtitle="`未完成：${pendingCount} 件`" />

    <div class="page-body">
      <!-- 篩選列 -->
      <q-card flat class="page-card page-card--filter q-mb-md">
        <q-card-section>
          <div class="page-card__header q-mb-sm">
            <div>
              <p class="page-card__kicker">FILTER</p>
              <div class="page-card__title">查詢條件</div>
            </div>
          </div>
          <div class="row q-col-gutter-md items-end">
            <div class="col-12 col-md-4">
              <q-input v-model="keyword" label="關鍵字（保單號、要保人、商品）" dense outlined clearable />
            </div>
            <div class="col-12 col-md-3">
              <q-select
                v-model="statusFilter"
                :options="statusOptions"
                label="狀態"
                dense outlined emit-value map-options
              />
            </div>
            <div class="col-12 col-md-3 flex q-gutter-sm">
              <q-btn color="primary" unelevated label="查詢" icon="search" :loading="isLoading" @click="search" />
              <q-btn flat label="清除" @click="resetFilter" />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- 錯誤訊息 -->
      <q-banner v-if="errorMessage" rounded class="bg-red-1 text-red-8 q-mb-md">
        {{ errorMessage }}
      </q-banner>

      <!-- 清單 -->
      <q-card flat class="page-card page-card--data">
        <q-card-section>
          <div class="page-card__header q-mb-md">
            <div>
              <p class="page-card__kicker">TASK LIST</p>
              <div class="page-card__title">待辦清單</div>
              <p class="page-card__desc">共 {{ filteredTasks.length }} 筆結果</p>
            </div>
          </div>
          <q-table
            class="app-table"
            :rows="filteredTasks"
            :columns="columns"
            row-key="APPLICATION_ID"
            flat bordered dense
            :loading="isLoading"
            no-data-label="目前沒有待處理案件"
          >
            <template #body-cell-APPLICATION_STATUS="props">
              <q-td :props="props">
                <q-chip
                  dense size="sm"
                  :color="STATUS_COLOR[props.row.APPLICATION_STATUS] ?? 'grey'"
                  text-color="white"
                >
                  {{ STATUS_LABEL[props.row.APPLICATION_STATUS] ?? props.row.APPLICATION_STATUS }}
                </q-chip>
              </q-td>
            </template>
            <template #no-data>
              <div class="page-empty">
                <q-icon name="inbox" class="page-empty__icon" />
                <div>目前沒有待處理案件</div>
              </div>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </div>
  </section>
</template>