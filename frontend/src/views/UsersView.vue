<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import PageHero from '@/components/layout/PageHero.vue'
import {
  deleteUser,
  fetchUsers,
  registerUser,
  updateUser,
  type User,
} from '@/services/userService'

const $q = useQuasar()

const users = ref<User[]>([])
const loading = ref(false)
const submitting = ref(false)

const searchQuery = ref('')
const filterRole = ref('')
const filterStatus = ref('')

const showForm = ref(false)
const formMode = ref<'create' | 'edit'>('create')
const form = ref({
  username: '',
  password: '',
  displayName: '',
  role: 'APPLICANT',
  enabled: true,
})

const showDeleteConfirm = ref(false)
const deleteTarget = ref<User | null>(null)

const ROLE_LABEL: Record<string, string> = {
  APPLICANT: '申請人',
  REVIEWER: '審核人',
}

const ROLE_COLOR: Record<string, string> = {
  APPLICANT: 'blue-6',
  REVIEWER: 'purple-6',
}

const roleOptions = [
  { label: '全部角色', value: '' },
  { label: '申請人', value: 'APPLICANT' },
  { label: '審核人', value: 'REVIEWER' },
]

const statusOptions = [
  { label: '全部狀態', value: '' },
  { label: '啟用', value: 'ACTIVE' },
  { label: '停用', value: 'INACTIVE' },
]

const roleFormOptions = [
  { label: '申請人', value: 'APPLICANT' },
  { label: '審核人', value: 'REVIEWER' },
]

const enabledOptions = [
  { label: '啟用', value: true },
  { label: '停用', value: false },
]

const activeCount = computed(() => users.value.filter((u) => u.STATUS === 'ACTIVE').length)
const inactiveCount = computed(() => users.value.filter((u) => u.STATUS !== 'ACTIVE').length)

const filteredUsers = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  return users.value.filter((user) => {
    const matchQuery =
      !q ||
      user.USERNAME.toLowerCase().includes(q) ||
      user.DISPLAY_NAME.toLowerCase().includes(q)
    const matchRole = !filterRole.value || user.ROLE_CODE === filterRole.value
    const matchStatus = !filterStatus.value || user.STATUS === filterStatus.value
    return matchQuery && matchRole && matchStatus
  })
})

const columns = [
  { name: 'user', label: '使用者', field: 'USERNAME', align: 'left' as const, sortable: true },
  { name: 'role', label: '角色', field: 'ROLE_CODE', align: 'left' as const },
  { name: 'status', label: '狀態', field: 'STATUS', align: 'center' as const },
  { name: 'actions', label: '操作', field: 'actions', align: 'center' as const },
]

function roleLabel(code: string) {
  return ROLE_LABEL[code] ?? code
}

function roleColor(code: string) {
  return ROLE_COLOR[code] ?? 'blue-grey-5'
}

function userInitials(user: User) {
  const name = user.DISPLAY_NAME?.trim() || user.USERNAME
  return name.slice(0, 1).toUpperCase()
}

function resetFilter() {
  searchQuery.value = ''
  filterRole.value = ''
  filterStatus.value = ''
}

async function loadUsers() {
  loading.value = true
  try {
    users.value = await fetchUsers()
  } catch {
    $q.notify({ type: 'negative', message: '載入使用者失敗', position: 'top' })
  } finally {
    loading.value = false
  }
}

function openCreate() {
  formMode.value = 'create'
  form.value = { username: '', password: '', displayName: '', role: 'APPLICANT', enabled: true }
  showForm.value = true
}

function openEdit(user: User) {
  formMode.value = 'edit'
  form.value = {
    username: user.USERNAME,
    password: '',
    displayName: user.DISPLAY_NAME,
    role: user.ROLE_CODE || 'APPLICANT',
    enabled: user.STATUS === 'ACTIVE',
  }
  showForm.value = true
}

function closeForm() {
  showForm.value = false
}

async function handleSubmit() {
  if (!form.value.username.trim()) {
    $q.notify({ type: 'warning', message: '請輸入帳號', position: 'top' })
    return
  }
  if (formMode.value === 'create' && !form.value.password.trim()) {
    $q.notify({ type: 'warning', message: '請輸入密碼', position: 'top' })
    return
  }

  submitting.value = true
  try {
    if (formMode.value === 'create') {
      await registerUser({
        USERNAME: form.value.username,
        PASSWORD: form.value.password,
        DISPLAY_NAME: form.value.displayName || form.value.username,
      })
      $q.notify({ type: 'positive', message: `使用者 ${form.value.username} 新增成功` })
    } else {
      await updateUser(form.value.username, {
        PASSWORD: form.value.password,
        DISPLAY_NAME: form.value.displayName,
        STATUS: form.value.enabled ? 'ACTIVE' : 'INACTIVE',
        ROLE: form.value.role,
      })
      $q.notify({ type: 'positive', message: `使用者 ${form.value.username} 修改成功` })
    }
    closeForm()
    await loadUsers()
  } catch (error: unknown) {
    const data = (error as { response?: { data?: { MESSAGE?: string; message?: string } } })?.response?.data
    $q.notify({
      type: 'negative',
      message: data?.MESSAGE ?? data?.message ?? '操作失敗',
      position: 'top',
    })
  } finally {
    submitting.value = false
  }
}

async function toggleUser(user: User) {
  try {
    const newStatus = user.STATUS === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    await updateUser(user.USERNAME, {
      PASSWORD: '',
      DISPLAY_NAME: user.DISPLAY_NAME,
      STATUS: newStatus,
      ROLE: user.ROLE_CODE || 'APPLICANT',
    })
    await loadUsers()
    $q.notify({
      type: newStatus === 'ACTIVE' ? 'positive' : 'warning',
      message: `使用者 ${user.USERNAME} 已${newStatus === 'ACTIVE' ? '啟用' : '停用'}`,
    })
  } catch (error: unknown) {
    const data = (error as { response?: { data?: { MESSAGE?: string; message?: string } } })?.response?.data
    $q.notify({
      type: 'negative',
      message: data?.MESSAGE ?? data?.message ?? '操作失敗',
      position: 'top',
    })
  }
}

function openDeleteConfirm(user: User) {
  deleteTarget.value = user
  showDeleteConfirm.value = true
}

function cancelDelete() {
  deleteTarget.value = null
  showDeleteConfirm.value = false
}

async function confirmDelete() {
  if (!deleteTarget.value) return
  submitting.value = true
  try {
    await deleteUser(deleteTarget.value.USERNAME)
    $q.notify({ type: 'positive', message: `使用者 ${deleteTarget.value.USERNAME} 已刪除` })
    showDeleteConfirm.value = false
    deleteTarget.value = null
    await loadUsers()
  } catch (error: unknown) {
    const data = (error as { response?: { data?: { MESSAGE?: string; message?: string } } })?.response?.data
    $q.notify({
      type: 'negative',
      message: data?.MESSAGE ?? data?.message ?? '刪除失敗',
      position: 'top',
    })
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadUsers()
})
</script>

<template>
  <section class="page-with-hero users-page">
    <PageHero
      title="使用者管理"
      subtitle="管理系統使用者帳號、角色與啟用狀態"
      compact
    />

    <div class="page-body">
      <!-- 篩選 -->
      <q-card flat class="page-card page-card--filter q-mb-md">
        <q-card-section>
          <div class="page-card__header q-mb-sm">
            <div>
              <p class="page-card__kicker">USER FILTER</p>
              <div class="page-card__title">查詢條件</div>
              <p class="page-card__desc">可依帳號、顯示名稱、角色或狀態篩選</p>
            </div>
          </div>

          <div class="users-filter-grid q-mt-md">
            <q-input
              v-model="searchQuery"
              label="關鍵字搜尋"
              outlined
              dense
              clearable
              placeholder="帳號或顯示名稱"
            >
              <template #prepend>
                <q-icon name="search" />
              </template>
            </q-input>
            <q-select
              v-model="filterRole"
              :options="roleOptions"
              label="角色"
              outlined
              dense
              emit-value
              map-options
            />
            <q-select
              v-model="filterStatus"
              :options="statusOptions"
              label="狀態"
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
              :loading="loading"
              @click="loadUsers"
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

      <!-- 使用者清單 -->
      <q-card flat class="page-card page-card--data">
        <q-card-section>
          <div class="page-card__header q-mb-md">
            <div>
              <p class="page-card__kicker">USER LIST</p>
              <div class="page-card__title">使用者清單</div>
              <p class="page-card__desc">
                共 {{ filteredUsers.length }} 筆結果
                <span v-if="filteredUsers.length !== users.length">（全部 {{ users.length }} 筆）</span>
              </p>
            </div>
            <div class="users-toolbar">
              <div class="users-stats" aria-label="使用者狀態統計">
                <q-chip dense size="sm" color="positive" text-color="white" icon="check_circle">
                  啟用 {{ activeCount }}
                </q-chip>
                <q-chip dense size="sm" color="grey-5" text-color="white" icon="pause_circle">
                  停用 {{ inactiveCount }}
                </q-chip>
              </div>
              <q-btn
                color="primary"
                unelevated
                icon="person_add"
                label="新增使用者"
                no-caps
                @click="openCreate"
              />
            </div>
          </div>

          <q-table
            class="app-table users-table"
            :rows="filteredUsers"
            :columns="columns"
            row-key="USERNAME"
            flat
            bordered
            dense
            :loading="loading"
            hide-pagination
            :rows-per-page-options="[0]"
            no-data-label="查無符合條件的使用者"
          >
            <template #body-cell-user="props">
              <q-td :props="props">
                <div class="user-cell">
                  <q-avatar
                    size="36px"
                    :color="props.row.STATUS === 'ACTIVE' ? 'primary' : 'grey-5'"
                    text-color="white"
                  >
                    {{ userInitials(props.row) }}
                  </q-avatar>
                  <div class="user-cell__info">
                    <span class="user-cell__name">{{ props.row.DISPLAY_NAME }}</span>
                    <span class="user-cell__username">@{{ props.row.USERNAME }}</span>
                  </div>
                </div>
              </q-td>
            </template>

            <template #body-cell-role="props">
              <q-td :props="props">
                <q-chip
                  dense
                  size="sm"
                  :color="roleColor(props.row.ROLE_CODE)"
                  text-color="white"
                  :icon="props.row.ROLE_CODE === 'REVIEWER' ? 'verified_user' : 'person'"
                >
                  {{ roleLabel(props.row.ROLE_CODE) }}
                </q-chip>
              </q-td>
            </template>

            <template #body-cell-status="props">
              <q-td :props="props">
                <q-badge
                  :color="props.row.STATUS === 'ACTIVE' ? 'positive' : 'grey-5'"
                  :label="props.row.STATUS === 'ACTIVE' ? '啟用' : '停用'"
                />
              </q-td>
            </template>

            <template #body-cell-actions="props">
              <q-td :props="props">
                <div class="users-actions">
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
                    :color="props.row.STATUS === 'ACTIVE' ? 'grey-7' : 'positive'"
                    :icon="props.row.STATUS === 'ACTIVE' ? 'block' : 'check_circle'"
                    :label="props.row.STATUS === 'ACTIVE' ? '停用' : '啟用'"
                    @click="toggleUser(props.row)"
                  />
                  <q-btn
                    size="sm"
                    flat
                    dense
                    no-caps
                    color="negative"
                    icon="delete_outline"
                    label="刪除"
                    @click="openDeleteConfirm(props.row)"
                  />
                </div>
              </q-td>
            </template>

            <template #no-data>
              <div class="users-empty">
                <q-icon name="group_off" size="40px" color="grey-5" />
                <p>查無符合條件的使用者</p>
                <q-btn
                  outline
                  color="primary"
                  label="新增第一位使用者"
                  no-caps
                  icon="person_add"
                  @click="openCreate"
                />
              </div>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </div>

    <!-- 新增 / 修改 Dialog -->
    <q-dialog v-model="showForm" persistent>
      <q-card class="users-dialog">
        <q-card-section class="users-dialog__header">
          <div>
            <p class="users-dialog__kicker">
              {{ formMode === 'create' ? 'NEW USER' : 'EDIT USER' }}
            </p>
            <div class="text-h6">
              {{ formMode === 'create' ? '新增使用者' : `修改 ${form.username}` }}
            </div>
            <p class="users-dialog__desc">
              {{
                formMode === 'create'
                  ? '建立新帳號後即可登入系統使用對應功能'
                  : '更新帳號資料，密碼留空則不變更'
              }}
            </p>
          </div>
          <q-btn icon="close" flat round dense v-close-popup aria-label="關閉" @click="closeForm" />
        </q-card-section>

        <q-separator />

        <q-card-section class="users-dialog__body">
          <p class="page-form-section__title">帳號資料</p>
          <div class="page-form-grid">
            <q-input
              v-model="form.username"
              label="帳號 *"
              dense
              outlined
              stack-label
              :readonly="formMode === 'edit'"
              :bg-color="formMode === 'edit' ? 'grey-2' : undefined"
              hint="建立後不可修改"
            />
            <q-input
              v-model="form.password"
              label="密碼"
              dense
              outlined
              stack-label
              type="password"
              :hint="formMode === 'edit' ? '不填則不修改密碼' : '新增時必填'"
            />
            <q-input
              v-model="form.displayName"
              label="顯示名稱"
              dense
              outlined
              stack-label
              placeholder="預設與帳號相同"
            />
            <q-select
              v-model="form.role"
              :options="roleFormOptions"
              label="角色"
              dense
              outlined
              emit-value
              map-options
            />
            <q-select
              v-if="formMode === 'edit'"
              v-model="form.enabled"
              :options="enabledOptions"
              label="狀態"
              dense
              outlined
              emit-value
              map-options
            />
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="取消" no-caps :disable="submitting" @click="closeForm" />
          <q-btn
            color="primary"
            unelevated
            :label="submitting ? '處理中...' : '確認送出'"
            no-caps
            :loading="submitting"
            @click="handleSubmit"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- 刪除確認 Dialog -->
    <q-dialog v-model="showDeleteConfirm" persistent>
      <q-card class="users-dialog users-dialog--danger">
        <q-card-section class="row items-center q-gutter-sm">
          <q-avatar icon="warning" color="negative" text-color="white" />
          <div>
            <div class="text-h6">確認刪除</div>
            <p class="users-dialog__desc q-mb-none">
              確定要刪除使用者
              <strong>{{ deleteTarget?.DISPLAY_NAME }}（{{ deleteTarget?.USERNAME }}）</strong>
              嗎？此操作無法復原。
            </p>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="取消" no-caps :disable="submitting" @click="cancelDelete" />
          <q-btn
            color="negative"
            unelevated
            :label="submitting ? '刪除中...' : '確認刪除'"
            no-caps
            :loading="submitting"
            @click="confirmDelete"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </section>
</template>

<style scoped>
.users-filter-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 16px;
}

.users-toolbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.users-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-cell__info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.user-cell__name {
  font-weight: 600;
  color: var(--notus-charcoal, #1a202c);
  line-height: 1.3;
}

.user-cell__username {
  font-size: 0.8rem;
  color: var(--notus-muted, #718096);
}

.users-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 4px;
}

.users-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 32px 16px;
  color: var(--notus-muted, #718096);
}

.users-empty p {
  margin: 0;
}

.users-dialog {
  width: min(520px, 92vw);
}

.users-dialog--danger {
  width: min(440px, 92vw);
}

.users-dialog__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.users-dialog__kicker {
  margin: 0 0 4px;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--notus-green-dark, #38a169);
}

.users-dialog__desc {
  margin: 6px 0 0;
  font-size: 0.875rem;
  color: var(--notus-muted, #718096);
  line-height: 1.5;
}

@media (max-width: 900px) {
  .users-filter-grid {
    grid-template-columns: 1fr;
  }

  .users-toolbar {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
