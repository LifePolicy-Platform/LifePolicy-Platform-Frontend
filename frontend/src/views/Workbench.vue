<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch, nextTick } from 'vue'
import { useQuasar } from 'quasar'
import { useAuthStore } from '@/stores/auth'
import { useRoute, useRouter } from 'vue-router'
import type { ProductListItem1 } from '@/types/productMgmt'
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
  BUSINESS_REVIEW_OPTIONS,
  reviewSuccessMessage,
  SUPERVISOR_REVIEW_OPTIONS,
} from '@/constants/applicationStatus'
import { formatCurrency, parseCurrencyInput } from '@/utils/currency'

type ProductOption = { label: string; value: string }

const router = useRouter()
const route = useRoute()
const $q = useQuasar()
const authStore = useAuthStore()

// ---- 商品清單 ----
const products = ref<ProductListItem1[]>([])
const productsExpanded = ref(false)
const PRODUCT_PREVIEW_COUNT = 5
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

const visibleProducts = computed(() =>
  productsExpanded.value ? products.value : products.value.slice(0, PRODUCT_PREVIEW_COUNT),
)

const hasMoreProducts = computed(() => products.value.length > PRODUCT_PREVIEW_COUNT)

function goToPolicyDetail(policyNo: string) {
  if (!policyNo?.trim()) return
  router.push({ name: 'policy-mgmt-detail', params: { policyNo: policyNo.trim() } })
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
  { label: '男', value: 'MALE' },
  { label: '女', value: 'FEMALE' }
]
const statusOptions = [
  { label: '全部', value: '' },
  { label: APPLICATION_STATUS_LABEL.PENDING, value: 'PENDING' },
  { label: APPLICATION_STATUS_LABEL.APPROVED, value: 'APPROVED' },
  { label: APPLICATION_STATUS_LABEL.REJECTED, value: 'REJECTED' },
  { label: APPLICATION_STATUS_LABEL.SUBMIT, value: 'SUBMIT' },
  { label: APPLICATION_STATUS_LABEL.RETURN, value: 'RETURN' },
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

onMounted(async () => {
  loadProducts()
  if (isTabKey(route.query.tab)) activeTab.value = route.query.tab

  const prefilledPolicyNo = route.query.policyNo
  if (typeof prefilledPolicyNo === 'string' && prefilledPolicyNo.trim()) {
    activeTab.value = 'query'
    queryForm.applicationId = prefilledPolicyNo.trim()
    router.replace({ query: { tab: 'query' } })
    await nextTick()
    handleQuery({ silent: true })
  }
})

watch(activeTab, (tab) => {
  if (route.query.tab !== tab) {
    router.replace({ query: { ...route.query, tab } })
  }
})

const workflowSteps: { key: TabKey; icon: string; label: string; desc: string }[] = [
  { key: 'create', icon: 'add_circle_outline', label: '新增案件', desc: '建立投保資料' },
  { key: 'query', icon: 'search', label: '查詢案件', desc: '搜尋與檢視' },
  { key: 'edit', icon: 'edit_note', label: '修改案件', desc: '補正退回件' },
  { key: 'review', icon: 'fact_check', label: '審核案件', desc: '業務／主管審核' },
]

function goToWorkflowTab(tab: TabKey) {
  activeTab.value = tab
  nextTick(() => {
    document.querySelector('.workbench-tab-card')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  })
}

const canCreate = computed(() => authStore.isAuthenticated && authStore.roles.includes('APPLICANT'))
const canQuery = computed(() => authStore.isAuthenticated)
const canEdit = computed(() => authStore.roles.includes('APPLICANT'))
const canBusinessReview = computed(() => authStore.roles.includes('APPLICANT'))
const canSupervisorReview = computed(() => authStore.roles.includes('REVIEWER'))
const canAccessReviewTab = computed(() => canBusinessReview.value || canSupervisorReview.value)
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
  sourceStatus: '' as string,
  targetStatus: 'APPROVED',
  rejectionReason: '',
  docIdentity: false,
  docProposal: false,
  docHealth: false
})

const reviewTargetOptions = computed(() => {
  if (reviewForm.sourceStatus === 'SUBMIT') {
    return [...BUSINESS_REVIEW_OPTIONS]
  }
  if (reviewForm.sourceStatus === 'PENDING') {
    return [...SUPERVISOR_REVIEW_OPTIONS]
  }
  return []
})

const reviewStageTitle = computed(() => {
  if (reviewForm.sourceStatus === 'SUBMIT') return '業務審核'
  if (reviewForm.sourceStatus === 'PENDING') return '主管審核'
  return '審核作業'
})

const showDocumentCheck = computed(() => reviewForm.sourceStatus === 'PENDING')

const requiresRejectionReason = computed(() =>
  reviewForm.targetStatus === 'REJECTED' || reviewForm.targetStatus === 'RETURN',
)

const canPerformLoadedReview = computed(() => {
  if (reviewForm.sourceStatus === 'SUBMIT') return canBusinessReview.value
  if (reviewForm.sourceStatus === 'PENDING') return canSupervisorReview.value
  return false
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
  { name: 'applicationId', label: '保單編號', field: 'APPLICATION_ID', align: 'left' as const },
  { name: 'applicant', label: '投保人', field: 'APPLICANT_NAME', align: 'left' as const },
  { name: 'insured', label: '被保人', field: 'INSURED_NAME', align: 'left' as const },
  { name: 'product', label: '商品', field: 'PRODUCT_CODE', align: 'left' as const },
  { name: 'sumInsured', label: '保額', field: 'SUM_INSURED', align: 'right' as const },
  { name: 'annualPremium', label: '年繳保費', field: 'ANNUAL_PREMIUM', align: 'right' as const },
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
      id: log.POLICY_LOG_NO,
      time: formatAprvLogTime(log.APRV_TIME),
      status: applicationStatusLabel(log.APRV_STATUS),
      statusCode: log.APRV_STATUS,
      handler: log.DISPLAY_NAME || '—',
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
  const relationship = resolveRelationship(hintForm.value.applicantIdNo, hintForm.value.insuredIdNo)
  return evaluateRiskLevel(hintForm.value.insuredBirthdate, relationship, sumInsured, ratio)
})

const duplicateWarning = ref('尚未檢查')

const documentHint = computed(() => {
  if (!canSupervisorReview.value) {
    return areDocumentsConfirmed() ? '文件檢核完成' : '主管審核時需完成文件檢核'
  }
  return areDocumentsConfirmed() ? '文件檢核完成，可進入主管審核' : '主管審核前，請先完成三項文件勾選'
})

// ---- 工具函式 ----
function calculateAge(dateString: string): number {
  const today = new Date()
  const birthday = new Date(dateString)
  let age = today.getFullYear() - birthday.getFullYear()
  const monthDiff = today.getMonth() - birthday.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthday.getDate())) age -= 1
  return age
}

function findProduct(productCode: string): ProductListItem1 | undefined {
  return products.value.find((product) => product.code === productCode)
}

/** 依身分證是否相同推導與被保人關係（後端仍必填此欄位） */
function resolveRelationship(applicantIdNo: string, insuredIdNo: string): string {
  const applicant = applicantIdNo.trim().toUpperCase()
  const insured = insuredIdNo.trim().toUpperCase()
  return applicant && insured && applicant === insured ? 'SELF' : 'OTHER'
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

  if (form.applicantBirthdate) {
    const applicantAge = calculateAge(form.applicantBirthdate)
    if (applicantAge < 18) errors.push('投保人須年滿 18 歲')
  }

  if (!form.productCode) errors.push('請選擇商品代碼')
  if (!phonePattern.test(form.contactPhone)) errors.push('聯絡電話需為 09 開頭的 10 碼手機號碼')

  const sumInsured = Number(form.sumInsured || 0)
  const annualPremium = Number(form.annualPremium || 0)
  if (sumInsured <= 0) errors.push('保額需大於 0')
  if (annualPremium <= 0) errors.push('年繳保費需大於 0')
  if (sumInsured > 0 && annualPremium / sumInsured > 0.05) errors.push('年繳保費不可超過保額的 5%')
  if (annualPremium > 1000000) errors.push('年繳保費不可超過 100 萬')

  const product = findProduct(form.productCode)
  if (product) {
    if (form.insuredBirthdate) {
      const insuredAge = calculateAge(form.insuredBirthdate)
      if (insuredAge < product.minInsuredAge || insuredAge > product.maxInsuredAge) {
        errors.push(`被保人年齡須介於 ${product.minInsuredAge}～${product.maxInsuredAge} 歲`)
      }
    }
    if (sumInsured > 0 && (sumInsured < product.minSumInsured || sumInsured > product.maxSumInsured)) {
      errors.push(
        `保額須介於 ${product.minSumInsured.toLocaleString('zh-TW')}～${product.maxSumInsured.toLocaleString('zh-TW')}`,
      )
    }
  }

  return errors
}

function buildPayload(form: ReturnType<typeof blankApplication>) {
  const sumInsured = Number(form.sumInsured || 0)
  const annualPremium = Number(form.annualPremium || 0)
  const premiumRatio = sumInsured > 0 ? annualPremium / sumInsured : 0
  const relationshipToInsured = resolveRelationship(form.applicantIdNo, form.insuredIdNo)

  return {
    APPLICANT_ID_NO: form.applicantIdNo.trim(),
    APPLICANT_NAME: form.applicantName.trim(),
    APPLICANT_GENDER: form.applicantGender,
    APPLICANT_BIRTHDATE: form.applicantBirthdate,
    RELATIONSHIP_TO_INSURED: relationshipToInsured,
    INSURED_ID_NO: form.insuredIdNo.trim(),
    INSURED_NAME: form.insuredName.trim(),
    INSURED_GENDER: form.insuredGender,
    INSURED_BIRTHDATE: form.insuredBirthdate,
    PRODUCT_CODE: form.productCode,
    SUM_INSURED: sumInsured,
    ANNUAL_PREMIUM: annualPremium,
    CONTACT_PHONE: form.contactPhone.trim(),
    RISK_LEVEL: evaluateRiskLevel(form.insuredBirthdate, relationshipToInsured, sumInsured, premiumRatio),
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

async function handleQuery(options?: { silent?: boolean }) {
  if (!hasQueryCriteria()) {
    if (!options?.silent) {
      notifyError('查詢至少需要一個條件')
    }
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
    if (!options?.silent) {
      notifySuccess(`查詢完成，共 ${result.TOTAL_COUNT} 筆`)
    }
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
  if (!canReviewRow(record)) {
    notifyError('您沒有權限審核此狀態的案件')
    return
  }
  reviewForm.applicationId = record.APPLICATION_ID
  reviewForm.sourceStatus = record.APPLICATION_STATUS || ''
  if (record.APPLICATION_STATUS === 'SUBMIT') {
    reviewForm.targetStatus = 'PENDING'
  } else if (record.APPLICATION_STATUS === 'PENDING') {
    reviewForm.targetStatus = 'APPROVED'
  } else {
    reviewForm.targetStatus = 'APPROVED'
  }
  reviewForm.rejectionReason = record.REJECTION_REASON || ''
  reviewForm.docIdentity = false
  reviewForm.docProposal = false
  reviewForm.docHealth = false
  reviewLoaded.value = true
  activeTab.value = 'review'
  notifySuccess(`已載入案件 ${record.APPLICATION_ID} 到審核區`)
}

function canEditRow(record: PolicyRecord): boolean {
  return canEdit.value && record.APPLICATION_STATUS === 'RETURN'
}
function canReviewRow(record: PolicyRecord): boolean {
  const status = record.APPLICATION_STATUS
  if (status === 'SUBMIT') return canBusinessReview.value
  if (status === 'PENDING') return canSupervisorReview.value
  return false
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
    notifySuccess(`修改成功，已重新送審（SUBMIT），風險等級 ${result.RISK_LEVEL}`)
  } catch (error: any) {
    notifyError(error.response?.data?.MESSAGE || '修改失敗')
  } finally {
    submitting.value = false
  }
}

// ---- 審核 ----
function resetReviewForm() {
  reviewForm.applicationId = ''
  reviewForm.sourceStatus = ''
  reviewForm.targetStatus = 'APPROVED'
  reviewForm.rejectionReason = ''
  reviewForm.docIdentity = false
  reviewForm.docProposal = false
  reviewForm.docHealth = false
  reviewLoaded.value = false
}

async function handleReview() {
  if (!reviewLoaded.value) {
    notifyError('請先從查詢結果載入要審核的案件')
    return
  }
  if (!canPerformLoadedReview.value) {
    notifyError('您沒有權限審核此狀態的案件')
    return
  }
  if (requiresRejectionReason.value && !reviewForm.rejectionReason.trim()) {
    notifyError(reviewForm.targetStatus === 'RETURN' ? '業務退件時必須填寫原因' : '主管駁回時必須填寫原因')
    return
  }
  if (showDocumentCheck.value && !areDocumentsConfirmed()) {
    notifyError('主管審核前，請先完成三項文件勾選')
    return
  }
  submitting.value = true
  try {
    const result = await reviewPolicyApplication({
      APPLICATION_ID: reviewForm.applicationId.trim(),
      TARGET_STATUS: reviewForm.targetStatus,
      REJECTION_REASON: reviewForm.rejectionReason.trim() || null,
      DOCUMENTS_CONFIRMED: showDocumentCheck.value ? areDocumentsConfirmed() : true,
      REVIEWED_BY: authStore.currentUser?.USERNAME ?? '',
    })
    const status = result.CURRENT_STATUS ?? reviewForm.targetStatus
    const successMsg = reviewSuccessMessage(status)
    resetReviewForm()
    activeTab.value = 'query'
    await nextTick()
    if (hasQueried.value) {
      await handleQuery({ silent: true })
    }
    notifySuccess(successMsg)
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
      PAGE_NO: 1,
      PAGE_SIZE: 20,
      SORT_DIRECTION: 'DESC'
    })
    const activeStatuses = new Set(['SUBMIT', 'PENDING', 'RETURN'])
    const records = (result.RECORDS || []).filter((item) => activeStatuses.has(item.APPLICATION_STATUS || ''))
    const duplicates = currentApplicationId
      ? records.filter((item) => item.APPLICATION_ID !== currentApplicationId)
      : records
    duplicateWarning.value = duplicates.length
      ? `偵測到 ${duplicates.length} 筆進行中申請（送件/待審/退回），送出前請再確認`
      : '未發現重複投保風險，可進行投保申請'
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
      <div class="page-hero__inner workbench-hero__inner">
        <div class="workbench-hero__copy">
          <h2 class="page-hero__title">保單管理</h2>
          <p class="page-hero__subtitle workbench-hero__subtitle">新增申請、查詢案件、修改退回與審核保單</p>
        </div>

        <nav class="workbench-workflow" aria-label="作業流程">
          <button
            v-for="step in workflowSteps"
            :key="step.key"
            type="button"
            class="workbench-workflow__step"
            :class="{ 'workbench-workflow__step--active': activeTab === step.key }"
            @click="goToWorkflowTab(step.key)"
          >
            <span class="workbench-workflow__icon" aria-hidden="true">
              <q-icon :name="step.icon" size="20px" />
            </span>
            <span class="workbench-workflow__text">
              <span class="workbench-workflow__label">{{ step.label }}</span>
              <span class="workbench-workflow__desc">{{ step.desc }}</span>
            </span>
          </button>
        </nav>
      </div>
    </header>

    <div class="page-body workbench-body">
      <!-- <q-card flat class="page-tab-card workbench-tab-card">
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
      </q-card> -->
      <div class="workbench-grid" :class="{ 'workbench-grid--no-aside': activeTab !== 'create' }">
        <div class="workbench-main">
          <q-tab-panels v-model="activeTab" animated class="workbench-panels bg-transparent">
          <!-- 新增 -->
          <q-tab-panel name="create" class="q-pa-none">
            <q-card flat class="page-card workbench-panel">
              <q-card-section>
              <div class="page-card__header">
                <div>
                  <p class="page-card__kicker">New policy application</p>
                  <p style="color: red; margin-bottom: 5px;">* 所有欄位皆為必填 </p>
                  <div class="page-card__title">新增投保案件</div>
                </div>
                <q-btn outline color="primary" label="檢查重複投保" no-caps icon="warning_amber" @click="runDuplicateCheck(createForm, null)" />
              </div>

              <q-banner v-if="!canCreate" rounded class="bg-amber-1 text-brown-8 q-mt-md">
                請先以 APPLICANT 身分登入後，再建立投保申請。
              </q-banner>

              <template v-else>
                <div class="form-grid q-mt-md">
                  <q-input v-model="createForm.applicantName" label="投保人姓名" outlined dense maxlength="50" />
                  <q-input v-model="createForm.applicantIdNo" label="投保人身分證" outlined dense maxlength="10" />
                  <q-select v-model="createForm.applicantGender" label="投保人性別" outlined dense :options="genderOptions" emit-value map-options />
                  <q-input v-model="createForm.applicantBirthdate" label="投保人生日" outlined dense type="date" stack-label />
                  <q-input v-model="createForm.insuredName" label="被保人姓名" outlined dense maxlength="50" />
                  <q-input v-model="createForm.insuredIdNo" label="被保人身分證" outlined dense maxlength="10" />
                  <q-select v-model="createForm.insuredGender" label="被保人性別" outlined dense :options="genderOptions" emit-value map-options />
                  <q-input v-model="createForm.insuredBirthdate" label="被保人生日" outlined dense type="date" stack-label />
                  <q-input v-model="createForm.contactPhone" label="聯絡電話" outlined dense maxlength="10" />
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
                  <q-input
                    :model-value="formatCurrency(createForm.sumInsured, '')"
                    label="保額"
                    outlined
                    dense
                    stack-label
                    inputmode="numeric"
                    @update:model-value="createForm.sumInsured = parseCurrencyInput($event)"
                  />
                  <q-input
                    :model-value="formatCurrency(createForm.annualPremium, '')"
                    label="年繳保費"
                    outlined
                    dense
                    stack-label
                    inputmode="numeric"
                    @update:model-value="createForm.annualPremium = parseCurrencyInput($event)"
                  />
                </div>
                <div class="q-mt-md">
                  <q-btn color="primary" unelevated label="送出新增" no-caps :loading="submitting" @click="handleCreate" />
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
                  <p class="page-card__kicker">Search Policy Cases</p>
                  <div class="page-card__title">查詢保單案件</div>
                </div>
              </div>

              <q-banner v-if="!canQuery" rounded class="bg-amber-1 text-brown-8 q-mt-md">
                請先登入後再查詢案件。
              </q-banner>

              <template v-else>
                <div class="form-grid q-mt-md">
                  <q-input v-model="queryForm.applicationId" label="申請編號" outlined dense />
                  <q-input v-model="queryForm.applicantIdNo" label="投保人身分證" outlined dense />
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
                  <q-input v-model="queryForm.insuredIdNo" label="被保人身分證" outlined dense />
                  <q-select v-model="queryForm.applicationStatus" label="申請狀態" outlined dense :options="statusOptions" emit-value map-options />
                  <q-select v-model="queryForm.sortDirection" label="排序方向" outlined dense :options="sortOptions" emit-value map-options />
                  <q-input v-model="queryForm.submissionStartTime" label="起始時間" outlined dense type="datetime-local" stack-label />
                  <q-input v-model="queryForm.submissionEndTime" label="結束時間" outlined dense type="datetime-local" stack-label />
                  <q-input v-model.number="queryForm.pageNo" label="頁碼" outlined dense type="number" />
                  <q-input v-model.number="queryForm.pageSize" label="筆數" outlined dense type="number" />
                </div>
                <div class="q-mt-md row items-center wrap q-gutter-sm">
                  <q-btn color="primary" unelevated label="執行查詢" no-caps icon="search" :loading="submitting" @click="handleQuery" />
                  <q-btn outline color="primary" label="清空條件" no-caps icon="refresh" @click="resetQuery" />
                  <span class="workbench-query-hint text-caption text-grey-7">
                    <q-icon name="info_outline" size="16px" class="q-mr-xs" />
                    點擊保單編號可查看詳細資料 / 安排約訪
                  </span>
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
                  <template #body-cell-applicationId="props">
                    <q-td :props="props">
                      <button
                        type="button"
                        class="workbench-policy-link"
                        @click="goToPolicyDetail(props.row.APPLICATION_ID)"
                      >
                        {{ props.row.APPLICATION_ID }}
                      </button>
                    </q-td>
                  </template>
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
                  <template #body-cell-sumInsured="props">
                    <q-td :props="props" class="text-right">
                      <span class="workbench-amount">{{ formatCurrency(props.row.SUM_INSURED) }}</span>
                    </q-td>
                  </template>
                  <template #body-cell-annualPremium="props">
                    <q-td :props="props" class="text-right">
                      <span class="workbench-amount">{{ formatCurrency(props.row.ANNUAL_PREMIUM) }}</span>
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
                  <p class="page-card__kicker">Revise Returned Cases</p>
                  <div class="page-card__title">修改退回案件</div>
                </div>
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
                  <q-input
                    :model-value="formatCurrency(editForm.sumInsured, '')"
                    label="保額"
                    outlined
                    dense
                    stack-label
                    inputmode="numeric"
                    @update:model-value="editForm.sumInsured = parseCurrencyInput($event)"
                  />
                  <q-input
                    :model-value="formatCurrency(editForm.annualPremium, '')"
                    label="年繳保費"
                    outlined
                    dense
                    stack-label
                    inputmode="numeric"
                    @update:model-value="editForm.annualPremium = parseCurrencyInput($event)"
                  />
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
                  <p class="page-card__kicker">Review Policy Cases</p>
                  <div class="page-card__title">{{ reviewStageTitle }}</div>
                </div>
              </div>

              <q-banner v-if="!canAccessReviewTab" rounded class="bg-amber-1 text-brown-8 q-mt-md">
                此功能僅開放 APPLICANT（業務審核）或 REVIEWER（主管審核）使用。
              </q-banner>
              <q-banner v-else-if="!reviewLoaded" rounded class="bg-amber-1 text-brown-8 q-mt-md">
                請先從查詢結果帶入待審案件：業務審核 、主管審核。
              </q-banner>
              <q-banner v-else-if="!canPerformLoadedReview" rounded class="bg-amber-1 text-brown-8 q-mt-md">
                您沒有權限審核此狀態的案件，請重新從查詢結果帶入。
              </q-banner>

              <template v-else>
                <q-banner rounded class="bg-blue-1 text-blue-9 q-mt-md">
                  目前狀態：{{ applicationStatusLabel(reviewForm.sourceStatus) }}
                </q-banner>
                <div class="form-grid q-mt-md">
                  <q-input v-model="reviewForm.applicationId" label="保單編號" outlined dense readonly />
                  <div class="identity-tile">
                    <div class="text-caption text-grey-7">審核人員</div>
                    <div class="text-weight-bold">{{ displayName }}</div>
                  </div>
                  <q-select
                    v-model="reviewForm.targetStatus"
                    label="審核結果"
                    outlined
                    dense
                    :options="reviewTargetOptions"
                    emit-value
                    map-options
                  />
                  <q-input
                    v-if="requiresRejectionReason"
                    v-model="reviewForm.rejectionReason"
                    class="full-span"
                    :label="reviewForm.targetStatus === 'RETURN' ? '退件原因' : '駁回原因'"
                    outlined
                    type="textarea"
                    rows="3"
                    :hint="reviewForm.targetStatus === 'RETURN' ? '業務退件時請填寫原因' : '主管駁回時請填寫原因'"
                  />
                </div>

                <q-card v-if="showDocumentCheck" flat bordered class="q-mt-md q-pa-md workbench-doc-card">
                  <div class="text-weight-bold q-mb-sm text-primary">文件完整性檢核（主管審核）</div>
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

        <aside v-if="activeTab === 'create'" class="workbench-aside">
          <q-card flat class="page-card page-card--accent workbench-insight workbench-insight--rules">
            <q-card-section>
              <div class="text-subtitle1 text-weight-bold q-mb-md workbench-insight__title">即時規則提示</div>
              <div class="hint-row"><span class="hint-label">保費比例</span><span>{{ premiumRatioHint }}</span></div>
              <div class="hint-row"><span class="hint-label">核保風險等級</span><span>{{ riskLevelHint }}</span></div>
              <div class="hint-row"><span class="hint-label">重複投保預警</span><span>{{ duplicateWarning }}</span></div>
              <div class="hint-row hint-row--last"><span class="hint-label">文件檢核</span><span>{{ documentHint }}</span></div>
            </q-card-section>
          </q-card>

          <q-card flat class="page-card page-card--accent workbench-insight workbench-insight--products">
            <q-card-section>
              <div class="row items-center no-wrap q-mb-md">
                <div class="text-subtitle1 text-weight-bold workbench-insight__title col">商品參考</div>
                <q-btn
                  v-if="hasMoreProducts"
                  flat
                  dense
                  round
                  color="primary"
                  :icon="productsExpanded ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
                  :aria-label="productsExpanded ? '收合商品列表' : '展開全部商品'"
                  @click="productsExpanded = !productsExpanded"
                />
              </div>
              <q-list separator class="workbench-product-list">
                <q-item v-for="p in visibleProducts" :key="p.code" class="product-item">
                  <q-item-section>
                    <q-item-label class="text-weight-bold">{{ p.code }}</q-item-label>
                    <q-item-label>{{ p.name }}</q-item-label>
                    <q-item-label caption>年齡 {{ p.minInsuredAge }}-{{ p.maxInsuredAge }}</q-item-label>
                    <q-item-label caption>
                      保額 {{ formatCurrency(p.minSumInsured) }} ~ {{ formatCurrency(p.maxSumInsured) }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
              <div
                v-if="hasMoreProducts && !productsExpanded"
                class="workbench-product-more text-caption text-grey-6 text-center q-pt-sm"
              >
                另有 {{ products.length - PRODUCT_PREVIEW_COUNT }} 項商品，點擊箭頭展開
              </div>
            </q-card-section>
          </q-card>
        </aside>
      </div>
    </div>
  </section>

  <q-dialog v-model="historyDialogOpen" no-backdrop-dismiss>
    <q-card class="history-dialog-card">
      <q-card-section class="history-dialog-card__header row items-start no-wrap q-pb-sm">
        <q-avatar rounded color="primary" text-color="white" icon="history" size="40px" class="q-mr-md" />
        <div class="col">
          <div class="text-h6 text-weight-bold text-grey-9">審核歷程</div>
          <div class="text-caption text-grey-7 q-mt-xs">
            申請編號
            <q-badge outline color="grey-6" class="q-ml-xs history-dialog-card__policy-no">
              {{ historyPolicyNo }}
            </q-badge>
          </div>
        </div>
        <q-btn icon="close" flat round dense color="grey-7" v-close-popup />
      </q-card-section>

      <q-separator />

      <q-card-section class="relative-position history-dialog-body">
        <PolicyHistoryTable :rows="historyRows" />
        <q-inner-loading :showing="historyLoading" color="primary" />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<style scoped>
.workbench-page {
  --wb-primary: #48bb78;
  --wb-primary-light: #68d391;
  --wb-primary-pale: #f0fff4;
  --wb-primary-dark: #38a169;
  --wb-primary-deep: #2f855a;
  --wb-ink: #1a202c;
  --wb-muted: #64748b;
  --wb-surface: #ffffff;
  --wb-surface-muted: #f7faf9;
  --wb-border: #d8e8de;
  --wb-accent-blue: #3182ce;
  --wb-accent-blue-deep: #2c5282;
  --wb-aside-width: 260px;
  background: linear-gradient(180deg, #f4fbf7 0%, #f8fafc 120px);
}

.workbench-hero__inner {
  display: flex;
  flex-direction: column;
  gap: 28px;
  max-width: 1120px;
}

.workbench-hero__copy {
  max-width: 640px;
}

.workbench-hero__subtitle {
  max-width: 52ch;
  line-height: 1.55;
}

.workbench-eyebrow {
  margin: 0 0 10px;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: rgba(255, 255, 255, 0.78);
  font-size: 0.6875rem;
  font-weight: 700;
}

.workbench-workflow {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.workbench-workflow__step {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 14px;
  border: 1px solid rgba(255, 255, 255, 0.28);
  border-radius: 12px;
  background: rgba(72, 187, 120, 0.14);
  backdrop-filter: blur(8px);
  color: #fff;
  text-align: left;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease, transform 0.15s ease;
}

.workbench-workflow__step:hover {
  background: rgba(72, 187, 120, 0.24);
  border-color: rgba(255, 255, 255, 0.45);
  transform: translateY(-1px);
}

.workbench-workflow__step--active {
  background: rgba(255, 255, 255, 0.96);
  border-color: var(--wb-primary);
  color: var(--wb-ink);
  box-shadow: 0 8px 24px rgba(47, 133, 90, 0.22);
}

.workbench-workflow__step--active .workbench-workflow__icon {
  background: linear-gradient(135deg, var(--wb-primary) 0%, var(--wb-primary-dark) 100%);
  color: #fff;
}

.workbench-workflow__step--active .workbench-workflow__desc {
  color: var(--wb-muted);
}

.workbench-workflow__icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.18);
}

.workbench-workflow__step:not(.workbench-workflow__step--active) .workbench-workflow__icon {
  background: rgba(44, 82, 130, 0.35);
}

.workbench-workflow__text {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.workbench-workflow__label {
  font-size: 0.875rem;
  font-weight: 700;
  line-height: 1.3;
}

.workbench-workflow__desc {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.72);
  line-height: 1.3;
}

.workbench-body {
  max-width: 1440px;
}

.workbench-tab-card {
  margin-bottom: 16px;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid var(--wb-border);
  border-top: 3px solid var(--wb-primary);
  box-shadow: 0 4px 16px rgba(72, 187, 120, 0.1);
  background: var(--wb-surface);
}

.workbench-tabs :deep(.q-tab) {
  min-height: 50px;
  padding: 0 22px;
  font-weight: 600;
  color: var(--wb-muted);
}

.workbench-tabs :deep(.q-tab--active) {
  color: var(--wb-primary-dark);
}

.workbench-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) var(--wb-aside-width);
  gap: 18px;
  align-items: start;
}

.workbench-grid--no-aside {
  grid-template-columns: minmax(0, 1fr);
}

.workbench-main {
  min-width: 0;
}

.workbench-panels {
  background: transparent;
}

.workbench-panel {
  border-radius: 14px;
  border: 1px solid var(--wb-border);
  box-shadow: 0 2px 10px rgba(72, 187, 120, 0.06);
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
  border-radius: 10px;
  background: var(--wb-primary-pale);
  border: 1px solid #c6f6d5;
}

.workbench-aside {
  display: grid;
  gap: 14px;
  width: var(--wb-aside-width);
  max-width: var(--wb-aside-width);
  font-size: 0.875rem;
}

.workbench-insight {
  border-radius: 14px;
  border: 1px solid var(--wb-border);
  background: var(--wb-surface);
  box-shadow: 0 2px 8px rgba(72, 187, 120, 0.06);
}

.workbench-insight--rules {
  border-left: 4px solid var(--wb-primary);
  background: linear-gradient(135deg, #ffffff 0%, var(--wb-primary-pale) 100%);
}

.workbench-insight--products {
  border-left: 4px solid var(--wb-accent-blue);
  background: linear-gradient(135deg, #ffffff 0%, #f0f7ff 100%);
}

.workbench-insight :deep(.q-card__section) {
  padding: 14px 16px;
}

.workbench-insight .text-subtitle1,
.workbench-insight__title {
  font-size: 0.9375rem;
  margin-bottom: 8px;
  color: var(--wb-ink);
}

.workbench-doc-card {
  background: var(--wb-primary-pale);
  border-color: #c6f6d5;
}

.hint-row {
  display: grid;
  gap: 4px;
  padding: 9px 0;
  border-bottom: 1px solid var(--wb-border);
}

.hint-row--last {
  border-bottom: none;
}

.hint-label {
  font-size: 0.6875rem;
  color: var(--wb-muted);
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
  background: var(--wb-primary-pale);
}

.workbench-table :deep(.q-table tbody td) {
  font-size: 0.9rem;
}

.workbench-table :deep(.q-table thead th) {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--wb-ink);
}

.history-dialog-body {
  min-height: 160px;
  padding: 16px 20px 20px;
  background: var(--wb-surface-muted);
}

.history-dialog-card {
  min-width: 680px;
  max-width: 95vw;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--wb-border);
  box-shadow: 0 12px 40px rgba(15, 23, 42, 0.12);
}

.history-dialog-card__header {
  padding: 18px 20px 14px;
  background: linear-gradient(180deg, #ffffff 0%, var(--wb-surface-muted) 100%);
}

.history-dialog-card__policy-no {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.75rem;
  letter-spacing: 0.02em;
}

.workbench-query-hint {
  display: inline-flex;
  align-items: center;
  margin-left: 4px;
}

.workbench-policy-link {
  padding: 0;
  border: none;
  background: none;
  color: var(--wb-primary-dark);
  font-weight: 600;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.8125rem;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.workbench-policy-link:hover {
  color: #276749;
}

.workbench-product-list {
  max-height: 420px;
  overflow-y: auto;
}

.workbench-product-more {
  border-top: 1px dashed var(--wb-border);
}

.workbench-amount {
  font-variant-numeric: tabular-nums;
  font-weight: 600;
}

@media (max-width: 1100px) {
  .workbench-workflow {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .workbench-grid,
  .form-grid {
    grid-template-columns: 1fr;
  }

  .workbench-aside {
    width: 100%;
    max-width: none;
  }
}

@media (max-width: 600px) {
  .workbench-workflow {
    grid-template-columns: 1fr;
  }
}
</style>