<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
  /** Dashboard 等較矮版面 */
  compact?: boolean
}>()
</script>

<template>
  <header class="page-hero" :class="{ 'page-hero--compact': compact }">
    <div class="page-hero__blobs" aria-hidden="true">
      <span class="page-hero__blob page-hero__blob--1" />
      <span class="page-hero__blob page-hero__blob--2" />
      <span class="page-hero__blob page-hero__blob--3" />
    </div>
    <div class="page-hero__inner">
      <h2 class="page-hero__title">{{ title }}</h2>
      <p v-if="subtitle" class="page-hero__subtitle">{{ subtitle }}</p>
    </div>
  </header>
</template>
