<script setup lang="ts">
import { computed, reactive } from 'vue'

const form = reactive({
  username: '',
  password: '',
  confirmPassword: '',
})

const passwordStrength = computed(() => {
  const hasEnglish = /[a-zA-Z]/.test(form.password)
  const hasNumber = /[0-9]/.test(form.password)
  const hasSymbol = /[!@#$%^&*]/.test(form.password)

  if (form.password.length >= 6 && hasEnglish && hasNumber && hasSymbol) return 'strong'
  if (form.password.length >= 6 && hasEnglish && hasNumber) return 'medium'
  return 'weak'
})

const strengthLabel = computed(() => {
  if (passwordStrength.value === 'strong') return '強'
  if (passwordStrength.value === 'medium') return '中'
  return '弱'
})

const strengthWidth = computed(() => {
  if (passwordStrength.value === 'strong') return '100%'
  if (passwordStrength.value === 'medium') return '60%'
  return '30%'
})

const passwordMatch = computed(() =>
  form.password === form.confirmPassword,
)

const canSubmit = computed(() =>
  Boolean(
    form.username.trim() &&
    form.password.trim() &&
    passwordMatch.value &&
    passwordStrength.value !== 'weak',
  ),
)

function send() {
  alert('註冊成功！')
  form.username = ''
  form.password = ''
  form.confirmPassword = ''
}
</script>

<template>
  <div class="reg-page">
    <div class="reg-card">
      <!-- Header -->
      <div class="reg-header">
        <div class="reg-icon">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" fill="#059669" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="#059669" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>
        <h1 class="reg-title">建立帳號</h1>
        <p class="reg-desc">填寫資料以完成註冊</p>
      </div>

      <!-- Form -->
      <form class="reg-form" @submit.prevent="send">
        <!-- 帳號 -->
        <div class="field">
          <label class="field-label" for="reg-username">帳號</label>
          <div class="field-wrap">
            <span class="field-icon">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-7 9a7 7 0 1 1 14 0H3z" />
              </svg>
            </span>
            <input
              id="reg-username"
              v-model="form.username"
              type="text"
              class="field-input"
              placeholder="請輸入帳號"
              autocomplete="username"
            />
          </div>
        </div>

        <!-- 密碼 -->
        <div class="field">
          <label class="field-label" for="reg-password">密碼</label>
          <div class="field-wrap">
            <span class="field-icon">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 2a4 4 0 0 0-4 4v2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-1V6a4 4 0 0 0-4-4zm-2 6V6a2 2 0 1 1 4 0v2H8zm2 5a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" clip-rule="evenodd" />
              </svg>
            </span>
            <input
              id="reg-password"
              v-model="form.password"
              type="password"
              class="field-input"
              placeholder="至少 6 碼，含英文、數字"
              autocomplete="new-password"
            />
          </div>

          <!-- 強度指示條 -->
          <div v-if="form.password" class="strength-bar-wrap">
            <div class="strength-bar">
              <div
                class="strength-fill"
                :class="`strength-fill--${passwordStrength}`"
                :style="{ width: strengthWidth }"
              />
            </div>
            <span class="strength-label" :class="`strength-text--${passwordStrength}`">
              密碼強度：{{ strengthLabel }}
            </span>
          </div>
        </div>

        <!-- 確認密碼 -->
        <div class="field">
          <label class="field-label" for="reg-confirm">確認密碼</label>
          <div class="field-wrap">
            <span class="field-icon">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0 0 10 1.944 11.954 11.954 0 0 0 17.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 0 0-1.414-1.414L9 10.586 7.707 9.293a1 1 0 0 0-1.414 1.414l2 2a1 1 0 0 0 1.414 0l4-4z" clip-rule="evenodd" />
              </svg>
            </span>
            <input
              id="reg-confirm"
              v-model="form.confirmPassword"
              type="password"
              class="field-input"
              placeholder="請再次輸入密碼"
              autocomplete="new-password"
            />
          </div>

          <Transition name="slide">
            <p
              v-if="form.confirmPassword"
              class="match-hint"
              :class="passwordMatch ? 'match-hint--ok' : 'match-hint--err'"
            >
              <svg viewBox="0 0 16 16" fill="currentColor" class="match-icon">
                <path v-if="passwordMatch" d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z" />
                <path v-else d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
              </svg>
              {{ passwordMatch ? '密碼一致' : '與密碼不相同' }}
            </p>
          </Transition>
        </div>

        <!-- 提交按鈕 -->
        <button type="submit" class="btn-submit" :disabled="!canSubmit">
          建立帳號
        </button>
      </form>

      <p class="reg-footer">
        已有帳號？
        <router-link to="/login" class="link-login">立即登入</router-link>
      </p>
    </div>
  </div>
</template>

<style scoped>
.reg-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  background: linear-gradient(160deg, #064e3b 0%, #065f46 50%, #d1fae5 100%);
}

.reg-card {
  width: 100%;
  max-width: 420px;
  background: #fff;
  border-radius: 16px;
  box-shadow:
    0 4px 6px -1px rgba(0,0,0,.07),
    0 10px 30px -5px rgba(6,78,59,.2);
  overflow: hidden;
}

/* Header */
.reg-header {
  padding: 2rem 2rem 1.5rem;
  text-align: center;
  background: linear-gradient(180deg, #ecfdf5 0%, #fff 100%);
  border-bottom: 1px solid #d1fae5;
}

.reg-icon {
  width: 52px; height: 52px;
  margin: 0 auto 1rem;
  background: #ecfdf5;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  border: 2px solid #a7f3d0;
}
.reg-icon svg { width: 28px; height: 28px; }

.reg-title {
  margin: 0 0 0.35rem;
  font-size: 1.5rem;
  font-weight: 700;
  color: #064e3b;
}
.reg-desc {
  margin: 0;
  font-size: 0.875rem;
  color: #6b7280;
}

/* Form */
.reg-form {
  padding: 1.75rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.field-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #065f46;
}

.field-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.field-icon {
  position: absolute;
  left: 0.75rem;
  color: #6b7280;
  display: flex; align-items: center;
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
  box-shadow: 0 0 0 3px rgba(5,150,105,.15);
}

/* Strength bar */
.strength-bar-wrap {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-top: 0.25rem;
}

.strength-bar {
  flex: 1;
  height: 5px;
  background: #e5e7eb;
  border-radius: 99px;
  overflow: hidden;
}
.strength-fill {
  height: 100%;
  border-radius: 99px;
  transition: width 0.3s ease, background-color 0.3s ease;
}
.strength-fill--strong { background: #059669; }
.strength-fill--medium { background: #f59e0b; }
.strength-fill--weak   { background: #ef4444; }

.strength-label {
  font-size: 0.78rem;
  font-weight: 600;
  white-space: nowrap;
}
.strength-text--strong { color: #059669; }
.strength-text--medium { color: #d97706; }
.strength-text--weak   { color: #dc2626; }

/* Match hint */
.match-hint {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.8rem;
  font-weight: 500;
  margin: 0.15rem 0 0;
}
.match-icon { width: 14px; height: 14px; flex-shrink: 0; }
.match-hint--ok  { color: #059669; }
.match-hint--err { color: #dc2626; }

/* Submit button */
.btn-submit {
  padding: 0.75rem;
  font-size: 1rem;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
  box-shadow: 0 4px 12px rgba(5,150,105,.35);
  letter-spacing: 0.05em;
}
.btn-submit:hover:not(:disabled) {
  opacity: 0.92;
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(5,150,105,.45);
}
.btn-submit:active:not(:disabled) { transform: translateY(0); }
.btn-submit:disabled {
  background: #d1fae5;
  color: #6ee7b7;
  cursor: not-allowed;
  box-shadow: none;
}

/* Footer */
.reg-footer {
  padding: 1rem 2rem 1.5rem;
  text-align: center;
  font-size: 0.875rem;
  color: #6b7280;
  border-top: 1px solid #f0fdf4;
  margin: 0;
}
.link-login {
  color: #059669;
  font-weight: 600;
  text-decoration: none;
}
.link-login:hover { color: #047857; text-decoration: underline; }

/* Transition */
.slide-enter-active, .slide-leave-active { transition: opacity 0.2s, transform 0.2s; }
.slide-enter-from { opacity: 0; transform: translateY(-4px); }
.slide-leave-to   { opacity: 0; }
</style>
