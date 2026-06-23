<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useAuthStore } from '@/stores/auth'
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
const authStore = useAuthStore()
const isAdmin = computed(() => authStore.roles.includes('ADMIN'))
const { filter, list, isLoading, errorMessage, reload, resetFilter } = useProductList()

onMounted(() => reload())

const activeCount = computed(() => list.value.filter((row) => row.status === 'ACTIVE').length)
const inactiveCount = computed(() => list.value.filter((row) => row.status === 'INACTIVE').length)

// ── Dialog ───────────────────────────────────────────────
const dialogOpen = ref(false)
const isEditing = ref(false)
const dialogLoading = ref(false)
const dialogError = ref('')

const fieldErrors = reactive({
  productCode: '',
  productName: '',
  productType: '',
  basePremium: '',
  minAmount: '',
  maxAmount: '',
  minAge: '',
  maxAge: '',
})

function clearFieldErrors() {
  Object.assign(fieldErrors, {
    productCode: '', productName: '', productType: '',
    basePremium: '', minAmount: '', maxAmount: '', minAge: '', maxAge: '',
  })
}

function validate(): boolean {
  clearFieldErrors()
  let ok = true

  if (!isEditing.value && !form.productCode.trim()) {
    fieldErrors.productCode = '必填'; ok = false
  }
  if (!form.productName.trim()) {
    fieldErrors.productName = '必填'; ok = false
  }
  if (!form.productType) {
    fieldErrors.productType = '必填'; ok = false
  }
  if (form.basePremium == null || form.basePremium <= 0) {
    fieldErrors.basePremium = '需大於 0'; ok = false
  }
  if (form.minAmount == null || form.minAmount < 1) {
    fieldErrors.minAmount = '需大於等於 1'; ok = false
  }
  if (form.maxAmount == null || form.maxAmount < 1) {
    fieldErrors.maxAmount = '需大於等於 1'; ok = false
  }
  if (form.minAmount != null && form.maxAmount != null && form.minAmount > form.maxAmount) {
    fieldErrors.minAmount = '不可大於最高保額'; fieldErrors.maxAmount = '不可小於最低保額'; ok = false
  }
  if (form.minAge == null || form.minAge < 0 || form.minAge > 99) {
    fieldErrors.minAge = '需介於 0~99'; ok = false
  }
  if (form.maxAge == null || form.maxAge < 0 || form.maxAge > 99) {
    fieldErrors.maxAge = '需介於 0~99'; ok = false
  }
  if (form.minAge != null && form.maxAge != null && form.minAge > form.maxAge) {
    fieldErrors.minAge = '不可大於最高年齡'; fieldErrors.maxAge = '不可小於最低年齡'; ok = false
  }

  return ok
}

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
  clearFieldErrors()
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
  clearFieldErrors()
  dialogOpen.value = true
}

async function submitForm() {
  if (!validate()) return
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
    const axErr = err as { response?: { data?: { MESSAGE?: string } }; message?: string }
    const msg = axErr?.response?.data?.MESSAGE ?? (err instanceof Error ? err.message : '操作失敗')
    if (msg === 'Product code already exists') {
      fieldErrors.productCode = '商品代碼已存在'
    } else if (msg === 'Product name already exists') {
      fieldErrors.productName = '商品名稱已存在'
    } else {
      dialogError.value = msg
    }
  } finally {
    dialogLoading.value = false
  }
}

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

// ── Display helpers ───────────────────────────────────────
function productTypeLabel(type: ProductType) {
  return PRODUCT_TYPE_LABEL[type] ?? type
}

function productStatusLabel(status: ProductStatus) {
  return PRODUCT_STATUS_LABEL[status] ?? status
}

const PRODUCT_TYPE_COLOR: Record<ProductType, string> = {
  LIFE: 'teal-6',
  HEALTH: 'blue-6',
  ACCIDENT: 'orange-7',
  ANNUITY: 'purple-6',
  TRAVEL: 'cyan-7',
}

function productTypeColor(type: ProductType) {
  return PRODUCT_TYPE_COLOR[type] ?? 'blue-grey-5'
}

function productStatusColor(status: ProductStatus) {
  return status === 'ACTIVE' ? 'positive' : 'grey-6'
}

function formatCurrency(value: number | null | undefined): string {
  if (value == null) return '—'
  return value.toLocaleString('zh-TW')
}

function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—'
  return value.slice(0, 16).replace('T', ' ')
}

function formatRange(min: number | null | undefined, max: number | null | undefined, unit = ''): string {
  if (min == null && max == null) return '—'
  return `${formatCurrency(min)} ~ ${formatCurrency(max)}${unit}`
}

const columns = [
  { name: 'productCode', label: '商品代碼', field: 'productCode', align: 'left' as const, sortable: true },
  { name: 'productName', label: '商品名稱', field: 'productName', align: 'left' as const, sortable: true },
  { name: 'productType', label: '類型', field: 'productType', align: 'left' as const },
  { name: 'basePremium', label: '基本保費', field: 'basePremium', align: 'right' as const },
  { name: 'amountRange', label: '保額區間', field: 'minAmount', align: 'right' as const },
  { name: 'ageRange', label: '投保年齡', field: 'minAge', align: 'center' as const },
  { name: 'status', label: '狀態', field: 'status', align: 'center' as const },
  { name: 'createTime', label: '建立日', field: 'createTime', align: 'left' as const, sortable: true },
  { name: 'actions', label: '操作', field: 'actions', align: 'center' as const },
]

const typeOptions = [{ label: '全部', value: '' }, ...PRODUCT_TYPE_OPTIONS]
const statusOptions = [{ label: '全部', value: '' }, ...PRODUCT_STATUS_OPTIONS]
const typeFormOptions = PRODUCT_TYPE_OPTIONS
const statusFormOptions = PRODUCT_STATUS_OPTIONS
</script>

<template>
  <section class="page-with-hero product-list-page">
    <PageHero title="商品管理" subtitle="查詢、新增、修改商品資料" />

    <div class="page-body">
      <!-- 篩選列 -->
      <q-card flat class="page-card page-card--filter q-mb-md">
        <q-card-section>
          <div class="page-card__header q-mb-sm">
            <div>
              <p class="page-card__kicker">PRODUCT FILTER</p>
              <div class="page-card__title">查詢條件</div>
              <p class="page-card__desc">可依代碼、名稱、類型或狀態篩選商品</p>
            </div>
          </div>

          <div class="product-filter-grid q-mt-md">
            <q-input
              v-model="filter.productCode"
              label="商品代碼"
              outlined
              dense
              clearable
              placeholder="輸入代碼關鍵字"
            />
            <q-input
              v-model="filter.productName"
              label="商品名稱"
              outlined
              dense
              clearable
              placeholder="輸入名稱關鍵字"
            />
            <q-select
              v-model="filter.productType"
              :options="typeOptions"
              label="商品類型"
              outlined
              dense
              emit-value
              map-options
            />
            <q-select
              v-model="filter.status"
              :options="statusOptions"
              label="上架狀態"
              outlined
              dense
              emit-value
              map-options
            />
          </div>

          <div class="q-mt-md row items-center wrap q-gutter-sm">
            <q-btn
              color="primary"
              unelevated
              label="執行查詢"
              no-caps
              icon="search"
              :loading="isLoading"
              @click="reload"
            />
            <q-btn
              outline
              color="primary"
              label="清空條件"
              no-caps
              icon="refresh"
              @click="resetFilter"
            />
          </div>
        </q-card-section>
      </q-card>

      <q-banner v-if="errorMessage" rounded class="bg-red-1 text-red-8 q-mb-md">
        <template #avatar>
          <q-icon name="error_outline" color="red-8" />
        </template>
        {{ errorMessage }}
      </q-banner>

      <!-- 商品列表 -->
      <q-card flat class="page-card page-card--data">
        <q-card-section>
          <div class="page-card__header q-mb-md">
            <div>
              <p class="page-card__kicker">PRODUCT LIST</p>
              <div class="page-card__title">商品清單</div>
              <p class="page-card__desc">共 {{ list.length }} 筆結果</p>
            </div>
            <div class="product-list-toolbar">
              <div class="product-list-stats" aria-label="商品狀態統計">
                <q-chip dense size="sm" color="positive" text-color="white" icon="check_circle">
                  上架 {{ activeCount }}
                </q-chip>
                <q-chip dense size="sm" color="grey-5" text-color="white" icon="pause_circle">
                  下架 {{ inactiveCount }}
                </q-chip>
              </div>
              <q-btn
                v-if="isAdmin"
                color="primary"
                unelevated
                icon="add"
                label="新增商品"
                no-caps
                @click="openCreate"
              />
            </div>
          </div>

          <q-table
            class="app-table product-list-table"
            :rows="list"
            :columns="columns"
            row-key="productCode"
            flat
            bordered
            dense
            :loading="isLoading"
            hide-pagination
            :rows-per-page-options="[0]"
            no-data-label="查無符合條件的商品"
          >
            <template #body-cell-productCode="props">
              <q-td :props="props">
                <span class="product-code">{{ props.row.productCode }}</span>
              </q-td>
            </template>

            <template #body-cell-productName="props">
              <q-td :props="props">
                <div class="product-name-cell">
                  <span class="product-name-cell__title">{{ props.row.productName }}</span>
                  <span v-if="props.row.remark" class="product-name-cell__remark">{{ props.row.remark }}</span>
                </div>
              </q-td>
            </template>

            <template #body-cell-productType="props">
              <q-td :props="props">
                <q-chip
                  dense
                  size="sm"
                  :color="productTypeColor(props.row.productType)"
                  text-color="white"
                >
                  {{ productTypeLabel(props.row.productType) }}
                </q-chip>
              </q-td>
            </template>

            <template #body-cell-basePremium="props">
              <q-td :props="props" class="text-right">
                <span class="product-amount">{{ formatCurrency(props.row.basePremium) }}</span>
              </q-td>
            </template>

            <template #body-cell-amountRange="props">
              <q-td :props="props" class="text-right">
                <span class="product-amount product-amount--muted">
                  {{ formatRange(props.row.minAmount, props.row.maxAmount) }}
                </span>
              </q-td>
            </template>

            <template #body-cell-ageRange="props">
              <q-td :props="props" class="text-center">
                {{ props.row.minAge }} ~ {{ props.row.maxAge }} 歲
              </q-td>
            </template>

            <template #body-cell-status="props">
              <q-td :props="props" class="text-center">
                <q-chip
                  dense
                  size="sm"
                  :color="productStatusColor(props.row.status)"
                  text-color="white"
                >
                  {{ productStatusLabel(props.row.status) }}
                </q-chip>
              </q-td>
            </template>

            <template #body-cell-createTime="props">
              <q-td :props="props">
                {{ formatDateTime(props.row.createTime) }}
              </q-td>
            </template>

            <template #body-cell-actions="props">
              <q-td :props="props">
                <div class="product-actions">
                  <q-btn
                    size="sm"
                    flat
                    dense
                    no-caps
                    color="primary"
                    icon="edit"
                    label="修改"
                    @click="openEdit(props.row)"
                  />
                  <q-btn
                    size="sm"
                    flat
                    dense
                    no-caps
                    :color="props.row.status === 'ACTIVE' ? 'grey-7' : 'positive'"
                    :icon="props.row.status === 'ACTIVE' ? 'block' : 'check_circle'"
                    :label="props.row.status === 'ACTIVE' ? '停用' : '啟用'"
                    @click="toggleStatus(props.row)"
                  />
                </div>
              </q-td>
            </template>

            <template #no-data>
              <div class="product-empty">
                <q-icon name="inventory_2" size="40px" color="grey-5" />
                <p>查無符合條件的商品</p>
                <q-btn
                  v-if="isAdmin"
                  outline
                  color="primary"
                  label="新增第一筆商品"
                  no-caps
                  icon="add"
                  @click="openCreate"
                />
              </div>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </div>

    <!-- 新增 / 修改 Dialog -->
    <q-dialog v-model="dialogOpen" persistent>
      <q-card class="product-dialog">
        <q-card-section class="product-dialog__header">
          <div>
            <p class="product-dialog__kicker">{{ isEditing ? 'EDIT PRODUCT' : 'NEW PRODUCT' }}</p>
            <div class="text-h6">{{ isEditing ? '修改商品' : '新增商品' }}</div>
            <p class="product-dialog__desc">
              {{ isEditing ? '更新商品設定後將立即套用至投保申請' : '建立新商品後即可於投保申請中選用' }}
            </p>
          </div>
          <q-btn icon="close" flat round dense v-close-popup aria-label="關閉" />
        </q-card-section>

        <q-separator />

        <q-card-section class="product-dialog__body">
          <p class="page-form-section__title">基本資料</p>
          <div class="page-form-grid q-mb-md">
            <q-input
              v-model="form.productCode"
              label="商品代碼 *"
              dense
              outlined
              stack-label
              :readonly="isEditing"
              :bg-color="isEditing ? 'grey-2' : undefined"
              :hint="fieldErrors.productCode ? '' : '建立後不可修改'"
              :error="!!fieldErrors.productCode"
              :error-message="fieldErrors.productCode"
            />
            <q-input
              v-model="form.productName"
              label="商品名稱 *"
              dense
              outlined
              stack-label
              :error="!!fieldErrors.productName"
              :error-message="fieldErrors.productName"
            />
            <q-select
              v-model="form.productType"
              :options="typeFormOptions"
              label="商品類型 *"
              dense
              outlined
              emit-value
              map-options
              :error="!!fieldErrors.productType"
              :error-message="fieldErrors.productType"
            />
            <q-select
              v-if="isEditing"
              v-model="form.status"
              :options="statusFormOptions"
              label="上架狀態 *"
              dense
              outlined
              emit-value
              map-options
            />
          </div>

          <p class="page-form-section__title">保費與保額</p>
          <div class="page-form-grid q-mb-md">
            <q-input
              v-model.number="form.basePremium"
              label="基本保費 *"
              dense
              outlined
              stack-label
              type="number"
              min="0"
              :error="!!fieldErrors.basePremium"
              :error-message="fieldErrors.basePremium"
            />
            <div class="product-dialog__spacer" aria-hidden="true" />
            <q-input
              v-model.number="form.minAmount"
              label="最低保額 *"
              dense
              outlined
              stack-label
              type="number"
              min="0"
              :error="!!fieldErrors.minAmount"
              :error-message="fieldErrors.minAmount"
            />
            <q-input
              v-model.number="form.maxAmount"
              label="最高保額 *"
              dense
              outlined
              stack-label
              type="number"
              min="0"
              :error="!!fieldErrors.maxAmount"
              :error-message="fieldErrors.maxAmount"
            />
          </div>

          <p class="page-form-section__title">投保年齡</p>
          <div class="page-form-grid q-mb-md">
            <q-input
              v-model.number="form.minAge"
              label="最低投保年齡 *"
              dense
              outlined
              stack-label
              type="number"
              min="0"
              suffix="歲"
              :error="!!fieldErrors.minAge"
              :error-message="fieldErrors.minAge"
            />
            <q-input
              v-model.number="form.maxAge"
              label="最高投保年齡 *"
              dense
              outlined
              stack-label
              type="number"
              min="0"
              suffix="歲"
              :error="!!fieldErrors.maxAge"
              :error-message="fieldErrors.maxAge"
            />
          </div>

          <p class="page-form-section__title">其他</p>
          <q-input
            v-model="form.remark"
            label="備註"
            dense
            outlined
            type="textarea"
            autogrow
            :rows="2"
            hint="選填，將顯示於商品名稱下方"
          />

        </q-card-section>

        <q-separator />

        <q-card-actions class="product-dialog__actions">
          <span v-if="dialogError" class="dialog-error-msg">
            <q-icon name="error_outline" size="16px" />
            {{ dialogError }}
          </span>
          <q-space />
          <q-btn flat label="取消" no-caps v-close-popup />
          <q-btn
            color="primary"
            unelevated
            no-caps
            :label="isEditing ? '儲存變更' : '建立商品'"
            :loading="dialogLoading"
            @click="submitForm"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </section>
</template>

<style scoped>
.product-list-page {
  --product-accent: #38a169;
}

.product-filter-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.product-list-toolbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.product-list-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.product-list-table :deep(thead tr) {
  background: #f7fafc;
}

.product-list-table :deep(.q-table thead th) {
  font-weight: 700;
  color: #2d3748;
  white-space: nowrap;
}

.product-code {
  font-family: ui-monospace, 'Cascadia Code', 'Consolas', monospace;
  font-size: 0.84rem;
  font-weight: 600;
  color: #2d3748;
  letter-spacing: 0.02em;
}

.product-name-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.product-name-cell__title {
  font-weight: 600;
  color: #1a202c;
}

.product-name-cell__remark {
  font-size: 0.78rem;
  color: #718096;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 220px;
}

.product-amount {
  font-variant-numeric: tabular-nums;
  font-weight: 600;
}

.product-amount--muted {
  font-weight: 500;
  color: #4a5568;
}

.product-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 4px;
}

.product-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 40px 16px;
  color: #718096;
}

.product-empty p {
  margin: 0;
}

.product-dialog {
  width: min(640px, 92vw);
  max-width: 92vw;
}

.product-dialog__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.product-dialog__kicker {
  margin: 0 0 4px;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  color: var(--product-accent);
}

.product-dialog__desc {
  margin: 4px 0 0;
  font-size: 0.875rem;
  color: #718096;
}

.product-dialog__body {
  max-height: min(70vh, 640px);
  overflow-y: auto;
}

.product-dialog__actions {
  padding: 12px 16px;
}

.dialog-error-msg {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #c53030;
  font-size: 0.85rem;
}

.product-dialog__spacer {
  display: none;
}

@media (min-width: 761px) {
  .product-dialog__spacer {
    display: block;
  }
}

@media (max-width: 1024px) {
  .product-filter-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .product-filter-grid {
    grid-template-columns: 1fr;
  }

  .product-list-toolbar {
    width: 100%;
    justify-content: space-between;
  }

  .product-name-cell__remark {
    max-width: 160px;
  }
}
</style>
