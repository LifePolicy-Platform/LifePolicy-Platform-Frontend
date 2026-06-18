import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { fetchCurrentUserApi, loginApi } from '@/api/auth'
import { getLocalStorageToken, setLocalStorageToken } from '@/api/http'
import type { CurrentUser, LoginRequest } from '@/types/auth'

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref<string | null>(getLocalStorageToken())
  const currentUser = ref<CurrentUser | null>(null)
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
    setLocalStorageToken(data.ACCESS_TOKEN)
    accessToken.value = data.ACCESS_TOKEN
    currentUser.value = {
      USERNAME: data.USERNAME,
      DISPLAY_NAME: data.DISPLAY_NAME,
      ROLE_CODE: data.ROLE_CODE,
    }
  }

  async function login(request: LoginRequest) {
    const response = await loginApi(request)
    if (!response.DATA?.ACCESS_TOKEN) {
      throw new Error(response.MESSAGE || '登入失敗，未取得 token')
    }
    applyLoginData(response.DATA)
    return response.DATA
  }

  async function hydrateFromBackend() {
    if (!accessToken.value) {
      currentUser.value = null
      return
    }
    try {
      const response = await fetchCurrentUserApi()
      currentUser.value = response.DATA
    } catch {
      logout()
    }
  }

  function logout() {
    setLocalStorageToken(null)
    accessToken.value = ''
    currentUser.value = null
  }

  return {
    accessToken,
    currentUser,
    roles,
    isAuthenticated,
    login,
    hydrateFromBackend,
    logout,
  }
})
