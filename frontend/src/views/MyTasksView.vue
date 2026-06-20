<script setup lang="ts">
import { onMounted } from 'vue'
import PageHero from '@/components/layout/PageHero.vue'
import { useMyTasks } from '@/composables/useMyTasks'
import type { TaskStatus } from '@/types/task'
import { TASK_STATUS_LABEL, TASK_STATUS_OPTIONS } from '@/constants/task'

const { filter, filteredTasks, pendingCount, isLoading, search, resetFilter } = useMyTasks()

function taskStatusLabel(status: TaskStatus) {
  return TASK_STATUS_LABEL[status]
}

onMounted(() => {
  search()
})

const columns = [
  { name: 'taskNo', label: '編號', field: 'taskNo', align: 'left' as const },
  { name: 'taskName', label: '案件名稱', field: 'taskName', align: 'left' as const },
  { name: 'status', label: '狀態', field: 'status', align: 'left' as const },
]

const statusOptions = [{ label: '全部', value: '' }, ...TASK_STATUS_OPTIONS]
</script>

<template>
  <section class="page-with-hero">
    <PageHero title="個人待辦案件" :subtitle="`未完成：${pendingCount} 件`" />

    <div class="page-body">
      <q-card flat class="page-card page-card--filter q-mb-md">
        <q-card-section>
          <div class="page-card__header q-mb-sm">
            <div>
              <p class="page-card__kicker">FILTER</p>
              <div class="page-card__title">查詢條件</div>
            </div>
          </div>
          <div class="row q-col-gutter-md items-end">
            <div class="col-12 col-md-4">
              <q-input v-model="filter.keyword" label="關鍵字" dense outlined clearable />
            </div>
            <div class="col-12 col-md-3">
              <q-select
                v-model="filter.status"
                :options="statusOptions"
                label="狀態"
                dense
                outlined
                emit-value
                map-options
              />
            </div>
            <div class="col-12 col-md-3 flex q-gutter-sm">
              <q-btn color="primary" unelevated label="查詢" icon="search" @click="search" />
              <q-btn flat label="清除" @click="resetFilter" />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <q-card flat class="page-card page-card--data">
        <q-card-section>
          <div class="page-card__header q-mb-md">
            <div>
              <p class="page-card__kicker">TASK LIST</p>
              <div class="page-card__title">待辦清單</div>
              <p class="page-card__desc">共 {{ filteredTasks.length }} 筆結果</p>
            </div>
          </div>
          <q-table
            class="app-table"
            :rows="filteredTasks"
            :columns="columns"
            row-key="taskNo"
            flat
            bordered
            dense
            :loading="isLoading"
            no-data-label="尚無待辦事項"
          >
            <template #body-cell-status="props">
              <q-td :props="props">
                <q-chip
                  dense
                  size="sm"
                  :color="props.row.status === 'done' ? 'positive' : props.row.status === 'in_progress' ? 'info' : 'warning'"
                  text-color="white"
                >
                  {{ taskStatusLabel(props.row.status) }}
                </q-chip>
              </q-td>
            </template>
            <template #no-data>
              <div class="page-empty">
                <q-icon name="inbox" class="page-empty__icon" />
                <div>尚無待辦事項</div>
              </div>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </div>
  </section>
</template>
