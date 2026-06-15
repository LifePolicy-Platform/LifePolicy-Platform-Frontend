<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  username: '',
  password: '',
})

const showPassword = ref(false)
const isLoading = ref(false)
const errorMsg = ref('')

async function handleLogin() {
  errorMsg.value = ''

  if (!form.username.trim() || !form.password.trim()) {
    errorMsg.value = '請輸入帳號與密碼'
    return
  }

  isLoading.value = true
  try {
    await authStore.login({ USERNAME: form.username, PASSWORD: form.password })
    // 登入成功，導向首頁或 redirect 目的地
    const redirect = (router.currentRoute.value.query.redirect as string) || '/'
    router.push(redirect)
  } catch (e: any) {
    const msg = e?.response?.data?.message
      ?? e?.response?.data?.MESSAGE
      ?? '帳號或密碼錯誤，請重新輸入'
    errorMsg.value = msg
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <!-- 左側裝飾區 -->
    <div class="login-deco" aria-hidden="true">
      <div class="deco-circle deco-circle--lg" />
      <div class="deco-circle deco-circle--sm" />
      <div class="deco-brand">
        <div class="brand-icon">
          <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="24" cy="24" r="22" fill="rgba(255,255,255,0.15)" />
            <path d="M24 12a7 7 0 0 1 7 7v2h2a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H15a2 2 0 0 1-2-2V23a2 2 0 0 1 2-2h2v-2a7 7 0 0 1 7-7zm0 3a4 4 0 0 0-4 4v2h8v-2a4 4 0 0 0-4-4zm0 9a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" fill="white" />
          </svg>
        </div>
        <h2 class="brand-title">約訪管理系統</h2>
      </div>
    </div>

    <!-- 右側表單區 -->
    <div class="login-form-area">
      <div class="login-card">
        <div class="card-header">
          <div class="card-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2a5 5 0 1 1 0 10A5 5 0 0 1 12 2zm0 12c5.33 0 8 2.67 8 4v2H4v-2c0-1.33 2.67-4 8-4z" fill="#059669" />
            </svg>
          </div>
          <h1 class="card-title">歡迎回來</h1>
          <p class="card-desc">請輸入您的帳號與密碼</p>
        </div>

        <form class="form-body" @submit.prevent="handleLogin" novalidate>
          <!-- 帳號 -->
          <div class="field-group">
            <label class="field-label" for="username">帳號</label>
            <div class="field-input-wrap">
              <span class="field-icon">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-7 9a7 7 0 1 1 14 0H3z" />
                </svg>
              </span>
              <input
                id="username"
                v-model="form.username"
                type="text"
                class="field-input"
                placeholder="請輸入帳號"
                autocomplete="username"
              />
            </div>
          </div>

          <!-- 密碼 -->
          <div class="field-group">
            <label class="field-label" for="password">密碼</label>
            <div class="field-input-wrap">
              <span class="field-icon">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 2a4 4 0 0 0-4 4v2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-1V6a4 4 0 0 0-4-4zm-2 6V6a2 2 0 1 1 4 0v2H8zm2 5a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" clip-rule="evenodd" />
                </svg>
              </span>
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                class="field-input"
                placeholder="請輸入密碼"
                autocomplete="current-password"
              />
              <button
                type="button"
                class="toggle-pw"
                @click="showPassword = !showPassword"
                :title="showPassword ? '隱藏密碼' : '顯示密碼'"
              >
                <svg v-if="!showPassword" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
                  <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 1 1-8 0 4 4 0 0 1 8 0z" clip-rule="evenodd" />
                </svg>
                <svg v-else viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M3.707 2.293a1 1 0 0 0-1.414 1.414l14 14a1 1 0 0 0 1.414-1.414l-1.473-1.473A10.014 10.014 0 0 0 19.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 0 0-4.512 1.074l-1.78-1.781zm4.261 4.26 1.514 1.515a2.003 2.003 0 0 1 2.45 2.45l1.514 1.514a4 4 0 0 0-5.478-5.478z" clip-rule="evenodd" />
                  <path d="M12.454 16.697 9.75 13.992a4 4 0 0 1-3.742-3.741L2.335 6.578A9.98 9.98 0 0 0 .458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                </svg>
              </button>
            </div>
          </div>

          <!-- 錯誤訊息 -->
          <Transition name="fade">
            <div v-if="errorMsg" class="error-msg" role="alert">
              <svg viewBox="0 0 20 20" fill="currentColor" class="error-icon">
                <path fill-rule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0zm-7 4a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-1-9a1 1 0 0 0-1 1v4a1 1 0 1 0 2 0V6a1 1 0 0 0-1-1z" clip-rule="evenodd" />
              </svg>
              {{ errorMsg }}
            </div>
          </Transition>

          <!-- 登入按鈕 -->
          <button
            type="submit"
            class="btn-login"
            :disabled="isLoading"
          >
            <span v-if="isLoading" class="spinner" />
            <span v-else>登入</span>
          </button>
        </form>

        <p class="card-footer">
          還沒有帳號？
          <router-link to="/regist" class="link-regist">立即註冊</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ===== Layout ===== */
.login-page {
  min-height: 100vh;
  display: flex;
  background: #f0fdf4;
}

/* ===== Decoration panel ===== */
.login-deco {
  display: none;
  position: relative;
  overflow: hidden;
  flex: 1;
  background: linear-gradient(145deg, #064e3b 0%, #065f46 40%, #047857 70%, #059669 100%);
}

@media (min-width: 768px) {
  .login-deco { display: flex; align-items: center; justify-content: center; }
}

.deco-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.07);
}
.deco-circle--lg {
  width: 420px; height: 420px;
  top: -80px; right: -80px;
}
.deco-circle--sm {
  width: 260px; height: 260px;
  bottom: -60px; left: -60px;
}

.deco-brand {
  position: relative;
  z-index: 1;
  text-align: center;
  color: #fff;
}
.brand-icon {
  width: 72px; height: 72px;
  margin: 0 auto 1.25rem;
}
.brand-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0 0 0.5rem;
  letter-spacing: 0.05em;
}
.brand-sub {
  font-size: 0.95rem;
  opacity: 0.75;
  margin: 0;
  letter-spacing: 0.1em;
}

/* ===== Form area ===== */
.login-form-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
}

/* ===== Card ===== */
.login-card {
  width: 100%;
  max-width: 420px;
  background: #fff;
  border-radius: 16px;
  box-shadow:
    0 4px 6px -1px rgba(0,0,0,.07),
    0 10px 25px -3px rgba(6,78,59,.12);
  overflow: hidden;
}

.card-header {
  padding: 2rem 2rem 1.5rem;
  text-align: center;
  background: linear-gradient(180deg, #f0fdf4 0%, #fff 100%);
  border-bottom: 1px solid #d1fae5;
}

.card-icon {
  width: 52px; height: 52px;
  margin: 0 auto 1rem;
  background: #ecfdf5;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  border: 2px solid #a7f3d0;
}
.card-icon svg { width: 28px; height: 28px; }

.card-title {
  margin: 0 0 0.35rem;
  font-size: 1.5rem;
  font-weight: 700;
  color: #064e3b;
}
.card-desc {
  margin: 0;
  font-size: 0.875rem;
  color: #6b7280;
}

/* ===== Form body ===== */
.form-body {
  padding: 1.75rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.field-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #065f46;
}

.field-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.field-icon {
  position: absolute;
  left: 0.75rem;
  color: #6b7280;
  display: flex;
  align-items: center;
}
.field-icon svg { width: 16px; height: 16px; }

.field-input {
  width: 100%;
  padding: 0.65rem 0.75rem 0.65rem 2.25rem;
  font-size: 0.95rem;
  border: 1.5px solid #d1fae5;
  border-radius: 10px;
  background: #f9fefb;
  color: #1a1a1a;
  transition: border-color 0.18s, box-shadow 0.18s;
  box-sizing: border-box;
}
.field-input:focus {
  outline: none;
  border-color: #059669;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.15);
}

.toggle-pw {
  position: absolute;
  right: 0.75rem;
  background: none;
  border: none;
  cursor: pointer;
  color: #6b7280;
  display: flex; align-items: center;
  padding: 0.25rem;
  border-radius: 4px;
  transition: color 0.15s;
}
.toggle-pw:hover { color: #059669; }
.toggle-pw svg { width: 18px; height: 18px; }

/* ===== Error message ===== */
.error-msg {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 0.85rem;
  border-radius: 8px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  font-size: 0.875rem;
}
.error-icon { width: 16px; height: 16px; flex-shrink: 0; }

/* ===== Login button ===== */
.btn-login {
  padding: 0.75rem 1rem;
  font-size: 1rem;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  border: none;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
  box-shadow: 0 4px 12px rgba(5,150,105,0.35);
  letter-spacing: 0.05em;
}
.btn-login:hover:not(:disabled) {
  opacity: 0.92;
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(5,150,105,0.45);
}
.btn-login:active:not(:disabled) {
  transform: translateY(0);
}
.btn-login:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* Spinner */
.spinner {
  display: inline-block;
  width: 18px; height: 18px;
  border: 2.5px solid rgba(255,255,255,.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ===== Footer ===== */
.card-footer {
  padding: 1rem 2rem 1.5rem;
  text-align: center;
  font-size: 0.875rem;
  color: #6b7280;
  border-top: 1px solid #f0fdf4;
  margin: 0;
}
.link-regist {
  color: #059669;
  font-weight: 600;
  text-decoration: none;
  transition: color 0.15s;
}
.link-regist:hover { color: #047857; text-decoration: underline; }

/* ===== Transition ===== */
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
