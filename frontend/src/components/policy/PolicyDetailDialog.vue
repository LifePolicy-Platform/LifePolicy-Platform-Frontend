<script setup lang="ts">
import { computed } from 'vue'
import type { PolicyDetail, PolicyHistoryItem } from '@/types/policyMgmt'
import { POLICY_STATUS_LABEL } from '@/constants/policyStatus'
import PolicyHistoryTable from '@/components/policy/PolicyHistoryTable.vue'

const props = defineProps<{
  modelValue: boolean
  detail: PolicyDetail | null
  history: PolicyHistoryItem[]
  loading: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  visit: []
}>()

const tab = defineModel<string>('tab', { default: 'info' })

const isOpen = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit('update:modelValue', v),
})
</script>

<template>
  <q-dialog v-model="isOpen" maximized transition-show="slide-up" transition-hide="slide-down">
    <q-card>
      <q-bar class="bg-primary text-white">
        <div>保單明細 — {{ detail?.policyNo ?? '' }}</div>
        <q-space />
        <q-btn v-close-popup dense flat icon="close" />
      </q-bar>

      <q-card-section v-if="loading" class="flex flex-center q-pa-xl">
        <q-spinner color="primary" size="40px" />
      </q-card-section>

      <template v-else-if="detail">
        <q-tabs v-model="tab" class="text-primary" align="left" dense>
          <q-tab name="info" label="保單資料" />
          <q-tab name="history" label="投保進度歷程" />
        </q-tabs>
        <q-separator />

        <q-tab-panels v-model="tab" animated>
          <q-tab-panel name="info">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <div class="text-subtitle2 q-mb-sm">投保人</div>
                <q-list dense bordered separator>
                  <q-item><q-item-section>姓名</q-item-section><q-item-section side>{{ detail.applicantName }}</q-item-section></q-item>
                  <q-item><q-item-section>性別</q-item-section><q-item-section side>{{ detail.applicantGender }}</q-item-section></q-item>
                  <q-item><q-item-section>生日</q-item-section><q-item-section side>{{ detail.applicantBirthday }}</q-item-section></q-item>
                  <q-item><q-item-section>聯絡電話</q-item-section><q-item-section side>{{ detail.contactPhone }}</q-item-section></q-item>
                  <q-item><q-item-section>與被保人關係</q-item-section><q-item-section side>{{ detail.relationship }}</q-item-section></q-item>
                </q-list>
              </div>
              <div class="col-12 col-md-6">
                <div class="text-subtitle2 q-mb-sm">被保人</div>
                <q-list dense bordered separator>
                  <q-item><q-item-section>身分證字號</q-item-section><q-item-section side>{{ detail.insuredIdNo }}</q-item-section></q-item>
                  <q-item><q-item-section>姓名</q-item-section><q-item-section side>{{ detail.insuredName }}</q-item-section></q-item>
                  <q-item><q-item-section>性別</q-item-section><q-item-section side>{{ detail.insuredGender }}</q-item-section></q-item>
                  <q-item><q-item-section>生日</q-item-section><q-item-section side>{{ detail.insuredBirthday }}</q-item-section></q-item>
                </q-list>
              </div>
              <div class="col-12">
                <div class="text-subtitle2 q-mb-sm">保單主檔</div>
                <q-list dense bordered separator>
                  <q-item><q-item-section>商品</q-item-section><q-item-section side>{{ detail.productName }}</q-item-section></q-item>
                  <q-item><q-item-section>狀態</q-item-section><q-item-section side>{{ POLICY_STATUS_LABEL[detail.policyStatus] }}</q-item-section></q-item>
                  <q-item><q-item-section>保額</q-item-section><q-item-section side>{{ detail.sumInsured.toLocaleString() }}</q-item-section></q-item>
                  <q-item><q-item-section>年繳保費</q-item-section><q-item-section side>{{ detail.annualPremium.toLocaleString() }}</q-item-section></q-item>
                  <q-item><q-item-section>生效日</q-item-section><q-item-section side>{{ detail.effectiveDate }}</q-item-section></q-item>
                  <q-item><q-item-section>到期日</q-item-section><q-item-section side>{{ detail.expiryDate }}</q-item-section></q-item>
                  <q-item><q-item-section>業務員</q-item-section><q-item-section side>{{ detail.agentName }}</q-item-section></q-item>
                  <q-item><q-item-section>風險等級</q-item-section><q-item-section side>{{ detail.riskLevel }}</q-item-section></q-item>
                  <q-item><q-item-section>備註</q-item-section><q-item-section side>{{ detail.remark || '—' }}</q-item-section></q-item>
                  <q-item><q-item-section>建立時間</q-item-section><q-item-section side>{{ detail.createdAt }}</q-item-section></q-item>
                </q-list>
              </div>
            </div>
            <div class="q-mt-md">
              <q-btn color="secondary" label="安排約訪" icon="event" @click="emit('visit')" />
            </div>
          </q-tab-panel>

          <q-tab-panel name="history">
            <div class="text-body2 text-grey-7 q-mb-md">
              可在此確認投保進度歷程（時間、事件、狀態、處理人、原因、備註）
            </div>
            <PolicyHistoryTable :rows="history" />
          </q-tab-panel>
        </q-tab-panels>
      </template>
    </q-card>
  </q-dialog>
</template>
