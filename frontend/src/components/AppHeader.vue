<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const menuOpen = ref(false)
const menuRef = ref<HTMLElement | null>(null)

const displayName = computed(() => {
  if (authStore.currentUser?.DISPLAY_NAME) {
    return authStore.currentUser.DISPLAY_NAME
  }
  if (authStore.currentUser?.USERNAME) {
    return authStore.currentUser.USERNAME
  }
  return '訪客'
})

function handleClickOutside(event: MouseEvent) {
  if (!menuOpen.value || !menuRef.value) return
  if (!menuRef.value.contains(event.target as Node)) {
    closeMenu()
  }
}

onMounted(() => {
  if (authStore.accessToken && !authStore.currentUser) {
    authStore.hydrateFromBackend()
  }
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

function goHome() {
  router.push('/')
}

function toggleMenu(event: MouseEvent) {
  event.stopPropagation()
  menuOpen.value = !menuOpen.value
}

function closeMenu() {
  menuOpen.value = false
}

function handleLogout() {
  closeMenu()
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <header class="app-header">
    <button type="button" class="header-home-btn" aria-label="首頁" @click="goHome">
      <q-icon name="home" size="22px" />
      <span class="header-home-label">Home</span>
    </button>

    <div class="header-right">
      <button type="button" class="header-bell" aria-label="通知">
        <q-icon name="notifications" size="22px" />
      </button>

      <span class="header-name">{{ displayName }}</span>

      <div ref="menuRef" class="header-user">
        <button
          type="button"
          class="header-menu-btn"
          aria-label="個人選單"
          @click="toggleMenu"
        >
          <q-icon name="menu" size="22px" />
        </button>

        <div v-if="menuOpen" class="header-dropdown">
          <button type="button" class="header-dropdown__item" disabled>
            個人資料調整
          </button>
          <button type="button" class="header-dropdown__item" @click="handleLogout">
            登出
          </button>
        </div>
      </div>
    </div>
  </header>
</template>
