<script setup lang="ts">
import { RouterLink } from 'vue-router'

const links = [
  { label: '保單查詢', to: '/policies', icon: 'description' },
  { label: '重新安排約訪', to: '/updTime', icon: 'schedule' },
  { label: '代辦事項', to: '/todoList', icon: 'checklist' },
]
</script>

<template>
  <article class="quick-links">
    <p class="quick-links__title">快速捷徑</p>
    <div class="quick-links__grid">
      <RouterLink
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        class="quick-links__item"
      >
        <q-icon :name="link.icon" size="20px" class="quick-links__icon" />
        <span>{{ link.label }}</span>
      </RouterLink>
    </div>
  </article>
</template>

<style scoped>
.quick-links {
  background: var(--dash-surface, #ffffff);
  border: 1px solid var(--dash-border, #e2e8f0);
  border-radius: var(--dash-radius, 8px);
  padding: 20px 22px;
  box-shadow: var(--dash-shadow, 0 4px 6px -1px rgba(0, 0, 0, 0.08));
}

.quick-links__title {
  margin: 0 0 14px;
  color: var(--dash-muted, #718096);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.quick-links__grid {
  display: grid;
  gap: 10px;
}

.quick-links__item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: #f7fafc;
  color: #2d3748;
  text-decoration: none;
  font-size: 0.88rem;
  font-weight: 700;
}

.quick-links__icon {
  color: #48bb78;
}
</style>
