<template>
  <div class="q-pa-md bg-grey-1">
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h5 text-weight-bold text-primary">理賠審核</div>
    </div>

    <q-card class="q-mb-md flat bordered">
      <q-card-section class="row q-col-gutter-sm items-center">
        <div class="col-12 col-sm-4">
          <q-select v-model="filters.status" :options="statusOptions" emit-value map-options label="審核狀態篩選" outlined dense clearable />
        </div>
        <div class="col-12 col-sm-4">
          <q-input v-model="filters.policyNo" label="保單號碼搜尋" outlined dense clearable />
        </div>
        <div class="col-12 col-sm-4">
          <q-btn color="indigo-7" icon="search" label="查詢審核列表" @click="loadAuditData" />
        </div>
      </q-card-section>
    </q-card>

    <q-table :rows="rows" :columns="columns" row-key="claimNo" :loading="loading" flat bordered class="bg-white">
      <template v-slot:body-cell-claimStatus="props">
        <q-td :props="props">
          <q-badge :color="getStatusColor(props.value)" class="q-pa-xs">
            {{ props.value }}
          </q-badge>
        </q-td>
      </template>

      <template v-slot:body-cell-actions="props">
        <q-td :props="props" class="q-gutter-xs">
          <q-btn size="sm" color="indigo" icon="gavel" label="進入審核關卡" @click="openAuditDialog(props.row)" />
        </q-td>
      </template>
    </q-table>

    <q-dialog v-model="auditDialog.show" persistent max-width="90vw" style="width: 1000px;">
      <q-card class="row no-wrap" style="max-height: 85vh;">
        
        <q-card-section class="col-7 q-pa-md scroll" style="border-right: 1px solid #e0e0e0">
          <div class="text-h6 text-weight-bold text-primary q-mb-md">案件核決處理</div>
          
          <div class="row q-col-gutter-sm">
            <div class="col-6"><q-input v-model="auditDialog.form.claimNo" label="案件編號" dense outlined readonly bg-color="grey-2" /></div>
            <div class="col-6"><q-input v-model="auditDialog.form.policyNo" label="保單號碼" dense outlined readonly bg-color="grey-2" /></div>
            <div class="col-6"><q-input v-model="auditDialog.form.memberId" label="客戶ID" dense outlined readonly bg-color="grey-2" /></div>
            <div class="col-6"><q-input v-model="auditDialog.form.claimAmount" label="申請理賠金額" dense outlined readonly bg-color="grey-2" prefix="$" /></div>
            <div class="col-12"><q-input v-model="auditDialog.form.remark" type="textarea" rows="2" label="原受理備註說明" dense outlined readonly bg-color="grey-2" /></div>
          </div>

          <q-separator class="q-my-lg" />

          <div class="bg-indigo-1 q-pa-md rounded-borders">
            <div class="text-subtitle1 text-weight-bold text-indigo q-mb-sm">審核人員簽核決策</div>
            <div class="row q-col-gutter-sm">
              <div class="col-12">
                <q-input 
                  v-model.number="auditForm.approveAmount" 
                  type="number" 
                  label="核決發放金額 (核准時必填)" 
                  outlined 
                  dense 
                  prefix="$"
                  :rules="[val => auditForm.action !== 'APPROVED' || (val !== null && val >= 0) || '同意核發時必須指定核決金額']"
                />
              </div>
              <div class="col-12">
                <q-input 
                  v-model="auditForm.remark" 
                  type="textarea" 
                  rows="3" 
                  label="核決審核意見 / 駁回、撤回理由原因" 
                  outlined 
                  dense 
                  placeholder="請在此處輸入簽核具體意見..."
                />
              </div>
            </div>
            
            <div class="row justify-end q-gutter-sm q-mt-md">
              <q-btn color="grey-6" label="取消關閉" v-close-popup />
              <q-btn color="orange-8" icon="undo" label="撤回申請 (RETURN)" @click="submitDecision('RETURN')" />
              <q-btn color="negative" icon="block" label="駁回拒絕 (REJECTED)" @click="submitDecision('REJECTED')" />
              <q-btn color="positive" icon="check_circle" label="同意核可 (APPROVED)" @click="submitDecision('APPROVED')" />
            </div>
          </div>
        </q-card-section>

        <q-card-section class="col-5 q-pa-md bg-grey-1 scroll">
          <div class="text-subtitle1 text-weight-bold text-grey-9 q-mb-md">📜 本案審核歷史履歷 (Log)</div>
          
          <div v-if="historyLogs.length === 0" class="text-center text-grey-5 q-mt-xl">
            <q-icon name="history" size="lg" /><br>暫無前次變更紀錄
          </div>
          
          <q-timeline v-else color="indigo">
            <q-timeline-entry
              v-for="log in historyLogs"
              :key="log.claimLogNo"
              :title="`變更狀態 ➔ ${log.claimStatus}`"
              :subtitle="formatDate(log.aprvTime) + ' - 經辦: ' + log.aprvUser"
              :icon="getLogIcon(log.claimStatus)"
              :color="getStatusColor(log.claimStatus)"
            >
              <div class="text-caption text-grey-8">
                <strong>核准金額:</strong> {{ log.approveAmount !== null ? `$${log.approveAmount}` : '無' }} <br>
                <strong>審核意見:</strong> {{ log.aprvRemark || '未填寫意見' }}
              </div>
            </q-timeline-entry>
          </q-timeline>
        </q-card-section>

      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import axios from 'axios'
import type { QTableColumn } from 'quasar'
const $q = useQuasar()
const loading = ref(false)
const rows = ref([])
const historyLogs = ref<any[]>([])

const filters = reactive({ status: '', policyNo: '' })
const statusOptions = [
  { label: '顯示全部待處理 (SUBMIT / PENDING / RETURN)', value: '' },
  { label: 'SUBMIT (新件待審)', value: 'SUBMIT' },
  { label: 'PENDING (審核中)', value: 'PENDING' },
  { label: 'APPROVED (已結案-准予)', value: 'APPROVED' },
  { label: 'REJECTED (已結案-駁回)', value: 'REJECTED' },
  { label: 'RETURN (已被撤回)', value: 'RETURN' }
]

const columns: QTableColumn[] = [
  { name: 'claimNo', label: '理賠案號', field: 'claimNo', align: 'left', sortable: true },
  { name: 'policyNo', label: '保單號碼', field: 'policyNo', align: 'left' },
  { name: 'claimAmount', label: '申請理賠金', field: 'claimAmount', align: 'right' },
  { name: 'claimStatus', label: '當前關卡狀態', field: 'claimStatus', align: 'center' },
  { name: 'actions', label: '審核簽准', field: 'actions', align: 'center' }
]

const auditDialog = reactive({ show: false, form: {} as any })
const auditForm = reactive({ action: '', approveAmount: null as number | null, remark: '' })

// 載入審核清單
async function loadAuditData() {
  loading.value = true
  try {
    const res = await axios.get('/api/admin/claim-audit/list', { params: filters })
    rows.value = res.data.DATA
  } catch (err) {
    $q.notify({ type: 'negative', message: '讀取審核列表失敗' })
  } finally {
    loading.value = false
  }
}

// 開啟審核大窗並抓取 Audit Log 軌跡
async function openAuditDialog(row: any) {
  auditDialog.form = { ...row }
  // 清空上一次的核決輸入輸入框
  auditForm.action = ''
  auditForm.approveAmount = row.claimStatus === 'APPROVED' ? row.approveAmount : row.claimAmount
  auditForm.remark = ''
  
  historyLogs.value = []
  auditDialog.show = true

  // 非同步向後端獲取歷史審核日誌 tb_claim_aprv_log
  try {
    const res = await axios.get(`/api/admin/claim-audit/logs/${row.claimNo}`)
    historyLogs.value = res.data.DATA
  } catch (err) {
    console.error('無法讀取歷史 Log 歷程', err)
  }
}

// 提交核決：同意、駁回、或撤回
async function submitDecision(actionType: string) {
  auditForm.action = actionType
  
  if (actionType === 'APPROVED' && (auditForm.approveAmount === null || auditForm.approveAmount < 0)) {
    $q.notify({ type: 'warning', message: '同意准予理賠時，必須填寫正確的核決理賠金額！' })
    return
  }

  $q.dialog({
    title: '📢 審核確認送出',
    message: `您即將要把本案判定為 [ ${actionType} ]，此作業將會同步存入變更歷程 Log 檔案中，是否確認？`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await axios.put('/api/admin/claim-audit/decision', {
        claimNo: auditDialog.form.claimNo,
        action: auditForm.action,
        approveAmount: auditForm.action === 'APPROVED' ? auditForm.approveAmount : null,
        remark: auditForm.remark,
        aprvUser: 'ADMIN_SUPERVISOR' // 這裡實務上可以抓目前登入的主管帳號變數
      })
      $q.notify({ type: 'positive', message: '理賠核決與履歷更新成功！' })
      auditDialog.show = false
      loadAuditData() // 刷新主清單
    } catch (err) {
      $q.notify({ type: 'negative', message: '提交審核決策時失敗' })
    }
  })
}

function getStatusColor(status: string) {
  switch (status) {
    case 'APPROVED': return 'green-7'
    case 'REJECTED': return 'red-7'
    case 'RETURN': return 'orange-9'
    case 'REVIEWING': return 'purple-7'
    default: return 'blue-grey-6'
  }
}

function getLogIcon(status: string) {
  switch (status) {
    case 'APPROVED': return 'check'
    case 'REJECTED': return 'close'
    case 'RETURN': return 'undo'
    default: return 'edit'
  }
}

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  return dateStr.replace('T', ' ').substring(0, 19)
}

onMounted(() => {
  loadAuditData()
})
</script>