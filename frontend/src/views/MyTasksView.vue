<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import PageHero from '@/components/layout/PageHero.vue'
import { useAuthStore } from '@/stores/auth'
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

const router = useRouter()
const authStore = useAuthStore()

onMounted(() => search())

function goToQuery(policyNo: string) {
  router.push({ path: '/policy-mgmt', query: { tab: 'query', policyNo } })
}

const isReviewer = computed(() => authStore.roles.includes('REVIEWER'))

// 依角色決定可選狀態
const statusOptions = computed(() => {
  if (isReviewer.value) {
    return [
      { label: '全部', value: '' },
      { label: '待主管審核', value: 'PENDING' },
    ]
  }
  return [
    { label: '全部', value: '' },
    { label: '待業務審核', value: 'SUBMIT' },
    { label: '已退回',     value: 'RETURN' },
  ]
})

// 依角色過濾清單（APPLICANT 不看 PENDING，REVIEWER 只看 PENDING）
const APPLICANT_STATUSES = ['SUBMIT', 'RETURN']
const REVIEWER_STATUSES  = ['PENDING']

const roleFilteredTasks = computed(() => {
  const allowed = isReviewer.value ? REVIEWER_STATUSES : APPLICANT_STATUSES
  return filteredTasks.value.filter(t => allowed.includes(t.APPLICATION_STATUS))
})

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
              <p class="page-card__desc">共 {{ roleFilteredTasks.length }} 筆結果</p>
            </div>
          </div>
          <q-table
            class="app-table"
            :rows="roleFilteredTasks"
            :columns="columns"
            row-key="APPLICATION_ID"
            flat bordered dense
            :loading="isLoading"
            no-data-label="目前沒有待處理案件"
          >
            <template #body-cell-APPLICATION_ID="props">
              <q-td :props="props">
                <span class="policy-no-link" @click="goToQuery(props.row.APPLICATION_ID)">
                  {{ props.row.APPLICATION_ID }}
                </span>
              </q-td>
            </template>

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

<style scoped>
.policy-no-link {
  color: #38a169;
  font-weight: 600;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.8125rem;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.policy-no-link:hover {
  color: #276749;
}
</style>