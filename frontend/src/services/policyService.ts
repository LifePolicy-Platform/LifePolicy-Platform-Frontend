import type { PolicySummary } from '../types/policy'

const policyDatabase: PolicySummary[] = [
  {
    policyNo: 'PL-2024-0001',
    productName: '安心醫療住院日額險',
    policyStatus: 'active',
    applicantName: '王小明',
    insuredName: '王小明',
    effectiveDate: '2024-01-15',
    premium: 18500,
    currency: 'TWD',
  },
  {
    policyNo: 'PL-2024-0002',
    productName: '樂活終身壽險',
    policyStatus: 'pending',
    applicantName: '陳怡婷',
    insuredName: '陳怡婷',
    effectiveDate: '2024-03-01',
    premium: 32000,
    currency: 'TWD',
  },
  {
    policyNo: 'PL-2023-0098',
    productName: '海外旅平險',
    policyStatus: 'expired',
    applicantName: '林志豪',
    insuredName: '林志豪',
    effectiveDate: '2023-08-20',
    premium: 120,
    currency: 'USD',
  },
]

function normalizePolicyNo(policyNo: string) {
  return policyNo.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
}

export async function searchPolicies(keyword: string): Promise<PolicySummary[]> {
  // 用 Promise + timeout 模擬 API 延遲，方便展示 loading 狀態切換。
  await new Promise((resolve) => window.setTimeout(resolve, 900))

  const normalizedKeyword = normalizePolicyNo(keyword)

  if (normalizedKeyword === 'ERROR500') {
    throw new Error('查詢服務暫時無法使用，請稍後再試。')
  }

  return policyDatabase.filter((policy) =>
    normalizePolicyNo(policy.policyNo).includes(normalizedKeyword),
  )
}