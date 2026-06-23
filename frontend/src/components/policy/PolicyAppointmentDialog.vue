<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { ActiveProjectOption, PolicyAppointmentContext } from '@/types/customer'

const props = defineProps<{
  modelValue: boolean
  context: PolicyAppointmentContext | null
  projects: ActiveProjectOption[]
  projectsLoading: boolean
  saving: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  submit: [payload: { campCode: string; recallTime: string }]
}>()

const campCode = ref('')
const recallDateTime = ref('')

const isOpen = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
})

const projectOptions = computed(() =>
  props.projects.map((project) => ({
    label: `${project.campName}（期限 ${project.campServiceDt}）`,
    value: project.campCode,
  })),
)

function resetForm() {
  campCode.value = ''
  recallDateTime.value = ''
}

function toApiDateTime(localValue: string): string {
  const normalized = localValue.replace('T', ' ')
  return normalized.length === 16 ? `${normalized}:00` : normalized
}

function handleSubmit() {
  if (!campCode.value || !recallDateTime.value) return
  emit('submit', {
    campCode: campCode.value,
    recallTime: toApiDateTime(recallDateTime.value),
  })
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      resetForm()
    }
  },
)
</script>

<template>
  <q-dialog v-model="isOpen">
    <q-card class="policy-appointment-dialog">
      <q-card-section>
        <div class="text-h6">新增約訪</div>
        <div class="text-caption text-grey-7">填寫約訪日期時間與專案名稱</div>
      </q-card-section>

      <q-card-section class="q-pt-none q-gutter-md">
        <q-input :model-value="context?.listNo ?? ''" label="名單序號" dense outlined readonly bg-color="grey-2" />
        <q-input :model-value="context?.custName ?? ''" label="客戶名稱" dense outlined readonly bg-color="grey-2" />
        <q-input :model-value="context?.listLastPhone ?? ''" label="撥出電話" dense outlined readonly bg-color="grey-2" />
        <q-select v-model="campCode" :options="projectOptions" label="專案名稱" dense outlined emit-value map-options
          :loading="projectsLoading" :disable="projectsLoading || projectOptions.length === 0" hint="僅顯示服務期限內的專案" />
        <q-input v-model="recallDateTime" label="約訪日期時間" type="datetime-local" dense outlined stack-label />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn v-close-popup flat label="取消" />
        <q-btn color="primary" label="確認新增" :loading="saving" :disable="!campCode || !recallDateTime"
          @click="handleSubmit" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style scoped>
.policy-appointment-dialog {
  min-width: 420px;
  max-width: 96vw;
}
</style>
