<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { fetchUsers, registerUser, updateUser, deleteUser, type User } from '../services/userService'


const router = useRouter()

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
  enabled: true
})

// 刪除確認
const showDeleteConfirm = ref(false)
const deleteTarget = ref<User | null>(null)

// 載入使用者清單
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

// 開啟新增表單
function openCreate() {
  formMode.value = 'create'
  form.value = { username: '', password: '', displayName: '', role: 'APPLICANT', enabled: true }
  showForm.value = true
}

// 開啟修改表單
function openEdit(user: User) {
  formMode.value = 'edit'
  form.value = {
    username: user.USERNAME,
    password: '',
    displayName: user.DISPLAY_NAME,
    role: user.ROLE_CODE || 'APPLICANT',
    enabled: user.STATUS === 'ACTIVE'
  }
  showForm.value = true
}

// 關閉表單
function closeForm() {
  showForm.value = false
}

// 送出表單
async function handleSubmit() {
  submitting.value = true
  successMessage.value = ''
  errorMessage.value = ''

  try {
    if (formMode.value === 'create') {
      await registerUser({
        USERNAME: form.value.username,
        PASSWORD: form.value.password,
        DISPLAY_NAME: form.value.displayName || form.value.username
      })
      successMessage.value = `使用者 ${form.value.username} 新增成功`
    } else {
      await updateUser(form.value.username, {
        PASSWORD: form.value.password,
        DISPLAY_NAME: form.value.displayName,
        STATUS: form.value.enabled ? 'ACTIVE' : 'INACTIVE',
        ROLE: form.value.role
      })
      successMessage.value = `使用者 ${form.value.username} 修改成功`
    }
    closeForm()
    await loadUsers()
  } catch (error: any) {
    const data = error.response?.data
    errorMessage.value = data?.MESSAGE ?? data?.message ?? '操作失敗'
  } finally {
    submitting.value = false
  }
}

// 停用/啟用使用者
async function toggleUser(user: User) {
  try {
    const newStatus = user.STATUS === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    await updateUser(user.USERNAME, {
      PASSWORD: '',
      DISPLAY_NAME: user.DISPLAY_NAME,
      STATUS: newStatus,
      ROLE: user.ROLE_CODE || 'APPLICANT'
    })
    await loadUsers()
    successMessage.value = `使用者 ${user.USERNAME} 已${newStatus === 'ACTIVE' ? '啟用' : '停用'}`
  } catch (error: any) {
    const data = error.response?.data
    errorMessage.value = data?.MESSAGE ?? data?.message ?? '操作失敗'
  }
}

// 開啟刪除確認
function openDeleteConfirm(user: User) {
  deleteTarget.value = user
  showDeleteConfirm.value = true
}

// 取消刪除
function cancelDelete() {
  deleteTarget.value = null
  showDeleteConfirm.value = false
}

// 確認刪除
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
  } catch (error: any) {
    const data = error.response?.data
    errorMessage.value = data?.MESSAGE ?? data?.message ?? '刪除失敗'
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadUsers()
})
</script>

<template>
  <div class="page-shell">
    <!-- Header -->
    <header class="hero-panel">
      <div>
        <p class="eyebrow">USER_MGMT</p>
        <h1>使用者管理</h1>
        <p class="hero-copy">管理系統使用者帳號、角色與啟用狀態。</p>
      </div>
      <div class="hero-side-card">
        <h2>操作說明</h2>
        <p>只有 REVIEWER 可以新增、修改、停用使用者。</p>
        <button class="link-button" @click="router.push('/dashboard')">
          返回工作台
        </button>
      </div>
    </header>

    <AuthCard />

    <!-- 全域訊息 -->
    <section class="status-strip">
      <div v-if="successMessage" class="message-box">{{ successMessage }}</div>
      <div v-if="errorMessage" class="message-box error">{{ errorMessage }}</div>
    </section>

    <!-- 使用者清單 -->
    <section class="content-card">
      <div class="panel-header">
        <div>
          <p class="panel-kicker">使用者清單</p>
          <h2>所有使用者</h2>
        </div>
        <button class="primary-button" @click="openCreate">新增使用者</button>
      </div>

      <!-- 載入中 -->
      <div v-if="loading" class="empty-row">載入中...</div>

      <!-- 表格 -->
      <div v-else class="table-shell">
        <table class="result-table">
          <thead>
            <tr>
              <th>帳號</th>
              <th>顯示名稱</th>
              <th>角色</th>
              <th>狀態</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!users.length">
              <td colspan="5" class="empty-row">查無使用者</td>
            </tr>
            <tr v-for="user in users" :key="user.USERNAME">
              <td>{{ user.USERNAME }}</td>
              <td>{{ user.DISPLAY_NAME }}</td>
              <td>
                <span class="role-pill">{{ user.ROLE_CODE }}</span>
              </td>
              <td>
                <span :class="user.STATUS === 'ACTIVE' ? 'badge-success' : 'badge-error'">
                  {{ user.STATUS === 'ACTIVE' ? '啟用' : '停用' }}
                </span>
              </td>
              <td>
                <div class="inline-actions">
                  <button class="action-button" @click="openEdit(user)">修改</button>
                  <button class="action-button" @click="toggleUser(user)">
                    {{ user.STATUS === 'ACTIVE' ? '停用' : '啟用' }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- 刪除確認區塊 -->
    <section v-if="showDeleteConfirm" class="content-card confirm-card">
      <p class="confirm-title">⚠️ 確認刪除</p>
      <p class="confirm-body">
        確定要刪除使用者 <strong>{{ deleteTarget?.USERNAME }}</strong> 嗎？此操作無法復原。
      </p>
      <div class="action-row">
        <button class="danger-button" @click="confirmDelete" :disabled="submitting">
          {{ submitting ? '刪除中...' : '確認刪除' }}
        </button>
        <button class="ghost-button" @click="cancelDelete">取消</button>
      </div>
    </section>

    <!-- 新增/修改表單 -->
    <section v-if="showForm" class="content-card">
      <div class="panel-header">
        <div>
          <p class="panel-kicker">{{ formMode === 'create' ? '新增' : '修改' }}</p>
          <h2>{{ formMode === 'create' ? '新增使用者' : `修改 ${form.username}` }}</h2>
        </div>
        <button class="ghost-button" @click="closeForm">取消</button>
      </div>

      <div class="form-grid">
        <label>
          帳號
          <input
            v-model="form.username"
            type="text"
            :disabled="formMode === 'edit'"
            required
          />
        </label>
        <label>
          密碼
          <input
            v-model="form.password"
            type="password"
            :placeholder="formMode === 'edit' ? '不填則不修改密碼' : ''"
          />
        </label>
        <label>
          顯示名稱
          <input v-model="form.displayName" type="text" />
        </label>
        <label>
          角色
          <select v-model="form.role">
            <option value="APPLICANT">APPLICANT</option>
            <option value="REVIEWER">REVIEWER</option>
          </select>
        </label>
        <label v-if="formMode === 'edit'">
          狀態
          <select v-model="form.enabled">
            <option :value="true">啟用</option>
            <option :value="false">停用</option>
          </select>
        </label>
      </div>

      <div class="action-row">
        <button class="primary-button" @click="handleSubmit" :disabled="submitting">
          {{ submitting ? '處理中...' : '送出' }}
        </button>
        <button class="ghost-button" @click="closeForm">取消</button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.page-shell {
  max-width: 1440px;
  margin: 0 auto;
  padding: 32px 24px 48px;
  display: grid;
  gap: 20px;
}

.hero-panel {
  display: grid;
  grid-template-columns: 1.8fr 1fr;
  gap: 24px;
  padding: 28px;
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.82);
  box-shadow: 0 24px 80px rgba(38, 57, 77, 0.12);
}

.eyebrow, .panel-kicker {
  margin: 0 0 8px;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: #876445;
  font-size: 12px;
  font-weight: 700;
}

.hero-panel h1 {
  margin: 0;
  font-family: "Noto Serif TC", serif;
  font-size: 32px;       /* 瀏覽器原生 h1 = 2em = 32px */
  line-height: 1.2;
  font-weight: bold;
}

.content-card h2,
.hero-side-card h2 {
  margin: 0;
  font-family: "Noto Serif TC", serif;
  font-size: 24px;       /* 瀏覽器原生 h2 = 1.5em = 24px */
  line-height: 1.3;
  font-weight: bold;
}

.hero-copy {
  line-height: 1.75;
}

.hero-side-card {
  padding: 22px;
  border-radius: 20px;
  background: linear-gradient(180deg, #172b4d 0%, #10203a 100%);
  color: #f9f5ef;
}

.hero-side-card h2 {
  margin: 0 0 12px;
  font-family: "Noto Serif TC", serif;
  color: #f9f5ef;
}

.hero-side-card p {
  line-height: 1.75;
  margin: 0 0 12px;
}

.link-button {
  background: none;
  border: none;
  color: #f6c177;
  cursor: pointer;
  font-weight: 700;
  padding: 0;
  text-decoration: underline;
}

.status-strip {
  display: grid;
  gap: 8px;
}

.message-box {
  padding: 14px 16px;
  border-radius: 14px;
  background: #e6f6ee;
  color: #1b6e4b;
}

.message-box.error {
  background: #ffe7e5;
  color: #a63934;
}

.content-card {
  padding: 28px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.86);
  box-shadow: 0 18px 50px rgba(45, 62, 80, 0.08);
  display: grid;
  gap: 20px;
}

/* 刪除確認卡片 */
.confirm-card {
  border: 2px solid #fbbcba;
  background: #fff8f8;
}

.confirm-title {
  font-size: 18px;
  font-weight: 700;
  color: #a63934;
  margin: 0;
}

.confirm-body {
  margin: 0;
  line-height: 1.75;
  color: #3d3d3d;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-shell {
  overflow-x: auto;
}

.result-table {
  width: 100%;
  border-collapse: collapse;
}

.result-table th,
.result-table td {
  padding: 12px 10px;
  border-bottom: 1px solid #eceff3;
  text-align: left;
}

.empty-row {
  text-align: center;
  color: #62707c;
  padding: 20px;
}

.role-pill {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 999px;
  background: #e8f0f8;
  color: #1f4b63;
  font-size: 12px;
  font-weight: 700;
}

.badge-success {
  color: #1b6e4b;
  font-weight: 700;
}

.badge-error {
  color: #a63934;
  font-weight: 700;
}

.inline-actions {
  display: flex;
  gap: 8px;
}

.action-button {
  padding: 8px 10px;
  border: 0;
  border-radius: 10px;
  cursor: pointer;
  background: #edf2f7;
  font-weight: 600;
}

/* 刪除按鈕 */
.action-button.danger {
  background: #ffe7e5;
  color: #a63934;
}

.action-button.danger:hover {
  background: #fbbcba;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

label {
  display: grid;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
}

input, select {
  width: 100%;
  box-sizing: border-box;
  padding: 12px 14px;
  border-radius: 14px;
  border: 1px solid #d7d9de;
  background: #fff;
  font: inherit;
}

input:disabled {
  background: #f3f5f7;
  color: #7b8794;
}

.action-row {
  display: flex;
  gap: 12px;
}

.primary-button {
  padding: 12px 18px;
  background: linear-gradient(135deg, #0d6b77 0%, #144e68 100%);
  color: #fff;
  border: 0;
  border-radius: 999px;
  font-weight: 700;
  cursor: pointer;
}

.primary-button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

/* 紅色確認刪除按鈕 */
.danger-button {
  padding: 12px 18px;
  background: linear-gradient(135deg, #c0392b 0%, #922b21 100%);
  color: #fff;
  border: 0;
  border-radius: 999px;
  font-weight: 700;
  cursor: pointer;
}

.danger-button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.ghost-button {
  padding: 10px 16px;
  background: #f2e9d8;
  color: #6e4d2f;
  border: 0;
  border-radius: 999px;
  font-weight: 700;
  cursor: pointer;
}

@media (max-width: 1100px) {
  .hero-panel {
    grid-template-columns: 1fr;
  }
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>