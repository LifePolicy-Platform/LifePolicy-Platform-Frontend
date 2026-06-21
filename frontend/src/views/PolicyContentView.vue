<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import type { PolicyRecord } from '@/types/policyApplication'
import type { PolicyHistoryItem } from '@/types/policyMgmt'
import type {
  ActiveProjectOption,
  CallAppointmentItem,
  PolicyAppointmentContext,
} from '@/types/customer'
import { fetchPolicyApplicationById } from '@/api/policyApplication'
import { fetchPolicyAprvLogs } from '@/api/policyAprvLog'
import {
  createCallAppointment,
  confirmCallAppointmentResult,
  fetchActiveProjects,
  fetchAppointmentsByListNo,
  fetchPolicyAppointmentContext,
} from '@/api/customer'
import PolicyHistoryTable from '@/components/policy/PolicyHistoryTable.vue'
import PolicyAppointmentDialog from '@/components/policy/PolicyAppointmentDialog.vue'
import PolicyAppointmentResultDialog from '@/components/policy/PolicyAppointmentResultDialog.vue'
import { useAuthStore } from '@/stores/auth'
import {
  applicationStatusColor,
  applicationStatusLabel,
} from '@/constants/applicationStatus'
import {
  canCreateAppointment,
} from '@/constants/callListStatus'
import { recallResultLabel, recallResultColor } from '@/constants/recallResult'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const authStore = useAuthStore()

const loading = ref(true)
const historyLoading = ref(false)
const appointmentLoading = ref(false)
const projectsLoading = ref(false)
const appointmentSaving = ref(false)
const resultSaving = ref(false)
const appointmentDialogOpen = ref(false)
const resultDialogOpen = ref(false)
const record = ref<PolicyRecord | null>(null)
const historyRows = ref<PolicyHistoryItem[]>([])
const appointmentContext = ref<PolicyAppointmentContext | null>(null)
const appointmentRows = ref<CallAppointmentItem[]>([])
const activeProjects = ref<ActiveProjectOption[]>([])

const policyNo = computed(() => String(route.params.policyNo ?? ''))

const currentUsername = computed(() => authStore.currentUser?.USERNAME ?? '')

const showConfirmResultButton = computed(() => {
  const ctx = appointmentContext.value
  if (!ctx || ctx.listStatus !== 1) return false
  return Boolean(
    ctx.pendingAppointmentUser &&
    ctx.pendingAppointmentUser === currentUsername.value,
  )
})

const appointmentDisableReason = computed(() => {
  if (!appointmentContext.value?.listNo) return '此保單尚無對應名單'
  return ''
})

const appointmentColumns = [
  { name: 'recNo', label: '約訪序號', field: 'recNo', align: 'left' as const },
  { name: 'projectName', label: '專案名稱', field: 'projectName', align: 'left' as const },
  { name: 'recallTime', label: '約訪時間', field: 'recallTime', align: 'left' as const },
  { name: 'recallResult', label: '約訪結果', field: 'recallResult', align: 'left' as const },
  { name: 'recTime', label: '回訪時間', field: 'recTime', align: 'left' as const },
]

const premiumRatioText = computed(() => {
  const ratio = Number(record.value?.PREMIUM_RATIO ?? 0)
  return `${(ratio * 100).toFixed(2)}%`
})

function formatMoney(value?: number | null): string {
  if (value == null) return '—'
  return value.toLocaleString('zh-TW')
}

function formatDate(value?: string | null): string {
  if (!value) return '—'
  return value.length > 10 ? value.replace('T', ' ').slice(0, 19) : value
}

function displayValue(value?: string | null): string {
  return value?.trim() ? value : '—'
}

function riskColor(level?: string | null): string {
  if (level === 'HIGH') return 'negative'
  if (level === 'MEDIUM') return 'warning'
  if (level === 'LOW') return 'positive'
  return 'grey'
}

function formatAprvLogTime(value?: string | null): string {
  if (!value) return '—'
  return value.replace('T', ' ').slice(0, 19)
}

function goBack() {
  if (window.history.length > 1) {
    router.back()
    return
  }
  router.push({ path: '/policy-mgmt', query: { tab: 'query' } })
}

async function loadHistory(id: string) {
  historyLoading.value = true
  historyRows.value = []
  try {
    const logs = await fetchPolicyAprvLogs(id)
    historyRows.value = logs.map((log) => ({
      id: log.POLICY_LOG_NO,
      time: formatAprvLogTime(log.APRV_TIME),
      status: applicationStatusLabel(log.APRV_STATUS),
      statusCode: log.APRV_STATUS,
      handler: log.DISPLAY_NAME || '—',
      remark: log.APRV_REMARK?.trim() || '—',
    }))
  } catch {
    historyRows.value = []
  } finally {
    historyLoading.value = false
  }
}

async function loadAppointmentContext() {
  appointmentLoading.value = true
  appointmentContext.value = null
  appointmentRows.value = []
  try {
    const context = await fetchPolicyAppointmentContext(policyNo.value)
    appointmentContext.value = context
    if (context?.listNo) {
      appointmentRows.value = await fetchAppointmentsByListNo(context.listNo)
    }
  } catch {
    appointmentContext.value = null
    appointmentRows.value = []
  } finally {
    appointmentLoading.value = false
  }
}

async function openAppointmentDialog() {
  const ctx = appointmentContext.value
  if (!ctx?.listNo) return

  if (ctx.listStatus === 1) {
    $q.dialog({
      title: '無法新增約訪',
      message: '此名單尚有未完成約訪，無法新增約訪',
      ok: { label: '我知道了', color: 'primary', flat: true },
    })
    return
  }

  if (!canCreateAppointment(ctx.listStatus)) return

  appointmentDialogOpen.value = true
  projectsLoading.value = true
  try {
    activeProjects.value = await fetchActiveProjects()
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } }; message?: string }
    $q.notify({
      type: 'negative',
      message: err.response?.data?.message || err.message || '載入專案選項失敗',
      position: 'top',
    })
    appointmentDialogOpen.value = false
  } finally {
    projectsLoading.value = false
  }
}

function openResultDialog() {
  resultDialogOpen.value = true
}

async function handleConfirmAppointmentResult(recallResult: number) {
  resultSaving.value = true
  try {
    await confirmCallAppointmentResult({
      policyNo: policyNo.value,
      recallResult,
    })
    $q.notify({ type: 'positive', message: '約訪結果已確認', position: 'top' })
    resultDialogOpen.value = false
    await loadAppointmentContext()
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } }; message?: string }
    $q.notify({
      type: 'negative',
      message: err.response?.data?.message || err.message || '確認約訪結果失敗',
      position: 'top',
    })
  } finally {
    resultSaving.value = false
  }
}

async function handleAppointmentAction() {
  if (showConfirmResultButton.value) {
    openResultDialog()
    return
  }
  await openAppointmentDialog()
}

async function handleCreateAppointment(payload: { campCode: string; recallTime: string }) {
  appointmentSaving.value = true
  try {
    await createCallAppointment({
      policyNo: policyNo.value,
      campCode: payload.campCode,
      recallTime: payload.recallTime,
    })
    $q.notify({ type: 'positive', message: '約訪已新增', position: 'top' })
    appointmentDialogOpen.value = false
    await loadAppointmentContext()
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } }; message?: string }
    $q.notify({
      type: 'negative',
      message: err.response?.data?.message || err.message || '新增約訪失敗',
      position: 'top',
    })
  } finally {
    appointmentSaving.value = false
  }
}

async function loadPolicy() {
  loading.value = true
  record.value = null
  try {
    const data = await fetchPolicyApplicationById(policyNo.value)
    if (!data) {
      $q.notify({ type: 'warning', message: '查無此保單資料', position: 'top' })
      goBack()
      return
    }
    record.value = data
    await Promise.all([loadHistory(data.APPLICATION_ID), loadAppointmentContext()])
  } catch (error: unknown) {
    const err = error as { response?: { data?: { MESSAGE?: string } }; message?: string }
    $q.notify({
      type: 'negative',
      message: err.response?.data?.MESSAGE || err.message || '載入保單失敗',
      position: 'top',
    })
    goBack()
  } finally {
    loading.value = false
  }
}

onMounted(loadPolicy)
</script>

<template>
  <section class="policy-content-page">
    <div class="policy-content-page__toolbar">
      <q-btn
        flat
        round
        dense
        icon="arrow_back"
        color="grey-8"
        aria-label="返回上一頁"
        class="policy-content-page__back"
        @click="goBack"
      />
      <div>
        <h1 class="policy-content-page__title">保單內容</h1>
        <p class="policy-content-page__subtitle">檢視投保申請完整資料與審核歷程</p>
      </div>
    </div>

    <div v-if="loading" class="policy-content-page__loading">
      <q-spinner color="primary" size="42px" />
      <span class="text-grey-7 q-mt-md">載入保單資料中…</span>
    </div>

    <template v-else-if="record">
      <q-card flat bordered class="policy-content-summary">
        <q-card-section class="row items-center q-col-gutter-md">
          <div class="col-12 col-md">
            <div class="text-caption text-grey-7 q-mb-xs">保單編號</div>
            <div class="policy-content-summary__policy-no">{{ record.APPLICATION_ID }}</div>
            <div class="text-body2 text-grey-7 q-mt-sm">
              {{ record.PRODUCT_NAME || '—' }}
              <span class="text-grey-5">·</span>
              <span class="text-grey-6">{{ record.PRODUCT_CODE }}</span>
            </div>
          </div>
          <div class="col-auto">
            <q-chip
              dense
              :color="applicationStatusColor(record.APPLICATION_STATUS)"
              text-color="white"
              class="policy-content-summary__status"
            >
              {{ applicationStatusLabel(record.APPLICATION_STATUS) }}
            </q-chip>
          </div>
        </q-card-section>
      </q-card>

      <div class="policy-content-grid">
        <q-card flat bordered class="policy-content-card">
          <q-card-section>
            <div class="policy-content-card__heading">
              <q-icon name="person_outline" color="primary" size="20px" />
              <span>投保人</span>
            </div>
            <dl class="policy-content-dl">
              <div class="policy-content-dl__row">
                <dt>姓名</dt>
                <dd>{{ displayValue(record.APPLICANT_NAME) }}</dd>
              </div>
              <div class="policy-content-dl__row">
                <dt>身分證字號</dt>
                <dd>{{ displayValue(record.APPLICANT_ID_NO) }}</dd>
              </div>
              <div class="policy-content-dl__row">
                <dt>性別</dt>
                <dd>{{ displayValue(record.APPLICANT_GENDER) }}</dd>
              </div>
              <div class="policy-content-dl__row">
                <dt>生日</dt>
                <dd>{{ formatDate(record.APPLICANT_BIRTHDATE) }}</dd>
              </div>
              <div class="policy-content-dl__row">
                <dt>聯絡電話</dt>
                <dd>{{ displayValue(record.CONTACT_PHONE) }}</dd>
              </div>
              <div class="policy-content-dl__row">
                <dt>與被保人關係</dt>
                <dd>{{ displayValue(record.RELATIONSHIP_TO_INSURED) }}</dd>
              </div>
            </dl>
          </q-card-section>
        </q-card>

        <q-card flat bordered class="policy-content-card">
          <q-card-section>
            <div class="policy-content-card__heading">
              <q-icon name="shield_outlined" color="primary" size="20px" />
              <span>被保人</span>
            </div>
            <dl class="policy-content-dl">
              <div class="policy-content-dl__row">
                <dt>姓名</dt>
                <dd>{{ displayValue(record.INSURED_NAME) }}</dd>
              </div>
              <div class="policy-content-dl__row">
                <dt>身分證字號</dt>
                <dd>{{ displayValue(record.INSURED_ID_NO) }}</dd>
              </div>
              <div class="policy-content-dl__row">
                <dt>性別</dt>
                <dd>{{ displayValue(record.INSURED_GENDER) }}</dd>
              </div>
              <div class="policy-content-dl__row">
                <dt>生日</dt>
                <dd>{{ formatDate(record.INSURED_BIRTHDATE) }}</dd>
              </div>
            </dl>
          </q-card-section>
        </q-card>

        <q-card flat bordered class="policy-content-card policy-content-card--wide">
          <q-card-section>
            <div class="policy-content-card__heading">
              <q-icon name="description_outlined" color="primary" size="20px" />
              <span>保單與核保資訊</span>
            </div>
            <div class="policy-content-metrics">
              <div class="policy-content-metric">
                <span class="policy-content-metric__label">保額</span>
                <strong class="policy-content-metric__value">{{ formatMoney(record.SUM_INSURED) }}</strong>
              </div>
              <div class="policy-content-metric">
                <span class="policy-content-metric__label">年繳保費</span>
                <strong class="policy-content-metric__value">{{ formatMoney(record.ANNUAL_PREMIUM) }}</strong>
              </div>
              <div class="policy-content-metric">
                <span class="policy-content-metric__label">保費比例</span>
                <strong class="policy-content-metric__value">{{ premiumRatioText }}</strong>
              </div>
              <div class="policy-content-metric">
                <span class="policy-content-metric__label">風險等級</span>
                <q-chip dense size="sm" :color="riskColor(record.RISK_LEVEL)" text-color="white">
                  {{ displayValue(record.RISK_LEVEL) }}
                </q-chip>
              </div>
            </div>
            <q-separator class="q-my-md" />
            <dl class="policy-content-dl policy-content-dl--cols">
              <div class="policy-content-dl__row">
                <dt>商品代碼</dt>
                <dd>{{ displayValue(record.PRODUCT_CODE) }}</dd>
              </div>
              <div class="policy-content-dl__row">
                <dt>商品名稱</dt>
                <dd>{{ displayValue(record.PRODUCT_NAME) }}</dd>
              </div>
              <div v-if="record.REJECTION_REASON" class="policy-content-dl__row policy-content-dl__row--full">
                <dt>拒絕原因</dt>
                <dd class="text-negative">{{ record.REJECTION_REASON }}</dd>
              </div>
            </dl>
          </q-card-section>
        </q-card>

        <q-card flat bordered class="policy-content-card policy-content-card--wide">
          <q-card-section>
            <div class="policy-content-card__heading policy-content-card__heading--between">
              <div class="policy-content-card__heading">
                <q-icon name="event_available" color="primary" size="20px" />
                <span>約訪記錄</span>
              </div>
              <q-btn
                v-if="showConfirmResultButton"
                color="secondary"
                outline
                dense
                icon="fact_check"
                label="約訪結果確認"
                @click="handleAppointmentAction"
              />
              <q-btn
                v-else
                color="primary"
                outline
                dense
                icon="add"
                label="新增約訪"
                :disable="!appointmentContext?.listNo"
                @click="handleAppointmentAction"
              >
                <q-tooltip v-if="appointmentDisableReason">
                  {{ appointmentDisableReason }}
                </q-tooltip>
              </q-btn>
            </div>
            <div class="relative-position policy-content-history">
              <q-table
                flat
                bordered
                :rows="appointmentRows"
                :columns="appointmentColumns"
                row-key="sno"
                hide-pagination
                :pagination="{ rowsPerPage: 0 }"
                no-data-label="尚無約訪記錄"
              >
                <template #body-cell-recallTime="props">
                  <q-td :props="props">
                    {{ formatDate(props.row.recallTime) }}
                  </q-td>
                </template>
                <template #body-cell-recallResult="props">
                  <q-td :props="props">
                    <q-chip
                      dense
                      size="sm"
                      :color="recallResultColor(props.row.recallResult)"
                      text-color="white"
                    >
                      {{ recallResultLabel(props.row.recallResult) }}
                    </q-chip>
                  </q-td>
                </template>
                <template #body-cell-recTime="props">
                  <q-td :props="props">
                    {{ formatDate(props.row.recTime) }}
                  </q-td>
                </template>
              </q-table>
              <q-inner-loading :showing="appointmentLoading" color="primary" />
            </div>
          </q-card-section>
        </q-card>

        <q-card flat bordered class="policy-content-card policy-content-card--wide">
          <q-card-section>
            <div class="policy-content-card__heading">
              <q-icon name="history" color="primary" size="20px" />
              <span>審核歷程</span>
            </div>
            <div class="relative-position policy-content-history">
              <PolicyHistoryTable :rows="historyRows" />
              <q-inner-loading :showing="historyLoading" color="primary" />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <PolicyAppointmentDialog
        v-model="appointmentDialogOpen"
        :context="appointmentContext"
        :projects="activeProjects"
        :projects-loading="projectsLoading"
        :saving="appointmentSaving"
        @submit="handleCreateAppointment"
      />
      <PolicyAppointmentResultDialog
        v-model="resultDialogOpen"
        :saving="resultSaving"
        @submit="handleConfirmAppointmentResult"
      />
    </template>
  </section>
</template>

<style scoped>
.policy-content-page {
  max-width: 1080px;
  margin: 0 auto;
  padding: 20px 20px 40px;
}

.policy-content-page__toolbar {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 20px;
}

.policy-content-page__back {
  margin-top: 2px;
}

.policy-content-page__title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a202c;
  line-height: 1.3;
}

.policy-content-page__subtitle {
  margin: 4px 0 0;
  font-size: 0.875rem;
  color: #718096;
}

.policy-content-page__loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 320px;
}

.policy-content-summary {
  border-radius: 12px;
  background: linear-gradient(135deg, #f0fff4 0%, #ffffff 55%);
  border-color: #9ae6b4;
  margin-bottom: 20px;
}

.policy-content-summary__policy-no {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 1.25rem;
  font-weight: 700;
  color: #22543d;
  letter-spacing: 0.02em;
}

.policy-content-summary__status {
  font-weight: 600;
  padding: 6px 12px;
}

.policy-content-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.policy-content-card {
  border-radius: 12px;
  border-color: #cbd5e0;
  background: #fff;
}

.policy-content-card--wide {
  grid-column: 1 / -1;
}

.policy-content-card__heading {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 14px;
}

.policy-content-card__heading--between {
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}

.policy-content-dl {
  margin: 0;
  display: grid;
  gap: 10px;
}

.policy-content-dl--cols {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px 24px;
}

.policy-content-dl__row {
  display: grid;
  grid-template-columns: 108px 1fr;
  gap: 12px;
  align-items: start;
}

.policy-content-dl__row--full {
  grid-column: 1 / -1;
}

.policy-content-dl__row dt {
  margin: 0;
  font-size: 0.8125rem;
  color: #718096;
}

.policy-content-dl__row dd {
  margin: 0;
  font-size: 0.9375rem;
  color: #2d3748;
  font-weight: 500;
  word-break: break-word;
}

.policy-content-metrics {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.policy-content-metric {
  padding: 12px 14px;
  border-radius: 10px;
  background: #f7fafc;
  border: 1px solid #d8dee6;
}

.policy-content-metric__label {
  display: block;
  font-size: 0.75rem;
  color: #718096;
  margin-bottom: 4px;
}

.policy-content-metric__value {
  font-size: 1.0625rem;
  color: #1a202c;
}

.policy-content-history {
  min-height: 120px;
}

@media (max-width: 900px) {
  .policy-content-grid,
  .policy-content-dl--cols,
  .policy-content-metrics {
    grid-template-columns: 1fr;
  }

  .policy-content-dl__row {
    grid-template-columns: 1fr;
    gap: 2px;
  }
}
</style>
