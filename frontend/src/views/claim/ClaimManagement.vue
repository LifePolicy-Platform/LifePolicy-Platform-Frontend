<template>
  <div class="q-pa-md bg-grey-1">
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h5 text-weight-bold text-primary">理賠管理</div>
      <q-btn color="primary" icon="add" label="新增理賠案件" @click="openDialog(null)" />
    </div>

    <q-card class="q-mb-md flat bordered">
      <q-card-section class="row q-col-gutter-sm items-center">
        <div class="col-12 col-sm-3">
          <q-select v-model="filters.status" :options="statusOptions" emit-value map-options label="案件狀態" outlined dense clearable />
        </div>
        <div class="col-12 col-sm-3">
          <q-input v-model="filters.policyNo" label="保單號碼" outlined dense clearable />
        </div>
        <div class="col-12 col-sm-3">
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
        <div class="col-12 col-sm-3">
          <q-btn color="secondary" icon="search" label="查詢" class="q-mr-sm" @click="loadData" />
          <q-btn color="grey-6" label="顯示全部" @click="resetFilters" />
        </div>
      </q-card-section>
    </q-card>

    <q-table :rows="rows || []" :columns="columns" row-key="claimNo" :loading="loading" flat bordered class="bg-white">
      <template v-slot:body-cell-claimStatus="props">
        <q-td :props="props">
          <q-badge :color="getStatusColor(props.value)" text-color="white" class="q-pa-xs text-weight-medium">
            {{ props.value }}
          </q-badge>
        </q-td>
      </template>

      <template v-slot:body-cell-actions="props">
        <q-td :props="props" class="q-gutter-xs">
          <q-btn size="sm" color="info" flat icon="visibility" label="詳情" @click="viewDetail(props.row)" />
          <q-btn size="sm" color="warning" flat icon="edit" label="修改" @click="openDialog(props.row)" />
          <!-- <q-btn size="sm" color="negative" flat icon="delete" label="刪除" :disabled="props.row.claimStatus !== 'PENDING'" @click="confirmDelete(props.row.claimNo)" /> -->
        </q-td>
      </template>
    </q-table>

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

          <!-- 客戶選擇區塊：新增模式下為下拉搜尋選單，詳情/修改模式下維持原樣 -->
          <div v-if="!dialog.form.claimNo && !dialog.isView" class="col-12">
            <q-select
              v-model="dialog.form.memberId"
              :options="filteredMemberOptions"
              option-value="memberId"
              option-label="name"
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
                    <q-item-label>[{{ scope.opt.memberId }}] {{ scope.opt.name }}</q-item-label>
                  </q-item-section>
                </q-item>
              </template>
              <template v-slot:selected-item="scope">
                <span v-if="scope.opt">[{{ scope.opt.memberId }}] {{ scope.opt.name }}</span>
              </template>
            </q-select>
          </div>
          <template v-else>
            <div :class="dialog.form.memberName ? 'col-6' : 'col-12'">
              <q-input v-model.number="dialog.form.memberId" type="number" label="客戶 ID" dense outlined :readonly="dialog.isView" />
            </div>
            <!-- 修改後：優先透過 ID 從 preloaded Map 中抓取正確真實姓名 -->
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

          <!-- 保單選擇區塊：新增模式下為下拉搜尋選單，詳情/修改模式下維持原樣 -->
          <div v-if="!dialog.form.claimNo && !dialog.isView" class="col-12">
            <q-select
              v-if="memberPolicyCount !== 0"
              v-model="dialog.form.policyNo"
              :options="filteredPolicyOptions"
              option-value="policyNo"
              option-label="productName"
              emit-value
              map-options
              use-input
              fill-input
              hide-selected
              input-debounce="300"
              label="選擇保單 (可輸入保單號碼或名稱搜尋)"
              dense
              outlined
              @filter="filterPolicy"
              @update:model-value="onPolicySelect"
            >
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section>
                    <q-item-label>[{{ scope.opt.policyNo }}] {{ scope.opt.productName }}</q-item-label>
                  </q-item-section>
                </q-item>
              </template>
              <template v-slot:selected-item="scope">
                <span v-if="scope.opt">[{{ scope.opt.policyNo }}] {{ scope.opt.productName }}</span>
              </template>
            </q-select>
            <q-input v-else model-value="無" label="選擇保單" dense outlined readonly bg-color="grey-2" />
          </div>
          <template v-else>
            <div class="col-12">
              <q-input v-model="dialog.form.policyNo" label="保單號碼" dense outlined :readonly="dialog.isView" />
            </div>
          </template>

          <!-- 原本的兩個金額欄位，替換為以下代碼 -->
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

          <!-- 經辦人員區塊：新增模式下為下拉選單(預設帶入登入者)，詳情/修改模式下維持原樣 -->
          <!-- <div :class="displayedAgentName ? 'col-6' : 'col-12'">
            <q-select
              v-if="!dialog.form.claimNo && !dialog.isView"
              v-model="dialog.form.agentId"
              :options="agentOptions"
              option-value="agentId"
              option-label="agentName"
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
                    <q-item-label>[{{ scope.opt.agentId }}] {{ scope.opt.agentName }}</q-item-label>
                  </q-item-section>
                </q-item>
              </template>
              <template v-slot:selected-item="scope">
                <span v-if="scope.opt">[{{ scope.opt.agentId }}] {{ scope.opt.agentName }}</span>
                <span v-else-if="dialog.form.agentId">[{{ dialog.form.agentId }}] {{ dialog.form.agentName }}</span>
              </template>
            </q-select>
            <q-input
              v-else
              v-model.number="dialog.form.agentId"
              type="number"
              label="經辦人員 ID"
              dense
              outlined
              :readonly="dialog.isView"
            />
          </div> -->

          <!-- 經辦人員選擇區塊 -->
<div class="col-12">
  <!-- 模式一：檢視模式 (唯讀顯示 [ID] 姓名) -->
  <q-input
    v-if="dialog.isView"
    :model-value="`[${dialog.form.agentId || ''}] ${dialog.form.agentName || ''}`"
    label="負責經辦人"
    dense
    outlined
    readonly
    bg-color="grey-2"
  />
  
  <!-- 模式二：新增/修改模式 (下拉選單) -->
  <q-select
    v-else
    v-model="dialog.form.agentId"
    :options="agentOptions"
    option-value="agentId"
    option-label="agentName"
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
          <q-item-label>[{{ scope.opt.agentId }}] {{ scope.opt.agentName }}</q-item-label>
        </q-item-section>
      </q-item>
    </template>
    <template v-slot:selected-item="scope">
      <span v-if="scope.opt">[{{ scope.opt.agentId }}] {{ scope.opt.agentName }}</span>
    </template>
  </q-select>
</div>

          <!-- <div class="col-6" v-if="displayedAgentName">
            <q-input :model-value="displayedAgentName" label="負責經辦人" dense outlined readonly bg-color="orange-1" />
          </div> -->

          <!-- 最後異動帳號：新增模式不顯示，預設送 null -->
          <div class="col-12" v-if="dialog.form.claimNo || dialog.isView">
            <q-input v-model="dialog.form.updateUser" label="最後異動帳號" dense outlined :readonly="dialog.isView" />
          </div>

          <div class="col-12">
            <q-input v-model="dialog.form.remark" type="textarea" rows="3" label="理賠備註原因" dense outlined :readonly="dialog.isView" />
          </div>

          <!-- 上傳佐證文件區塊：新增/修改可上傳或替換，詳情模式不顯示上傳元件 -->
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
                <input
                  ref="file01Input"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  style="display: none"
                  @change="onFileChange($event, 1)"
                />
                <div v-if="dialog.form.file01Name" class="text-caption text-positive q-mt-xs">
                  ✅ 已上傳：{{ dialog.form.file01Name }}
                </div>
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
                <input
                  ref="file02Input"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  style="display: none"
                  @change="onFileChange($event, 2)"
                />
                <div v-if="dialog.form.file02Name" class="text-caption text-positive q-mt-xs">
                  ✅ 已上傳：{{ dialog.form.file02Name }}
                </div>
              </div>
            </div>
          </div>

          <div class="col-12 q-mt-md" v-if="dialog.form.file01Path || dialog.form.file02Path || dialog.isView">
            <div class="text-subtitle2 text-weight-bold text-grey-8 q-mb-xs"> 附加理賠佐證文件</div>
            <div class="row q-col-gutter-sm">
              <div class="col-6" v-if="dialog.form.file01Path">
                <q-btn class="full-width" color="indigo-7" outline icon="picture_as_pdf" :label="dialog.form.file01Name || '診斷書'" @click="viewPdf(dialog.form.file01Path)" />
              </div>
              <div class="col-6" v-if="dialog.form.file02Path">
                <q-btn class="full-width" color="indigo-7" outline icon="picture_as_pdf" :label="dialog.form.file02Name || '醫療收據'" @click="viewPdf(dialog.form.file02Path)" />
              </div>
              <div v-if="!dialog.form.file01Path && !dialog.form.file02Path" class="col-12 text-grey-6 text-caption text-center q-pa-sm bg-grey-2 rounded-borders">
                本案暫無附帶任何電子文件
              </div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn
            v-if="!dialog.isView"
            :label="dialog.form.claimNo ? '取消' : '關閉'"
            color="grey"
            v-close-popup
          />
          <q-btn v-if="!dialog.isView" label="確認儲存" color="primary" :loading="isSubmitting" @click="saveClaim" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import type { QTableProps } from 'quasar'
import axios from 'axios'
import { watch } from 'vue'

// 將原本的 import axios 替換成這些 API 匯入
import { 
  fetchClaims, 
  fetchClaimDetail, 
  createClaimApi, 
  updateClaimApi, 
  deleteClaimApi, 
  fetchMemberOptions, 
  fetchPolicyOptions, 
  fetchAgentOptions, 
  uploadFileApi,
  type ClaimModel 
} from '@/api/claim'

const $q = useQuasar()

const filters = reactive({ status: '', policyNo: '', applyDate: '' })
const statusOptions = [
  { label: '最新案件待處理 (SUBMIT)', value: 'SUBMIT' },
  { label: '審核中 (PENDING)', value: 'PENDING' },
  { label: '已結案-核准 (APPROVED)', value: 'APPROVED' },
  { label: '已結案-駁回 (REJECTED)', value: 'REJECTED' },
  { label: '已被撤回須補件 (RETURN)', value: 'RETURN' }
]

const loading = ref(false)
const isSubmitting = ref(false)
const rows = ref<ClaimModel[]>([])

// 日期格式化小工具
function formatDate(dateStr: any) {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

// 新增：千分位轉換工具
function formatMoney(val: any) {
  if (val === null || val === undefined || isNaN(Number(val))) return '0'
  return Number(val).toLocaleString('en-US')
}

// 新增：彈窗「申請理賠金額」雙向千分位綁定
const displayClaimAmount = computed({
  get() {
    if (dialog.form.claimAmount === null || dialog.form.claimAmount === undefined) return ''
    return formatMoney(dialog.form.claimAmount)
  },
  set(val: string) {
    // 移除非數字的逗號
    const cleanNum = val.replace(/,/g, '').trim()
    if (cleanNum === '') {
      dialog.form.claimAmount = 0
    } else {
      const parsed = Number(cleanNum)
      dialog.form.claimAmount = isNaN(parsed) ? 0 : parsed
    }
  }
})

// 新增：彈窗「核決金額」唯讀千分位顯示
const displayApproveAmount = computed(() => {
  if (dialog.form.approveAmount === null || dialog.form.approveAmount === undefined) return '尚未核決'
  return `$${formatMoney(dialog.form.approveAmount)}`
})

// 新增：客戶 ID 對照真實真實姓名的 Lookup Map
const memberNameMap = computed(() => {
  const map: Record<number, string> = {}
  memberOptions.value.forEach(m => {
    if (m.memberId) {
      // 優先取用正確的 name 欄位
      map[m.memberId] = m.name || m.username || ''
    }
  })
  return map
})

const columns: QTableProps['columns'] = [
  { name: 'claimNo', label: '理賠案號', field: 'claimNo', align: 'left', sortable: true },
  { name: 'policyNo', label: '保單號碼', field: 'policyNo', align: 'left' },
  { name: 'memberName', label: '客戶姓名', field: 'memberName', align: 'left',
    format: (val, row) => memberNameMap.value[row.memberId] || val || '-' },
  { name: 'claimAmount', label: '申請金額', field: 'claimAmount', align: 'right', format: (val: any) => `$${formatMoney(val)}`},
  { name: 'approveAmount', label: '核決金額', field: 'approveAmount', align: 'right', format: (val: any) => val !== null && val !== undefined ? `$${formatMoney(val)}` : '-' },
  { name: 'applyTime', label: '申請日', field: 'applyTime', align: 'right', format: val => formatDate(val) },
  { name: 'claimStatus', label: '狀態', field: 'claimStatus', align: 'center' },
  // { name: 'updateUser', label: '異動人員', field: 'updateUser', align: 'center' },
  { name: 'actions', label: '操作', field: 'actions', align: 'center' }
]

// 🌟 form 宣告為 any 類型，避免 updateUser: null 造成 TypeScript 型態衝突
const dialog = reactive({
  show: false,
  isView: false,
  form: {} as any
})

// 當 status 改變時，自動重新載入資料
watch(() => filters.status, (newStatus) => {
  // 如果你有設定「重置後」的行為，也可以在這裡判斷
  // 這裡直接執行 loadData
  loadData()
})

// 下拉選單專用響應式變數
const memberOptions = ref<any[]>([])
const policyOptions = ref<any[]>([])
const agentOptions = ref<any[]>([])
const filteredMemberOptions = ref<any[]>([])
const filteredPolicyOptions = ref<any[]>([])

// 檔案上傳專用變數（改用原生 input ref，避免 QFile 元件未註冊問題）
const file01Input = ref<HTMLInputElement | null>(null)
const file02Input = ref<HTMLInputElement | null>(null)
const uploading01 = ref(false)
const uploading02 = ref(false)

// 經辦人員顯示名稱：優先用 form 自帶的 agentName，沒有的話用 agentOptions 比對 agentId 補上
const displayedAgentName = computed(() => {
  if (dialog.form.agentName) return dialog.form.agentName
  const matched = agentOptions.value.find(a => a.agentId === dialog.form.agentId)
  return matched ? matched.agentName : ''
})

// 目前選取客戶名下的保單數量；-1 代表尚未選擇客戶（此時不顯示「無」）
const memberPolicyCount = computed(() => {
  if (!dialog.form.memberId) return -1
  return policyOptions.value.filter(p => p.memberId === dialog.form.memberId).length
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

// async function fetchOptionsData() {
//   try {
//     const [mRes, pRes, aRes] = await Promise.all([
//       fetchMemberOptions(),
//       fetchPolicyOptions(),
//       fetchAgentOptions()
//     ])
//     memberOptions.value = mRes.DATA || []
//     filteredMemberOptions.value = mRes.DATA || []
//     policyOptions.value = pRes.DATA || []
//     agentOptions.value = aRes.DATA || []
//   } catch (err) {
//     $q.notify({ type: 'negative', message: '載入選單失敗' })
//   }
// }

// 這是更新後的 fetchOptionsData，直接複製替換掉你原本的函數
async function fetchOptionsData() {
  try {
    const [memberRes, policyRes, agentRes] = await Promise.all([
      fetchMemberOptions(),
      fetchPolicyOptions(),
      fetchAgentOptions()
    ])
    
    // 假設你的 ApiEnvelope 結構是 { DATA: ... }
    memberOptions.value = memberRes.DATA || []
    filteredMemberOptions.value = memberRes.DATA || []
    policyOptions.value = policyRes.DATA || []
    agentOptions.value = agentRes.DATA || []
  } catch (err) {
    console.error('拉取下拉選單資料失敗', err)
    $q.notify({ type: 'negative', message: '拉取選單資料失敗' })
  }
}

// 客戶選單模糊過濾
function filterMember(val: string, update: Function) {
  if (val === '') {
    update(() => { filteredMemberOptions.value = memberOptions.value })
    return
  }
  update(() => {
    const needle = val.toLowerCase()
    filteredMemberOptions.value = memberOptions.value.filter(
      v => String(v.memberId).includes(needle) || v.name.toLowerCase().includes(needle)
    )
  })
}

// 保單選單模糊過濾（只顯示當前選取客戶名下的保單）
function filterPolicy(val: string, update: Function) {
  let availablePolicies = policyOptions.value
  if (dialog.form.memberId) {
    availablePolicies = policyOptions.value.filter(p => p.memberId === dialog.form.memberId)
  }

  if (val === '') {
    update(() => { filteredPolicyOptions.value = availablePolicies })
    return
  }
  update(() => {
    const needle = val.toLowerCase()
    filteredPolicyOptions.value = availablePolicies.filter(
      v => v.policyNo.toLowerCase().includes(needle) || v.productName.toLowerCase().includes(needle)
    )
  })
}

// 換客戶時：先清空保單欄位，避免殘留前一位客戶的保單資料
function onMemberSelect(memberId: number) {
  dialog.form.policyNo = ''
  dialog.form.productName = ''
  filteredPolicyOptions.value = policyOptions.value.filter(p => p.memberId === memberId)
}

// 當選取保單時，自動帶入對應的客戶 ID 以及保單專案名稱
function onPolicySelect(policyNo: string) {
  const matched = policyOptions.value.find(p => p.policyNo === policyNo)
  if (matched) {
    dialog.form.memberId = matched.memberId
    dialog.form.productName = matched.productName
  }
}

// 點按鈕時觸發隱藏的 input[type=file]
function triggerFileSelect(slot: 1 | 2) {
  if (slot === 1) file01Input.value?.click()
  else file02Input.value?.click()
}

// input 選擇檔案後的處理
function onFileChange(event: Event, slot: 1 | 2) {
  const target = event.target as HTMLInputElement
  const file = target.files && target.files[0]
  if (file) {
    handleFileUpload(file, slot)
  }
  // 清空 input value，允許重新選同一個檔案也能觸發 change
  target.value = ''
}

// 上傳理賠佐證文件（診斷書/收據），上傳成功後將檔名與路徑寫回表單
// async function handleFileUpload(file: File, slot: 1 | 2) {
//   const formData = new FormData()
//   formData.append('file', file)

//   if (slot === 1) uploading01.value = true
//   else uploading02.value = true

//   try {
//     const res = await axios.post('/api/admin/claim/upload', formData, {
//       headers: { 'Content-Type': 'multipart/form-data' }
//     })
//     if (res.data && res.data.DATA) {
//       if (slot === 1) {
//         dialog.form.file01Name = res.data.DATA.fileName
//         dialog.form.file01Path = res.data.DATA.filePath
//       } else {
//         dialog.form.file02Name = res.data.DATA.fileName
//         dialog.form.file02Path = res.data.DATA.filePath
//       }
//       $q.notify({ type: 'positive', message: '檔案上傳成功' })
//     }
//   } catch (err) {
//     $q.notify({ type: 'negative', message: '檔案上傳失敗' })
//   } finally {
//     if (slot === 1) uploading01.value = false
//     else uploading02.value = false
//   }
// }

// 確保上面的 import 已經包含 uploadFileApi
async function handleFileUpload(file: File, slot: 1 | 2) {
  if (slot === 1) uploading01.value = true
  else uploading02.value = true

  try {
    // 使用封裝後的 API，不需要再手動設定 headers，http instance 會處理 Token
    const res = await uploadFileApi(file)
    
    // 檢查回傳結果
    if (res.data && res.data.DATA) {
      if (slot === 1) {
        dialog.form.file01Name = res.data.DATA.fileName
        dialog.form.file01Path = res.data.DATA.filePath
      } else {
        dialog.form.file02Name = res.data.DATA.fileName
        dialog.form.file02Path = res.data.DATA.filePath
      }
      $q.notify({ type: 'positive', message: '檔案上傳成功' })
    } else {
      throw new Error('伺服器未回傳資料')
    }
  } catch (err) {
    console.error('上傳失敗', err)
    $q.notify({ type: 'negative', message: '檔案上傳失敗，請檢查網路連線或權限' })
  } finally {
    if (slot === 1) uploading01.value = false
    else uploading02.value = false
  }
}

// // 選擇經辦人員時，同步帶入姓名顯示
// function onAgentSelect(agentId: number) {
//   const matched = agentOptions.value.find(a => a.agentId === agentId)
//   dialog.form.agentName = matched ? matched.agentName : ''
// }

// 選擇經辦人員時，更新 agentName 到 form 中
function onAgentSelect(agentId: number) {
  const matched = agentOptions.value.find(a => a.agentId === agentId)
  if (matched) {
    dialog.form.agentName = matched.agentName
  }
}

// 取得目前登入者資訊（localStorage key: user）
// USERNAME 直接當作 agentId，DISPLAY_NAME 當作顯示名稱
function getCurrentUser() {
  try {
    const raw = localStorage.getItem('user')
    if (!raw) return null
    const u = JSON.parse(raw)
    return {
      agentId: Number(u.USERNAME),
      agentName: u.DISPLAY_NAME
    }
  } catch {
    return null
  }
}

const applyDateInputRef = ref<any>(null)

// 點擊申請日期輸入框任意處即觸發瀏覽器原生日曆選擇器
function openDatePicker() {
  const inputEl = applyDateInputRef.value?.$el?.querySelector('input')
  if (inputEl && typeof inputEl.showPicker === 'function') {
    inputEl.showPicker()
  }
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
    await fetchOptionsData()
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
  // 1. 原有的：檢查保單號碼與客戶 ID
  if (!dialog.form.policyNo || !dialog.form.memberId) {
    $q.notify({ type: 'warning', message: '請填寫保單號碼與客戶ID' })
    return
  }

  // 2. 檢查申請金額
  if (!dialog.form.claimAmount || Number(dialog.form.claimAmount) <= 0) {
    $q.notify({ type: 'warning', message: '申請理賠金額必須大於 0' })
    return
  }

  // 3. 檢查理賠備註
  if (!dialog.form.remark || !dialog.form.remark.trim()) {
    $q.notify({ type: 'warning', message: '請填寫理賠備註原因' })
    return
  }

  if (isSubmitting.value) return
  isSubmitting.value = true

  // 🌟 核心防呆：如果是修改模式，且該案目前為「PENDING」狀態
  if (dialog.form.claimNo && dialog.form.claimStatus === 'PENDING') {
    $q.dialog({
      title: '⚠️ 重新送審提示',
      message: '本案目前處於「審核中 (PENDING)」階段。若確認進行修改儲存，案件狀態將重設為「新件待審 (SUBMIT)」並重新提交審核，是否確定？',
      cancel: {
        label: '取消修改',
        color: 'grey'
      },
      ok: {
        label: '確定送審',
        color: 'primary'
      },
      persistent: true
    }).onOk(async () => {
      try {
        // 1. 強制將狀態設定為 'SUBMIT'
        dialog.form.claimStatus = 'SUBMIT'
        
        // 2. 呼叫更新 API 送出
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
    
    return // 阻斷下方直接儲存的流程
  }

  // 以下為常規儲存流程 (新增案件，或非 PENDING 狀態的修改案件)
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

function confirmDelete(claimNo: string) {
  $q.dialog({
    title: '⚠️ 刪除確認',
    message: `確定要刪除錯誤建立的案號： ${claimNo} 嗎？此動作不可逆。`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await deleteClaimApi(claimNo)
      $q.notify({ type: 'positive', message: '案件已成功刪除' })
      loadData()
    } catch (err) {
      $q.notify({ type: 'negative', message: '僅限 PENDING 狀態案件允許刪除' })
    }
  })
}

function getStatusColor(status: string) {
  switch (status) {
    case 'APPROVED': return 'positive'
    case 'REJECTED': return 'negative'
    case 'REVIEWING': return 'orange-8'
    default: return 'blue-grey-6'
  }
}

function viewPdf(path: string | undefined) {
  if (!path) return;

  // 1. 如果路徑已經是完整網址，直接開
  if (path.startsWith('http')) {
    window.open(path, '_blank');
    return;
  }

  // 2. 如果路徑是 /uploads/...，直接加上後端 Base URL
  // 請確認 import.meta.env.VITE_API_BASE_URL 有值
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
  
  // 組合網址：確保中間只有一個斜線
  const cleanBase = baseUrl.replace(/\/$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const fullUrl = `${cleanBase}${cleanPath}`;
  
  console.log('準備開啟檔案，網址為:', fullUrl);
  
  // 3. 確保開啟的是一個絕對路徑，避開 Vue Router
  window.open(fullUrl, '_blank');
}

// 預先載入經辦人員清單（讓詳情/修改模式即使後端沒回傳 agentName 也能比對顯示）
async function preloadAgentOptions() {
  try {
    const agentRes = await axios.get('/api/admin/claim/agent-options')
    if (agentRes.data && agentRes.data.DATA) {
      agentOptions.value = agentRes.data.DATA
    }
  } catch (err) {
    console.error('預先載入經辦人員清單失敗', err)
  }
}

onMounted(() => {
  loadData()
  preloadAgentOptions()
  fetchOptionsData() // 預載所有客戶、保單與經辦資料
})
</script>