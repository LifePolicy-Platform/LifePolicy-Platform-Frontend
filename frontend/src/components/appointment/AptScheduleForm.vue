<script setup lang="ts">
import type { UpdateMode } from '@/types/customer'

defineProps<{
  saveError: string
  isSaving: boolean
}>()

const updateMode = defineModel<UpdateMode>('updateMode', { required: true })
const workdaysCount = defineModel<number>('workdaysCount', { required: true })
const specificDate = defineModel<string>('specificDate', { required: true })
const specificTime = defineModel<string>('specificTime', { required: true })

const emit = defineEmits<{
  save: []
}>()

const workdayOptions = [1, 2, 3, 4, 5].map((day) => ({ label: String(day), value: day }))
</script>

<template>
  <div class="update-section">
    <div class="block-title">重新設定安排方式：</div>

    <div class="update-radio-group">
      <q-radio v-model="updateMode" val="today" label="安排至今日的約訪時間" color="primary" />

      <div class="radio-line">
        <q-radio v-model="updateMode" val="workdays" color="primary" />
        <div class="inline-controls">
          <span>安排至</span>
          <span class="today-badge">今日</span>
          <span>+</span>
          <q-select
            v-model="workdaysCount"
            dense
            outlined
            emit-value
            map-options
            :options="workdayOptions"
            class="day-select"
          />
          <span>工作天</span>
        </div>
      </div>

      <div class="radio-line">
        <q-radio v-model="updateMode" val="specific" color="primary" />
        <div class="inline-controls specific-controls">
          <span>安排至此約訪時間：</span>
          <q-input v-model="specificDate" dense outlined mask="date" placeholder="年 / 月 / 日" class="date-field">
            <template #append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="specificDate">
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="關閉" color="primary" flat />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
          <q-input v-model="specificTime" dense outlined mask="time" placeholder="--:--" class="time-field">
            <template #append>
              <q-icon name="schedule" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-time v-model="specificTime" format24h>
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="關閉" color="primary" flat />
                    </div>
                  </q-time>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
          <span class="hint-text">（範圍擷取項，只會處理你所勾選的第一筆資料）</span>
        </div>
      </div>
    </div>

    <div v-if="saveError" class="save-error">{{ saveError }}</div>

    <div class="actions">
      <q-btn
        color="primary"
        label="儲存"
        unelevated
        class="save-btn"
        :loading="isSaving"
        :disable="isSaving"
        @click="emit('save')"
      />
    </div>
  </div>
</template>

<style scoped>
.block-title {
  margin-bottom: 12px;
  color: #08a66a;
  font-weight: 700;
}

.update-section {
  margin-top: 58px;
}

.update-radio-group {
  display: grid;
  gap: 8px;
}

.update-radio-group :deep(.q-radio__label),
.radio-line {
  color: #475569;
  font-weight: 700;
}

.radio-line {
  display: flex;
  align-items: center;
  gap: 4px;
}

.inline-controls {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.specific-controls {
  gap: 8px;
}

.today-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 52px;
  height: 36px;
  padding: 0 10px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background: #f9fafb;
  color: #334155;
  font-size: 0.9rem;
  font-weight: 700;
}

.day-select {
  width: 112px;
}

.date-field {
  width: 142px;
}

.time-field {
  width: 118px;
}

.hint-text {
  color: #64748b;
  font-size: 0.9rem;
  font-weight: 700;
}

.save-error {
  margin-top: 12px;
  color: #b91c1c;
  font-size: 0.875rem;
  font-weight: 700;
  text-align: center;
}

.actions {
  display: flex;
  justify-content: center;
  margin-top: 44px;
}

.save-btn {
  min-width: 96px;
  background: #00a65a;
  font-weight: 700;
}

@media (max-width: 760px) {
  .update-section {
    margin-top: 32px;
  }

  .date-field,
  .time-field,
  .day-select {
    width: 100%;
  }

  .inline-controls {
    display: flex;
    width: 100%;
  }
}
</style>
