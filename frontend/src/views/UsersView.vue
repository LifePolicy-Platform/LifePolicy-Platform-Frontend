<script setup lang="ts">
import { ref, onMounted } from 'vue'
import PageHero from '@/components/layout/PageHero.vue'
import { fetchUsers, registerUser, updateUser, deleteUser, type User } from '../services/userService'

const users = ref<User[]>([])
const loading = ref(false)
const submitting = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

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

const roleOptions = [
  { label: 'APPLICANT', value: 'APPLICANT' },
  { label: 'REVIEWER', value: 'REVIEWER' },
]

const columns = [
  { name: 'username', label: '帳號', field: 'USERNAME', align: 'left' as const },
  { name: 'displayName', label: '顯示名稱', field: 'DISPLAY_NAME', align: 'left' as const },
  { name: 'role', label: '角色', field: 'ROLE_CODE', align: 'left' as const },
  { name: 'status', label: '狀態', field: 'STATUS', align: 'left' as const },
  { name: 'actions', label: '操作', field: 'actions', align: 'left' as const },
]

async function loadUsers() {
  loading.value = true
  try {
    users.value = await fetchUsers()
  } catch {
    errorMessage.value = '載入使用者失敗'
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
  submitting.value = true
  successMessage.value = ''
  errorMessage.value = ''

  try {
    if (formMode.value === 'create') {
      await registerUser({
        USERNAME: form.value.username,
        PASSWORD: form.value.password,
        DISPLAY_NAME: form.value.displayName || form.value.username,
      })
      successMessage.value = `使用者 ${form.value.username} 新增成功`
    } else {
      await updateUser(form.value.username, {
        PASSWORD: form.value.password,
        DISPLAY_NAME: form.value.displayName,
        STATUS: form.value.enabled ? 'ACTIVE' : 'INACTIVE',
        ROLE: form.value.role,
      })
      successMessage.value = `使用者 ${form.value.username} 修改成功`
    }
    closeForm()
    await loadUsers()
  } catch (error: unknown) {
    const err = error as { response?: { data?: { MESSAGE?: string } } }
    errorMessage.value = err.response?.data?.MESSAGE || '操作失敗'
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
    successMessage.value = `使用者 ${user.USERNAME} 已${newStatus === 'ACTIVE' ? '啟用' : '停用'}`
  } catch {
    errorMessage.value = '操作失敗'
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
  successMessage.value = ''
  errorMessage.value = ''
  try {
    await deleteUser(deleteTarget.value.USERNAME)
    successMessage.value = `使用者 ${deleteTarget.value.USERNAME} 已刪除`
    showDeleteConfirm.value = false
    deleteTarget.value = null
    await loadUsers()
  } catch (error: unknown) {
    const err = error as { response?: { data?: { MESSAGE?: string } } }
    errorMessage.value = err.response?.data?.MESSAGE || '刪除失敗'
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadUsers()
})
</script>

<template>
  <section class="page-with-hero">
    <PageHero title="使用者管理" subtitle="管理系統使用者帳號、角色與啟用狀態" />

    <div class="page-body">
      <q-banner v-if="successMessage" rounded class="page-alert page-alert--success">
        {{ successMessage }}
      </q-banner>
      <q-banner v-if="errorMessage" rounded class="page-alert page-alert--error">
        {{ errorMessage }}
      </q-banner>

      <q-card flat class="page-card page-card--data">
        <q-card-section>
          <div class="page-card__header q-mb-md">
            <div>
              <p class="page-card__kicker">USER LIST</p>
              <div class="page-card__title">所有使用者</div>
              <p class="page-card__desc">共 {{ users.length }} 位使用者</p>
            </div>
            <q-btn color="primary" unelevated icon="person_add" label="新增使用者" no-caps @click="openCreate" />
          </div>

          <q-table
            class="app-table"
            :rows="users"
            :columns="columns"
            row-key="USERNAME"
            flat
            bordered
            dense
            :loading="loading"
            no-data-label="查無使用者"
          >
            <template #body-cell-role="props">
              <q-td :props="props">
                <q-chip dense size="sm" color="primary" text-color="white">
                  {{ props.row.ROLE_CODE }}
                </q-chip>
              </q-td>
            </template>
            <template #body-cell-status="props">
              <q-td :props="props">
                <q-chip
                  dense
                  size="sm"
                  :color="props.row.STATUS === 'ACTIVE' ? 'positive' : 'grey-5'"
                  text-color="white"
                >
                  {{ props.row.STATUS === 'ACTIVE' ? '啟用' : '停用' }}
                </q-chip>
              </q-td>
            </template>
            <template #body-cell-actions="props">
              <q-td :props="props">
                <div class="q-gutter-xs">
                  <q-btn size="sm" dense flat color="primary" label="修改" no-caps @click="openEdit(props.row)" />
                  <q-btn size="sm" dense flat color="primary" :label="props.row.STATUS === 'ACTIVE' ? '停用' : '啟用'" no-caps @click="toggleUser(props.row)" />
                  <q-btn size="sm" dense flat color="negative" label="刪除" no-caps @click="openDeleteConfirm(props.row)" />
                </div>
              </q-td>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </div>

    <q-dialog v-model="showForm" persistent>
      <q-card style="min-width: 420px; max-width: 520px">
        <q-card-section>
          <div class="page-card__kicker">{{ formMode === 'create' ? 'CREATE' : 'UPDATE' }}</div>
          <div class="text-h6">{{ formMode === 'create' ? '新增使用者' : `修改 ${form.username}` }}</div>
        </q-card-section>
        <q-card-section class="q-pt-none q-gutter-md">
          <q-input
            v-model="form.username"
            label="帳號"
            dense
            outlined
            :disable="formMode === 'edit'"
          />
          <q-input
            v-model="form.password"
            label="密碼"
            type="password"
            dense
            outlined
            :hint="formMode === 'edit' ? '不填則不修改密碼' : undefined"
          />
          <q-input v-model="form.displayName" label="顯示名稱" dense outlined />
          <q-select
            v-model="form.role"
            :options="roleOptions"
            label="角色"
            dense
            outlined
            emit-value
            map-options
          />
          <q-toggle v-if="formMode === 'edit'" v-model="form.enabled" label="啟用帳號" color="primary" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="取消" :disable="submitting" @click="closeForm" />
          <q-btn color="primary" unelevated label="送出" :loading="submitting" @click="handleSubmit" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showDeleteConfirm" persistent>
      <q-card style="min-width: 360px">
        <q-card-section>
          <div class="text-h6 text-negative">確認刪除</div>
          <p class="q-mt-sm q-mb-none">
            確定要刪除使用者 <strong>{{ deleteTarget?.USERNAME }}</strong> 嗎？此操作無法復原。
          </p>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="取消" @click="cancelDelete" />
          <q-btn color="negative" unelevated label="確認刪除" :loading="submitting" @click="confirmDelete" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </section>
</template>
