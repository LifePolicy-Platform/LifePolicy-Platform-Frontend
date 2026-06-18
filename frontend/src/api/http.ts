import axios, { type AxiosError, type Method } from 'axios'
import type { ApiEnvelope } from '@/types/auth'
import { useAuthStore } from '@/stores/auth'
import router from '@/router/index'


const TOKEN_KEY = 'insuranceWorkbenchAccessToken'

declare module 'axios' {
  export interface AxiosRequestConfig {
    skipAuth?: boolean
  }
}

// header 加入token
export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

http.interceptors.request.use((config) => {
  if (config.skipAuth) {
    return config
  }

  const token = getLocalStorageToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

// 401 自動登出並跳回登入頁
http.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    if (status === 401 && !error.config?.skipAuth) {
      const auth = useAuthStore()
      auth.logout()
      if (router.currentRoute.value.path !== '/login') {
        router.push('/login')
      }
    }
    return Promise.reject(error)
  },
)

export function getLocalStorageToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setLocalStorageToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
  } else {
    localStorage.removeItem(TOKEN_KEY)
  }
}

export async function requestJson<T>(
  url: string,
  method: string,
  payload?: unknown,
  options: { requiresAuth?: boolean } = {},
): Promise<ApiEnvelope<T>> {
  const { requiresAuth = true } = options
  const token = getLocalStorageToken()

  if (requiresAuth && !token) {
    throw new Error('請先登入')
  }

  const normalizedMethod = method.toUpperCase() as Method
  try {
    const response = await http.request<ApiEnvelope<T>>({
      url,
      method: normalizedMethod,
      data: normalizedMethod === 'GET' || normalizedMethod === 'HEAD' ? undefined : payload,
      skipAuth: !requiresAuth,
    })

    const body = response.data
    if (body?.SUCCESS === false) {
      throw new Error(body.MESSAGE || '請求失敗')
    }

    return body
  } catch (error) {
    if (axios.isAxiosError(error) && !error.response) {
      throw new Error('無法連線後端，請確認後端服務已啟動（port 8085）')
    }
    throw error
  }
}

export default http
