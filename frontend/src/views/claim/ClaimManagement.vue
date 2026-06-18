<template>
  <q-page class="q-pa-md bg-grey-1">
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
          <q-btn color="grey-6" label="重置" @click="resetFilters" />
        </div>
      </q-card-section>
    </q-card>

    <q-table :rows="rows" :columns="columns" row-key="claimNo" :loading="loading" flat bordered class="bg-white">
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
            {{ dialog.isView ? '🔍 案件詳細資料' : dialog.form.claimNo ? '✏️ 修改理賠資料' : '📞 電話受理登記' }}
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
          <div class="col-6">
            <q-input v-model.number="dialog.form.memberId" type="number" label="客戶 ID" dense outlined :readonly="dialog.isView" />
          </div>
          <div class="col-6">
            <q-input v-model="dialog.form.policyNo" label="保單號碼" dense outlined :readonly="dialog.isView" />
          </div>
          <div class="col-6">
            <q-input v-model.number="dialog.form.claimAmount" type="number" label="申請理賠金額" dense outlined :readonly="dialog.isView" />
          </div>
          <div class="col-6">
            <q-input v-model.number="dialog.form.approveAmount" type="number" label="核決理賠金額" dense outlined :readonly="dialog.isView" placeholder="審核中則留空" />
          </div>
          <div class="col-6">
            <q-input v-model.number="dialog.form.agentId" type="number" label="經辦人員 ID" dense outlined :readonly="dialog.isView" />
          </div>
          <div class="col-6">
            <q-input v-model="dialog.form.updateUser" label="最後異動帳號" dense outlined :readonly="dialog.isView" />
          </div>
          <div class="col-12">
            <q-input v-model="dialog.form.remark" type="textarea" rows="3" label="理賠備註原因" dense outlined :readonly="dialog.isView" />
          </div>

          <div class="col-12 q-mt-md" v-if="dialog.form.file01Path || dialog.form.file02Path || dialog.isView">
            <div class="text-subtitle2 text-weight-bold text-grey-8 q-mb-xs">📂 附加理賠佐證文件</div>
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
          <q-btn label="關閉" color="grey" v-close-popup />
          <q-btn v-if="!dialog.isView" label="確認儲存" color="primary" @click="saveClaim" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import type { QTableProps } from 'quasar'
import { fetchClaims, fetchClaimDetail, createClaimApi, updateClaimApi, deleteClaimApi, type ClaimModel } from '@/api/claim'

const $q = useQuasar()

const filters = reactive({ status: '', policyNo: '', applyDate: '' })
const statusOptions = [
  { label: 'PENDING (待審核)', value: 'PENDING' },
  { label: 'REVIEWING (審核中)', value: 'REVIEWING' },
  { label: 'APPROVED (已獲批)', value: 'APPROVED' },
  { label: 'REJECTED (已駁回)', value: 'REJECTED' }
]

const loading = ref(false)
const rows = ref<ClaimModel[]>([])
const columns: QTableProps['columns'] = [
  { name: 'claimNo', label: '理賠案號', field: 'claimNo', align: 'left', sortable: true },
  { name: 'policyNo', label: '保單號碼', field: 'policyNo', align: 'left' },
  { name: 'claimAmount', label: '申請金額', field: 'claimAmount', align: 'right' },
  { name: 'approveAmount', label: '核決金額', field: 'approveAmount', align: 'right', format: (val: any) => val ?? '-' },
  { name: 'claimStatus', label: '狀態', field: 'claimStatus', align: 'center' },
  { name: 'updateUser', label: '異動人員', field: 'updateUser', align: 'center' },
  { name: 'actions', label: '操作面板', field: 'actions', align: 'center' }
]

const dialog = reactive({
  show: false,
  isView: false,
  form: {} as ClaimModel
})

async function loadData() {
  loading.value = true
  try {
    const res = await fetchClaims(filters)
    rows.value = res.DATA // 💡 配合優化後的 API 宣告，直接拿 res.DATA 即可
  } catch (err) {
    $q.notify({ type: 'negative', message: '載入理賠清單失敗' })
  } finally {
    loading.value = false
  }
}

function resetFilters() {
  filters.status = ''
  filters.policyNo = ''
  filters.applyDate = ''
  loadData()
}

function openDialog(targetRow: ClaimModel | null) {
  dialog.isView = false
  if (targetRow) {
    dialog.form = { ...targetRow }
  } else {
    dialog.form = { memberId: null, policyNo: '', claimAmount: 0, approveAmount: null, agentId: null, remark: '', updateUser: '' }
  }
  dialog.show = true
}

async function viewDetail(row: ClaimModel) {
  try {
    const res = await fetchClaimDetail(row.claimNo!)
    dialog.form = res.DATA // 💡 配合優化後的 API 宣告，直接拿 res.DATA 即可
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
  try {
    if (dialog.form.claimNo) {
      await updateClaimApi(dialog.form.claimNo, dialog.form)
      $q.notify({ type: 'positive', message: '修改成功！' })
    } else {
      await createClaimApi(dialog.form)
      $q.notify({ type: 'positive', message: '電話受理登記成功！' })
    }
    dialog.show = false
    loadData()
  } catch (err) {
    $q.notify({ type: 'negative', message: '儲存理賠案件時發生錯誤' })
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
      $q.notify({ type: 'positive', message: '案件已成功切除' })
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