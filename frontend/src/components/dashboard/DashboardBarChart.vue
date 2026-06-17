<script setup lang="ts">
import { computed } from 'vue'
import DashboardCardShell from '@/components/dashboard/DashboardCardShell.vue'
import type { BarChartItem } from '@/types/dashboard'

const props = defineProps<{
  title: string
  data: BarChartItem[]
  yAxisLabel?: string
  subtitle?: string
  compact?: boolean
}>()

const chartWidth = 440
const chartHeight = 155
const padLeft = 36
const padRight = 12
const padTop = 10
const padBottom = 38

const plotWidth = chartWidth - padLeft - padRight
const plotHeight = chartHeight - padTop - padBottom

const maxValue = computed(() => {
  const max = Math.max(...props.data.map((d) => d.value), 1)
  return Math.ceil(max * 1.12)
})

const barWidth = computed(() => {
  const gap = 10
  const totalGap = gap * (props.data.length + 1)
  return Math.max(14, (plotWidth - totalGap) / props.data.length)
})

const bars = computed(() => {
  const gap = 10
  return props.data.map((d, i) => {
    const w = barWidth.value
    const x = padLeft + gap + i * (w + gap)
    const h = (d.value / maxValue.value) * plotHeight
    const y = padTop + plotHeight - h
    return { ...d, x, y, w, h }
  })
})

const yTicks = computed(() => {
  const max = maxValue.value
  return [0, Math.round(max / 2), max]
})
</script>

<template>
  <DashboardCardShell :title="title" :subtitle="subtitle" :compact="compact ?? true">
    <svg
      class="chart-svg"
      :viewBox="`0 0 ${chartWidth} ${chartHeight}`"
      role="img"
      :aria-label="title"
    >
      <line
        :x1="padLeft"
        :y1="padTop + plotHeight"
        :x2="padLeft + plotWidth"
        :y2="padTop + plotHeight"
        class="chart-axis"
      />
      <line
        :x1="padLeft"
        :y1="padTop"
        :x2="padLeft"
        :y2="padTop + plotHeight"
        class="chart-axis"
      />

      <g v-for="tick in yTicks" :key="tick">
        <line
          :x1="padLeft"
          :x2="padLeft + plotWidth"
          :y1="padTop + plotHeight - (tick / maxValue) * plotHeight"
          :y2="padTop + plotHeight - (tick / maxValue) * plotHeight"
          class="chart-grid"
        />
        <text
          :x="padLeft - 6"
          :y="padTop + plotHeight - (tick / maxValue) * plotHeight + 3"
          class="chart-tick"
          text-anchor="end"
        >
          {{ tick }}
        </text>
      </g>

      <g v-for="bar in bars" :key="bar.label">
        <rect
          :x="bar.x"
          :y="bar.y"
          :width="bar.w"
          :height="bar.h"
          :fill="bar.color ?? '#48bb78'"
          rx="2"
        />
        <text
          :x="bar.x + bar.w / 2"
          :y="padTop + plotHeight + 14"
          class="chart-tick chart-tick--label"
          text-anchor="middle"
        >
          {{ bar.label }}
        </text>
      </g>

      <text
        v-if="yAxisLabel"
        :x="10"
        :y="padTop + plotHeight / 2"
        class="chart-axis-label"
        text-anchor="middle"
        :transform="`rotate(-90, 10, ${padTop + plotHeight / 2})`"
      >
        {{ yAxisLabel }}
      </text>
    </svg>
  </DashboardCardShell>
</template>

<style scoped>
.chart-svg {
  width: 100%;
  max-height: 155px;
  display: block;
}

.chart-axis {
  stroke: #e2e8f0;
  stroke-width: 1;
}

.chart-grid {
  stroke: #f7fafc;
  stroke-width: 1;
}

.chart-tick {
  fill: #a0aec0;
  font-size: 8px;
}

.chart-tick--label {
  font-size: 8px;
}

.chart-axis-label {
  fill: #cbd5e0;
  font-size: 8px;
  font-weight: 600;
}
</style>
