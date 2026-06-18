<script setup lang="ts">
import PageHero from '@/components/layout/PageHero.vue'
import { usePolicyMgmt } from '@/composables/usePolicyMgmt'

const { createForm, isCreating, createMessage, submitCreate } = usePolicyMgmt()
</script>

<template>
  <section class="page-with-hero">
    <PageHero title="新增保單" subtitle="填寫投保人、被保人與保單資料" />

    <div class="page-body">
      <q-card flat class="page-card page-card--accent">
        <q-card-section>
          <div class="page-card__header q-mb-md">
            <div>
              <p class="page-card__kicker">POLICY CREATE</p>
              <div class="page-card__title">新增保單申請</div>
            </div>
          </div>

          <p class="page-form-section__title">保單資料</p>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-4">
              <q-input v-model="createForm.productCode" label="商品代碼" dense outlined />
            </div>
            <div class="col-12 col-md-4">
              <q-input
                v-model.number="createForm.sumInsured"
                label="保額"
                type="number"
                dense
                outlined
              />
            </div>
            <div class="col-12 col-md-4">
              <q-input
                v-model.number="createForm.annualPremium"
                label="年繳保費"
                type="number"
                dense
                outlined
              />
            </div>
            <div class="col-12 col-md-4">
              <q-input
                v-model="createForm.effectiveDate"
                label="生效日"
                type="date"
                dense
                outlined
              />
            </div>
          </div>

          <p class="page-form-section__title q-mt-lg">投保人</p>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-4">
              <q-input v-model="createForm.applicantName" label="姓名" dense outlined />
            </div>
            <div class="col-12 col-md-4">
              <q-input v-model="createForm.applicantGender" label="性別" dense outlined />
            </div>
            <div class="col-12 col-md-4">
              <q-input
                v-model="createForm.applicantBirthday"
                label="生日"
                type="date"
                dense
                outlined
              />
            </div>
            <div class="col-12 col-md-4">
              <q-input v-model="createForm.contactPhone" label="聯絡電話" dense outlined />
            </div>
            <div class="col-12 col-md-4">
              <q-input v-model="createForm.relationship" label="與被保人關係" dense outlined />
            </div>
          </div>

          <p class="page-form-section__title q-mt-lg">被保人</p>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-4">
              <q-input v-model="createForm.insuredIdNo" label="身分證字號" dense outlined />
            </div>
            <div class="col-12 col-md-4">
              <q-input v-model="createForm.insuredName" label="姓名" dense outlined />
            </div>
            <div class="col-12 col-md-4">
              <q-input v-model="createForm.insuredGender" label="性別" dense outlined />
            </div>
            <div class="col-12 col-md-4">
              <q-input
                v-model="createForm.insuredBirthday"
                label="生日"
                type="date"
                dense
                outlined
              />
            </div>
          </div>

          <div class="col-12 q-mt-md">
            <q-input v-model="createForm.remark" label="備註" type="textarea" dense outlined autogrow />
          </div>

          <q-banner v-if="createMessage" dense rounded class="bg-green-1 text-positive q-mt-md">
            {{ createMessage }}
          </q-banner>

          <div class="q-mt-lg">
            <q-btn color="primary" unelevated icon="send" label="送出申請" :loading="isCreating" @click="submitCreate" />
          </div>
        </q-card-section>
      </q-card>
    </div>
  </section>
</template>

