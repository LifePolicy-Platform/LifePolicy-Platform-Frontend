<script setup lang="ts">
import { computed } from 'vue'
import type { PolicyVisitForm } from '@/types/policyMgmt'
import { useAuthStore } from '@/stores/auth'

const props = defineProps<{
  modelValue: boolean
  policyNo: string
  form: PolicyVisitForm
  saving: boolean
  message: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'update:form': [value: PolicyVisitForm]
  submit: []
}>()

const authStore = useAuthStore()

const isOpen = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit('update:modelValue', v),
})

const agentLabel = computed(
  () => authStore.currentUser?.DISPLAY_NAME || authStore.currentUser?.USERNAME || '目前登入使用者',
)

function patchForm(patch: Partial<PolicyVisitForm>) {
  emit('update:form', { ...props.form, ...patch })
}
</script>

<template>
  <q-dialog v-model="isOpen" persistent>
    <q-card style="min-width: 400px">
      <q-card-section>
        <div class="text-h6">安排約訪</div>
        <div class="text-caption text-grey-7">保單：{{ policyNo }}</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-banner dense rounded class="bg-blue-1 text-primary q-mb-md">
          約訪將綁定承辦業務：<strong>{{ agentLabel }}</strong>
        </q-banner>

        <q-input
          :model-value="form.visitDate"
          label="約訪日期"
          type="date"
          dense
          outlined
          class="q-mb-md"
          @update:model-value="(v) => patchForm({ visitDate: String(v ?? '') })"
        />
        <q-input
          :model-value="form.visitTime"
          label="約訪時間"
          type="time"
          dense
          outlined
          class="q-mb-md"
          @update:model-value="(v) => patchForm({ visitTime: String(v ?? '') })"
        />
        <q-input
          :model-value="form.remark"
          label="備註"
          type="textarea"
          dense
          outlined
          autogrow
          @update:model-value="(v) => patchForm({ remark: String(v ?? '') })"
        />

        <q-banner v-if="message" dense rounded class="bg-green-1 text-positive q-mt-md">
          {{ message }}
        </q-banner>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn v-close-popup flat label="取消" />
        <q-btn
          color="primary"
          label="確認安排"
          :loading="saving"
          @click="emit('submit')"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
