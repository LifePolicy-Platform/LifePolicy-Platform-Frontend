<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
  compact?: boolean
}>()
</script>

<template>
  <article class="dashboard-card" :class="{ 'dashboard-card--compact': compact }">
    <header v-if="title || subtitle" class="dashboard-card__header">
      <div class="dashboard-card__heading">
        <p v-if="subtitle" class="dashboard-card__eyebrow">{{ subtitle }}</p>
        <h3 v-if="title" class="dashboard-card__title">{{ title }}</h3>
      </div>
    </header>

    <div class="dashboard-card__body">
      <slot />
    </div>
  </article>
</template>

<style scoped>
.dashboard-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.06);
  height: 100%;
}

.dashboard-card--compact .dashboard-card__header {
  padding: 14px 16px 0;
}

.dashboard-card--compact .dashboard-card__body {
  padding: 6px 12px 12px;
}

.dashboard-card__header {
  padding: 16px 18px 0;
}

.dashboard-card__eyebrow {
  margin: 0 0 2px;
  color: #a0aec0;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.dashboard-card__title {
  margin: 0;
  color: #2d3748;
  font-size: 0.88rem;
  font-weight: 700;
}

.dashboard-card__body {
  padding: 8px 14px 14px;
}
</style>
