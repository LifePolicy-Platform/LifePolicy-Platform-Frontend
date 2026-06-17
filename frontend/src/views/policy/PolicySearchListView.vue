<script setup lang="ts">
import { ref } from 'vue'
import PageHero from '@/components/layout/PageHero.vue'
import { useAuthStore } from '@/stores/auth'
import PolicySearchFilter from '@/components/policy/PolicySearchFilter.vue'
import PolicyListTable from '@/components/policy/PolicyListTable.vue'
import PolicyDetailDialog from '@/components/policy/PolicyDetailDialog.vue'
import PolicyVisitDialog from '@/components/policy/PolicyVisitDialog.vue'
import { usePolicyMgmt } from '@/composables/usePolicyMgmt'

const authStore = useAuthStore()

const {
  filter,
  list,
  isSearching,
  hasSearched,
  detail,
  history,
  isDetailLoading,
  visitForm,
  visitPolicyNo,
  isVisitSaving,
  visitMessage,
  searchPolicies,
  resetFilter,
  loadDetail,
  openVisit,
  submitVisit,
} = usePolicyMgmt()

const showDetail = ref(false)
const showVisit = ref(false)

function onDetail(policyNo: string) {
  showDetail.value = true
  loadDetail(policyNo)
}

function onVisit(policyNo: string) {
  openVisit(policyNo)
  showVisit.value = true
}

function onVisitFromDetail() {
  if (detail.value) {
    onVisit(detail.value.policyNo)
  }
}

function onSubmitVisit() {
  const name =
    authStore.currentUser?.DISPLAY_NAME || authStore.currentUser?.USERNAME || '目前登入使用者'
  submitVisit(name)
}
</script>

<template>
  <section class="page-with-hero">
    <PageHero title="保單查詢" subtitle="查詢保單、檢視明細與安排約訪" />

    <div class="page-body">
      <PolicySearchFilter
        v-model:filter="filter"
        @search="searchPolicies"
        @reset="resetFilter"
      />

      <q-card v-if="hasSearched" flat class="page-card">
        <q-card-section>
          <PolicyListTable
            :rows="list"
            :loading="isSearching"
            @detail="onDetail"
            @visit="onVisit"
          />
        </q-card-section>
      </q-card>
    </div>

    <PolicyDetailDialog
      v-model="showDetail"
      :detail="detail"
      :history="history"
      :loading="isDetailLoading"
      @visit="onVisitFromDetail"
    />

    <PolicyVisitDialog
      v-model="showVisit"
      :policy-no="visitPolicyNo"
      :form="visitForm"
      :saving="isVisitSaving"
      :message="visitMessage"
      @update:form="(v) => (visitForm = v)"
      @submit="onSubmitVisit"
    />
  </section>
</template>

