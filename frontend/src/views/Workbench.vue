<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useAuthStore } from '@/stores/auth'
import { useRoute, useRouter } from 'vue-router'
import type { ProductListItem } from '@/types/productMgmt'
import type { PolicyRecord } from '@/types/policyApplication'
import type { PolicyHistoryItem } from '@/types/policyMgmt'
import PolicyHistoryTable from '@/components/policy/PolicyHistoryTable.vue'
import {
  createPolicyApplication,
  queryPolicyApplications,
  updatePolicyApplication,
  reviewPolicyApplication,
} from '@/api/policyApplication'
import { fetchPolicyAprvLogs } from '@/api/policyAprvLog'
import { fetchActiveProducts } from '@/api/product'
import {
  APPLICATION_STATUS_LABEL,
  applicationStatusColor,
  applicationStatusLabel,
  reviewSuccessMessage,
} from '@/constants/applicationStatus'

type ProductOption = { label: string; value: string }

const router = useRouter()
const route = useRoute()
const $q = useQuasar()
const authStore = useAuthStore()

// ---- 商品清單 ----
const products = ref<ProductListItem[]>([])
const createProductOptions = ref<ProductOption[]>([])
const queryProductOptions = ref<ProductOption[]>([{ label: '全部', value: '' }])
const editProductOptions = ref<ProductOption[]>([])

function buildProductOptions(includeAll = false): ProductOption[] {
  const items = products.value.map((p) => ({
    label: `${p.code} - ${p.name}`,
    value: p.code,
  }))
  return includeAll ? [{ label: '全部', value: '' }, ...items] : items
}

function filterProductOptions(
  val: string,
  update: (callback: () => void) => void,
  target: 'create' | 'query' | 'edit',
) {
  update(() => {
    const needle = val.trim().toLowerCase()
    const base = products.value.map((p) => ({
      label: `${p.code} - ${p.name}`,
      value: p.code,
    }))
    const filtered = !needle
      ? base
      : base.filter(
          (opt) =>
            opt.label.toLowerCase().includes(needle) ||
            opt.value.toLowerCase().includes(needle),
        )

    if (target === 'create') {
      createProductOptions.value = filtered
    } else if (target === 'query') {
      queryProductOptions.value = [{ label: '全部', value: '' }, ...filtered]
    } else {
      editProductOptions.value = filtered
    }
  })
}

async function loadProducts() {
  try {
    products.value = await fetchActiveProducts()
    createProductOptions.value = buildProductOptions()
    queryProductOptions.value = buildProductOptions(true)
    editProductOptions.value = buildProductOptions()
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '載入商品失敗'
    notifyError(message)
  }
}

// ---- q-select 用的選項 ----
const genderOptions = [
  { label: 'MALE', value: 'MALE' },
  { label: 'FEMALE', value: 'FEMALE' }
]
const relationshipOptions = [
  { label: 'SELF', value: 'SELF' },
  { label: 'SPOUSE', value: 'SPOUSE' },
  { label: 'CHILD', value: 'CHILD' },
  { label: 'PARENT', value: 'PARENT' },
  { label: 'OTHER', value: 'OTHER' }
]
const statusOptions = [
  { label: '全部', value: '' },
  { label: APPLICATION_STATUS_LABEL.PENDING, value: 'PENDING' },
  { label: APPLICATION_STATUS_LABEL.APPROVED, value: 'APPROVED' },
  { label: APPLICATION_STATUS_LABEL.REJECTED, value: 'REJECTED' },
  { label: APPLICATION_STATUS_LABEL.SUBMIT, value: 'SUBMIT' },
  { label: APPLICATION_STATUS_LABEL.RETURN, value: 'RETURN' },
]
const targetStatusOptions = [
  { label: '核准', value: 'APPROVED' },
  { label: '拒絕', value: 'REJECTED' },
]
const sortOptions = [
  { label: '由新到舊', value: 'DESC' },
  { label: '由舊到新', value: 'ASC' }
]

// ---- 分頁 ----
type TabKey = 'create' | 'query' | 'edit' | 'review'
const tabKeys: TabKey[] = ['create', 'query', 'edit', 'review']
const activeTab = ref<TabKey>('create')

function isTabKey(value: unknown): value is TabKey {
  return typeof value === 'string' && tabKeys.includes(value as TabKey)
}

onMounted(() => {
  loadProducts()
  if (isTabKey(route.query.tab)) activeTab.value = route.query.tab
})

watch(activeTab, (tab) => {
  if (route.query.tab !== tab) {
    router.replace({ query: { ...route.query, tab } })
  }
})

const canCreate = computed(() => authStore.isAuthenticated && authStore.roles.includes('APPLICANT'))
const canQuery = computed(() => authStore.isAuthenticated)
const canEdit = computed(() => authStore.roles.includes('APPLICANT'))
const canReview = computed(() => authStore.roles.includes('REVIEWER'))
const displayName = computed(
  () => authStore.currentUser?.DISPLAY_NAME ?? authStore.currentUser?.USERNAME ?? '',
)

// ---- 訊息（改用 Quasar 的 notify）----
function notifySuccess(msg: string) {
  $q.notify({ type: 'positive', message: msg, position: 'top', timeout: 2500 })
}
function notifyError(msg: string) {
  $q.notify({ type: 'negative', message: msg, position: 'top', timeout: 3000 })
}

// ---- 表單預設值 ----
function blankApplication() {
  return {
    applicationId: '',
    applicantIdNo: '',
    applicantName: '',
    applicantGender: 'MALE',
    applicantBirthdate: '',
    relationshipToInsured: 'SELF',
    insuredIdNo: '',
    insuredName: '',
    insuredGender: 'MALE',
    insuredBirthdate: '',
    productCode: '',
    sumInsured: '',
    annualPremium: '',
    contactPhone: ''
  }
}

const createForm = reactive(blankApplication())
const editForm = reactive(blankApplication())

const queryForm = reactive({
  applicationId: '',
  applicantIdNo: '',
  insuredIdNo: '',
  applicationStatus: '',
  productCode: '',
  submissionStartTime: '',
  submissionEndTime: '',
  pageNo: 1,
  pageSize: 10,
  sortDirection: 'DESC'
})

const reviewForm = reactive({
  applicationId: '',
  targetStatus: 'APPROVED',
  rejectionReason: '',
  docIdentity: false,
  docProposal: false,
  docHealth: false
})

const submitting = ref(false)
const editLoaded = ref(false)
const reviewLoaded = ref(false)

// ---- 查詢結果 ----
const queryResults = ref<PolicyRecord[]>([])
const queryMeta = ref('')
const hasQueried = ref(false)

// q-table 欄位定義
const columns = [
  { name: 'applicationId', label: '申請編號', field: 'APPLICATION_ID', align: 'left' as const },
  { name: 'applicant', label: '投保人', field: 'APPLICANT_NAME', align: 'left' as const },
  { name: 'insured', label: '被保人', field: 'INSURED_NAME', align: 'left' as const },
  { name: 'product', label: '商品', field: 'PRODUCT_CODE', align: 'left' as const },
  { name: 'status', label: '狀態', field: 'APPLICATION_STATUS', align: 'left' as const },
  { name: 'risk', label: '風險', field: 'RISK_LEVEL', align: 'left' as const },
  { name: 'ratio', label: '保費比例', field: 'PREMIUM_RATIO', align: 'left' as const },
  { name: 'history', label: '歷程', field: 'history', align: 'left' as const },
  { name: 'actions', label: '操作', field: 'actions', align: 'left' as const }
]

const historyDialogOpen = ref(false)
const historyLoading = ref(false)
const historyPolicyNo = ref('')
const historyRows = ref<PolicyHistoryItem[]>([])

function formatAprvLogTime(value?: string | null): string {
  if (!value) return '—'
  return value.replace('T', ' ').slice(0, 19)
}

async function openPolicyHistory(record: PolicyRecord) {
  const policyNo = record.APPLICATION_ID
  historyPolicyNo.value = policyNo
  historyDialogOpen.value = true
  historyLoading.value = true
  historyRows.value = []
  try {
    const logs = await fetchPolicyAprvLogs(policyNo)
    historyRows.value = logs.map((log) => ({
      time: formatAprvLogTime(log.APRV_TIME),
      eventName: '審核歷程',
      status: applicationStatusLabel(log.APRV_STATUS),
      handler: log.DISPLAY_NAME || '—',
      reason: '',
      remark: log.APRV_REMARK?.trim() || '—',
    }))
  } catch (error: unknown) {
    const err = error as { response?: { data?: { MESSAGE?: string } } }
    notifyError(err.response?.data?.MESSAGE || '查詢審核歷程失敗')
    historyDialogOpen.value = false
  } finally {
    historyLoading.value = false
  }
}

// ---- 即時提示 ----
const hintForm = computed(() => (activeTab.value === 'edit' ? editForm : createForm))

const premiumRatioHint = computed(() => {
  const premium = Number(hintForm.value.annualPremium || 0)
  const sumInsured = Number(hintForm.value.sumInsured || 0)
  if (sumInsured <= 0) return '尚未計算'
  const ratio = premium / sumInsured
  const pct = (ratio * 100).toFixed(2)
  if (ratio > 0.05) return `${pct}%，已超過 5% 上限`
  if (ratio >= 0.04) return `${pct}%，接近 5% 上限`
  return `${pct}%，落在安全區間`
})

const riskLevelHint = computed(() => {
  const sumInsured = Number(hintForm.value.sumInsured || 0)
  const premium = Number(hintForm.value.annualPremium || 0)
  const ratio = sumInsured > 0 ? premium / sumInsured : 0
  if (!hintForm.value.insuredBirthdate) return '尚未判定'
  return evaluateRiskLevel(hintForm.value.insuredBirthdate, hintForm.value.relationshipToInsured, sumInsured, ratio)
})

const duplicateWarning = ref('尚未檢查')

const documentHint = computed(() =>
  areDocumentsConfirmed() ? '文件檢核完成，可進入審核' : '尚有文件未確認，系統會拒絕送審'
)

// ---- 工具函式 ----
function calculateAge(dateString: string): number {
  const today = new Date()
  const birthday = new Date(dateString)
  let age = today.getFullYear() - birthday.getFullYear()
  const monthDiff = today.getMonth() - birthday.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthday.getDate())) age -= 1
  return age
}

function evaluateRiskLevel(insuredBirthdate: string, relationship: string, sumInsured: number, ratio: number): string {
  const age = insuredBirthdate ? calculateAge(insuredBirthdate) : 0
  if (age >= 60 || sumInsured >= 3000000 || relationship === 'PARENT' || relationship === 'CHILD') return 'HIGH'
  if (age >= 50 || sumInsured >= 1500000 || ratio >= 0.04 || relationship === 'SPOUSE') return 'MEDIUM'
  return 'LOW'
}

function areDocumentsConfirmed(): boolean {
  return reviewForm.docIdentity && reviewForm.docProposal && reviewForm.docHealth
}

function toApiDateTime(value: string): string | null {
  return value ? `${value}:00` : null
}

function formatRatio(value: number): string {
  return `${(Number(value || 0) * 100).toFixed(2)}%`
}

function riskColor(level: string): string {
  if (level === 'HIGH') return 'negative'
  if (level === 'MEDIUM') return 'warning'
  return 'positive'
}

// ---- 驗證 ----
function validateApplication(form: ReturnType<typeof blankApplication>): string[] {
  const errors: string[] = []
  const idPattern = /^[A-Z][0-9]{9}$/
  const phonePattern = /^09\d{8}$/

  if (!idPattern.test(form.applicantIdNo)) errors.push('投保人身分證格式需為 1 個英文字母加 9 碼數字')
  if (!idPattern.test(form.insuredIdNo)) errors.push('被保人身分證格式需為 1 個英文字母加 9 碼數字')
  if (form.applicantName.trim().length < 2) errors.push('投保人姓名至少需 2 個字')
  if (form.insuredName.trim().length < 2) errors.push('被保人姓名至少需 2 個字')

  const today = new Date()
  if (form.applicantBirthdate && new Date(form.applicantBirthdate) > today) errors.push('投保人生日不可晚於今天')
  if (form.insuredBirthdate && new Date(form.insuredBirthdate) > today) errors.push('被保人生日不可晚於今天')

  if (!form.productCode) errors.push('請選擇商品代碼')
  if (!phonePattern.test(form.contactPhone)) errors.push('聯絡電話需為 09 開頭的 10 碼手機號碼')

  const sumInsured = Number(form.sumInsured || 0)
  const annualPremium = Number(form.annualPremium || 0)
  if (sumInsured <= 0) errors.push('保額需大於 0')
  if (annualPremium <= 0) errors.push('年繳保費需大於 0')
  if (sumInsured > 0 && annualPremium / sumInsured > 0.05) errors.push('年繳保費不可超過保額的 5%')

  return errors
}

function buildPayload(form: ReturnType<typeof blankApplication>) {
  const sumInsured = Number(form.sumInsured || 0)
  const annualPremium = Number(form.annualPremium || 0)
  const premiumRatio = sumInsured > 0 ? annualPremium / sumInsured : 0

  return {
    APPLICANT_ID_NO: form.applicantIdNo.trim(),
    APPLICANT_NAME: form.applicantName.trim(),
    APPLICANT_GENDER: form.applicantGender,
    APPLICANT_BIRTHDATE: form.applicantBirthdate,
    RELATIONSHIP_TO_INSURED: form.relationshipToInsured,
    INSURED_ID_NO: form.insuredIdNo.trim(),
    INSURED_NAME: form.insuredName.trim(),
    INSURED_GENDER: form.insuredGender,
    INSURED_BIRTHDATE: form.insuredBirthdate,
    PRODUCT_CODE: form.productCode,
    SUM_INSURED: sumInsured,
    ANNUAL_PREMIUM: annualPremium,
    CONTACT_PHONE: form.contactPhone.trim(),
    RISK_LEVEL: evaluateRiskLevel(form.insuredBirthdate, form.relationshipToInsured, sumInsured, premiumRatio),
    CREATED_BY: authStore.currentUser?.USERNAME ?? ''
  }
}

// ---- 新增 ----
async function handleCreate() {
  const errors = validateApplication(createForm)
  if (errors.length) {
    notifyError(errors[0])
    return
  }
  submitting.value = true
  try {
    const result = await createPolicyApplication(buildPayload(createForm))
    notifySuccess(`新增成功，申請編號 ${result.APPLICATION_ID}`)
    Object.assign(createForm, blankApplication())
  } catch (error: any) {
    notifyError(error.response?.data?.MESSAGE || '新增失敗')
  } finally {
    submitting.value = false
  }
}

// ---- 查詢 ----
function hasQueryCriteria(): boolean {
  return Boolean(
    queryForm.applicationId.trim() ||
      queryForm.applicantIdNo.trim() ||
      queryForm.insuredIdNo.trim() ||
      queryForm.applicationStatus ||
      queryForm.productCode ||
      queryForm.submissionStartTime ||
      queryForm.submissionEndTime
  )
}

async function handleQuery() {
  if (!hasQueryCriteria()) {
    notifyError('查詢至少要填一個條件，或指定一段送件時間')
    return
  }
  if (
    queryForm.submissionStartTime &&
    queryForm.submissionEndTime &&
    queryForm.submissionStartTime > queryForm.submissionEndTime
  ) {
    notifyError('結束時間不可早於起始時間')
    return
  }
  submitting.value = true
  try {
    const result = await queryPolicyApplications({
      APPLICATION_ID: queryForm.applicationId.trim(),
      APPLICANT_ID_NO: queryForm.applicantIdNo.trim(),
      INSURED_ID_NO: queryForm.insuredIdNo.trim(),
      APPLICATION_STATUS: queryForm.applicationStatus,
      PRODUCT_CODE: queryForm.productCode,
      SUBMISSION_START_TIME: toApiDateTime(queryForm.submissionStartTime),
      SUBMISSION_END_TIME: toApiDateTime(queryForm.submissionEndTime),
      PAGE_NO: Number(queryForm.pageNo || 1),
      PAGE_SIZE: Number(queryForm.pageSize || 10),
      SORT_DIRECTION: queryForm.sortDirection || 'DESC'
    })
    queryResults.value = result.RECORDS || []
    queryMeta.value = `第 ${result.PAGE_NO} 頁 / 共 ${result.TOTAL_PAGES} 頁，總筆數 ${result.TOTAL_COUNT}`
    hasQueried.value = true
    notifySuccess(`查詢完成，共 ${result.TOTAL_COUNT} 筆`)
  } catch (error: any) {
    notifyError(error.response?.data?.MESSAGE || '查詢失敗')
  } finally {
    submitting.value = false
  }
}

function resetQuery() {
  Object.assign(queryForm, {
    applicationId: '',
    applicantIdNo: '',
    insuredIdNo: '',
    applicationStatus: '',
    productCode: '',
    submissionStartTime: '',
    submissionEndTime: '',
    pageNo: 1,
    pageSize: 10,
    sortDirection: 'DESC'
  })
  queryResults.value = []
  queryMeta.value = ''
  hasQueried.value = false
}

// ---- 帶入修改 / 審核 ----
function loadRecordToEdit(record: PolicyRecord) {
  Object.assign(editForm, {
    applicationId: record.APPLICATION_ID,
    applicantIdNo: record.APPLICANT_ID_NO || '',
    applicantName: record.APPLICANT_NAME || '',
    applicantGender: record.APPLICANT_GENDER || 'MALE',
    applicantBirthdate: record.APPLICANT_BIRTHDATE || '',
    relationshipToInsured: record.RELATIONSHIP_TO_INSURED || 'SELF',
    insuredIdNo: record.INSURED_ID_NO || '',
    insuredName: record.INSURED_NAME || '',
    insuredGender: record.INSURED_GENDER || 'MALE',
    insuredBirthdate: record.INSURED_BIRTHDATE || '',
    productCode: record.PRODUCT_CODE || '',
    sumInsured: String(record.SUM_INSURED || ''),
    annualPremium: String(record.ANNUAL_PREMIUM || ''),
    contactPhone: record.CONTACT_PHONE || ''
  })
  editLoaded.value = true
  activeTab.value = 'edit'
  notifySuccess(`已載入案件 ${record.APPLICATION_ID} 到修改區`)
}

function loadRecordToReview(record: PolicyRecord) {
  reviewForm.applicationId = record.APPLICATION_ID
  reviewForm.targetStatus = record.APPLICATION_STATUS === 'REJECTED' ? 'REJECTED' : 'APPROVED'
  reviewForm.rejectionReason = record.REJECTION_REASON || ''
  reviewForm.docIdentity = false
  reviewForm.docProposal = false
  reviewForm.docHealth = false
  reviewLoaded.value = true
  activeTab.value = 'review'
  notifySuccess(`已載入案件 ${record.APPLICATION_ID} 到審核區`)
}

function canEditRow(record: PolicyRecord): boolean {
  return canEdit.value && record.APPLICATION_STATUS === 'PENDING'
}
function canReviewRow(record: PolicyRecord): boolean {
  return canReview.value && record.APPLICATION_STATUS === 'PENDING'
}

// ---- 修改 ----
async function handleEdit() {
  if (!editLoaded.value) {
    notifyError('請先從查詢結果載入要修改的案件')
    return
  }
  const errors = validateApplication(editForm)
  if (errors.length) {
    notifyError(errors[0])
    return
  }
  submitting.value = true
  try {
    const result = await updatePolicyApplication(editForm.applicationId, buildPayload(editForm))
    notifySuccess(`修改成功，風險等級 ${result.RISK_LEVEL}`)
  } catch (error: any) {
    notifyError(error.response?.data?.MESSAGE || '修改失敗')
  } finally {
    submitting.value = false
  }
}

// ---- 審核 ----
async function handleReview() {
  if (!reviewLoaded.value) {
    notifyError('請先從查詢結果載入要審核的案件')
    return
  }
  if (reviewForm.targetStatus === 'REJECTED' && !reviewForm.rejectionReason.trim()) {
    notifyError('選擇「拒絕」時必須填寫拒絕原因')
    return
  }
  if (!areDocumentsConfirmed()) {
    notifyError('送出審核前，請先完成三項文件勾選')
    return
  }
  submitting.value = true
  try {
    const result = await reviewPolicyApplication({
      APPLICATION_ID: reviewForm.applicationId.trim(),
      TARGET_STATUS: reviewForm.targetStatus,
      REJECTION_REASON: reviewForm.rejectionReason.trim() || null,
      DOCUMENTS_CONFIRMED: areDocumentsConfirmed(),
      REVIEWED_BY: authStore.currentUser?.USERNAME ?? '',
    })
    const status = result.CURRENT_STATUS ?? reviewForm.targetStatus
    notifySuccess(reviewSuccessMessage(status))
  } catch (error: any) {
    notifyError(error.response?.data?.MESSAGE || '審核失敗')
  } finally {
    submitting.value = false
  }
}

// ---- 重複投保檢查 ----
async function runDuplicateCheck(form: ReturnType<typeof blankApplication>, currentApplicationId: string | null) {
  if (!form.applicantIdNo || !form.insuredIdNo || !form.productCode) {
    duplicateWarning.value = '請先填妥投保人、被保人與商品代碼後再檢查'
    return
  }
  try {
    const result = await queryPolicyApplications({
      APPLICANT_ID_NO: form.applicantIdNo.trim(),
      INSURED_ID_NO: form.insuredIdNo.trim(),
      PRODUCT_CODE: form.productCode,
      APPLICATION_STATUS: 'PENDING',
      PAGE_NO: 1,
      PAGE_SIZE: 10,
      SORT_DIRECTION: 'DESC'
    })
    const records = result.RECORDS || []
    const duplicates = currentApplicationId
      ? records.filter((item) => item.APPLICATION_ID !== currentApplicationId)
      : records
    duplicateWarning.value = duplicates.length
      ? `偵測到 ${duplicates.length} 筆相似 PENDING 申請，送出前請再確認`
      : '未發現相同投保人/被保人/商品的 PENDING 申請'
  } catch (error: any) {
    duplicateWarning.value = error.response?.data?.MESSAGE || '檢查失敗'
  }
}
</script>

<template>
  <section class="page-with-hero workbench-page">
    <header class="page-hero workbench-hero">
      <div class="page-hero__blobs" aria-hidden="true">
        <span class="page-hero__blob page-hero__blob--1" />
        <span class="page-hero__blob page-hero__blob--2" />
        <span class="page-hero__blob page-hero__blob--3" />
      </div>
      <div class="page-hero__inner workbench-hero__grid">
        <div class="workbench-hero__copy">
          <p class="workbench-eyebrow">Financial Life Insurance</p>
          <h2 class="page-hero__title">投保申請作業工作台</h2>
          <p class="page-hero__subtitle">
            同一頁完成新增、查詢、修改、審核，並即時呈現保費比例、風險等級、缺件提醒與重複投保預警。
          </p>
        </div>

        <q-card flat class="page-hero-card workbench-identity-card">
          <q-card-section>
            <div class="text-subtitle2 text-weight-bold q-mb-sm">目前身分</div>
            <template v-if="authStore.isAuthenticated">
              <div class="text-h6 text-weight-medium q-mb-xs">{{ displayName }}</div>
              <div class="q-gutter-xs q-mb-md">
                <q-chip
                  v-for="role in authStore.roles"
                  :key="role"
                  dense
                  size="sm"
                  color="primary"
                  text-color="white"
                >
                  {{ role }}
                </q-chip>
              </div>
              <q-btn flat no-caps color="primary" label="返回 Dashboard" to="/dashboard" icon="dashboard" />
            </template>
            <div v-else class="text-body2 text-grey-7">尚未登入，請先登入後再操作。</div>
          </q-card-section>
        </q-card>
      </div>
    </header>

    <div class="page-body workbench-body">
      <q-card flat class="page-tab-card workbench-tab-card">
        <q-tabs
          v-model="activeTab"
          align="left"
          dense
          no-caps
          active-color="primary"
          indicator-color="primary"
          class="workbench-tabs text-grey-7"
        >
          <q-tab name="create" icon="add_circle_outline" label="新增申請" />
          <q-tab name="query" icon="search" label="查詢案件" />
          <q-tab name="edit" icon="edit_note" label="修改案件" />
          <q-tab name="review" icon="fact_check" label="審核案件" />
        </q-tabs>
        <q-separator />
      </q-card>

      <div class="workbench-grid">
        <div class="workbench-main">
          <q-tab-panels v-model="activeTab" animated class="workbench-panels bg-transparent">
          <!-- 新增 -->
          <q-tab-panel name="create" class="q-pa-none">
            <q-card flat class="page-card workbench-panel">
              <q-card-section>
              <div class="page-card__header">
                <div>
                  <p class="page-card__kicker">POL_APP_CMD</p>
                  <div class="page-card__title">新增投保申請</div>
                </div>
                <q-btn outline color="primary" label="檢查重複投保" no-caps icon="warning_amber" @click="runDuplicateCheck(createForm, null)" />
              </div>

              <q-banner v-if="!canCreate" rounded class="bg-amber-1 text-brown-8 q-mt-md">
                請先以 APPLICANT 身分登入後，再建立投保申請。
              </q-banner>

              <template v-else>
                <div class="form-grid q-mt-md">
                  <q-input v-model="createForm.applicantIdNo" label="投保人身分證" outlined dense maxlength="10" />
                  <q-input v-model="createForm.applicantName" label="投保人姓名" outlined dense maxlength="50" />
                  <q-select v-model="createForm.applicantGender" label="投保人性別" outlined dense :options="genderOptions" emit-value map-options />
                  <q-input v-model="createForm.applicantBirthdate" label="投保人生日" outlined dense type="date" stack-label />
                  <q-select v-model="createForm.relationshipToInsured" label="關係" outlined dense :options="relationshipOptions" emit-value map-options />
                  <q-input v-model="createForm.insuredIdNo" label="被保人身分證" outlined dense maxlength="10" />
                  <q-input v-model="createForm.insuredName" label="被保人姓名" outlined dense maxlength="50" />
                  <q-select v-model="createForm.insuredGender" label="被保人性別" outlined dense :options="genderOptions" emit-value map-options />
                  <q-input v-model="createForm.insuredBirthdate" label="被保人生日" outlined dense type="date" stack-label />
                  <q-select
                    v-model="createForm.productCode"
                    label="商品代碼"
                    outlined
                    dense
                    use-input
                    fill-input
                    hide-selected
                    input-debounce="200"
                    :options="createProductOptions"
                    emit-value
                    map-options
                    @filter="(val, update) => filterProductOptions(val, update, 'create')"
                  >
                    <template #no-option>
                      <q-item>
                        <q-item-section class="text-grey">查無符合的商品</q-item-section>
                      </q-item>
                    </template>
                  </q-select>
                  <q-input v-model="createForm.sumInsured" label="保額" outlined dense type="number" />
                  <q-input v-model="createForm.annualPremium" label="年繳保費" outlined dense type="number" />
                  <q-input v-model="createForm.contactPhone" label="聯絡電話" outlined dense maxlength="10" />
                </div>
                <div class="q-mt-md">
                  <q-btn color="primary" unelevated label="送出新增" no-caps icon="send" :loading="submitting" @click="handleCreate" />
                </div>
              </template>
              </q-card-section>
            </q-card>
          </q-tab-panel>

          <!-- 查詢 -->
          <q-tab-panel name="query" class="q-pa-none">
            <q-card flat class="page-card workbench-panel">
              <q-card-section>
              <div class="page-card__header">
                <div>
                  <p class="page-card__kicker">POL_APP_QRY</p>
                  <div class="page-card__title">查詢投保申請</div>
                </div>
              </div>

              <q-banner v-if="!canQuery" rounded class="bg-amber-1 text-brown-8 q-mt-md">
                請先登入後再查詢案件。
              </q-banner>

              <template v-else>
                <div class="form-grid q-mt-md">
                  <q-input v-model="queryForm.applicationId" label="申請編號" outlined dense />
                  <q-input v-model="queryForm.applicantIdNo" label="投保人身分證" outlined dense />
                  <q-input v-model="queryForm.insuredIdNo" label="被保人身分證" outlined dense />
                  <q-select v-model="queryForm.applicationStatus" label="申請狀態" outlined dense :options="statusOptions" emit-value map-options />
                  <q-select
                    v-model="queryForm.productCode"
                    label="商品代碼"
                    outlined
                    dense
                    use-input
                    fill-input
                    hide-selected
                    input-debounce="200"
                    :options="queryProductOptions"
                    emit-value
                    map-options
                    @filter="(val, update) => filterProductOptions(val, update, 'query')"
                  >
                    <template #no-option>
                      <q-item>
                        <q-item-section class="text-grey">查無符合的商品</q-item-section>
                      </q-item>
                    </template>
                  </q-select>
                  <q-input v-model="queryForm.submissionStartTime" label="起始時間" outlined dense type="datetime-local" stack-label />
                  <q-input v-model="queryForm.submissionEndTime" label="結束時間" outlined dense type="datetime-local" stack-label />
                  <q-select v-model="queryForm.sortDirection" label="排序方向" outlined dense :options="sortOptions" emit-value map-options />
                  <q-input v-model.number="queryForm.pageNo" label="頁碼" outlined dense type="number" />
                  <q-input v-model.number="queryForm.pageSize" label="筆數" outlined dense type="number" />
                </div>
                <div class="q-mt-md q-gutter-sm">
                  <q-btn color="primary" unelevated label="執行查詢" no-caps icon="search" :loading="submitting" @click="handleQuery" />
                  <q-btn outline color="primary" label="清空條件" no-caps icon="refresh" @click="resetQuery" />
                </div>

                <q-table
                  class="q-mt-md workbench-table app-table"
                  flat
                  bordered
                  dense
                  :rows="queryResults"
                  :columns="columns"
                  row-key="APPLICATION_ID"
                  hide-pagination
                  :rows-per-page-options="[0]"
                  :no-data-label="hasQueried ? '查無資料' : '尚未查詢資料'"
                >
                  <template #body-cell-applicant="props">
                    <q-td :props="props">
                      {{ props.row.APPLICANT_NAME || '—' }}
                    </q-td>
                  </template>
                  <template #body-cell-insured="props">
                    <q-td :props="props">
                      {{ props.row.INSURED_NAME || '—' }}
                    </q-td>
                  </template>
                  <template #body-cell-product="props">
                    <q-td :props="props">
                      <div>{{ props.row.PRODUCT_NAME || '—' }}</div>
                      <small class="text-grey-6">{{ props.row.PRODUCT_CODE }}</small>
                    </q-td>
                  </template>
                  <template #body-cell-status="props">
                    <q-td :props="props">
                      <q-chip
                        dense
                        size="sm"
                        :color="applicationStatusColor(props.row.APPLICATION_STATUS)"
                        text-color="white"
                      >
                        {{ applicationStatusLabel(props.row.APPLICATION_STATUS) }}
                      </q-chip>
                    </q-td>
                  </template>
                  <template #body-cell-risk="props">
                    <q-td :props="props">
                      <q-chip dense size="sm" :color="riskColor(props.row.RISK_LEVEL)" text-color="white">
                        {{ props.row.RISK_LEVEL }}
                      </q-chip>
                    </q-td>
                  </template>
                  <template #body-cell-ratio="props">
                    <q-td :props="props">{{ formatRatio(props.row.PREMIUM_RATIO) }}</q-td>
                  </template>
                  <template #body-cell-history="props">
                    <q-td :props="props">
                      <q-btn
                        size="sm"
                        dense
                        flat
                        color="primary"
                        label="歷程"
                        no-caps
                        icon="history"
                        @click="openPolicyHistory(props.row)"
                      />
                    </q-td>
                  </template>
                  <template #body-cell-actions="props">
                    <q-td :props="props">
                      <div class="q-gutter-xs">
                        <q-btn v-if="canEditRow(props.row)" size="sm" dense color="primary" label="帶入修改" no-caps @click="loadRecordToEdit(props.row)" />
                        <q-btn v-if="canReviewRow(props.row)" size="sm" dense outline color="primary" label="帶入審核" no-caps @click="loadRecordToReview(props.row)" />
                        <span v-if="!canEditRow(props.row) && !canReviewRow(props.row)" class="text-grey-6">無可用操作</span>
                      </div>
                    </q-td>
                  </template>
                </q-table>
                <div class="text-caption text-grey-6 q-mt-sm">{{ queryMeta }}</div>
              </template>
              </q-card-section>
            </q-card>
          </q-tab-panel>

          <!-- 修改 -->
          <q-tab-panel name="edit" class="q-pa-none">
            <q-card flat class="page-card workbench-panel">
              <q-card-section>
              <div class="page-card__header">
                <div>
                  <p class="page-card__kicker">POL_APP_UPD</p>
                  <div class="page-card__title">修改 PENDING 案件</div>
                </div>
                <q-btn outline color="primary" label="檢查重複投保" no-caps icon="warning_amber" @click="runDuplicateCheck(editForm, editForm.applicationId)" />
              </div>

              <q-banner v-if="!canEdit" rounded class="bg-amber-1 text-brown-8 q-mt-md">此功能僅開放 APPLICANT 使用。</q-banner>
              <q-banner v-else-if="!editLoaded" rounded class="bg-amber-1 text-brown-8 q-mt-md">
                請先到查詢案件頁籤查出目標案件，再從結果點選「帶入修改」。
              </q-banner>

              <template v-else>
                <div class="form-grid q-mt-md">
                  <q-input v-model="editForm.applicantIdNo" label="投保人身分證" outlined dense maxlength="10" />
                  <q-input v-model="editForm.applicantName" label="投保人姓名" outlined dense maxlength="50" />
                  <q-select v-model="editForm.applicantGender" label="投保人性別" outlined dense :options="genderOptions" emit-value map-options />
                  <q-input v-model="editForm.applicantBirthdate" label="投保人生日" outlined dense type="date" stack-label />
                  <q-select v-model="editForm.relationshipToInsured" label="關係" outlined dense :options="relationshipOptions" emit-value map-options />
                  <q-input v-model="editForm.insuredIdNo" label="被保人身分證" outlined dense maxlength="10" />
                  <q-input v-model="editForm.insuredName" label="被保人姓名" outlined dense maxlength="50" />
                  <q-select v-model="editForm.insuredGender" label="被保人性別" outlined dense :options="genderOptions" emit-value map-options />
                  <q-input v-model="editForm.insuredBirthdate" label="被保人生日" outlined dense type="date" stack-label />
                  <q-select
                    v-model="editForm.productCode"
                    label="商品代碼"
                    outlined
                    dense
                    use-input
                    fill-input
                    hide-selected
                    input-debounce="200"
                    :options="editProductOptions"
                    emit-value
                    map-options
                    @filter="(val, update) => filterProductOptions(val, update, 'edit')"
                  >
                    <template #no-option>
                      <q-item>
                        <q-item-section class="text-grey">查無符合的商品</q-item-section>
                      </q-item>
                    </template>
                  </q-select>
                  <q-input v-model="editForm.sumInsured" label="保額" outlined dense type="number" />
                  <q-input v-model="editForm.annualPremium" label="年繳保費" outlined dense type="number" />
                  <q-input v-model="editForm.contactPhone" label="聯絡電話" outlined dense maxlength="10" />
                </div>
                <div class="q-mt-md">
                  <q-btn color="primary" unelevated label="送出修改" no-caps icon="save" :loading="submitting" @click="handleEdit" />
                </div>
              </template>
              </q-card-section>
            </q-card>
          </q-tab-panel>

          <!-- 審核 -->
          <q-tab-panel name="review" class="q-pa-none">
            <q-card flat class="page-card workbench-panel">
              <q-card-section>
              <div class="page-card__header">
                <div>
                  <p class="page-card__kicker">POL_APP_APRV</p>
                  <div class="page-card__title">審核作業</div>
                </div>
              </div>

              <q-banner v-if="!canReview" rounded class="bg-amber-1 text-brown-8 q-mt-md">此功能僅開放 REVIEWER 使用。</q-banner>
              <q-banner v-else-if="!reviewLoaded" rounded class="bg-amber-1 text-brown-8 q-mt-md">請先從查詢結果帶入待審案件。</q-banner>

              <template v-else>
                <div class="form-grid q-mt-md">
                  <q-input v-model="reviewForm.applicationId" label="申請編號" outlined dense readonly />
                  <div class="identity-tile">
                    <div class="text-caption text-grey-7">審核人員</div>
                    <div class="text-weight-bold">{{ displayName }}</div>
                  </div>
                  <q-select v-model="reviewForm.targetStatus" label="目標狀態" outlined dense :options="targetStatusOptions" emit-value map-options />
                  <q-input
                    v-model="reviewForm.rejectionReason"
                    class="full-span"
                    label="拒絕原因"
                    outlined
                    type="textarea"
                    rows="3"
                    hint="若選擇「拒絕」，請填寫原因"
                  />
                </div>

                <q-card flat bordered class="q-mt-md q-pa-md workbench-doc-card">
                  <div class="text-weight-bold q-mb-sm text-primary">文件完整性檢核</div>
                  <q-checkbox v-model="reviewForm.docIdentity" label="身分證明" />
                  <q-checkbox v-model="reviewForm.docProposal" label="要保書" />
                  <q-checkbox v-model="reviewForm.docHealth" label="健康告知" />
                </q-card>

                <div class="q-mt-md">
                  <q-btn color="primary" unelevated label="送出審核" no-caps icon="check_circle" :loading="submitting" @click="handleReview" />
                </div>
              </template>
              </q-card-section>
            </q-card>
          </q-tab-panel>
        </q-tab-panels>
        </div>

        <aside class="workbench-aside">
          <q-card flat class="page-card page-card--accent workbench-insight">
            <q-card-section>
              <div class="text-subtitle1 text-weight-bold q-mb-md text-primary">即時規則提示</div>
              <div class="hint-row"><span class="hint-label">保費比例</span><span>{{ premiumRatioHint }}</span></div>
              <div class="hint-row"><span class="hint-label">核保風險等級</span><span>{{ riskLevelHint }}</span></div>
              <div class="hint-row"><span class="hint-label">重複投保預警</span><span>{{ duplicateWarning }}</span></div>
              <div class="hint-row hint-row--last"><span class="hint-label">文件檢核</span><span>{{ documentHint }}</span></div>
            </q-card-section>
          </q-card>

          <q-card flat class="page-card page-card--accent workbench-insight">
            <q-card-section>
              <div class="text-subtitle1 text-weight-bold q-mb-md text-primary">商品參考</div>
              <q-list separator>
                <q-item v-for="p in products" :key="p.code" class="product-item">
                  <q-item-section>
                    <q-item-label class="text-weight-bold">{{ p.code }}</q-item-label>
                    <q-item-label>{{ p.name }}</q-item-label>
                    <q-item-label caption>年齡 {{ p.minInsuredAge }}-{{ p.maxInsuredAge }}，保額 {{ p.minSumInsured }}-{{ p.maxSumInsured }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>
        </aside>
      </div>
    </div>
  </section>

  <q-dialog v-model="historyDialogOpen" persistent>
    <q-card style="min-width: 720px; max-width: 95vw">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">審核歷程</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>
      <q-card-section class="text-caption text-grey-7 q-pt-none">
        申請編號：{{ historyPolicyNo }}
      </q-card-section>
      <q-card-section>
        <q-inner-loading :showing="historyLoading">
          <q-spinner size="40px" color="primary" />
        </q-inner-loading>
        <PolicyHistoryTable v-if="!historyLoading" :rows="historyRows" />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<style scoped>
.workbench-page {
  --workbench-accent: #48bb78;
  --workbench-aside-width: 240px;
}

.workbench-hero__grid {
  display: grid;
  grid-template-columns: 1.6fr 1fr;
  gap: 24px;
  align-items: end;
}

.workbench-eyebrow {
  margin: 0 0 8px;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: rgba(255, 255, 255, 0.82);
  font-size: 11px;
  font-weight: 700;
}

.workbench-body {
  max-width: 1440px;
}

.workbench-tab-card {
  margin-bottom: 16px;
  border-radius: 12px;
  overflow: hidden;
}

.workbench-tabs :deep(.q-tab) {
  min-height: 48px;
  padding: 0 20px;
  font-weight: 600;
}

.workbench-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) var(--workbench-aside-width);
  gap: 16px;
  align-items: start;
}

.workbench-main {
  min-width: 0;
}

.workbench-panels {
  background: transparent;
}

.workbench-panel {
  border-radius: 12px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.full-span {
  grid-column: 1 / -1;
}

.identity-tile {
  display: grid;
  gap: 4px;
  align-content: center;
  padding: 10px 14px;
  border-radius: 8px;
  background: #f0fff4;
  border: 1px solid #c6f6d5;
}

.workbench-aside {
  display: grid;
  gap: 12px;
  width: var(--workbench-aside-width);
  max-width: var(--workbench-aside-width);
  font-size: 0.875rem;
}

.workbench-insight {
  border-radius: 12px;
  border-top: 3px solid var(--workbench-accent);
}

.workbench-insight :deep(.q-card__section) {
  padding: 12px 14px;
}

.workbench-insight .text-subtitle1 {
  font-size: 0.95rem;
  margin-bottom: 8px;
}

.workbench-doc-card {
  background: #f7fafc;
}

.hint-row {
  display: grid;
  gap: 4px;
  padding: 8px 0;
  border-bottom: 1px solid #edf2f7;
}

.hint-row--last {
  border-bottom: none;
}

.hint-label {
  font-size: 11px;
  color: #718096;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 600;
}

.product-item {
  padding: 6px 0;
  min-height: auto;
}

.product-item :deep(.q-item__label) {
  line-height: 1.35;
}

.workbench-table :deep(thead tr) {
  background: #f0fff4;
}

.workbench-table :deep(.q-table tbody td) {
  font-size: 0.9rem;
}

.workbench-table :deep(.q-table thead th) {
  font-size: 0.85rem;
  font-weight: 700;
}

@media (max-width: 1100px) {
  .workbench-hero__grid,
  .workbench-grid,
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>