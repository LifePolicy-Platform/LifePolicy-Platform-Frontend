<script setup lang="ts">
import { onMounted, ref, reactive } from 'vue'
import { useQuasar } from 'quasar'
import PageHero from '@/components/layout/PageHero.vue'
import { useProductList } from '@/composables/useProductList'
import {
  PRODUCT_STATUS_LABEL,
  PRODUCT_STATUS_OPTIONS,
  PRODUCT_TYPE_LABEL,
  PRODUCT_TYPE_OPTIONS,
} from '@/constants/product'
import type { ProductListItem, ProductStatus, ProductType } from '@/types/productMgmt'
import {
  activateProduct,
  createProduct,
  deactivateProduct,
  updateProduct,
} from '@/api/product'

const $q = useQuasar()
const { filter, list, isLoading, errorMessage, reload, resetFilter } = useProductList()

onMounted(() => reload())

// ── Dialog ───────────────────────────────────────────────
const dialogOpen = ref(false)
const isEditing = ref(false)
const dialogLoading = ref(false)
const dialogError = ref('')

interface FormState {
  productCode: string
  productName: string
  productType: ProductType | ''
  basePremium: number | null
  minAmount: number | null
  maxAmount: number | null
  minAge: number | null
  maxAge: number | null
  status: ProductStatus | ''
  remark: string
}

function emptyForm(): FormState {
  return {
    productCode: '',
    productName: '',
    productType: '',
    basePremium: null,
    minAmount: null,
    maxAmount: null,
    minAge: null,
    maxAge: null,
    status: 'ACTIVE',
    remark: '',
  }
}

const form = reactive<FormState>(emptyForm())

function openCreate() {
  Object.assign(form, emptyForm())
  isEditing.value = false
  dialogError.value = ''
  dialogOpen.value = true
}

function openEdit(row: ProductListItem) {
  form.productCode = row.productCode
  form.productName = row.productName
  form.productType = row.productType
  form.basePremium = row.basePremium
  form.minAmount = row.minAmount
  form.maxAmount = row.maxAmount
  form.minAge = row.minAge
  form.maxAge = row.maxAge
  form.status = row.status
  form.remark = row.remark ?? ''
  isEditing.value = true
  dialogError.value = ''
  dialogOpen.value = true
}

async function submitForm() {
  dialogLoading.value = true
  dialogError.value = ''
  try {
    if (isEditing.value) {
      await updateProduct(form.productCode, {
        PRODUCT_NAME: form.productName,
        PRODUCT_TYPE: form.productType as string,
        BASE_PREMIUM: form.basePremium!,
        MIN_AMOUNT: form.minAmount!,
        MAX_AMOUNT: form.maxAmount!,
        MIN_AGE: form.minAge!,
        MAX_AGE: form.maxAge!,
        STATUS: form.status as string,
        REMARK: form.remark || undefined,
      })
      $q.notify({ type: 'positive', message: '商品已更新' })
    } else {
      await createProduct({
        PRODUCT_CODE: form.productCode,
        PRODUCT_NAME: form.productName,
        PRODUCT_TYPE: form.productType as string,
        BASE_PREMIUM: form.basePremium!,
        MIN_AMOUNT: form.minAmount!,
        MAX_AMOUNT: form.maxAmount!,
        MIN_AGE: form.minAge!,
        MAX_AGE: form.maxAge!,
        REMARK: form.remark || undefined,
      })
      $q.notify({ type: 'positive', message: '商品已新增' })
    }
    dialogOpen.value = false
    await reload()
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : '操作失敗'
    dialogError.value = msg
  } finally {
    dialogLoading.value = false
  }
}

// ── Status toggle ─────────────────────────────────────────
async function toggleStatus(row: ProductListItem) {
  try {
    if (row.status === 'ACTIVE') {
      await deactivateProduct(row.productCode)
      $q.notify({ type: 'warning', message: `${row.productName} 已停用` })
    } else {
      await activateProduct(row.productCode)
      $q.notify({ type: 'positive', message: `${row.productName} 已啟用` })
    }
    await reload()
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : '操作失敗'
    $q.notify({ type: 'negative', message: msg })
  }
}

// ── Table ─────────────────────────────────────────────────
function productTypeLabel(type: ProductType) {
  return PRODUCT_TYPE_LABEL[type] ?? type
}

function productStatusLabel(status: ProductStatus) {
  return PRODUCT_STATUS_LABEL[status] ?? status
}

const columns = [
  { name: 'productCode', label: '商品代碼', field: 'productCode', align: 'left' as const },
  { name: 'productName', label: '商品名稱', field: 'productName', align: 'left' as const },
  { name: 'productType', label: '類型', field: 'productType', align: 'left' as const },
  { name: 'status', label: '狀態', field: 'status', align: 'left' as const },
  {
    name: 'minAmount',
    label: '最低保額',
    field: 'minAmount',
    align: 'right' as const,
    format: (v: number) => v != null ? v.toLocaleString() : '-',
  },
  {
    name: 'maxAmount',
    label: '最高保額',
    field: 'maxAmount',
    align: 'right' as const,
    format: (v: number) => v != null ? v.toLocaleString() : '-',
  },
  {
    name: 'createTime',
    label: '建立日',
    field: 'createTime',
    align: 'left' as const,
    format: (v: string) => (v ? v.slice(0, 16).replace('T', ' ') : ''),
  },
  { name: 'actions', label: '操作', field: 'actions', align: 'center' as const },
]

const typeOptions = [{ label: '全部', value: '' }, ...PRODUCT_TYPE_OPTIONS]
const statusOptions = [{ label: '全部', value: '' }, ...PRODUCT_STATUS_OPTIONS]
const typeFormOptions = PRODUCT_TYPE_OPTIONS
const statusFormOptions = PRODUCT_STATUS_OPTIONS
</script>

<template>
  <section class="page-with-hero">
    <PageHero title="商品管理" subtitle="查詢、新增、修改商品資料" />

    <div class="page-body">
      <!-- 篩選列 -->
      <q-card flat class="page-card q-mb-md">
        <q-card-section>
          <div class="row q-col-gutter-md items-end">
            <div class="col-12 col-md-3">
              <q-input v-model="filter.productCode" label="商品代碼" dense outlined clearable />
            </div>
            <div class="col-12 col-md-3">
              <q-input v-model="filter.productName" label="商品名稱" dense outlined clearable />
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
            <div class="col-12 col-md-2 flex items-center q-gutter-sm">
              <q-btn color="primary" label="查詢" icon="search" :loading="isLoading" @click="reload" />
              <q-btn flat label="清除" @click="resetFilter" />
              <q-space />
              <q-btn color="teal-7" icon="add" label="新增" no-caps @click="openCreate" />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- 錯誤訊息 -->
      <q-banner v-if="errorMessage" rounded class="bg-red-1 text-red-8 q-mb-md">
        {{ errorMessage }}
      </q-banner>

      <!-- 商品列表 -->
      <q-card flat class="page-card">
        <q-card-section>
          <q-table
            :rows="list"
            :columns="columns"
            row-key="productCode"
            flat bordered
            :loading="isLoading"
            no-data-label="查無商品"
          >
            <template #body-cell-productType="props">
              <q-td :props="props">{{ productTypeLabel(props.row.productType) }}</q-td>
            </template>
            <template #body-cell-status="props">
              <q-td :props="props">
                <q-chip
                  dense size="sm"
                  :color="props.row.status === 'ACTIVE' ? 'positive' : 'grey'"
                  text-color="white"
                >
                  {{ productStatusLabel(props.row.status) }}
                </q-chip>
              </q-td>
            </template>
            <template #body-cell-actions="props">
              <q-td :props="props">
                <div class="q-gutter-xs">
                  <q-btn size="sm" dense color="teal-7" label="修改" no-caps @click="openEdit(props.row)" />
                  <q-btn
                    size="sm" dense no-caps
                    :color="props.row.status === 'ACTIVE' ? 'grey' : 'positive'"
                    :label="props.row.status === 'ACTIVE' ? '停用' : '啟用'"
                    @click="toggleStatus(props.row)"
                  />
                </div>
              </q-td>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </div>

    <!-- 新增 / 修改 Dialog -->
    <q-dialog v-model="dialogOpen" persistent>
      <q-card style="min-width: 520px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ isEditing ? '修改商品' : '新增商品' }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-sm-6">
              <q-input
                v-model="form.productCode"
                label="商品代碼 *"
                dense outlined
                :readonly="isEditing"
                :bg-color="isEditing ? 'grey-2' : undefined"
              />
            </div>
            <div class="col-12 col-sm-6">
              <q-input v-model="form.productName" label="商品名稱 *" dense outlined />
            </div>
            <div class="col-12 col-sm-6">
              <q-select
                v-model="form.productType"
                :options="typeFormOptions"
                label="商品類型 *"
                dense outlined emit-value map-options
              />
            </div>
            <div v-if="isEditing" class="col-12 col-sm-6">
              <q-select
                v-model="form.status"
                :options="statusFormOptions"
                label="狀態 *"
                dense outlined emit-value map-options
              />
            </div>
            <div class="col-12 col-sm-6">
              <q-input v-model.number="form.basePremium" label="基本保費 *" dense outlined type="number" />
            </div>
            <div class="col-12 col-sm-6">
              <q-input v-model.number="form.minAmount" label="最低保額 *" dense outlined type="number" />
            </div>
            <div class="col-12 col-sm-6">
              <q-input v-model.number="form.maxAmount" label="最高保額 *" dense outlined type="number" />
            </div>
            <div class="col-12 col-sm-6">
              <q-input v-model.number="form.minAge" label="最低投保年齡 *" dense outlined type="number" />
            </div>
            <div class="col-12 col-sm-6">
              <q-input v-model.number="form.maxAge" label="最高投保年齡 *" dense outlined type="number" />
            </div>
            <div class="col-12">
              <q-input v-model="form.remark" label="備註" dense outlined type="textarea" :rows="2" />
            </div>
          </div>

          <q-banner v-if="dialogError" rounded class="bg-red-1 text-red-8 q-mt-md">
            {{ dialogError }}
          </q-banner>
        </q-card-section>

        <q-card-section class="row justify-end q-gutter-sm q-pt-none">
          <q-btn flat label="取消" v-close-popup />
          <q-btn
            color="primary"
            :label="isEditing ? '儲存' : '新增'"
            :loading="dialogLoading"
            @click="submitForm"
          />
        </q-card-section>
      </q-card>
    </q-dialog>
  </section>
</template>