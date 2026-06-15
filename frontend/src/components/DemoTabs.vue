<script setup lang="ts">
interface TabItem {
  id: string
  label: string
  description: string
}

defineProps<{
  activeTab: string
  tabs: readonly TabItem[]
}>()

const emit = defineEmits<{
  'update:activeTab': [tab: string]
}>()
</script>

<template>
  <div class="tabs-bar" role="tablist" aria-label="課堂練習分頁">
    <button
      v-for="tab in tabs"
      :key="tab.id"
      class="tab-button"
      :class="{ 'tab-button--active': tab.id === activeTab }"
      type="button"
      role="tab"
      :aria-selected="tab.id === activeTab"
      @click="emit('update:activeTab', tab.id)"
    >
      <strong>{{ tab.label }}</strong>
      <span>{{ tab.description }}</span>
    </button>
  </div>
</template>