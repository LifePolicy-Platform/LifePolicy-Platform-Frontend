<script setup lang="ts">
import { computed, ref, watch } from 'vue'

const props = defineProps<{
  modelValue: boolean
  saving: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  submit: [recallResult: number]
}>()

const recallResult = ref<1 | 2>(1)

const isOpen = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
})

const resultOptions = [
  { label: '約訪成功', value: 1 as const, icon: 'check_circle', color: 'positive' },
  { label: '約訪失敗', value: 2 as const, icon: 'cancel', color: 'negative' },
]

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      recallResult.value = 1
    }
  },
)

function handleSubmit() {
  emit('submit', recallResult.value)
}
</script>

<template>
  <q-dialog v-model="isOpen" persistent>
    <q-card class="policy-appointment-result-dialog">
      <q-card-section>
        <div class="text-h6">約訪結果確認</div>
        <div class="text-caption text-grey-7">請選擇本次約訪結果，確認後名單將結案</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-option-group
          v-model="recallResult"
          :options="resultOptions"
          type="radio"
          color="primary"
        />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn v-close-popup flat label="取消" />
        <q-btn
          color="primary"
          label="確認送出"
          :loading="saving"
          @click="handleSubmit"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style scoped>
.policy-appointment-result-dialog {
  min-width: 360px;
  max-width: 96vw;
}
</style>
