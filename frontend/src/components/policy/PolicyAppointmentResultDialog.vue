<script setup lang="ts">
import { computed, ref, watch } from 'vue'

export interface AppointmentResultSubmitPayload {
  recallResult: 1 | 2
  recTime?: string
}

const props = defineProps<{
  modelValue: boolean
  saving: boolean
  /** 進行中約訪的預定約訪時間，用於驗證實際約訪時間 */
  recallTime?: string | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  submit: [payload: AppointmentResultSubmitPayload]
}>()

const recallResult = ref<1 | 2 | null>(null)
const recDateTime = ref('')
const recTimeError = ref('')
const recallResultError = ref('')

const isOpen = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
})

const isSuccessResult = computed(() => recallResult.value === 1)

const resultOptions = [
  { label: '約訪成功', value: 1 as const, icon: 'check_circle', color: 'positive' },
  { label: '約訪失敗', value: 2 as const, icon: 'cancel', color: 'negative' },
]

const scheduledRecallTimeLabel = computed(() => {
  if (!props.recallTime) return ''
  return props.recallTime.replace('T', ' ').slice(0, 16)
})


function nowForDatetimeLocal(): string {
  const now = new Date()
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`
}

function toApiDateTime(localValue: string): string {
  const normalized = localValue.replace('T', ' ')
  return normalized.length === 16 ? `${normalized}:00` : normalized
}

function toComparableMs(value: string): number {
  return new Date(value.replace(' ', 'T')).getTime()
}

function resetForm() {
  recallResult.value = null
  recDateTime.value = ''
  recTimeError.value = ''
  recallResultError.value = ''
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      resetForm()
    }
  },
)

watch(recallResult, (value) => {
  recallResultError.value = ''
  if (value === 1) {
    if (!recDateTime.value.trim()) {
      recDateTime.value = nowForDatetimeLocal()
    }
    return
  }
  recDateTime.value = ''
  recTimeError.value = ''
})

watch(recDateTime, () => {
  if (recTimeError.value) {
    recTimeError.value = ''
  }
})

function validateRecTimeGreaterThanScheduled(recTime: string): boolean {
  if (!props.recallTime) {
    return true
  }
  if (toComparableMs(recTime) <= toComparableMs(props.recallTime)) {
    recTimeError.value = '實際約訪時間需大於約訪時間'
    return false
  }
  return true
}

function handleSubmit() {
  recallResultError.value = ''
  recTimeError.value = ''

  if (recallResult.value == null) {
    recallResultError.value = '請選擇約訪結果'
    return
  }

  if (recallResult.value === 1) {
    if (!recDateTime.value.trim()) {
      recTimeError.value = '請選擇實際約訪時間'
      return
    }
    const recTime = toApiDateTime(recDateTime.value.trim())
    if (!validateRecTimeGreaterThanScheduled(recTime)) {
      return
    }
    emit('submit', { recallResult: 1, recTime })
    return
  }

  emit('submit', { recallResult: 2 })
}
</script>

<template>
  <q-dialog v-model="isOpen" persistent>
    <q-card class="policy-appointment-result-dialog">
      <q-card-section>
        <div class="text-h6">約訪結果確認</div>
        <div class="text-caption text-grey-7">請選擇本次約訪結果，確認後名單將結案</div>
      </q-card-section>

      <q-card-section class="q-pt-none q-gutter-md">
        <div>
          <q-option-group v-model="recallResult" :options="resultOptions" type="radio" color="primary" />
          <div v-if="recallResultError" class="text-negative text-caption q-mt-xs q-ml-sm" role="alert">
            {{ recallResultError }}
          </div>
        </div>
        <div v-if="isSuccessResult" >
          <span style="color: red;">* </span>
          <span>實際約訪時間: </span>
        </div>
        <q-input v-if="isSuccessResult" v-model="recDateTime" type="datetime-local" stack-label outlined dense clearable
          :error="!!recTimeError" :error-message="recTimeError">
          
          <template #label>
            實際約訪時間 <span class="text-negative">*</span>
          </template>
        </q-input>
        
      </q-card-section>

      <q-card-actions align="right">
        <q-btn v-close-popup flat label="取消" />
        <q-btn color="primary" label="確認送出" :loading="saving" @click="handleSubmit" />
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
