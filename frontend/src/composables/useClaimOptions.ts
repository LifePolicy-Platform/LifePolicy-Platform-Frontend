import { ref } from 'vue'
import { fetchMemberOptions, fetchPolicyOptions, fetchAgentOptions } from '@/api/claim'

export function useClaimOptions() {
  const memberOptions = ref<any[]>([])
  const policyOptions = ref<any[]>([])
  const agentOptions = ref<any[]>([])
  
  const filteredMemberOptions = ref<any[]>([])
  const filteredPolicyOptions = ref<any[]>([])

  // 撈取所有下拉選單
  async function preloadOptions() {
    try {
      const [memberRes, policyRes, agentRes] = await Promise.all([
        fetchMemberOptions(),
        fetchPolicyOptions(),
        fetchAgentOptions()
      ])
      memberOptions.value = memberRes.DATA || []
      filteredMemberOptions.value = memberRes.DATA || []
      policyOptions.value = policyRes.DATA || []
      agentOptions.value = agentRes.DATA || []
    } catch (err) {
      console.error('拉取下拉選單資料失敗', err)
    }
  }

  // 客戶選單過濾 (對齊 DTO 欄位: value, label)
  function filterMember(val: string, update: Function) {
    if (val === '') {
      update(() => { filteredMemberOptions.value = memberOptions.value })
      return
    }
    update(() => {
      const needle = val.toLowerCase()
      filteredMemberOptions.value = memberOptions.value.filter(
        v => String(v.value).includes(needle) || v.label.toLowerCase().includes(needle)
      )
    })
  }

  // 保單選單過濾 (只顯示該客戶名下保單，額外 ID 存放在 extra 欄位)
  function filterPolicy(val: string, memberId: number | null, update: Function) {
    let availablePolicies = policyOptions.value
    if (memberId) {
      availablePolicies = policyOptions.value.filter(p => p.extra === memberId)
    }

    if (val === '') {
      update(() => { filteredPolicyOptions.value = availablePolicies })
      return
    }
    update(() => {
      const needle = val.toLowerCase()
      filteredPolicyOptions.value = availablePolicies.filter(
        v => String(v.value).toLowerCase().includes(needle) || v.label.toLowerCase().includes(needle)
      )
    })
  }

  return {
    memberOptions,
    policyOptions,
    agentOptions,
    filteredMemberOptions,
    filteredPolicyOptions,
    preloadOptions,
    filterMember,
    filterPolicy
  }
}