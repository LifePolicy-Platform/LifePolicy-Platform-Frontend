import { requestJson } from '@/api/http'
import type { CurrentUser, LoginRequest, LoginResponseData } from '@/types/auth'

/** 呼叫後端登入 API，回傳含 ACCESS_TOKEN 的 DATA */
export async function loginApi(credentials: LoginRequest) {
  return requestJson<LoginResponseData>('/api/v1/auth/login', 'POST', credentials, {
    requiresAuth: false,
  })
}

/** 用目前 token 向後端確認登入狀態 */
export async function fetchCurrentUserApi() {
  return requestJson<CurrentUser>('/api/v1/auth/me', 'GET')
}
