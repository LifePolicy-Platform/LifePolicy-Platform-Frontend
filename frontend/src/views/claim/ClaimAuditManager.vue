<template>
  <section class="page-with-hero">
    <PageHero title="理賠審核" subtitle="審核理賠案件與檢視審核歷程" />

    <div class="page-body q-pa-md bg-grey-1">

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
            v-if="['APPROVED', 'REJECTED', 'RETURN', 'PENDING'].includes(props.row.claimStatus)"
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

    <!-- 審核案件處理彈窗 (視覺極簡化：去色塊、去Icon、文字純淨流) -->
    <q-dialog v-model="auditDialog.show" persistent>
      <q-card style="width: 1000px; max-width: 95vw; height: 90vh;" class="column no-wrap bg-grey-1">
        
        <!-- 頂部標題與關閉按鈕 -->
        <q-card-section class="row items-center bg-teal-9 text-white q-py-sm">
          <div class="text-h6 text-weight-bold">理賠案件核決與歷程</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <!-- 主體內容 -->
        <q-card-section class="row col q-col-gutter-md q-pa-md scroll">
          
          <!-- ================= [左側固定區塊：工作面板] ================= -->
          <div class="col-12 col-md-5 column q-gutter-y-md">
            
            <!-- 1. 當前案件核心卡片 (拿掉 Icon) -->
            <q-card flat bordered class="bg-white border-teal">
              <q-card-section class="q-pa-md">
                <div class="text-caption text-grey-6 q-mb-xs">客戶姓名</div>
                <div class="row items-baseline justify-between">
                  <div class="text-h5 text-weight-bold text-teal-9">
                    {{ auditDialog.form.memberName || '-' }}
                  </div>
                  <div class="text-subtitle1 text-weight-bold text-negative">
                    申請金額: ${{ formatMoney(auditDialog.form.claimAmount) }}
                  </div>
                </div>
              </q-card-section>
            </q-card>

            <!-- 2. 自動審核面板 (依您的建議：完全拿掉綠底、紅底、灰底與 Icon，字體顏色與一般輸入框文字相同) -->
            <q-card flat bordered class="bg-white">
              <q-card-section class="q-pa-md">
                <div class="text-caption text-grey-6 q-mb-xs">系統自動審核</div>
                <div 
  class="text-body1 text-weight-medium" 
  :class="auditRules.pass ? 'text-teal-9' : 'text-negative'"
>
  {{ auditRules.msg }}
</div>
              </q-card-section>
            </q-card>

            <!-- 3. 審核人員填寫卡片 (依狀態顯示對應的結案/處理文字，並隱藏輸入框) -->
            <q-card flat bordered class="bg-white col column no-wrap">
              <q-card-section class="q-pa-md column q-gutter-y-sm full-height col">
                
                <!-- 當狀態為 PENDING, RETURN, APPROVED, REJECTED 時，顯示對應的綠色狀態文字 -->
                <div 
                  v-if="['PENDING', 'RETURN', 'APPROVED', 'REJECTED'].includes(auditDialog.form.claimStatus)" 
                  class="col column justify-center items-center q-py-xl"
                >
                  <div class="text-h6 text-weight-bold text-teal-9">
                    <span v-if="auditDialog.form.claimStatus === 'PENDING'">案件處理中</span>
                    <span v-else-if="auditDialog.form.claimStatus === 'RETURN'">退回補件中</span>
                    <span v-else-if="auditDialog.form.claimStatus === 'APPROVED'">已結案-核准</span>
                    <span v-else-if="auditDialog.form.claimStatus === 'REJECTED'">已結案-駁回</span>
                  </div>
                </div>
                
                <!-- 預設狀態才顯示發放金額與意見輸入框 -->
                <template v-else>
                  <div>
                    <q-input 
                      :model-value="formatMoney(auditForm.approveAmount)" 
                      @update:model-value="onAmountInput"
                      label="核決發放金額" 
                      outlined 
                      dense 
                      color="teal"
                      prefix="$"
                      lazy-rules
                      :rules="[val => auditForm.action !== 'APPROVED' || (auditForm.approveAmount !== null && auditForm.approveAmount >= 0) || '同意核發時必須指定核決金額']"
                    />
                  </div>
                  
                  <div class="col">
                    <q-input 
                      v-model="auditForm.remark" 
                      type="textarea" 
                      rows="4" 
                      label="核決審核意見 / 理由原因" 
                      outlined 
                      dense 
                      color="teal"
                      placeholder="請在此處輸入簽核具體意見..."
                      class="full-height"
                    />
                  </div>
                </template>
                
                <!-- 操作按鈕群 -->
                <div class="row justify-end q-gutter-sm q-mt-sm">
                  <q-btn 
                    v-if="getUserRole() === 'APPLICANT' && auditDialog.form.claimStatus === 'SUBMIT'"
                    color="teal-7" 
                    label="送審遞呈" 
                    @click="submitDecision('PENDING')" 
                  />
                  <!-- 撤回按鈕：排除 PENDING, RETURN, APPROVED, REJECTED 狀態 -->
                  <q-btn 
                    v-if="getUserRole() === 'APPLICANT' && !['PENDING', 'RETURN', 'APPROVED', 'REJECTED'].includes(auditDialog.form.claimStatus)"
                    color="grey-7" 
                    label="撤回申請" 
                    @click="submitDecision('RETURN')" 
                  />
                  <template v-if="['REVIEWER', 'ADMIN'].includes(getUserRole())">
                    <template v-if="!['APPROVED', 'REJECTED'].includes(auditDialog.form.claimStatus)">
                      <q-btn color="red-8" label="駁回拒絕" @click="submitDecision('REJECTED')" />
                      <q-btn color="teal-9" label="同意核可" @click="submitDecision('APPROVED')" />
                    </template>
                  </template>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <!-- ================= [右側動態區塊：小頁籤切換] ================= -->
          <div class="col-12 col-md-7 column">
            <q-card flat bordered class="col column no-wrap bg-white">
              
              <!-- 頁籤控制 (🌟 依您的建議：拿掉 icon、調整歷程數字右移與間距) -->
              <q-tabs
                v-model="activeTab"
                dense
                class="text-grey-7"
                active-color="teal"
                indicator-color="teal"
                align="left"
                narrow-indicator
              >
                <q-tab name="detail" label="案件詳情與文件" class="q-mr-sm" />
                <q-tab name="history" class="q-px-md">
                  <div class="row items-center no-wrap">
                    <div>本案審核歷程</div>
                    <!-- 🌟 數字單獨包在 div 裡，向右推開外距 (q-ml-sm)，視覺更美觀 -->
                    <q-badge v-if="historyLogs.length > 0" color="teal" class="q-ml-sm">
                      {{ historyLogs.length }}
                    </q-badge>
                  </div>
                </q-tab>
              </q-tabs>

              <q-separator />

              <!-- 頁籤內容面板群組 -->
              <q-tab-panels v-model="activeTab" animated class="col scroll bg-white">
                
                <!-- 頁籤一：基本資訊與文件 -->
                <q-tab-panel name="detail" class="q-pa-md q-gutter-y-md">
                  <div class="row q-col-gutter-sm">
                    <div class="col-6"><q-input v-model="auditDialog.form.claimNo" label="案件編號" dense outlined readonly bg-color="grey-1" /></div>
                    <div class="col-6"><q-input v-model="auditDialog.form.policyNo" label="保單號碼" dense outlined readonly bg-color="grey-1" /></div>
                    <div class="col-6"><q-input v-model="auditDialog.form.memberName" label="客戶姓名" dense outlined readonly bg-color="grey-1" /></div>
                    <div class="col-6"><q-input v-model="auditDialog.form.productName" label="商品名稱" dense outlined readonly bg-color="grey-1" /></div>
                    <div class="col-12"><q-input v-model="auditDialog.form.remark" type="textarea" rows="3" label="原受理備註說明" dense outlined readonly bg-color="grey-1" /></div>
                  </div>

                  <!-- 檔案連結區塊 (依您的建議：拿掉背景灰底、拿掉 icon) -->
                  <div v-if="auditDialog.form.file01Path || auditDialog.form.file02Path" class="q-mt-md">
                    <div class="text-subtitle2 text-weight-bold text-grey-8 q-mb-xs">佐證電子文件 (點擊開啟)</div>
                    <div class="row q-gutter-sm q-py-xs">
                      <q-btn v-if="auditDialog.form.file01Path" color="teal" outline :label="auditDialog.form.file01Name || '診斷書'" @click="viewPdf(auditDialog.form.file01Path)" />
                      <q-btn v-if="auditDialog.form.file02Path" color="teal" outline :label="auditDialog.form.file02Name || '收據'" @click="viewPdf(auditDialog.form.file02Path)" />
                    </div>
                  </div>
                </q-tab-panel>

                <!-- 頁籤二：審核歷史歷程軌跡 -->
                <q-tab-panel name="history" class="q-pa-md bg-grey-1">
                  <div v-if="historyLogs.length === 0" class="text-center text-grey-5 q-mt-xl">
                    暫無前次變更紀錄
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
                          <span :class="log.approveAmount > 0 ? 'text-weight-bold text-teal-9' : 'text-grey-6'">
                            {{ log.approveAmount > 0 ? `$${formatMoney(log.approveAmount)}` : '無' }}
                          </span>
                        </div>
                        
                        <div class="bg-grey-2 q-pa-xs rounded-borders text-grey-9 q-mt-sm" style="min-height: 32px;">
                          <strong>意見:</strong> {{ log.aprvRemark || '未填寫意見' }}
                        </div>
                      </div>
                    </q-card>
                  </div>
                </q-tab-panel>

              </q-tab-panels>
            </q-card>
          </div>

        </q-card-section>
      </q-card>
    </q-dialog>
    
  </div>
  </section>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import axios from 'axios'
import type { QTableColumn } from 'quasar'
import PageHero from '@/components/layout/PageHero.vue'
const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const loading = ref(false)
const rows = ref([])
const historyLogs = ref<any[]>([])

const filters = reactive({ status: '', policyNo: '' })
const statusOptions = [
  { label: '顯示全部處理中 (SUBMIT / PENDING / RETURN)', value: '' },
  { label: '最新案件待處理 (SUBMIT)', value: 'SUBMIT' },
  { label: '審核中 (PENDING)', value: 'PENDING' },
  { label: '已結案-核准 (APPROVED)', value: 'APPROVED' },
  { label: '已結案-駁回 (REJECTED)', value: 'REJECTED' },
  { label: '已被撤回須補件 (RETURN)', value: 'RETURN' }
]

const columns: QTableColumn[] = [
  { name: 'claimNo', label: '理賠案號', field: 'claimNo', align: 'left', sortable: true },
  { name: 'memberName', label: '客戶姓名', field: 'memberName', align: 'left' },
  { name: 'policyNo', label: '保單號碼', field: 'policyNo', align: 'left' },
  { name: 'claimAmount', label: '申請理賠金', field: 'claimAmount', align: 'right', format: val => `$${formatMoney(val)}` },
  { name: 'approveAmount', label: '核決理賠金', field: 'approveAmount', align: 'right', format: val => val !== null ? `$${formatMoney(val)}` : '尚未核決' },
  { name: 'claimStatus', label: '當前關卡狀態', field: 'claimStatus', align: 'center' },
  { name: 'actions', label: '審核簽准', field: 'actions', align: 'center' }
]

const auditDialog = reactive({ show: false, form: {} as any })
const auditForm = reactive({ action: '', approveAmount: null as number | null, remark: '' })
const activeTab = ref('detail') // 預設進來彈窗時，停在「案件詳情與文件」頁籤

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
    const res = await axios.get(`/api/admin/claim/${row.claimNo}`)
    auditDialog.form = res.data.DATA
    
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
  activeTab.value = 'detail' // 每次開新彈窗時，都要強迫重置回第一個分頁
}

// 提交核決：同意、駁回、或撤回
async function submitDecision(actionType: string) {
  // auditForm.action = actionType
  
  // if (actionType === 'APPROVED' && (auditForm.approveAmount === null || auditForm.approveAmount < 0)) {
  //   $q.notify({ type: 'warning', message: '必須填寫正確的核決理賠金額！' })
  //   return
  // }
auditForm.action = actionType
  
  // 🌟 如果欄位不幸被清空變成 null 或 undefined，強行校正為 0，絕對不讓 null 進 DB
  if (auditForm.approveAmount === null || auditForm.approveAmount === undefined) {
    auditForm.approveAmount = 0
  }
  
  if (actionType === 'APPROVED' && auditForm.approveAmount < 0) {
    $q.notify({ type: 'warning', message: '必須填寫正確的核決理賠金額！' })
    return
  }


  $q.dialog({
    title: '審核確認送出',
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
        // 新的：APPROVED 和 PENDING 保留金額，只有 REJECTED/RETURN 才送 null
approveAmount: ['APPROVED', 'PENDING'].includes(auditForm.action)
  ? auditForm.approveAmount
  : null,
        remark: auditForm.remark,
        aprvUser: currentUserName //  這次送出的就會是精準的 "管理員" 囉！
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

onMounted(async () => {
  await loadAuditData()
  const prefilledClaimNo = route.query.claimNo
  if (typeof prefilledClaimNo === 'string' && prefilledClaimNo.trim()) {
    router.replace({ query: {} })
    const target = (rows.value as any[]).find(r => r.claimNo === prefilledClaimNo.trim())
    if (target) openAuditDialog(target)
  }
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
    return { pass: false, msg: `❌ 事故日期 (${form.applyTime.substring(0,10)}) 不在保單效期內 ` };
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

  return { pass: true, msg: '保單效期與等待期檢查通過' };
});

// 新增：千分位轉換工具
function formatMoney(val: any) {
  if (val === null || val === undefined || isNaN(Number(val))) return '0'
  return Number(val).toLocaleString('en-US')
}

// 🌟 專門處理千分位輸入框的清洗函式，徹底解決 TS 型別與 null 問題
function onAmountInput(val: string | number | null) {
  if (val === null || val === undefined) {
    auditForm.approveAmount = 0;
    return;
  }
  
  // 強制轉字串後，拔掉所有逗號
  const cleanNum = String(val).replace(/,/g, '').trim();
  
  // 如果被刪光了就給 0，否則轉成標準 Number 存回後端需要的變數
  auditForm.approveAmount = cleanNum === '' ? 0 : Number(cleanNum);
}

// 新增：依生日動態計算年齡
function calculateAge(birthday: string | null | undefined): string {
  if (!birthday) return '未提供生日'
  const birthDate = new Date(birthday)
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  
  // 若今年生日還沒過，年齡減一歲
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return isNaN(age) ? '格式錯誤' : `${age} 歲`
}

// 新增：格式化性別代碼為中文
function formatGender(gender: string | null | undefined): string {
  if (!gender) return '-'
  const g = gender.toUpperCase().trim()
  if (g === 'M' || g === 'MALE') return '男 (Male)'
  if (g === 'F' || g === 'FEMALE') return '女 (Female)'
  return gender
}

// 新增：格式化風險等級代碼
function formatRiskLevel(level: string | null | undefined): string {
  if (!level) return '未評估'
  const l = level.toUpperCase().trim()
  if (l === 'HIGH') return '高風險 (HIGH)'
  if (l === 'MEDIUM') return '中風險 (MEDIUM)'
  if (l === 'LOW') return '低風險 (LOW)'
  return level
}
</script>