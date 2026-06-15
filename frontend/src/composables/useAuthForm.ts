import { computed, reactive } from 'vue'
import type { LoginFormValues, LoginSubmitResult } from '../types/auth'

// composable 只保留可重用的登入資料與驗證邏輯，
// 不把畫面排版、按鈕文案等 UI 細節一起綁進來。
export function useAuthForm(initialValues?: Partial<LoginFormValues>) {
  const form = reactive<LoginFormValues>({
    username: initialValues?.username ?? '',
    password: initialValues?.password ?? '',
  })

  const errors = reactive({
    username: '',
    password: '',
    submit: '',
  })

  const canSubmit = computed(() => Boolean(form.username.trim() && form.password.trim()))

  function resetSubmitError() {
    errors.submit = ''
  }

  function validate() {
    errors.username = form.username.trim() ? '' : '請輸入帳號。'
    errors.password = form.password.trim() ? '' : '請輸入密碼。'

    if (!errors.username && form.username.trim().length < 4) {
      errors.username = '帳號至少需要 4 個字元。'
    }

    if (!errors.password && form.password.trim().length < 6) {
      errors.password = '密碼至少需要 6 個字元。'
    }

    return !errors.username && !errors.password
  }

  async function submit(): Promise<LoginSubmitResult> {
    resetSubmitError()

    if (!validate()) {
      return {
        success: false,
        message: '表單驗證未通過。',
      }
    }

    return {
      success: true,
      message: `登入資料已送出：${form.username}`,
    }
  }

  return {
    form,
    errors,
    canSubmit,
    validate,
    submit,
    resetSubmitError,
  }
}