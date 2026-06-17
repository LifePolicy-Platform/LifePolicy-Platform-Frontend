<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  title: string
  value: string
  subtitle?: string
  trend?: 'up' | 'down' | 'neutral'
  trendLabel?: string
  icon?: string
  progress?: number
  dense?: boolean
}>()

const showInlineTrend = computed(
  () => props.trend && props.trend !== 'neutral' && props.trendLabel,
)

const clampedProgress = computed(() => {
  if (props.progress == null) return null
  return Math.min(100, Math.max(0, props.progress))
})
</script>

<template>
  <article class="stat-card" :class="{ 'stat-card--dense': dense }">
    <div class="stat-card__content">
      <p class="stat-card__title">{{ title }}</p>

      <div class="stat-card__value-row">
        <span class="stat-card__value">{{ value }}</span>
        <span
          v-if="showInlineTrend"
          class="stat-card__trend"
          :class="{
            'stat-card__trend--up': trend === 'up',
            'stat-card__trend--down': trend === 'down',
          }"
        >
          {{ trendLabel }}
        </span>
      </div>

      <p v-if="subtitle" class="stat-card__subtitle">{{ subtitle }}</p>

      <div v-if="clampedProgress != null" class="stat-card__progress-track">
        <div class="stat-card__progress-bar" :style="{ width: `${clampedProgress}%` }" />
      </div>
    </div>

    <div v-if="icon" class="stat-card__icon-box" :class="{ 'stat-card__icon-box--dense': dense }" aria-hidden="true">
      <q-icon :name="icon" :size="dense ? '18px' : '22px'" />
    </div>
  </article>
</template>

<style scoped>
.stat-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 14px 16px;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.06);
  min-height: 88px;
}

.stat-card__content {
  flex: 1;
  min-width: 0;
}

.stat-card__title {
  margin: 0;
  color: #718096;
  font-size: 0.8rem;
  font-weight: 600;
}

.stat-card__value-row {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 6px;
}

.stat-card__value {
  color: #1a202c;
  font-size: 1.15rem;
  font-weight: 700;
  line-height: 1.2;
}

.stat-card__trend {
  font-size: 0.82rem;
  font-weight: 700;
}

.stat-card__trend--up {
  color: #48bb78;
}

.stat-card__trend--down {
  color: #f56565;
}

.stat-card__subtitle {
  margin: 4px 0 0;
  color: #a0aec0;
  font-size: 0.75rem;
  font-weight: 500;
}

.stat-card__progress-track {
  margin-top: 8px;
  height: 4px;
  border-radius: 999px;
  background: #edf2f7;
  overflow: hidden;
}

.stat-card__progress-bar {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #48bb78 0%, #38a169 100%);
}

.stat-card__icon-box {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
  color: #ffffff;
  box-shadow: 0 4px 10px rgba(72, 187, 120, 0.28);
}

.stat-card--dense {
  padding: 10px 12px;
  min-height: 0;
  border-radius: 10px;
  gap: 8px;
}

.stat-card--dense .stat-card__title {
  font-size: 0.72rem;
}

.stat-card--dense .stat-card__value {
  font-size: 1rem;
}

.stat-card--dense .stat-card__subtitle {
  font-size: 0.68rem;
  margin-top: 2px;
}

.stat-card--dense .stat-card__value-row {
  margin-top: 4px;
}

.stat-card__icon-box--dense {
  width: 36px;
  height: 36px;
  border-radius: 9px;
  box-shadow: 0 2px 6px rgba(72, 187, 120, 0.22);
}
</style>
