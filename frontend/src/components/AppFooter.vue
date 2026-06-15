<script setup lang="ts">
defineProps<{
  activeTopicLabel: string
}>()
</script>

<template>
  <footer class="app-footer">
    <p>目前主題：{{ activeTopicLabel }}</p>
    <p>這個版型示範 header、footer、sidebar、Vue Router 頁面切換與 Pinia 管理全域 UI 狀態。</p>
  </footer>
</template>