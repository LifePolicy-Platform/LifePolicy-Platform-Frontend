<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNotifications } from '@/composables/useNotifications'

const router = useRouter()
const open = ref(false)
const wrapperRef = ref<HTMLElement | null>(null)

const {
  unreadCount,
  notifications,
  isLoading,
  refreshCount,
  loadNotifications,
  markAsRead,
  markAllAsRead,
} = useNotifications()

const displayCount = computed(() =>
  open.value
    ? notifications.value.filter(n => n.isRead === 0).length
    : unreadCount.value
)

async function toggleOpen() {
  open.value = !open.value
  if (open.value) {
    await Promise.all([loadNotifications(), refreshCount()])
  }
}

function close() {
  open.value = false
}

function handleDocumentClick(e: MouseEvent) {
  if (wrapperRef.value && !wrapperRef.value.contains(e.target as Node)) {
    close()
  }
}

onMounted(() => document.addEventListener('click', handleDocumentClick))
onUnmounted(() => document.removeEventListener('click', handleDocumentClick))

const CLAIM_RESULT_KEYWORDS = ['核准', '駁回', '退件']

/** 若 refNo 是理賠號 (CLM...) 則打 API 換成保單號，否則直接回傳 */
async function resolvePolicyNo(refNo: string): Promise<string> {
  if (!refNo.startsWith('CLM')) return refNo
  try {
    const res = await fetch(`/api/admin/claim/${refNo}`)
    const data = await res.json()
    return data?.DATA?.policyNo ?? refNo
  } catch {
    return refNo
  }
}

async function handleClick(notifNo: number, refNo: string | null, notifType: string, title: string) {
  await markAsRead(notifNo)
  close()

  const isClaimResult =
    notifType === 'CLAIM_RESULT' ||
    (notifType === 'CLAIM' && CLAIM_RESULT_KEYWORDS.some(kw => title?.includes(kw)))

  if (isClaimResult) {
    // 結果通知 → ClaimManagement，新通知 refNo=policyNo，舊通知 refNo=claimNo 需換算
    const policyNo = refNo ? await resolvePolicyNo(refNo) : null
    router.push({ path: '/claim/ClaimManagement', query: policyNo ? { policyNo } : {} })
  } else if (notifType === 'CLAIM') {
    // 待審通知 → ClaimAuditManager，refNo=claimNo
    router.push({ path: '/claim/ClaimAuditManager', query: refNo ? { claimNo: refNo } : {} })
  } else if (refNo) {
    // 保單通知 → policy-mgmt
    router.push({ path: '/policy-mgmt', query: { tab: 'query', policyNo: refNo } })
  }
}

function formatTime(dateStr: string | null) {
  if (!dateStr) return ''
  return dateStr.slice(0, 16).replace('T', ' ')
}
</script>

<template>
  <div ref="wrapperRef" class="notif-bell">
    <button type="button" class="bell-btn" aria-label="通知" @click.stop="toggleOpen">
      <q-icon name="notifications" size="22px" />
      <span v-if="displayCount > 0" class="bell-badge">
        {{ displayCount > 99 ? '99+' : displayCount }}
      </span>
    </button>

    <div v-if="open" class="notif-dropdown">
      <div class="notif-dropdown__header">
        <span class="notif-dropdown__title">通知</span>
        <button
          v-if="displayCount > 0"
          type="button"
          class="notif-dropdown__read-all"
          @click="markAllAsRead"
        >
          全部已讀
        </button>
      </div>

      <div v-if="isLoading" class="notif-state">載入中…</div>

      <div v-else-if="notifications.length === 0" class="notif-state">
        目前沒有通知
      </div>

      <ul v-else class="notif-list">
        <li
          v-for="n in notifications"
          :key="n.notifNo"
          class="notif-item"
          :class="{ 'notif-item--unread': n.isRead === 0 }"
          @click="handleClick(n.notifNo, n.refNo, n.notifType, n.title)"
        >
          <div class="notif-item__title">{{ n.title }}</div>
          <div class="notif-item__content">{{ n.content }}</div>
          <div class="notif-item__time">{{ formatTime(n.createTime) }}</div>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.notif-bell {
  position: relative;
}

.bell-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  color: inherit;
  padding: 4px;
}

.bell-badge {
  position: absolute;
  top: -2px;
  right: -4px;
  min-width: 16px;
  height: 16px;
  padding: 0 3px;
  background: #e53e3e;
  color: #fff;
  font-size: 0.65rem;
  font-weight: 700;
  line-height: 16px;
  border-radius: 8px;
  text-align: center;
}

.notif-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 320px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  z-index: 999;
  overflow: hidden;
}

.notif-dropdown__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #e2e8f0;
}

.notif-dropdown__title {
  font-weight: 700;
  font-size: 0.9rem;
  color: #1a202c;
}

.notif-dropdown__read-all {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.78rem;
  color: #38a169;
  font-weight: 600;
}
.notif-dropdown__read-all:hover {
  text-decoration: underline;
}

.notif-state {
  padding: 24px;
  text-align: center;
  color: #718096;
  font-size: 0.875rem;
}

.notif-list {
  list-style: none;
  margin: 0;
  padding: 0;
  max-height: 360px;
  overflow-y: auto;
}

.notif-item {
  padding: 12px 16px;
  border-bottom: 1px solid #f0f4f8;
  cursor: pointer;
  transition: background 0.15s;
}
.notif-item:last-child {
  border-bottom: none;
}
.notif-item:hover {
  background: #f7fafc;
}
.notif-item--unread {
  background: #f0fff4;
  border-left: 3px solid #38a169;
}
.notif-item--unread:hover {
  background: #e6ffed;
}

.notif-item__title {
  font-weight: 600;
  font-size: 0.85rem;
  color: #2d3748;
  margin-bottom: 2px;
}

.notif-item__content {
  font-size: 0.8rem;
  color: #4a5568;
  margin-bottom: 4px;
  line-height: 1.4;
}

.notif-item__time {
  font-size: 0.72rem;
  color: #a0aec0;
}
</style>