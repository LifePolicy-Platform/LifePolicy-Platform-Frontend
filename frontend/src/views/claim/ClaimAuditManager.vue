<template>
  <div class="q-pa-md bg-grey-1">
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h5 text-weight-bold text-primary">理賠審核</div>
    </div>

    <q-card class="q-mb-md flat bordered">
      <q-card-section class="row q-col-gutter-sm items-center">
        <div class="col-12 col-sm-4">
          <q-select 
            v-model="filters.status" 
            :options="statusOptions" 
            emit-value 
            map-options 
            label="審核狀態篩選" 
            outlined 
            dense 
            clearable 
            @update:model-value="loadAuditData"
          />
        </div>
        <div class="col-12 col-sm-4">
          <q-input 
            v-model="filters.policyNo" 
            label="保單號碼搜尋" 
            outlined 
            dense 
            clearable 
            @keydown.enter="loadAuditData"
          />
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
          <q-btn 
            v-if="['APPROVED', 'REJECTED'].includes(props.row.claimStatus)"
            size="sm" 
            color="teal-7" 
            icon="visibility" 
            label="查看審核歷程" 
            @click="openAuditDialog(props.row)" 
          />
          <q-btn 
            v-else
            size="sm" 
            color="indigo" 
            icon="gavel" 
            label="進入審核關卡" 
            @click="openAuditDialog(props.row)" 
          />
        </q-td>
      </template>
    </q-table>

    <!-- <q-dialog v-model="auditDialog.show" persistent max-width="90vw" style="width: 1000px;">
      <q-card class="row no-wrap" style="max-height: 85vh;">
        
        <q-btn 
          icon="close" 
          flat 
          round 
          dense 
          v-close-popup 
          class="absolute-top-right q-ma-sm text-grey-6" 
          style="z-index: 10;"
        /> -->
        <q-dialog v-model="auditDialog.show" persistent>
  <q-card style="width: 900px; max-width: 95vw;">
    <!-- 關閉按鈕 -->
    <q-btn icon="close" flat round dense v-close-popup class="absolute-top-right q-ma-sm" style="z-index: 10;" />
              <q-card-section class="col-7 scroll">

        <!-- <q-card-section class="col-7 q-pa-md scroll" style="border-right: 1px solid #e0e0e0"> -->
          <div class="text-h6 text-weight-bold text-primary q-mb-md">案件核決處理</div>
          
          <div class="row q-col-gutter-sm">
          <div class="col-6"><q-input v-model="auditDialog.form.claimNo" label="案件編號" dense outlined readonly bg-color="grey-2" /></div>
          <div class="col-6"><q-input v-model="auditDialog.form.policyNo" label="保單號碼" dense outlined readonly bg-color="grey-2" /></div>
          <div class="col-6"><q-input v-model="auditDialog.form.memberName" label="客戶姓名" dense outlined readonly bg-color="grey-2" /></div>
          <div class="col-6"><q-input v-model="auditDialog.form.productName" label="商品名稱" dense outlined readonly bg-color="grey-2" /></div>
          <div class="col-12"><q-input v-model="auditDialog.form.claimAmount" label="申請理賠金額" dense outlined readonly bg-color="grey-2" prefix="$" /></div>
          <div class="col-12"><q-input v-model="auditDialog.form.remark" type="textarea" rows="2" label="原受理備註說明" dense outlined readonly bg-color="grey-2" /></div>
        </div>

          <!-- 檔案連結區塊 -->
        <div class="q-mt-md" v-if="auditDialog.form.file01Path || auditDialog.form.file02Path">
          <div class="text-subtitle2 q-mb-xs">佐證電子文件</div>
          <div class="row q-gutter-sm">
            <q-btn v-if="auditDialog.form.file01Path" color="indigo" outline icon="picture_as_pdf" :label="auditDialog.form.file01Name || '診斷書'" @click="viewPdf(auditDialog.form.file01Path)" />
            <q-btn v-if="auditDialog.form.file02Path" color="indigo" outline icon="picture_as_pdf" :label="auditDialog.form.file02Name || '收據'" @click="viewPdf(auditDialog.form.file02Path)" />
          </div>
        </div>

          <q-separator class="q-my-lg" />

          <!-- 自動審核判斷面板 -->
<div class="q-mt-md q-pa-sm rounded-borders" 
     :class="auditRules.pass ? 'bg-green-1' : 'bg-red-1'">
  <div class="text-weight-bold" :class="auditRules.pass ? 'text-green-9' : 'text-red-9'">
    <q-icon :name="auditRules.pass ? 'check_circle' : 'warning'" class="q-mr-xs" />
    系統自動審核：{{ auditRules.msg }}
  </div>
</div>

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
              
              <q-btn 
                v-if="getUserRole() === 'APPLICANT'"
                color="orange-8" 
                icon="undo" 
                label="撤回申請 (RETURN)" 
                @click="submitDecision('RETURN')" 
              />
              
              <template v-if="['REVIEWER', 'ADMIN'].includes(getUserRole())">
                <template v-if="!['APPROVED', 'REJECTED'].includes(auditDialog.form.claimStatus)">
                  <q-btn color="negative" icon="block" label="駁回拒絕 (REJECTED)" @click="submitDecision('REJECTED')" />
                  <q-btn color="positive" icon="check_circle" label="同意核可 (APPROVED)" @click="submitDecision('APPROVED')" />
                </template>
              </template>
            </div>
          </div>
        </q-card-section>

        <q-card-section class="col-5 q-pa-md bg-grey-1 scroll">
          <div class="text-subtitle1 text-weight-bold text-grey-9 q-mb-md">📜 本案審核歷程</div>
          
          <div v-if="historyLogs.length === 0" class="text-center text-grey-5 q-mt-xl">
            <q-icon name="history" size="lg" /><br>暫無前次變更紀錄
          </div>
          
          <div v-else class="q-gutter-y-sm">
            <q-card 
              v-for="log in historyLogs" 
              :key="log.claimLogNo" 
              flat 
              bordered 
              class="bg-white q-pa-sm"
              :style="`border-left: 5px solid var(--q-${getStatusColor(log.claimStatus)})`"
            >
              <div class="row items-center justify-between q-mb-xs">
                <q-badge :color="getStatusColor(log.claimStatus)" class="text-weight-bold">
                  {{ log.claimStatus }}
                </q-badge>
                <div class="text-caption text-grey-6">{{ formatDate(log.aprvTime) }}</div>
              </div>

              <div class="text-caption text-grey-8 q-mt-xs">
                <div class="q-mb-xs"><strong>審核人員:</strong> {{ log.aprvUser || '系統' }}</div>
                <div class="q-mb-xs">
                  <strong>核准金額:</strong> 
                  <span :class="log.approveAmount > 0 ? 'text-weight-bold text-negative' : 'text-grey-6'">
                    {{ log.approveAmount > 0 ? `$${log.approveAmount}` : '無' }}
                  </span>
                </div>
                
                <div class="bg-grey-2 q-pa-xs rounded-borders text-grey-9 q-mt-sm" style="min-height: 32px;">
                  <strong>意見:</strong> {{ log.aprvRemark || '未填寫意見' }}
                </div>
              </div>
            </q-card>
          </div>
        </q-card-section>

      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
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
  { name: 'memberName', label: '客戶姓名', field: 'memberName', align: 'left' },
  { name: 'policyNo', label: '保單號碼', field: 'policyNo', align: 'left' },
  { name: 'claimAmount', label: '申請理賠金', field: 'claimAmount', align: 'right' },
  { name: 'approveAmount', label: '核決理賠金', field: 'approveAmount', align: 'right', format: val => val !== null ? `$${val}` : '尚未核決' },
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
  // 1. 先顯示彈窗 (或者顯示 loading 狀態)
  auditDialog.show = true
  
  try {
    // 2. 關鍵：重新呼叫後端 API 取得完整資訊 (包含 JOIN 的 effectDate 等欄位)
    // 假設你有一個 API 可以透過 claimNo 抓取完整資料
    const res = await axios.get(`/api/admin/claim/${row.claimNo}`)
    auditDialog.form = res.data.DATA
    
    // 3. 獲取審核 Log
    const logRes = await axios.get(`/api/admin/claim-audit/logs/${row.claimNo}`)
    historyLogs.value = logRes.data.DATA
    
  } catch (err) {
    console.error('無法讀取案件詳細資料或 Log', err)
    $q.notify({ type: 'negative', message: '無法讀取案件詳情' })
  }

  // 初始化核決表單
  auditForm.action = ''
  auditForm.approveAmount = row.claimStatus === 'APPROVED' ? row.approveAmount : row.claimAmount
  auditForm.remark = ''
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
      // 修正：從複雜的 User JSON 物件中解出大寫的 DISPLAY_NAME
      const userJson = localStorage.getItem('User');
      let currentUserName = '審核主管';
      if (userJson) {
        try {
          const userObj = JSON.parse(userJson);
          currentUserName = userObj.DISPLAY_NAME || '審核主管';
        } catch (e) {
          console.error(e);
        }
      }

      await axios.put('/api/admin/claim-audit/decision', {
        claimNo: auditDialog.form.claimNo,
        action: auditForm.action,
        approveAmount: auditForm.action === 'APPROVED' ? auditForm.approveAmount : null,
        remark: auditForm.remark,
        aprvUser: currentUserName // 🌟 這次送出的就會是精準的 "管理員" 囉！
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

// 新增：獲取當前登入使用者的 ROLE_CODE 權限
function getUserRole(): string {
  const userJson = localStorage.getItem('User')
  if (userJson) {
    try {
      const userObj = JSON.parse(userJson)
      return userObj.ROLE_CODE || ''
    } catch (e) {
      console.error('讀取角色權限失敗', e)
    }
  }
  return ''
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

  const auditRules = computed(() => {
  const form = auditDialog.form;
  if (!form.policyNo || !form.applyTime) return { pass: true, msg: '資料載入中...' };

  const applyDate = new Date(form.applyTime);
  const effectDate = new Date(form.effectDate);
  const expireDate = new Date(form.expireDate);
  
  // 1. 效期比對
  if (applyDate < effectDate || applyDate > expireDate) {
    return { pass: false, msg: `❌ 事故日期 (${form.applyTime.substring(0,10)}) 不在保單效期內 (${form.effectDate} ~ ${form.expireDate})` };
  }
  
  // 2. 疾病等待期 (90天)
  // 如果產品類型是 HEALTH，且 applyDate 距離 effectDate < 90 天
  // 強制轉大寫比較，確保 'health' 或 'HEALTH' 都能偵測到
  const type = (form.productType || '').toUpperCase();
  if (form.productType === 'HEALTH') {
    const diffTime = applyDate.getTime() - effectDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 90) {
      return { pass: false, msg: `❌ 仍在疾病等待期內 (投保後第 ${diffDays} 天，需滿 90 天)` };
    }
  }

  return { pass: true, msg: '✅ 保單效期與等待期檢查通過' };
});
</script>