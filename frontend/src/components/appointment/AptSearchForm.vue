<script setup lang="ts">
defineProps<{
  rangeError: string
}>()

const searchStartDate = defineModel<string>('searchStartDate', { required: true })
const searchStartTime = defineModel<string>('searchStartTime', { required: true })
const searchEndDate = defineModel<string>('searchEndDate', { required: true })
const searchEndTime = defineModel<string>('searchEndTime', { required: true })

const emit = defineEmits<{
  search: []
}>()
</script>

<template>
  <div>
    <div v-if="rangeError" class="range-error">{{ rangeError }}</div>

    <div class="search-row">
      <span class="field-label">查詢日期：</span>

      <q-input v-model="searchStartDate" dense outlined mask="date" placeholder="年 / 月 / 日" class="date-field">
        <template #append>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
              <q-date v-model="searchStartDate">
                <div class="row items-center justify-end">
                  <q-btn v-close-popup label="關閉" color="primary" flat />
                </div>
              </q-date>
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>

      <q-input v-model="searchStartTime" dense outlined mask="time" placeholder="--:--" class="time-field">
        <template #append>
          <q-icon name="schedule" class="cursor-pointer">
            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
              <q-time v-model="searchStartTime" format24h>
                <div class="row items-center justify-end">
                  <q-btn v-close-popup label="關閉" color="primary" flat />
                </div>
              </q-time>
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>

      <span class="range-separator">～</span>

      <q-input v-model="searchEndDate" dense outlined mask="date" placeholder="年 / 月 / 日" class="date-field">
        <template #append>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
              <q-date v-model="searchEndDate">
                <div class="row items-center justify-end">
                  <q-btn v-close-popup label="關閉" color="primary" flat />
                </div>
              </q-date>
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>

      <q-input v-model="searchEndTime" dense outlined mask="time" placeholder="--:--" class="time-field">
        <template #append>
          <q-icon name="schedule" class="cursor-pointer">
            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
              <q-time v-model="searchEndTime" format24h>
                <div class="row items-center justify-end">
                  <q-btn v-close-popup label="關閉" color="primary" flat />
                </div>
              </q-time>
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>

      <q-btn color="primary" label="查詢" unelevated class="search-btn" @click="emit('search')" />
    </div>
  </div>
</template>

<style scoped>
.range-error {
  margin-bottom: 10px;
  color: #b91c1c;
  font-size: 0.9rem;
  font-weight: 700;
}

.search-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-bottom: 18px;
}

.field-label,
.range-separator {
  color: #64748b;
  font-weight: 700;
}

.date-field {
  width: 142px;
}

.time-field {
  width: 118px;
}

.search-btn {
  min-width: 72px;
  background: #48bb78;
  font-weight: 700;
}

@media (max-width: 760px) {
  .search-row {
    align-items: stretch;
    flex-direction: column;
  }

  .date-field,
  .time-field,
  .search-btn {
    width: 100%;
  }
}
</style>
