<script setup lang="ts">
import PageHero from '@/components/layout/PageHero.vue'
import { useProductList } from '@/composables/useProductList'
import {
  PRODUCT_STATUS_LABEL,
  PRODUCT_STATUS_OPTIONS,
  PRODUCT_TYPE_LABEL,
  PRODUCT_TYPE_OPTIONS,
} from '@/constants/product'
import type { ProductStatus, ProductType } from '@/types/productMgmt'

const { filter, list, isSearching, hasSearched, errorMessage, search, resetFilter } = useProductList()

function productTypeLabel(type: ProductType) {
  return PRODUCT_TYPE_LABEL[type] ?? type
}

function productStatusLabel(status: ProductStatus) {
  return PRODUCT_STATUS_LABEL[status] ?? status
}

const columns = [
  { name: 'code', label: '商品代碼', field: 'code', align: 'left' as const },
  { name: 'name', label: '商品名稱', field: 'name', align: 'left' as const },
  { name: 'productType', label: '類型', field: 'productType', align: 'left' as const },
  { name: 'status', label: '狀態', field: 'status', align: 'left' as const },
  {
    name: 'minSumInsured',
    label: '最低保額',
    field: 'minSumInsured',
    align: 'right' as const,
    format: (v: number) => v.toLocaleString(),
  },
  {
    name: 'maxSumInsured',
    label: '最高保額',
    field: 'maxSumInsured',
    align: 'right' as const,
    format: (v: number) => v.toLocaleString(),
  },
  {
    name: 'createTime',
    label: '建立日',
    field: 'createTime',
    align: 'left' as const,
    format: (v: string) => v ? v.slice(0, 16).replace('T', ' ') : '',
  },
]

const typeOptions = [{ label: '全部', value: '' }, ...PRODUCT_TYPE_OPTIONS]
const statusOptions = [{ label: '全部', value: '' }, ...PRODUCT_STATUS_OPTIONS]
</script>

<template>
  <section class="page-with-hero">
    <PageHero title="商品管理" subtitle="查詢商品列表" />

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
            <div class="col-12 col-md-3">
              <q-input v-model="filter.code" label="商品代碼" dense outlined clearable />
            </div>
            <div class="col-12 col-md-3">
              <q-input v-model="filter.name" label="商品名稱" dense outlined clearable />
            </div>
            <div class="col-12 col-md-2">
              <q-select
                v-model="filter.productType"
                :options="typeOptions"
                label="類型"
                dense outlined emit-value map-options
              />
            </div>
            <div class="col-12 col-md-2">
              <q-select
                v-model="filter.status"
                :options="statusOptions"
                label="狀態"
                dense outlined emit-value map-options
              />
            </div>
            <div class="col-12 col-md-2 flex q-gutter-sm">
              <q-btn color="primary" unelevated label="查詢" icon="search" @click="search" />
              <q-btn flat label="清除" @click="resetFilter" />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <q-banner v-if="errorMessage" rounded class="bg-red-1 text-red-8 q-mb-md">
        {{ errorMessage }}
      </q-banner>

      <q-card v-if="hasSearched && !errorMessage" flat class="page-card">
        <q-card-section>
          <div class="page-card__header q-mb-md">
            <div>
              <p class="page-card__kicker">PRODUCT LIST</p>
              <div class="page-card__title">商品清單</div>
              <p class="page-card__desc">共 {{ list.length }} 筆結果</p>
            </div>
          </div>
          <q-table
            class="app-table"
            :rows="list"
            :columns="columns"
            row-key="code"
            flat bordered
            dense
            :loading="isSearching"
            no-data-label="查無商品"
          >
            <template #body-cell-productType="props">
              <q-td :props="props">
                <q-chip dense size="sm" color="blue-grey-2" text-color="blue-grey-9">
                  {{ productTypeLabel(props.row.productType) }}
                </q-chip>
              </q-td>
            </template>
            <template #body-cell-status="props">
              <q-td :props="props">
                <q-chip
                  dense size="sm"
                  :color="props.row.status === 'active' ? 'positive' : 'grey'"
                  text-color="white"
                >
                  <q-chip
                  dense
                  size="sm"
                  :color="props.row.status === 'active' ? 'positive' : 'grey-5'"
                  text-color="white"
                >
                  {{ productStatusLabel(props.row.status) }}
                </q-chip>
                </q-chip>
              </q-td>
            </template>
            <template #no-data>
              <div class="page-empty">
                <q-icon name="inventory_2" class="page-empty__icon" />
                <div>查無商品</div>
              </div>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </div>
  </section>
</template>