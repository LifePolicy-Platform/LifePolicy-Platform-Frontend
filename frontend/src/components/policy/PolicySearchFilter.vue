<script setup lang="ts">
import type { PolicySearchFilter } from '@/types/policyMgmt'
import { POLICY_STATUS_LABEL } from '@/constants/policyStatus'
import type { PolicyStatus } from '@/types/policyMgmt'

const filter = defineModel<PolicySearchFilter>('filter', { required: true })

defineEmits<{
  search: []
  reset: []
}>()

const statusOptions = [
  { label: '全部', value: '' },
  ...Object.entries(POLICY_STATUS_LABEL).map(([value, label]) => ({
    label,
    value: value as PolicyStatus,
  })),
]
</script>

<template>
  <q-card flat class="page-card page-card--filter q-mb-md">
    <q-card-section>
      <div class="page-card__header q-mb-sm">
        <div>
          <p class="page-card__kicker">FILTER</p>
          <div class="page-card__title">查詢條件</div>
        </div>
      </div>
      <div class="row q-col-gutter-md">
        <div class="col-12 col-sm-6 col-md-3">
          <q-input v-model="filter.policyNo" label="保單號碼" dense outlined clearable />
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <q-input v-model="filter.applicantName" label="投保人" dense outlined clearable />
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <q-select
            v-model="filter.policyStatus"
            :options="statusOptions"
            label="狀態"
            dense
            outlined
            emit-value
            map-options
          />
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <q-input v-model="filter.effectiveDateFrom" label="生效日起" dense outlined type="date" />
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <q-input v-model="filter.effectiveDateTo" label="生效日迄" dense outlined type="date" />
        </div>
        <div class="col-12 col-sm-6 col-md-3 flex items-end q-gutter-sm">
          <q-btn color="primary" unelevated label="查詢" icon="search" @click="$emit('search')" />
          <q-btn flat label="清除" @click="$emit('reset')" />
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>
