<template>
  <section class="page-with-hero">
    <PageHero title="理賠管理" subtitle="查詢、新增與修改理賠案件" />

    <div class="page-body">
      <q-card flat class="page-card page-card--filter q-mb-md">
        <q-card-section>
          <div class="page-card__header q-mb-sm">
            <div>
              <p class="page-card__kicker">CLAIM FILTER</p>
              <div class="page-card__title">查詢條件</div>
            </div>
          </div>
          <div class="row q-col-gutter-sm items-end q-mt-sm">
            <div class="col-12 col-sm-4">
              <q-select v-model="filters.status" :options="statusOptions" emit-value map-options label="案件狀態" outlined dense clearable />
            </div>
            <div class="col-12 col-sm-4">
              <q-input v-model="filters.policyNo" label="保單號碼" outlined dense clearable />
            </div>
            <div class="col-12 col-sm-4">
              <q-input
                ref="applyDateInputRef"
                v-model="filters.applyDate"
                type="date"
                label="申請日期"
                outlined
                dense
                stack-label
                clearable
                behavior="menu"
                @click="openDatePicker"
              />
            </div>
          </div>
          <div class="q-mt-md row items-center wrap q-gutter-sm">
            <q-btn color="primary" unelevated icon="search" label="查詢" no-caps :loading="loading" @click="loadData" />
            <q-btn outline color="primary" label="顯示全部" no-caps icon="refresh" @click="resetFilters" />
          </div>
        </q-card-section>
      </q-card>

      <q-card flat class="page-card page-card--data">
        <q-card-section>
          <div class="page-card__header q-mb-md">
            <div>
              <p class="page-card__kicker">CLAIM LIST</p>
              <div class="page-card__title">理賠清單</div>
            </div>
            <q-btn color="primary" unelevated icon="add" label="新增理賠案件" no-caps @click="openDialog(null)" />
          </div>

          <q-table :rows="rows || []" :columns="columns" row-key="claimNo" :loading="loading" flat bordered class="app-table" style="height: auto !important; min-height: auto !important; flex: none !important;">
            <template v-slot:body-cell-claimStatus="props">
              <q-td :props="props">
                <q-badge :color="getStatusColor(props.value)" text-color="white" class="q-pa-xs text-weight-medium">
                  {{ getStatusLabel(props.value) }} 
                </q-badge>
              </q-td>
            </template>

            <template v-slot:body-cell-actions="props">
              <q-td :props="props" class="q-gutter-xs">
                <q-btn size="sm" color="info" flat icon="visibility" label="詳情" @click="viewDetail(props.row)" />
                <q-btn 
                  size="sm" 
                  :color="props.row.claimStatus === 'RETURN' ? 'orange-8' : 'warning'" 
                  flat 
                  icon="edit" 
                  :label="props.row.claimStatus === 'RETURN' ? '補件' : '修改'" 
                  @click="openDialog(props.row)" 
                />
              </q-td>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </div>

    <q-dialog v-model="dialog.show" persistent>
      <q-card style="width: 600px; max-width: 90vw;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-weight-bold">
            {{ dialog.isView ? '理賠案件資料' : dialog.form.claimNo ? '修改理賠資料' : '新增理賠案件' }}
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-md row q-col-gutter-sm">
          <div v-if="dialog.form.claimNo" class="col-6">
            <q-input v-model="dialog.form.claimNo" label="理賠案號" dense outlined readonly bg-color="grey-2" />
          </div>
          <div v-if="dialog.form.claimStatus" class="col-6">
            <q-input v-model="dialog.form.claimStatus" label="目前狀態" dense outlined readonly bg-color="grey-2" />
          </div>

          <!-- 客戶選擇區塊 (🌟 前後端對齊：改用 value 與 label) -->
          <div v-if="!dialog.form.claimNo && !dialog.isView" class="col-12">
            <q-select
              v-model="dialog.form.memberId"
              :options="filteredMemberOptions"
              option-value="value"
              option-label="label"
              emit-value
              map-options
              use-input
              fill-input
              hide-selected
              input-debounce="300"
              label="選擇客戶 (可輸入 ID 或 姓名搜尋)"
              dense
              outlined
              @filter="filterMember"
              @update:model-value="onMemberSelect"
            >
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section>
                    <q-item-label>[{{ scope.opt.value }}] {{ scope.opt.label }}</q-item-label>
                  </q-item-section>
                </q-item>
              </template>
              <template v-slot:selected-item="scope">
                <span v-if="scope.opt">[{{ scope.opt.value }}] {{ scope.opt.label }}</span>
              </template>
            </q-select>
          </div>
          <template v-else>
            <div :class="dialog.form.memberName ? 'col-6' : 'col-12'">
              <q-input v-model.number="dialog.form.memberId" type="number" label="客戶 ID" dense outlined :readonly="dialog.isView" />
            </div>
            <div class="col-6" v-if="dialog.form.memberId || dialog.form.memberName">
              <q-input 
                :model-value="memberNameMap[dialog.form.memberId] || dialog.form.memberName || ''" 
                label="客戶姓名" 
                dense 
                outlined 
                readonly 
                bg-color="blue-1" 
              />
            </div>
          </template>

          <!-- 保單選擇區塊 (🌟 前後端對齊：改用 value 與 label，以及 extra) -->
          <div v-if="!dialog.form.claimNo && !dialog.isView" class="col-12">
            <q-select
              v-if="memberPolicyCount !== 0"
              v-model="dialog.form.policyNo"
              :options="filteredPolicyOptions"
              option-value="value"
              option-label="label"
              emit-value
              map-options
              use-input
              fill-input
              hide-selected
              input-debounce="300"
              label="選擇保單 (可輸入保單號碼或名稱搜尋)"
              dense
              outlined
              @filter="filterPolicyWrap"
              @update:model-value="onPolicySelect"
            >
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section>
                    <q-item-label>[{{ scope.opt.value }}] {{ scope.opt.label }}</q-item-label>
                  </q-item-section>
                </q-item>
              </template>
              <template v-slot:selected-item="scope">
                <span v-if="scope.opt">[{{ scope.opt.value }}] {{ scope.opt.label }}</span>
              </template>
            </q-select>
            <q-input v-else model-value="無" label="選擇保單" dense outlined readonly bg-color="grey-2" />
          </div>
          <template v-else>
            <div class="col-12">
              <q-input v-model="dialog.form.policyNo" label="保單號碼" dense outlined :readonly="dialog.isView" />
            </div>
          </template>

          <!-- 金額欄位 -->
          <div class="col-6">
            <q-input 
              v-model="displayClaimAmount" 
              label="申請理賠金額" 
              dense 
              outlined 
              prefix="$"
              :readonly="dialog.isView" 
            />
          </div>
          <div class="col-6">
            <q-input
              :model-value="displayApproveAmount"
              label="核決理賠金額"
              dense
              outlined
              readonly
              bg-color="grey-2"
            />
          </div>

          <!-- 負責經辦人員 (🌟 對應全域單例 OptionResponse DTO 欄位) -->
          <div class="col-12">
            <q-input
              v-if="dialog.isView"
              :model-value="`[${dialog.form.agentId || ''}] ${dialog.form.agentName || ''}`"
              label="負責經辦人"
              dense
              outlined
              readonly
              bg-color="grey-2"
            />
            <q-select
              v-else
              v-model="dialog.form.agentId"
              :options="agentOptions"
              option-value="value"
              option-label="label"
              emit-value
              map-options
              label="負責經辦人"
              dense
              outlined
              @update:model-value="onAgentSelect"
            >
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section>
                    <q-item-label>[{{ scope.opt.value }}] {{ scope.opt.label }}</q-item-label>
                  </q-item-section>
                </q-item>
              </template>
              <template v-slot:selected-item="scope">
                <span v-if="scope.opt">[{{ scope.opt.value }}] {{ scope.opt.label }}</span>
              </template>
            </q-select>
          </div>

          <div class="col-12" v-if="dialog.form.claimNo || dialog.isView">
            <q-input v-model="dialog.form.updateUser" label="最後異動帳號" dense outlined :readonly="dialog.isView" />
          </div>

          <div class="col-12">
            <q-input v-model="dialog.form.remark" type="textarea" rows="3" label="理賠備註原因" dense outlined :readonly="dialog.isView" />
          </div>

          <!-- 檔案上傳 -->
          <div class="col-12 q-mt-sm" v-if="!dialog.isView">
            <div class="text-subtitle2 text-weight-bold text-grey-8 q-mb-xs">上傳理賠佐證文件</div>
            <div class="row q-col-gutter-sm">
              <div class="col-6">
                <q-btn
                  class="full-width"
                  color="grey-7"
                  outline
                  icon="attach_file"
                  :label="uploading01 ? '上傳中...' : '選擇診斷書'"
                  :loading="uploading01"
                  @click="triggerFileSelect(1)"
                />
                <input ref="file01Input" type="file" accept=".pdf,.jpg,.jpeg,.png" style="display: none" @change="onFileChange($event, 1)" />
                <div v-if="dialog.form.file01Name" class="text-caption text-positive q-mt-xs">✅ 已上傳：{{ dialog.form.file01Name }}</div>
              </div>
              <div class="col-6">
                <q-btn
                  class="full-width"
                  color="grey-7"
                  outline
                  icon="attach_file"
                  :label="uploading02 ? '上傳中...' : '選擇醫療收據'"
                  :loading="uploading02"
                  @click="triggerFileSelect(2)"
                />
                <input ref="file02Input" type="file" accept=".pdf,.jpg,.jpeg,.png" style="display: none" @change="onFileChange($event, 2)" />
                <div v-if="dialog.form.file02Name" class="text-caption text-positive q-mt-xs">✅ 已上傳：{{ dialog.form.file02Name }}</div>
              </div>
            </div>
          </div>

          <div class="col-12 q-mt-md" v-if="dialog.form.file01Path || dialog.form.file02Path || dialog.isView">
            <div class="text-subtitle2 text-weight-bold text-grey-8 q-mb-xs"> 附加理賠佐證文件</div>
            <div class="row q-col-gutter-sm">
              <div class="col-6" v-if="dialog.form.file01Path"><q-btn class="full-width" color="indigo-7" outline icon="picture_as_pdf" :label="dialog.form.file01Name || '診斷書'" @click="viewPdf(dialog.form.file01Path)" /></div>
              <div class="col-6" v-if="dialog.form.file02Path"><q-btn class="full-width" color="indigo-7" outline icon="picture_as_pdf" :label="dialog.form.file02Name || '醫療收據'" @click="viewPdf(dialog.form.file02Path)" /></div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn v-if="!dialog.isView" :label="dialog.form.claimNo ? '取消' : '關閉'" color="grey" v-close-popup />
          <q-btn v-if="!dialog.isView" label="確認儲存" color="primary" :loading="isSubmitting" @click="saveClaim" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </section>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import type { QTableProps } from 'quasar'
import PageHero from '@/components/layout/PageHero.vue'

// 🌟 匯入 Composables
import { useClaimHelpers } from '@/composables/useClaimHelpers'
import { useClaimOptions } from '@/composables/useClaimOptions'

import { 
  fetchClaims, 
  fetchClaimDetail, 
  createClaimApi, 
  updateClaimApi, 
  deleteClaimApi, 
  uploadFileApi,
  type ClaimModel 
} from '@/api/claim'

const $q = useQuasar()
const route = useRoute()
const { formatDate, formatMoney, getStatusColor, getStatusLabel, viewPdf } = useClaimHelpers()
const { 
  memberOptions, policyOptions, agentOptions, 
  filteredMemberOptions, filteredPolicyOptions, 
  preloadOptions, filterMember, filterPolicy 
} = useClaimOptions()

const filters = reactive({ status: '', policyNo: '', applyDate: '' })
const statusOptions = [
  { label: '新件待初審', value: 'SUBMIT' },
  { label: '複審中', value: 'PENDING' },
  { label: '已核准', value: 'APPROVED' },
  { label: '已駁回', value: 'REJECTED' },
  { label: '已被退回須補件', value: 'RETURN' }
]

const loading = ref(false)
const isSubmitting = ref(false)
const rows = ref<ClaimModel[]>([])

// 彈窗雙向金額綁定
const displayClaimAmount = computed({
  get() {
    if (dialog.form.claimAmount === null || dialog.form.claimAmount === undefined) return ''
    return formatMoney(dialog.form.claimAmount)
  },
  set(val: string) {
    const cleanNum = val.replace(/,/g, '').trim()
    dialog.form.claimAmount = cleanNum === '' ? 0 : Number(cleanNum)
  }
})

const displayApproveAmount = computed(() => {
  if (dialog.form.approveAmount === null || dialog.form.approveAmount === undefined) return '尚未核決'
  return `$${formatMoney(dialog.form.approveAmount)}`
})

// 🌟 對應全域單例 OptionResponse DTO 轉換
const memberNameMap = computed(() => {
  const map: Record<number, string> = {}
  memberOptions.value.forEach(m => {
    if (m.value) map[m.value] = m.label
  })
  return map
})

const columns: QTableProps['columns'] = [
  { name: 'claimNo', label: '理賠案號', field: 'claimNo', align: 'left', sortable: true },
  { name: 'policyNo', label: '保單號碼', field: 'policyNo', align: 'left' },
  { name: 'memberName', label: '客戶姓名', field: 'memberName', align: 'left',
    format: (val, row) => memberNameMap.value[row.memberId] || val || '-' },
  { name: 'claimAmount', label: '申請金額', field: 'claimAmount', align: 'right', format: (val: any) => `$${formatMoney(val)}` },
  { name: 'approveAmount', label: '核決金額', field: 'approveAmount', align: 'right', format: (val: any) => val !== null && val !== undefined ? `$${formatMoney(val)}` : '-' },
  { name: 'applyTime', label: '申請日', field: 'applyTime', align: 'right', format: val => formatDate(val) },
  { name: 'claimStatus', label: '狀態', field: 'claimStatus', align: 'center' },
  { name: 'actions', label: '操作', field: 'actions', align: 'center' }
]

const dialog = reactive({ show: false, isView: false, form: {} as any })

watch(() => filters.status, () => { loadData() })

const file01Input = ref<HTMLInputElement | null>(null)
const file02Input = ref<HTMLInputElement | null>(null)
const uploading01 = ref(false)
const uploading02 = ref(false)

const memberPolicyCount = computed(() => {
  if (!dialog.form.memberId) return -1
  // 🌟 DTO 結構下，保單所屬客戶 ID 存在 extra 欄位
  return policyOptions.value.filter(p => p.extra === dialog.form.memberId).length
})

async function loadData() {
  loading.value = true
  try {
    const res = await fetchClaims(filters)
    rows.value = res.DATA
  } catch (err) {
    $q.notify({ type: 'negative', message: '載入理賠清單失敗' })
  } finally {
    loading.value = false
  }
}

function filterPolicyWrap(val: string, update: Function) {
  filterPolicy(val, dialog.form.memberId, update)
}

function onMemberSelect(memberId: number) {
  dialog.form.policyNo = ''
  dialog.form.productName = ''
  filteredPolicyOptions.value = policyOptions.value.filter(p => p.extra === memberId)
}

function onPolicySelect(policyNo: string) {
  const matched = policyOptions.value.find(p => p.value === policyNo)
  if (matched) {
    dialog.form.memberId = matched.extra
    dialog.form.productName = matched.label
  }
}

function triggerFileSelect(slot: 1 | 2) {
  if (slot === 1) file01Input.value?.click()
  else file02Input.value?.click()
}

function onFileChange(event: Event, slot: 1 | 2) {
  const target = event.target as HTMLInputElement
  const file = target.files && target.files[0]
  if (file) handleFileUpload(file, slot)
  target.value = ''
}

async function handleFileUpload(file: File, slot: 1 | 2) {
  if (slot === 1) uploading01.value = true
  else uploading02.value = true
  try {
    const res = await uploadFileApi(file)
    if (res.data && res.data.DATA) {
      if (slot === 1) {
        dialog.form.file01Name = res.data.DATA.fileName
        dialog.form.file01Path = res.data.DATA.filePath
      } else {
        dialog.form.file02Name = res.data.DATA.fileName
        dialog.form.file02Path = res.data.DATA.filePath
      }
      $q.notify({ type: 'positive', message: '檔案上傳成功' })
    }
  } catch (err) {
    $q.notify({ type: 'negative', message: '檔案上傳失敗' })
  } finally {
    if (slot === 1) uploading01.value = false
    else uploading02.value = false
  }
}

function onAgentSelect(agentId: number) {
  const matched = agentOptions.value.find(a => a.value === agentId)
  if (matched) dialog.form.agentName = matched.label
}

function getCurrentUser() {
  try {
    const raw = localStorage.getItem('user')
    if (!raw) return null
    const u = JSON.parse(raw)
    return { agentId: Number(u.USERNAME), agentName: u.DISPLAY_NAME }
  } catch {
    return null
  }
}

const applyDateInputRef = ref<any>(null)
function openDatePicker() {
  const inputEl = applyDateInputRef.value?.$el?.querySelector('input')
  if (inputEl && typeof inputEl.showPicker === 'function') inputEl.showPicker()
}

function resetFilters() {
  filters.status = ''
  filters.policyNo = ''
  filters.applyDate = ''
  loadData()
}

async function openDialog(targetRow: ClaimModel | null) {
  dialog.isView = false
  if (file01Input.value) file01Input.value.value = ''
  if (file02Input.value) file02Input.value.value = ''

  if (targetRow) {
    loading.value = true
    try {
      const res = await fetchClaimDetail(targetRow.claimNo!)
      dialog.form = { ...res.DATA }
    } catch (err) {
      $q.notify({ type: 'negative', message: '無法取得欲修改案件的完整資訊' })
      dialog.form = { ...targetRow }
    } finally {
      loading.value = false
    }
  } else {
    // 📞 新增模式
    await preloadOptions()
    const currentUser = getCurrentUser()

    dialog.form = {
      claimNo: undefined,
      claimStatus: undefined,
      memberId: null,
      policyNo: '',
      claimAmount: 0,
      approveAmount: null,
      agentId: currentUser ? currentUser.agentId : null,
      agentName: currentUser ? currentUser.agentName : '',
      remark: '',
      updateUser: null, // 新增模式不顯示輸入框，固定送 null
      memberName: '',
      productCode: '',
      productName: ''
    }
  }

  dialog.show = true
}

async function viewDetail(row: ClaimModel) {
  try {
    const res = await fetchClaimDetail(row.claimNo!)
    dialog.form = res.DATA
    dialog.isView = true
    dialog.show = true
  } catch (err) {
    $q.notify({ type: 'negative', message: '無法取得該案詳細資訊' })
  }
}

async function saveClaim() {
  if (!dialog.form.policyNo || !dialog.form.memberId) {
    $q.notify({ type: 'warning', message: '請填寫保單號碼與客戶ID' })
    return
  }
  if (!dialog.form.claimAmount || Number(dialog.form.claimAmount) <= 0) {
    $q.notify({ type: 'warning', message: '申請理賠金額必須大於 0' })
    return
  }
  if (!dialog.form.remark || !dialog.form.remark.trim()) {
    $q.notify({ type: 'warning', message: '請填寫理賠備註原因' })
    return
  }

  if (isSubmitting.value) return
  isSubmitting.value = true

  // 補件重送機制
  if (dialog.form.claimNo && dialog.form.claimStatus === 'RETURN') {
    $q.dialog({
      title: '重新送審提示',
      message: '若確認進行儲存補件，案件狀態將重設為「新件待審 (SUBMIT)」並重新提交審核，是否確定？',
      cancel: { label: '取消修改', color: 'grey' },
      ok: { label: '確定送審', color: 'primary' },
      persistent: true
    }).onOk(async () => {
      try {
        dialog.form.claimStatus = 'SUBMIT'
        await updateClaimApi(dialog.form.claimNo, dialog.form)
        $q.notify({ type: 'positive', message: '修改成功，已重新提交審核！' })
        dialog.show = false
        loadData()
      } catch (err) {
        $q.notify({ type: 'negative', message: '儲存理賠案件時發生錯誤' })
      } finally {
        isSubmitting.value = false
      }
    }).onCancel(() => {
      isSubmitting.value = false
    })
    return
  }

  try {
    if (dialog.form.claimNo) {
      await updateClaimApi(dialog.form.claimNo, dialog.form)
      $q.notify({ type: 'positive', message: '修改成功！' })
    } else {
      const now = new Date()
      const expiry = new Date()
      expiry.setDate(now.getDate() + 15)

      const formatJavaDateTime = (date: Date) => {
        const pad = (num: number) => String(num).padStart(2, '0')
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T` +
               `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
      }

      const cleanForm = {
        memberId: Number(dialog.form.memberId),
        policyNo: dialog.form.policyNo,
        claimAmount: Number(dialog.form.claimAmount) || 0,
        approveAmount: null,
        agentId: dialog.form.agentId ? Number(dialog.form.agentId) : null,
        remark: dialog.form.remark || '',
        updateUser: null,
        claimStatus: 'SUBMIT',
        applyTime: formatJavaDateTime(now),
        expiryTime: formatJavaDateTime(expiry),
        file01Name: dialog.form.file01Name || null,
        file01Path: dialog.form.file01Path || null,
        file02Name: dialog.form.file02Name || null,
        file02Path: dialog.form.file02Path || null
      } as any

      await createClaimApi(cleanForm)
      $q.notify({ type: 'positive', message: '新增案件成功！' })
    }
    dialog.show = false
    loadData()
  } catch (err) {
    $q.notify({ type: 'negative', message: '儲存理賠案件時發生錯誤' })
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  const queryPolicyNo = route.query.policyNo
  if (queryPolicyNo && typeof queryPolicyNo === 'string') {
    filters.policyNo = queryPolicyNo
  }
  loadData()
  preloadOptions()
})

watch(
  () => route.query.policyNo,
  (policyNo) => {
    if (typeof policyNo === 'string' && policyNo.trim()) {
      filters.policyNo = policyNo.trim()
      loadData()
    }
  }
)
</script>