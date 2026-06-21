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
          <q-input v-model="filters.applyDate" type="date" label="申請日期" outlined dense stack-label clearable />
        </div>
        <div class="col-12 col-sm-3">
          <q-btn color="secondary" icon="search" label="查詢" class="q-mr-sm" @click="loadData" />
          <q-btn color="grey-6" label="全部" @click="resetFilters" />
        </div>
      </q-card-section>
    </q-card>

    <q-table :rows="rows|| []" :columns="columns" row-key="claimNo" :loading="loading" flat bordered class="bg-white">
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
          <q-btn size="sm" color="negative" flat icon="delete" label="刪除" :disabled="props.row.claimStatus !== 'PENDING'" @click="confirmDelete(props.row.claimNo)" />
        </q-td>
      </template>
    </q-table>

    <q-dialog v-model="dialog.show" persistent>
      <q-card style="width: 600px; max-width: 90vw;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-weight-bold">
            {{ dialog.isView ? '🔍 案件詳細資料' : dialog.form.claimNo ? '修改理賠資料' : '新增理賠案件' }}
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
              emit-value
              map-options
              use-input
              input-debounce="300"
              label="選擇客戶 (可輸入 ID 或 姓名搜尋)"
              dense
              outlined
              @filter="filterMember"
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
            <div class="col-6" v-if="dialog.form.memberName">
              <q-input :model-value="dialog.form.memberName" label="客戶姓名" dense outlined readonly bg-color="blue-1" />
            </div>
          </template>
          
          <!-- 保單選擇區塊：新增模式下為下拉搜尋選單，詳情/修改模式下維持原樣 -->
          <div v-if="!dialog.form.claimNo && !dialog.isView" class="col-12">
            <q-select
              v-model="dialog.form.policyNo"
              :options="filteredPolicyOptions"
              option-value="policyNo"
              emit-value
              map-options
              use-input
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
          </div>
          <template v-else>
            <div class="col-12">
              <q-input v-model="dialog.form.policyNo" label="保單號碼" dense outlined :readonly="dialog.isView" />
            </div>
          </template>

          <div class="col-6">
            <q-input v-model.number="dialog.form.claimAmount" type="number" label="申請理賠金額" dense outlined :readonly="dialog.isView" />
          </div>
          <div class="col-6">
            <q-input v-model.number="dialog.form.approveAmount" type="number" label="核決理賠金額" dense outlined :readonly="dialog.isView" placeholder="審核中則留空" />
          </div>

          <div :class="dialog.form.agentName ? 'col-6' : 'col-12'">
            <q-input v-model.number="dialog.form.agentId" type="number" label="經辦人員 ID" dense outlined :readonly="dialog.isView" />
          </div>
          <div class="col-6" v-if="dialog.form.agentName">
            <q-input :model-value="dialog.form.agentName" label="負責經辦人" dense outlined readonly bg-color="orange-1" />
          </div>

          <div class="col-12">
            <q-input v-model="dialog.form.updateUser" label="最後異動帳號" dense outlined :readonly="dialog.isView" />
          </div>
          <div class="col-12">
            <q-input v-model="dialog.form.remark" type="textarea" rows="3" label="理賠備註原因" dense outlined :readonly="dialog.isView" />
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
                ⚠️ 本案暫無附帶 any 電子文件
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
import { ref, reactive, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import type { QTableProps } from 'quasar'
import axios from 'axios'
import { fetchClaims, fetchClaimDetail, createClaimApi, updateClaimApi, deleteClaimApi, type ClaimModel } from '@/api/claim'

const $q = useQuasar()

const filters = reactive({ status: '', policyNo: '', applyDate: '' })
const statusOptions = [
  { label: 'SUBMIT (新件待審)', value: 'SUBMIT' },
  { label: 'PENDING (審核中)', value: 'PENDING' },
  { label: 'APPROVED (已結案-准予)', value: 'APPROVED' },
  { label: 'REJECTED (已結案-駁回)', value: 'REJECTED' },
  { label: 'RETURN (已被撤回)', value: 'RETURN' }
]

const loading = ref(false)
const isSubmitting = ref(false)
const rows = ref<ClaimModel[]>([])
const columns: QTableProps['columns'] = [
  { name: 'claimNo', label: '理賠案號', field: 'claimNo', align: 'left', sortable: true },
  { name: 'policyNo', label: '保單號碼', field: 'policyNo', align: 'left' },
  { name: 'claimAmount', label: '申請金額', field: 'claimAmount', align: 'right' },
  { name: 'approveAmount', label: '核決金額', field: 'approveAmount', align: 'right', format: (val: any) => val ?? '-' },
  { name: 'claimStatus', label: '狀態', field: 'claimStatus', align: 'center' },
  { name: 'updateUser', label: '異動人員', field: 'updateUser', align: 'center' },
  { name: 'actions', label: '操作', field: 'actions', align: 'center' }
]

// 🌟 修正：將 form 宣告為 any 類型，徹底杜絕 updateUser: null 造成的 TypeScript 型態衝突紅線
const dialog = reactive({
  show: false,
  isView: false,
  form: {} as any
})

// 下拉選單專用響應式變數
const memberOptions = ref<any[]>([])
const policyOptions = ref<any[]>([])
const filteredMemberOptions = ref<any[]>([])
const filteredPolicyOptions = ref<any[]>([])

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

// 獲取後端選單來源 API
async function fetchOptionsData() {
  try {
    const memberRes = await axios.get('/api/admin/claim/member-options')
    if (memberRes.data && memberRes.data.DATA) {
      memberOptions.value = memberRes.data.DATA
    }
    const policyRes = await axios.get('/api/admin/claim/policy-options')
    if (policyRes.data && policyRes.data.DATA) {
      policyOptions.value = policyRes.data.DATA
    }
  } catch (err) {
    console.error('拉取下拉選單資料失敗', err)
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

// 保單選單模糊過濾
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

// 當選取保單時，自動帶入對應的客戶 ID 以及保單專案名稱
function onPolicySelect(policyNo: string) {
  const matched = policyOptions.value.find(p => p.policyNo === policyNo)
  if (matched) {
    dialog.form.memberId = matched.memberId
    dialog.form.productName = matched.productName
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
    // 🌟 因為 dialog.form 本身已是 any，這裡直接賦值，不再需要加 as any 或 as ExtendedClaimModel
    dialog.form = {
      claimNo: undefined, 
      claimStatus: undefined,
      memberId: null, 
      policyNo: '', 
      claimAmount: 0, 
      approveAmount: null, 
      agentId: null, 
      remark: '', 
      updateUser: null, // 保持為 null 傳送至後端
      agentName: '',
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

  if (isSubmitting.value) return
  isSubmitting.value = true
  
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
        claimStatus: 'PENDING',
        applyTime: formatJavaDateTime(now),   
        expiryTime: formatJavaDateTime(expiry) 
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

function viewPdf(url: string) {
  if (url) window.open(url, '_blank')
}

onMounted(() => {
  loadData()
})
</script>