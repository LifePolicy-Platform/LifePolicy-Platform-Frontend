<script setup lang="ts">
import type { PolicySummary } from '../../types/policy'

defineProps<{
  loading: boolean
  errorMessage: string
  hasSearched: boolean
  results: PolicySummary[]
  resultCountText: string
}>()

function statusLabel(status: PolicySummary['policyStatus']) {
  const labels = {
    active: '生效中',
    pending: '審核中',
    expired: '已失效',
  }

  return labels[status]
}

function premiumLabel(policy: PolicySummary) {
  return new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: policy.currency,
    maximumFractionDigits: 0,
  }).format(policy.premium)
}
</script>

<template>
  <section class="card">
    <header class="card-heading">
      <div>
        <h2>查詢結果元件</h2>
        <p>這個元件只負責接 props 並呈現結果，避免輸入與顯示混在一起。</p>
      </div>
    </header>

    <div class="section-body">
      <p v-if="loading" class="state-box state-box--loading">資料查詢中，請稍候...</p>

      <p v-else-if="errorMessage" class="state-box state-box--error">
        {{ errorMessage }}
      </p>

      <p v-else-if="hasSearched && results.length === 0" class="state-box state-box--empty">
        查無資料，請確認保單號是否正確。
      </p>

      <template v-else-if="results.length > 0">
        <div class="result-summary">{{ resultCountText }}</div>
        <ul class="result-list">
          <li v-for="policy in results" :key="policy.policyNo" class="result-item">
            <div>
              <p class="policy-no">{{ policy.policyNo }}</p>
              <h3>{{ policy.productName }}</h3>
              <p>{{ policy.applicantName }} / {{ policy.insuredName }}</p>
            </div>
            <dl>
              <div>
                <dt>狀態</dt>
                <dd>{{ statusLabel(policy.policyStatus) }}</dd>
              </div>
              <div>
                <dt>生效日</dt>
                <dd>{{ policy.effectiveDate }}</dd>
              </div>
              <div>
                <dt>保費</dt>
                <dd>{{ premiumLabel(policy) }}</dd>
              </div>
            </dl>
          </li>
        </ul>
      </template>

      <p v-else class="state-box">請輸入保單號後按下查詢。</p>
    </div>
  </section>
</template>
