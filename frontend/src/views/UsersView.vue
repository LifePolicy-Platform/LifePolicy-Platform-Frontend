<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import PageHero from '@/components/layout/PageHero.vue'
import { fetchUsers, registerUser, updateUser, type User } from '../services/userService'

const $q = useQuasar()

const users = ref<User[]>([])
const loading = ref(false)
const submitting = ref(false)

// ── Dialog ────────────────────────────────────────────────
const dialogOpen = ref(false)
const formMode = ref<'create' | 'edit'>('create')
const form = reactive({
  username: '',
  password: '',
  displayName: '',
  role: 'APPLICANT',
  enabled: true,
})

// ── Confirm modal (destructive actions) ───────────────────
type ModalType = 'warn' | 'active' | 'danger'
const confirmModal = reactive({
  show: false,
  type: 'warn' as ModalType,
  title: '',
  message: '',
  confirmLabel: '',
  onConfirm: () => {},
})
const confirmTarget = ref<User | null>(null)

function closeConfirmModal() {
  confirmModal.show = false
  confirmTarget.value = null
}

// ── Load ──────────────────────────────────────────────────
async function loadUsers() {
  loading.value = true
  try {
    users.value = await fetchUsers()
  } catch {
    $q.notify({ type: 'negative', message: '載入使用者失敗' })
  } finally {
    loading.value = false
  }
}

// ── Form ──────────────────────────────────────────────────
function openCreate() {
  formMode.value = 'create'
  Object.assign(form, { username: '', password: '', displayName: '', role: 'APPLICANT', enabled: true })
  dialogOpen.value = true
}

function openEdit(user: User) {
  formMode.value = 'edit'
  Object.assign(form, {
    username: user.USERNAME,
    password: '',
    displayName: user.DISPLAY_NAME,
    role: user.ROLE_CODE || 'APPLICANT',
    enabled: user.STATUS === 'ACTIVE',
  })
  dialogOpen.value = true
}

async function handleSubmit() {
  submitting.value = true
  try {
    if (formMode.value === 'create') {
      await registerUser({
        USERNAME: form.username,
        PASSWORD: form.password,
        DISPLAY_NAME: form.displayName || form.username,
      })
      $q.notify({ type: 'positive', message: `使用者 ${form.username} 新增成功` })
    } else {
      await updateUser(form.username, {
        PASSWORD: form.password,
        DISPLAY_NAME: form.displayName,
        STATUS: form.enabled ? 'ACTIVE' : 'INACTIVE',
        ROLE: form.role,
      })
      $q.notify({ type: 'positive', message: `使用者 ${form.username} 修改成功` })
    }
    dialogOpen.value = false
    await loadUsers()
  } catch (error: any) {
    const data = error.response?.data
    $q.notify({ type: 'negative', message: data?.MESSAGE ?? data?.message ?? '操作失敗' })
  } finally {
    submitting.value = false
  }
}

// ── Toggle active/inactive ────────────────────────────────
async function toggleUser(user: User) {
  const newStatus = user.STATUS === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
  try {
    await updateUser(user.USERNAME, {
      PASSWORD: '',
      DISPLAY_NAME: user.DISPLAY_NAME,
      STATUS: newStatus,
      ROLE: user.ROLE_CODE || 'APPLICANT',
    })
    $q.notify({
      type: newStatus === 'ACTIVE' ? 'positive' : 'warning',
      message: `使用者 ${user.USERNAME} 已${newStatus === 'ACTIVE' ? '啟用' : '停用'}`,
    })
    await loadUsers()
  } catch (error: any) {
    const data = error.response?.data
    $q.notify({ type: 'negative', message: data?.MESSAGE ?? data?.message ?? '操作失敗' })
  }
}

function openDeactivateConfirm(user: User) {
  confirmTarget.value = user
  Object.assign(confirmModal, {
    show: true,
    type: 'warn',
    title: '確認停用',
    message: `確定要停用使用者 ${user.USERNAME} 嗎？停用後該帳號將無法登入系統。`,
    confirmLabel: '確認停用',
    onConfirm: async () => {
      if (!confirmTarget.value) return
      await toggleUser(confirmTarget.value)
      closeConfirmModal()
    },
  })
}

function openActivateConfirm(user: User) {
  confirmTarget.value = user
  Object.assign(confirmModal, {
    show: true,
    type: 'active',
    title: '確認啟用',
    message: `確定要啟用使用者 ${user.USERNAME} 嗎？啟用後該帳號可以登入系統。`,
    confirmLabel: '確認啟用',
    onConfirm: async () => {
      if (!confirmTarget.value) return
      await toggleUser(confirmTarget.value)
      closeConfirmModal()
    },
  })
}

onMounted(() => loadUsers())

// ── Table columns ─────────────────────────────────────────
const columns = [
  { name: 'USERNAME',     label: '帳號',   field: 'USERNAME',     align: 'left'   as const, sortable: true },
  { name: 'DISPLAY_NAME', label: '顯示名稱', field: 'DISPLAY_NAME', align: 'left'   as const },
  { name: 'ROLE_CODE',    label: '角色',   field: 'ROLE_CODE',    align: 'left'   as const },
  { name: 'STATUS',       label: '狀態',   field: 'STATUS',       align: 'center' as const },
  { name: 'actions',      label: '操作',   field: 'actions',      align: 'center' as const },
]

const roleOptions = [
  { label: 'APPLICANT（業務）',   value: 'APPLICANT' },
  { label: 'REVIEWER（主管）',    value: 'REVIEWER'  },
  { label: 'ADMIN（系統管理員）', value: 'ADMIN'     },
]

function roleColor(role: string) {
  if (role === 'ADMIN')     return 'deep-purple-6'
  if (role === 'REVIEWER')  return 'blue-7'
  return 'teal-6'
}
</script>

<template>
  <section class="page-with-hero">
    <PageHero title="使用者管理" subtitle="管理系統帳號、角色與啟用狀態" />

    <div class="page-body">
      <!-- 標題列 + 新增按鈕 -->
      <q-card flat class="page-card page-card--filter">
        <q-card-section>
          <div class="page-card__header">
            <div>
              <p class="page-card__kicker">USER MANAGEMENT</p>
              <div class="page-card__title">使用者清單</div>
              <p class="page-card__desc">共 {{ users.length }} 位使用者</p>
            </div>
            <q-btn
              color="teal-7"
              unelevated
              icon="person_add"
              label="新增使用者"
              @click="openCreate"
            />
          </div>
        </q-card-section>
      </q-card>

      <!-- 清單 -->
      <q-card flat class="page-card page-card--data">
        <q-card-section>
          <q-table
            class="app-table"
            :rows="users"
            :columns="columns"
            row-key="USERNAME"
            flat
            bordered
            dense
            :loading="loading"
            no-data-label="尚無使用者資料"
          >
            <template #body-cell-ROLE_CODE="props">
              <q-td :props="props">
                <q-chip dense size="sm" :color="roleColor(props.row.ROLE_CODE)" text-color="white">
                  {{ props.row.ROLE_CODE }}
                </q-chip>
              </q-td>
            </template>

            <template #body-cell-STATUS="props">
              <q-td :props="props">
                <q-badge
                  :color="props.row.STATUS === 'ACTIVE' ? 'positive' : 'grey-5'"
                  :label="props.row.STATUS === 'ACTIVE' ? '啟用' : '停用'"
                  class="q-pa-xs"
                />
              </q-td>
            </template>

            <template #body-cell-actions="props">
              <q-td :props="props">
                <div class="q-gutter-xs">
                  <q-btn
                    size="sm" color="blue-grey-6" flat dense
                    icon="edit" label="修改"
                    @click="openEdit(props.row)"
                  />
                  <q-btn
                    v-if="props.row.STATUS === 'ACTIVE'"
                    size="sm" color="orange-7" flat dense
                    icon="block" label="停用"
                    @click="openDeactivateConfirm(props.row)"
                  />
                  <q-btn
                    v-else
                    size="sm" color="positive" flat dense
                    icon="check_circle" label="啟用"
                    @click="openActivateConfirm(props.row)"
                  />
                </div>
              </q-td>
            </template>

            <template #no-data>
              <div class="page-empty">
                <q-icon name="people" class="page-empty__icon" />
                <div>尚無使用者資料</div>
              </div>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </div>
  </section>

  <!-- 新增 / 修改 Dialog -->
  <q-dialog v-model="dialogOpen" persistent>
    <q-card style="width: 520px; max-width: 95vw;">
      <q-card-section class="row items-center bg-teal-7 text-white q-py-sm">
        <div class="text-h6 text-weight-bold">
          {{ formMode === 'create' ? '新增使用者' : `修改 ${form.username}` }}
        </div>
        <q-space />
        <q-btn icon="close" flat round dense @click="dialogOpen = false" />
      </q-card-section>

      <q-card-section>
        <div class="user-form-grid">
          <q-input
            v-model="form.username"
            label="帳號"
            outlined dense
            :disable="formMode === 'edit'"
            class="span-2"
          />
          <q-input
            v-model="form.password"
            label="密碼"
            type="password"
            outlined dense
            :placeholder="formMode === 'edit' ? '不填則不修改密碼' : ''"
          />
          <q-input
            v-model="form.displayName"
            label="顯示名稱"
            outlined dense
          />
          <q-select
            v-model="form.role"
            :options="roleOptions"
            label="角色"
            outlined dense
            emit-value map-options
          />
          <q-select
            v-if="formMode === 'edit'"
            v-model="form.enabled"
            :options="[{ label: '啟用', value: true }, { label: '停用', value: false }]"
            label="狀態"
            outlined dense
            emit-value map-options
          />
        </div>
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md q-pt-none">
        <q-btn flat label="取消" @click="dialogOpen = false" />
        <q-btn
          color="teal-7"
          unelevated
          :label="submitting ? '處理中...' : '送出'"
          :loading="submitting"
          @click="handleSubmit"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- 確認彈窗 -->
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="confirmModal.show" class="modal-backdrop" @click.self="closeConfirmModal">
        <div class="modal-card" :class="`modal-card--${confirmModal.type}`">
          <div class="modal-header">
            <span class="modal-icon">
              <template v-if="confirmModal.type === 'warn'">⚠️</template>
              <template v-else-if="confirmModal.type === 'active'">✅</template>
              <template v-else>🗑️</template>
            </span>
            <p class="modal-title" :class="`modal-title--${confirmModal.type}`">
              {{ confirmModal.title }}
            </p>
          </div>
          <p class="modal-body">{{ confirmModal.message }}</p>
          <div class="modal-actions">
            <button
              class="modal-confirm-btn"
              :class="`modal-confirm-btn--${confirmModal.type}`"
              :disabled="submitting"
              @click="confirmModal.onConfirm"
            >
              {{ submitting ? '處理中...' : confirmModal.confirmLabel }}
            </button>
            <button class="ghost-button" :disabled="submitting" @click="closeConfirmModal">
              取消
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.user-form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.span-2 {
  grid-column: span 2;
}

.page-empty {
  text-align: center;
  padding: 32px;
  color: #718096;
}

.page-empty__icon {
  font-size: 40px;
  display: block;
  margin: 0 auto 12px;
  color: #cbd5e0;
}

/* ── 確認彈窗 ── */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9000;
  padding: 16px;
}

.modal-card {
  width: 100%;
  max-width: 420px;
  background: #fff;
  border-radius: 20px;
  padding: 28px 32px;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.18);
  display: grid;
  gap: 16px;
}

.modal-card--warn   { border-top: 4px solid #f59e0b; }
.modal-card--active { border-top: 4px solid #10b981; }
.modal-card--danger { border-top: 4px solid #ef4444; }

.modal-header { display: flex; align-items: center; gap: 10px; }
.modal-icon   { font-size: 22px; line-height: 1; }

.modal-title { margin: 0; font-size: 18px; font-weight: 700; }
.modal-title--warn   { color: #b45309; }
.modal-title--active { color: #065f46; }
.modal-title--danger { color: #a63934; }

.modal-body { margin: 0; line-height: 1.75; color: #3d3d3d; font-size: 14px; }

.modal-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 4px; }

.modal-confirm-btn {
  padding: 10px 20px;
  border: 0;
  border-radius: 999px;
  font-weight: 700;
  cursor: pointer;
  color: #fff;
}
.modal-confirm-btn:disabled { cursor: not-allowed; opacity: 0.45; }
.modal-confirm-btn--warn   { background: linear-gradient(135deg, #d97706 0%, #b45309 100%); }
.modal-confirm-btn--active { background: linear-gradient(135deg, #059669 0%, #047857 100%); }
.modal-confirm-btn--danger { background: linear-gradient(135deg, #c0392b 0%, #922b21 100%); }

.ghost-button {
  padding: 10px 16px;
  background: #f2e9d8;
  color: #6e4d2f;
  border: 0;
  border-radius: 999px;
  font-weight: 700;
  cursor: pointer;
}
.ghost-button:disabled { cursor: not-allowed; opacity: 0.45; }

.modal-enter-active, .modal-leave-active { transition: opacity 0.18s ease; }
.modal-enter-active .modal-card, .modal-leave-active .modal-card {
  transition: transform 0.18s ease, opacity 0.18s ease;
}
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from .modal-card, .modal-leave-to .modal-card {
  transform: translateY(-12px) scale(0.97);
  opacity: 0;
}
</style>