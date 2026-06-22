<script setup lang="ts">
import { onMounted } from 'vue'
import PageHero from '@/components/layout/PageHero.vue'
import { usePolicyMgmt } from '@/composables/usePolicyMgmt'
import { POLICY_STATUS_LABEL } from '@/constants/policyStatus'
import type { PolicyStatus } from '@/types/policyMgmt'

const { reviewList, isReviewLoading, loadReviewList } = usePolicyMgmt()

function statusLabel(status: PolicyStatus) {
  return POLICY_STATUS_LABEL[status]
}

onMounted(() => {
  loadReviewList()
})

const columns = [
  { name: 'policyNo', label: '保單號碼', field: 'policyNo', align: 'left' as const },
  { name: 'productName', label: '商品', field: 'productName', align: 'left' as const },
  { name: 'applicantName', label: '投保人', field: 'applicantName', align: 'left' as const },
  { name: 'appliedAt', label: '申請日', field: 'appliedAt', align: 'left' as const },
  { name: 'policyStatus', label: '狀態', field: 'policyStatus', align: 'left' as const },
  { name: 'agentName', label: '業務員', field: 'agentName', align: 'left' as const },
  { name: 'actions', label: '操作', field: 'actions', align: 'center' as const },
]
</script>

<template>
  <section class="page-with-hero">
    <PageHero title="審核保單" subtitle="待核保件列表（權限控管後續實作）" />

    <div class="page-body">
      <q-card flat class="page-card page-card--data">
        <q-card-section>
          <div class="page-card__header q-mb-md">
            <div>
              <p class="page-card__kicker">REVIEW QUEUE</p>
              <div class="page-card__title">待審保單</div>
              <p class="page-card__desc">共 {{ reviewList.length }} 筆待處理</p>
            </div>
          </div>
          <q-table
            class="app-table"
            :rows="reviewList"
            :columns="columns"
            row-key="policyNo"
            flat
            bordered
            dense
            :loading="isReviewLoading"
            no-data-label="目前無待審件"
          >
            <template #body-cell-policyStatus="props">
              <q-td :props="props">
                <q-chip dense size="sm" color="warning" text-color="white">
                  {{ statusLabel(props.row.policyStatus) }}
                </q-chip>
              </q-td>
            </template>
            <template #body-cell-actions="props">
              <q-td :props="props">
                <q-btn flat dense color="primary" label="審核" disable title="權限功能後續實作" />
              </q-td>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </div>
  </section>
</template>

