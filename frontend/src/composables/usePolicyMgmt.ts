import { computed, ref } from 'vue'
import type {
  PolicyCreateForm,
  PolicyDetail,
  PolicyHistoryItem,
  PolicyListItem,
  PolicyReviewItem,
  PolicySearchFilter,
  PolicyVisitForm,
} from '@/types/policyMgmt'

const MOCK_POLICIES: PolicyListItem[] = [
  {
    policyNo: 'POL-2026-001',
    productName: '安心終身壽險',
    applicantName: '王小明',
    policyStatus: 'active',
    annualPremium: 48000,
    agentName: '陳業務',
    effectiveDate: '2026-01-15',
  },
  {
    policyNo: 'POL-2026-002',
    productName: '健康醫療險',
    applicantName: '林美玲',
    policyStatus: 'pending_review',
    annualPremium: 32000,
    agentName: '張業務',
    effectiveDate: '2026-03-01',
  },
  {
    policyNo: 'POL-2026-003',
    productName: '旅平險一年期',
    applicantName: '黃志豪',
    policyStatus: 'pending_docs',
    annualPremium: 5600,
    agentName: '陳業務',
    effectiveDate: '2026-02-20',
  },
]

const MOCK_DETAILS: Record<string, PolicyDetail> = {
  'POL-2026-001': {
    policyNo: 'POL-2026-001',
    productName: '安心終身壽險',
    policyStatus: 'active',
    applicantName: '王小明',
    applicantGender: '男',
    applicantBirthday: '1985-06-12',
    contactPhone: '0912-345-678',
    relationship: '本人',
    insuredIdNo: 'A123456789',
    insuredName: '王小明',
    insuredGender: '男',
    insuredBirthday: '1985-06-12',
    sumInsured: 3000000,
    annualPremium: 48000,
    effectiveDate: '2026-01-15',
    expiryDate: '終身',
    agentName: '陳業務',
    riskLevel: '標準',
    remark: '',
    createdAt: '2026-01-10 09:30',
  },
  'POL-2026-002': {
    policyNo: 'POL-2026-002',
    productName: '健康醫療險',
    policyStatus: 'pending_review',
    applicantName: '林美玲',
    applicantGender: '女',
    applicantBirthday: '1990-03-22',
    contactPhone: '0922-111-222',
    relationship: '本人',
    insuredIdNo: 'B234567890',
    insuredName: '林美玲',
    insuredGender: '女',
    insuredBirthday: '1990-03-22',
    sumInsured: 1000000,
    annualPremium: 32000,
    effectiveDate: '2026-03-01',
    expiryDate: '2027-02-28',
    agentName: '張業務',
    riskLevel: '標準',
    remark: '等待核保審核',
    createdAt: '2026-02-18 14:20',
  },
  'POL-2026-003': {
    policyNo: 'POL-2026-003',
    productName: '旅平險一年期',
    policyStatus: 'pending_docs',
    applicantName: '黃志豪',
    applicantGender: '男',
    applicantBirthday: '1978-11-05',
    contactPhone: '0933-888-999',
    relationship: '本人',
    insuredIdNo: 'C345678901',
    insuredName: '黃志豪',
    insuredGender: '男',
    insuredBirthday: '1978-11-05',
    sumInsured: 500000,
    annualPremium: 5600,
    effectiveDate: '2026-02-20',
    expiryDate: '2027-02-19',
    agentName: '陳業務',
    riskLevel: '標準',
    remark: '缺健檢報告',
    createdAt: '2026-02-15 11:00',
  },
}

const MOCK_HISTORY: Record<string, PolicyHistoryItem[]> = {
  'POL-2026-001': [
    {
      time: '2026-01-15 10:00',
      eventName: '承保生效',
      status: '已承保',
      handler: '系統',
      reason: '',
      remark: '保單正式生效',
    },
    {
      time: '2026-01-12 15:30',
      eventName: '核保通過',
      status: '核保通過',
      handler: '核保部',
      reason: '',
      remark: '',
    },
    {
      time: '2026-01-10 09:30',
      eventName: '新件受理',
      status: '受理中',
      handler: '陳業務',
      reason: '',
      remark: '客戶親自到櫃',
    },
  ],
  'POL-2026-002': [
    {
      time: '2026-02-18 14:20',
      eventName: '送審',
      status: '審核中',
      handler: '張業務',
      reason: '',
      remark: '等待核保審核',
    },
  ],
  'POL-2026-003': [
    {
      time: '2026-02-16 09:00',
      eventName: '補件通知',
      status: '待補件',
      handler: '核保部',
      reason: '缺健檢報告',
      remark: '已通知業務員',
    },
    {
      time: '2026-02-15 11:00',
      eventName: '新件受理',
      status: '受理中',
      handler: '陳業務',
      reason: '',
      remark: '',
    },
  ],
}

const MOCK_REVIEW: PolicyReviewItem[] = [
  {
    policyNo: 'POL-2026-002',
    productName: '健康醫療險',
    applicantName: '林美玲',
    appliedAt: '2026-02-18',
    policyStatus: 'pending_review',
    agentName: '張業務',
  },
  {
    policyNo: 'POL-2026-004',
    productName: '意外傷害險',
    applicantName: '吳佳穎',
    appliedAt: '2026-02-20',
    policyStatus: 'pending_review',
    agentName: '陳業務',
  },
]

function emptyFilter(): PolicySearchFilter {
  return {
    policyNo: '',
    applicantName: '',
    policyStatus: '',
    effectiveDateFrom: '',
    effectiveDateTo: '',
  }
}

function emptyCreateForm(): PolicyCreateForm {
  return {
    productCode: '',
    sumInsured: null,
    annualPremium: null,
    effectiveDate: '',
    applicantName: '',
    applicantGender: '',
    applicantBirthday: '',
    contactPhone: '',
    relationship: '',
    insuredIdNo: '',
    insuredName: '',
    insuredGender: '',
    insuredBirthday: '',
    remark: '',
  }
}

function emptyVisitForm(): PolicyVisitForm {
  return {
    visitDate: '',
    visitTime: '',
    remark: '',
  }
}

export function usePolicyMgmt() {
  const filter = ref<PolicySearchFilter>(emptyFilter())
  const list = ref<PolicyListItem[]>([])
  const isSearching = ref(false)
  const hasSearched = ref(false)

  const detail = ref<PolicyDetail | null>(null)
  const history = ref<PolicyHistoryItem[]>([])
  const isDetailLoading = ref(false)

  const createForm = ref<PolicyCreateForm>(emptyCreateForm())
  const isCreating = ref(false)
  const createMessage = ref('')

  const reviewList = ref<PolicyReviewItem[]>([])
  const isReviewLoading = ref(false)

  const visitForm = ref<PolicyVisitForm>(emptyVisitForm())
  const visitPolicyNo = ref('')
  const isVisitSaving = ref(false)
  const visitMessage = ref('')

  function searchPolicies() {
    isSearching.value = true
    hasSearched.value = true
    setTimeout(() => {
      list.value = MOCK_POLICIES.filter((row) => {
        if (filter.value.policyNo && !row.policyNo.includes(filter.value.policyNo)) return false
        if (filter.value.applicantName && !row.applicantName.includes(filter.value.applicantName)) {
          return false
        }
        if (filter.value.policyStatus && row.policyStatus !== filter.value.policyStatus) return false
        if (filter.value.effectiveDateFrom && row.effectiveDate < filter.value.effectiveDateFrom) {
          return false
        }
        if (filter.value.effectiveDateTo && row.effectiveDate > filter.value.effectiveDateTo) {
          return false
        }
        return true
      })
      isSearching.value = false
    }, 300)
  }

  function resetFilter() {
    filter.value = emptyFilter()
    list.value = []
    hasSearched.value = false
  }

  function loadDetail(policyNo: string) {
    isDetailLoading.value = true
    detail.value = null
    history.value = []
    setTimeout(() => {
      detail.value = MOCK_DETAILS[policyNo] ?? null
      history.value = MOCK_HISTORY[policyNo] ?? []
      isDetailLoading.value = false
    }, 200)
  }

  function loadReviewList() {
    isReviewLoading.value = true
    setTimeout(() => {
      reviewList.value = [...MOCK_REVIEW]
      isReviewLoading.value = false
    }, 300)
  }

  function submitCreate() {
    isCreating.value = true
    createMessage.value = ''
    setTimeout(() => {
      isCreating.value = false
      createMessage.value = '保單已送出（模擬），待後端 API 串接'
      createForm.value = emptyCreateForm()
    }, 400)
  }

  function openVisit(policyNo: string) {
    visitPolicyNo.value = policyNo
    visitForm.value = emptyVisitForm()
    visitMessage.value = ''
  }

  function submitVisit(agentName: string) {
    isVisitSaving.value = true
    visitMessage.value = ''
    setTimeout(() => {
      isVisitSaving.value = false
      visitMessage.value = `已安排約訪（模擬），承辦業務：${agentName}`
    }, 400)
  }

  const pendingReviewCount = computed(() => MOCK_REVIEW.length)

  return {
    filter,
    list,
    isSearching,
    hasSearched,
    detail,
    history,
    isDetailLoading,
    createForm,
    isCreating,
    createMessage,
    reviewList,
    isReviewLoading,
    visitForm,
    visitPolicyNo,
    isVisitSaving,
    visitMessage,
    pendingReviewCount,
    searchPolicies,
    resetFilter,
    loadDetail,
    loadReviewList,
    submitCreate,
    openVisit,
    submitVisit,
  }
}
