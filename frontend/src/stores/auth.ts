import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { loginApi } from '@/api/auth'
import { getLocalStorageToken, setLocalStorageToken } from '@/api/http'
import type { CurrentUser, LoginRequest } from '@/types/auth'

const USER_KEY = 'User'

function getStoredUser(): CurrentUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? (JSON.parse(raw) as CurrentUser) : null
  } catch {
    return null
  }
}

function setStoredUser(user: CurrentUser | null) {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  } else {
    localStorage.removeItem(USER_KEY)
  }
}

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref<string | null>(getLocalStorageToken())
  const currentUser = ref<CurrentUser | null>(getStoredUser())
  const isAuthenticated = computed(() => Boolean(accessToken.value))
  const roles = computed(() =>
    currentUser.value?.ROLE_CODE ? [currentUser.value.ROLE_CODE] : []
  )

  function applyLoginData(data: {
    ACCESS_TOKEN: string
    USERNAME: string
    DISPLAY_NAME: string
    ROLE_CODE: string
  }) {
    const user: CurrentUser = {
      USERNAME: data.USERNAME,
      DISPLAY_NAME: data.DISPLAY_NAME,
      ROLE_CODE: data.ROLE_CODE,
    }
    setLocalStorageToken(data.ACCESS_TOKEN)
    setStoredUser(user)
    accessToken.value = data.ACCESS_TOKEN
    currentUser.value = user
  }

  async function login(request: LoginRequest) {
    const response = await loginApi(request)
    if (!response.DATA?.ACCESS_TOKEN) {
      throw new Error(response.MESSAGE || '登入失敗，未取得 token')
    }
    applyLoginData(response.DATA)
    return response.DATA
  }

  function logout() {
    setLocalStorageToken(null)
    setStoredUser(null)
    accessToken.value = null
    currentUser.value = null
  }

  return {
    accessToken,
    currentUser,
    roles,
    isAuthenticated,
    login,
    logout,
  }
})
