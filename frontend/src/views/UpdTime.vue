<script setup lang="ts">
import AptSearchForm from '@/components/appointment/AptSearchForm.vue'
import AptResultsTable from '@/components/appointment/AptResultsTable.vue'
import AptScheduleForm from '@/components/appointment/AptScheduleForm.vue'
import { useUpdTime } from '@/composables/useUpdTime'

const {
  searchStartDate,
  searchStartTime,
  searchEndDate,
  searchEndTime,
  selectedRowIds,
  updateMode,
  workdaysCount,
  specificDate,
  specificTime,
  rows,
  isLoading,
  errorMsg,
  rangeError,
  hasSearched,
  isSaving,
  saveError,
  updateResults,
  selectedCountLabel,
  hasPartialSelection,
  allSelected,
  searchAppointments,
  saveUpdate,
} = useUpdTime()
</script>

<template>
  <section class="appt-update-page">
    <q-card flat bordered class="appt-panel">
      <q-card-section class="appt-panel__header">
        <h2 class="appt-title">重新安排約訪時間</h2>
      </q-card-section>

      <q-separator />

      <q-card-section class="appt-panel__body">
        <div class="block-title">尚未完成的訪名單如下：</div>

        <AptSearchForm
          v-model:search-start-date="searchStartDate"
          v-model:search-start-time="searchStartTime"
          v-model:search-end-date="searchEndDate"
          v-model:search-end-time="searchEndTime"
          :range-error="rangeError"
          @search="searchAppointments"
        />

        <AptResultsTable
          v-model:selected-row-ids="selectedRowIds"
          v-model:all-selected="allSelected"
          :rows="rows"
          :has-searched="hasSearched"
          :is-loading="isLoading"
          :error-msg="errorMsg"
          :selected-count-label="selectedCountLabel"
          :has-partial-selection="hasPartialSelection"
          :update-results="updateResults"
        />

        <AptScheduleForm
          v-model:update-mode="updateMode"
          v-model:workdays-count="workdaysCount"
          v-model:specific-date="specificDate"
          v-model:specific-time="specificTime"
          :save-error="saveError"
          :is-saving="isSaving"
          @save="saveUpdate"
        />
      </q-card-section>
    </q-card>
  </section>
</template>

<style scoped>
.appt-update-page {
  display: flex;
  justify-content: center;
  width: 100%;
}

.appt-panel {
  width: min(100%, 980px);
  background: #ffffff;
  border-color: #dce7e3;
  border-radius: 4px;
  box-shadow: 0 0 0 1px rgba(15, 118, 110, 0.12), 0 12px 26px rgba(15, 23, 42, 0.08);
}

.appt-panel__header {
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px 56px;
}

.appt-title {
  margin: 0;
  color: #465a58;
  font-size: 1.15rem;
  font-weight: 700;
}

.appt-panel__body {
  padding: 22px 34px 30px;
}

.block-title {
  margin-bottom: 12px;
  color: #08a66a;
  font-weight: 700;
}

@media (max-width: 760px) {
  .appt-panel__body {
    padding: 18px;
  }
}
</style>
