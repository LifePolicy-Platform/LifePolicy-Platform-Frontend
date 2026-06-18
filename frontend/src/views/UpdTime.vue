<script setup lang="ts">
import AptSearchForm from '@/components/appointment/AptSearchForm.vue'
import AptResultsTable from '@/components/appointment/AptResultsTable.vue'
import AptScheduleForm from '@/components/appointment/AptScheduleForm.vue'
import PageHero from '@/components/layout/PageHero.vue'
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
  <section class="page-with-hero appt-update-page">
    <PageHero title="重新安排約訪時間" subtitle="查詢未完成訪名單並重新設定約訪時間" />

    <div class="page-body appt-body">
      <q-card flat class="page-card page-card--accent appt-card">
        <q-card-section class="appt-card__section">
          <div class="page-card__header q-mb-md">
            <div>
              <p class="page-card__kicker">APPOINTMENT</p>
              <div class="page-card__title">查詢條件</div>
              <p class="page-card__desc">尚未完成的訪名單如下</p>
            </div>
          </div>

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
    </div>
  </section>
</template>

<style scoped>
.appt-update-page {
  --notus-charcoal: #1a202c;
  --notus-muted: #718096;
  --notus-green: #48bb78;
  --notus-green-dark: #38a169;
  --notus-green-deep: #2f855a;
}

.appt-card__section {
  padding: 28px 32px 32px;
}

.section-label {
  margin: 0 0 6px;
  color: var(--notus-muted);
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.block-title {
  margin-bottom: 16px;
  color: var(--notus-charcoal);
  font-size: 1rem;
  font-weight: 700;
}

.appt-card :deep(.block-title) {
  margin-bottom: 12px;
  color: var(--notus-green-deep);
  font-weight: 700;
}

.appt-card :deep(.search-btn),
.appt-card :deep(.save-btn) {
  background: var(--notus-green) !important;
}

.appt-card :deep(.search-btn:hover),
.appt-card :deep(.save-btn:hover) {
  background: var(--notus-green-dark) !important;
}

.appt-card :deep(.q-radio__inner--truthy) {
  color: var(--notus-green);
}

.appt-card :deep(.q-checkbox__inner--truthy) {
  color: var(--notus-green);
}

@media (max-width: 760px) {
  .appt-card__section {
    padding: 20px 18px 24px;
  }
}
</style>
