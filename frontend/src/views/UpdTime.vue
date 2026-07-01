<script setup lang="ts">
import { ref, watch } from 'vue'
import PageHero from '@/components/layout/PageHero.vue'
import { useUpdTime } from '@/composables/useUpdTime'
import type { AptBatchUpdateResponse, AptRecordListResponse } from '@/types/customer'
import { datePart, timePart } from '@/utils/appointmentDateTime'
import { recallResultColor, recallResultLabel } from '@/constants/recallResult'

type PageTab = 'reschedule' | 'history'

const activeTab = ref<PageTab>('reschedule')

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
  resetSearchFilters,
  historyIdentityCard,
  historyRows,
  isHistoryLoading,
  historyErrorMsg,
  historyIdError,
  historyHasSearched,
  historyCustName,
  searchHistory,
  resetHistoryFilters,
} = useUpdTime()

const workdayOptions = [1, 2, 3, 4, 5].map((day) => ({ label: `${day} 個工作天`, value: day }))

const resultColumns = [
  { name: 'updateResult', label: '執行結果', field: 'updateResult', align: 'center' as const },
  { name: 'recNo', label: '約訪序號', field: 'recNo', align: 'left' as const },
  { name: 'custName', label: '客戶姓名', field: 'custName', align: 'left' as const },
  { name: 'campName', label: '專案名稱', field: 'campName', align: 'left' as const },
  { name: 'recallDate', label: '約訪日期', field: 'recallDate', align: 'left' as const },
  { name: 'recallClock', label: '約訪時間', field: 'recallClock', align: 'left' as const },
  { name: 'listLastphone', label: '撥出電話', field: 'listLastphone', align: 'left' as const },
  { name: 'campServiceDt', label: '名單回收日', field: 'campServiceDt', align: 'left' as const },
]

const historyColumns = [
  { name: 'recNo', label: '約訪序號', field: 'recNo', align: 'left' as const },
  { name: 'campName', label: '專案名稱', field: 'campName', align: 'left' as const },
  { name: 'recallDate', label: '約訪日期', field: 'recallDate', align: 'left' as const },
  { name: 'recallClock', label: '約訪時間', field: 'recallClock', align: 'left' as const },
  { name: 'recDate', label: '實際約訪日期', field: 'recDate', align: 'left' as const },
  { name: 'recallResult', label: '約訪結果', field: 'recallResult', align: 'left' as const },
]

const rescheduleColumns = [
  {
    name: 'select',
    label: '',
    field: 'select',
    align: 'center' as const,
    style: 'width: 48px; min-width: 48px;',
    headerStyle: 'width: 48px; min-width: 48px;',
  },
  ...resultColumns,
]

function getUpdateResult(row: AptRecordListResponse): AptBatchUpdateResponse | undefined {
  return updateResults.value.get(row.sno)
}

const historyPagination = ref({
  page: 1,
  rowsPerPage: 10,
})

watch(historyRows, () => {
  historyPagination.value.page = 1
})
</script>

<template>
  <section class="page-with-hero upd-time-page">
    <PageHero title="重新安排約訪" subtitle="查詢未完成訪名單、重新設定約訪時間，或查詢約訪紀錄" />

    <div class="page-body">
      <q-card flat class="page-card upd-time-tabs-card">
        <q-tabs v-model="activeTab" align="left" dense no-caps active-color="primary" indicator-color="primary"
          class="upd-time-tabs text-grey-7">
          <q-tab name="reschedule" icon="event_repeat" label="重新安排約訪" />
          <q-tab name="history" icon="history" label="查詢約訪紀錄" />
        </q-tabs>
        <q-separator />

        <q-tab-panels v-model="activeTab" animated class="bg-transparent">
          <!-- 重新安排約訪 -->
          <q-tab-panel name="reschedule" class="q-pa-none">
            <div class="upd-time-panel">
              <q-card flat class="page-card page-card--filter upd-time-filter-card q-mb-xs">
                <q-card-section class="upd-time-filter-section">
                  <div class="page-card__header">
                    <div>
                      <p class="page-card__kicker">SEARCH</p>
                      <div class="page-card__title">查詢條件</div>
                      <p class="page-card__desc">尚未完成訪的名單，可依約訪日期區間篩選</p>
                    </div>

                  </div>

                  <div class="upd-time-filter-row q-mt-sm">
                    <div class="upd-time-filter-grid">
                      <q-input v-model="searchStartDate" label="開始日期" type="date" stack-label outlined dense />
                      <q-input v-model="searchStartTime" label="開始時間" type="time" stack-label outlined dense />
                      <q-input v-model="searchEndDate" label="結束日期" type="date" stack-label outlined dense
                        :error="!!rangeError" :error-message="rangeError" />
                      <q-input v-model="searchEndTime" label="結束時間" type="time" stack-label outlined dense />
                    </div>
                    <div class="upd-time-filter-actions row items-center no-wrap q-gutter-sm">
                      <q-btn color="primary" unelevated label="執行查詢" no-caps icon="search" size="m" :loading="isLoading"
                        @click="searchAppointments" />
                      <q-btn outline color="primary" label="清空條件" no-caps icon="refresh" size="m"
                        @click="resetSearchFilters" />
                    </div>
                  </div>
                </q-card-section>
              </q-card>

              <q-card flat class="page-card page-card--data q-mb-md">
                <q-card-section>
                  <div class="page-card__header q-mb-md">
                    <div>
                      <p class="page-card__kicker">RESULT</p>
                      <div class="page-card__title">查詢結果</div>
                      <p v-if="hasSearched" class="page-card__desc">
                        共 {{ rows.length }} 筆 · {{ selectedCountLabel }}
                      </p>
                    </div>
                  </div>

                  <q-banner v-if="errorMsg" rounded class="bg-red-1 text-red-8 q-mb-md">
                    {{ errorMsg }}
                  </q-banner>

                  <q-table class="app-table upd-time-reschedule-table" v-model:pagination="historyPagination" flat
                    bordered :rows="rows" :columns="rescheduleColumns" row-key="sno" :loading="isLoading"
                    :rows-per-page-options="[10]">
                    <template #no-data>
                      <div class="upd-time-table-empty text-grey-6">
                        {{ hasSearched ? '查無資料，請調整查詢條件' : '請輸入條件後執行查詢' }}
                      </div>
                    </template>

                    <template #header-cell-select="props">
                      <q-th :props="props" style="width: 48px; min-width: 48px; padding: 0 4px;">
                        <div style="display: flex; align-items: center; justify-content: center;">
                          <q-checkbox :model-value="allSelected" :indeterminate="hasPartialSelection" dense
                            @update:model-value="allSelected = $event" />
                        </div>
                      </q-th>
                    </template>

                    <template #body-cell-select="props">
                      <q-td :props="props" style="padding: 0 4px;">
                        <div style="display: flex; align-items: center; justify-content: center;">
                          <q-checkbox v-model="selectedRowIds" :val="props.rowIndex" dense />
                        </div>
                      </q-td>
                    </template>

                    <template #body-cell-updateResult="props">
                      <q-td :props="props">
                        <template v-if="getUpdateResult(props.row)">
                          <q-chip v-if="getUpdateResult(props.row)?.result === 'success'" dense size="sm"
                            color="positive" text-color="white">
                            完成
                          </q-chip>
                          <q-chip v-else dense size="sm" color="negative" text-color="white"
                            :title="getUpdateResult(props.row)?.errorMsg ?? ''">
                            失敗
                          </q-chip>
                        </template>
                        <span v-else class="text-grey-6">—</span>
                      </q-td>
                    </template>

                    <template #body-cell-recallDate="props">
                      <q-td :props="props">{{ datePart(props.row.recallTime) || '—' }}</q-td>
                    </template>

                    <template #body-cell-recallClock="props">
                      <q-td :props="props">{{ timePart(props.row.recallTime) || '—' }}</q-td>
                    </template>
                  </q-table>
                </q-card-section>
              </q-card>

              <q-card flat class="page-card page-card--accent">
                <q-card-section>
                  <div class="page-card__header q-mb-md">
                    <div>
                      <p class="page-card__kicker">SCHEDULE</p>
                      <div class="page-card__title">重新設定安排方式</div>
                    </div>
                  </div>

                  <div class="upd-time-schedule-options">
                    <q-card flat bordered class="upd-time-schedule-card"
                      :class="{ 'upd-time-schedule-card--active': updateMode === 'workdays' }"
                      @click="updateMode = 'workdays'">
                      <q-card-section class="upd-time-schedule-card__body">
                        <div class="row items-center no-wrap q-gutter-xs">
                          <q-radio v-model="updateMode" val="workdays" color="primary" dense />
                          <div class="col">
                            <div class="upd-time-schedule-card__title">今日起算工作天</div>
                            <p class="upd-time-schedule-card__desc">
                              保留原約訪時分，日期改為今日起加 N 個工作天
                            </p>
                            <q-select v-model="workdaysCount" :options="workdayOptions" label="工作天數" outlined dense
                              emit-value map-options :disable="updateMode !== 'workdays'"
                              class="upd-time-workday-select" @click.stop />
                          </div>
                        </div>
                      </q-card-section>
                    </q-card>

                    <q-card flat bordered class="upd-time-schedule-card"
                      :class="{ 'upd-time-schedule-card--active': updateMode === 'specific' }"
                      @click="updateMode = 'specific'">
                      <q-card-section class="upd-time-schedule-card__body">
                        <div class="row items-start no-wrap q-gutter-xs">
                          <q-radio v-model="updateMode" val="specific" color="primary" dense class="q-mt-xs" />
                          <div class="col">
                            <div class="upd-time-schedule-card__title">指定約訪時間</div>
                            <p class="upd-time-schedule-card__desc">
                              僅處理勾選名單中約訪時間最早的一筆
                            </p>
                            <div class="upd-time-specific-grid">
                              <q-input v-model="specificDate" label="約訪日期" type="date" stack-label outlined dense
                                :disable="updateMode !== 'specific'" @click.stop />
                              <q-input v-model="specificTime" label="約訪時間" type="time" stack-label outlined dense
                                :disable="updateMode !== 'specific'" @click.stop />
                            </div>
                          </div>
                        </div>
                      </q-card-section>
                    </q-card>
                  </div>

                  <q-banner v-if="saveError" rounded class="bg-red-1 text-red-8 q-mt-md">
                    {{ saveError }}
                  </q-banner>

                  <div class="q-mt-lg row justify-end">
                    <q-btn color="primary" unelevated label="儲存變更" no-caps :loading="isSaving" :disable="isSaving"
                      @click="saveUpdate" />
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </q-tab-panel>

          <!-- 查詢約訪歷程 -->
          <q-tab-panel name="history" class="q-pa-none">
            <div class="upd-time-panel">
              <q-card flat class="page-card page-card--filter upd-time-filter-card q-mb-xs">
                <q-card-section class="upd-time-filter-section">
                  <div class="page-card__header">
                    <div>
                      <p class="page-card__kicker">HISTORY</p>
                      <div class="page-card__title">查詢條件</div>
                      <p class="page-card__desc">輸入身分證字號查詢約訪紀錄</p>
                    </div>
                  </div>

                  <div class="upd-time-filter-row q-mt-sm">
                    <div class="upd-time-history-filter">
                      <q-input v-model="historyIdentityCard" label="身分證字號" outlined dense clearable maxlength="10"
                        :error="!!historyIdError" :error-message="historyIdError" @keyup.enter="searchHistory" />
                    </div>
                    <div class="upd-time-filter-actions row items-center no-wrap q-gutter-sm">
                      <q-btn color="primary" unelevated label="執行查詢" no-caps icon="search" size="m"
                        :loading="isHistoryLoading" @click="searchHistory" />
                      <q-btn outline color="primary" label="清空條件" no-caps icon="refresh" size="m"
                        @click="resetHistoryFilters" />
                    </div>
                  </div>
                </q-card-section>
              </q-card>

              <q-card flat class="page-card page-card--data">
                <q-card-section>
                  <div class="page-card__header q-mb-sm">
                    <div>
                      <p class="page-card__kicker">HISTORY LIST</p>
                      <div class="page-card__title">約訪紀錄</div>
                    </div>
                    <p v-if="historyHasSearched" class="page-card__desc q-mb-none upd-time-history-count">
                      共 {{ historyRows.length }} 筆
                    </p>
                  </div>

                  <div v-if="historyHasSearched" class="upd-time-history-subject q-mb-md">
                    <q-avatar size="32px" color="primary" text-color="white" icon="person" class="upd-time-history-subject__avatar" />
                    <div class="upd-time-history-subject__name">
                      <span class="upd-time-history-subject__prefix">客戶姓名：</span>{{ historyCustName }}
                    </div>
                  </div>

                  <q-banner v-if="historyErrorMsg" rounded class="bg-red-1 text-red-8 q-mb-md">
                    {{ historyErrorMsg }}
                  </q-banner>

                  <q-table v-model:pagination="historyPagination" class="app-table" flat bordered :rows="historyRows"
                    :columns="historyColumns" row-key="sno" :loading="isHistoryLoading" :rows-per-page-options="[10]">
                    <template #no-data>
                      <div class="upd-time-table-empty text-grey-6">
                        {{ historyHasSearched ? '查無資料，請調整查詢條件' : '請輸入身分證字號後執行查詢' }}
                      </div>
                    </template>

                    <template #body-cell-recallDate="props">
                      <q-td :props="props">{{ datePart(props.row.recallTime) || '—' }}</q-td>
                    </template>

                    <template #body-cell-recallClock="props">
                      <q-td :props="props">{{ timePart(props.row.recallTime) || '—' }}</q-td>
                    </template>

                    <template #body-cell-recDate="props">
                      <q-td :props="props">{{ datePart(props.row.recTime) || '—' }}</q-td>
                    </template>

                    <template #body-cell-recallResult="props">
                      <q-td :props="props">
                        <q-chip v-if="props.row.recallResult != null" dense size="sm"
                          :color="recallResultColor(props.row.recallResult)" text-color="white">
                          {{ recallResultLabel(props.row.recallResult) }}
                        </q-chip>
                        <span v-else class="text-grey-6">—</span>
                      </q-td>
                    </template>
                  </q-table>
                </q-card-section>
              </q-card>
            </div>
          </q-tab-panel>
        </q-tab-panels>
      </q-card>
    </div>
  </section>
</template>

<style scoped>
.upd-time-tabs-card {
  border-radius: 14px;
  overflow: hidden;
}

.upd-time-tabs :deep(.q-tab) {
  min-height: 48px;
  padding: 0 20px;
  font-weight: 600;
}

.upd-time-panel {
  padding: 10px;
}

.upd-time-history-count {
  align-self: flex-end;
  white-space: nowrap;
}

.upd-time-history-subject {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 10px;
  background: var(--notus-green-soft);
  border: 1px solid var(--notus-green-pale);
}

.upd-time-history-subject__avatar {
  flex-shrink: 0;
}

.upd-time-history-subject__name {
  font-size: 1rem;
  font-weight: 700;
  color: var(--notus-charcoal);
  line-height: 1.35;
}

.upd-time-history-subject__prefix {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--notus-muted);
}

.upd-time-filter-row {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  flex-wrap: wrap;
}

.upd-time-filter-section {
  padding-bottom: 4px;
}

.upd-time-filter-actions {
  flex-shrink: 0;
  margin-right: auto;
  margin-bottom: 20px;
}

.upd-time-filter-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 140px));
  gap: 10px 12px;
  max-width: 620px;
}

.upd-time-history-filter {
  width: 200px;
  max-width: 100%;
}

.upd-time-table-empty {
  width: 100%;
  padding: 16px;
  text-align: center;
}

.upd-time-schedule-options {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.upd-time-schedule-card {
  border-radius: 10px;
  cursor: pointer;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.upd-time-schedule-card__body {
  padding: 10px 12px;
}

.upd-time-schedule-card__title {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--notus-charcoal, #1a202c);
  line-height: 1.35;
}

.upd-time-schedule-card__desc {
  margin: 2px 0 8px;
  font-size: 0.75rem;
  color: var(--notus-muted, #718096);
  line-height: 1.4;
}

.upd-time-schedule-card--active {
  border-color: #48bb78;
  box-shadow: 0 0 0 1px rgba(72, 187, 120, 0.35);
}

.upd-time-workday-select {
  max-width: 150px;
}

.upd-time-specific-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  max-width: 280px;
}

@media (max-width: 1024px) {
  .upd-time-schedule-options {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  .upd-time-panel {
    padding: 14px;
  }

  .upd-time-filter-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    max-width: none;
  }

  .upd-time-history-filter {
    width: 100%;
  }

  .upd-time-filter-row {
    flex-direction: column;
    align-items: stretch;
  }

  .upd-time-filter-actions {
    width: 100%;
    justify-content: flex-end;
    margin-left: 0;
  }

  .upd-time-specific-grid {
    max-width: none;
  }

  .upd-time-workday-select {
    max-width: none;
  }
}
</style>
