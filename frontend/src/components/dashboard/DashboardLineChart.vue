<script setup lang="ts">
import { computed } from 'vue'
import DashboardCardShell from '@/components/dashboard/DashboardCardShell.vue'
import type { TimeSeriesPoint } from '@/types/dashboard'

const props = defineProps<{
  title: string
  data: TimeSeriesPoint[]
  xAxisLabel?: string
  yAxisLabel?: string
  subtitle?: string
  compact?: boolean
}>()

const chartWidth = 420
const chartHeight = 132
const padLeft = 36
const padRight = 10
const padTop = 10
const padBottom = 28

const plotWidth = chartWidth - padLeft - padRight
const plotHeight = chartHeight - padTop - padBottom

const maxValue = computed(() => {
  const max = Math.max(...props.data.map((d) => d.value), 1)
  return Math.ceil(max * 1.15)
})

const pointCoords = computed(() => {
  if (props.data.length === 0) return []
  const step = props.data.length > 1 ? plotWidth / (props.data.length - 1) : 0
  return props.data.map((d, i) => {
    const x = padLeft + i * step
    const y = padTop + plotHeight - (d.value / maxValue.value) * plotHeight
    return { x, y, label: d.label, index: i }
  })
})

const linePoints = computed(() => pointCoords.value.map((p) => `${p.x},${p.y}`).join(' '))

const areaPoints = computed(() => {
  if (pointCoords.value.length === 0) return ''
  const first = pointCoords.value[0]!
  const last = pointCoords.value[pointCoords.value.length - 1]!
  const bottom = padTop + plotHeight
  const line = pointCoords.value.map((p) => `${p.x},${p.y}`).join(' ')
  return `${first.x},${bottom} ${line} ${last.x},${bottom}`
})

const yTicks = computed(() => {
  const max = maxValue.value
  return [0, Math.round(max / 2), max]
})

const xLabelStep = computed(() => (props.data.length > 6 ? 2 : 1))

const gradientId = 'dashboard-line-area-gradient'
</script>

<template>
  <DashboardCardShell :title="title" :subtitle="subtitle" :compact="compact ?? true">
    <svg
      class="chart-svg"
      :viewBox="`0 0 ${chartWidth} ${chartHeight}`"
      role="img"
      :aria-label="title"
    >
      <defs>
        <linearGradient :id="gradientId" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="rgba(45, 55, 72, 0.14)" />
          <stop offset="100%" stop-color="rgba(45, 55, 72, 0)" />
        </linearGradient>
      </defs>

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

      <g v-for="tick in yTicks" :key="`y-${tick}`">
        <line
          :x1="padLeft"
          :x2="padLeft + plotWidth"
          :y1="padTop + plotHeight - (tick / maxValue) * plotHeight"
          :y2="padTop + plotHeight - (tick / maxValue) * plotHeight"
          class="chart-grid"
        />
        <text
          :x="padLeft - 8"
          :y="padTop + plotHeight - (tick / maxValue) * plotHeight + 4"
          class="chart-tick chart-tick--y"
          text-anchor="end"
        >
          {{ tick }}
        </text>
      </g>

      <polygon
        v-if="pointCoords.length > 0"
        :points="areaPoints"
        :fill="`url(#${gradientId})`"
      />
      <polyline
        v-if="pointCoords.length > 0"
        :points="linePoints"
        class="chart-line"
      />
      <circle
        v-for="p in pointCoords"
        :key="p.label"
        :cx="p.x"
        :cy="p.y"
        r="3"
        class="chart-dot"
      />

      <text
        v-for="p in pointCoords"
        v-show="p.index % xLabelStep === 0"
        :key="`x-${p.label}`"
        :x="p.x"
        :y="chartHeight - 10"
        class="chart-tick chart-tick--x"
        text-anchor="middle"
      >
        {{ p.label }}
      </text>

      <text
        v-if="yAxisLabel"
        :x="14"
        :y="padTop + plotHeight / 2"
        class="chart-axis-label chart-axis-label--y"
        text-anchor="middle"
        :transform="`rotate(-90, 14, ${padTop + plotHeight / 2})`"
      >
        {{ yAxisLabel }}
      </text>
      <text
        v-if="xAxisLabel"
        :x="padLeft + plotWidth / 2"
        :y="chartHeight - 1"
        class="chart-axis-label chart-axis-label--x"
        text-anchor="middle"
      >
        {{ xAxisLabel }}
      </text>
    </svg>
  </DashboardCardShell>
</template>

<style scoped>
.chart-svg {
  width: 100%;
  max-height: 132px;
  display: block;
  font-family: 'Avenir Next', 'Trebuchet MS', 'Noto Sans TC', sans-serif;
}

.chart-axis {
  stroke: #a0aec0;
  stroke-width: 1.2;
}

.chart-grid {
  stroke: #e2e8f0;
  stroke-width: 1;
}

.chart-line {
  fill: none;
  stroke: #2d3748;
  stroke-width: 2;
  stroke-linejoin: round;
  stroke-linecap: round;
}

.chart-dot {
  fill: #ffffff;
  stroke: #2d3748;
  stroke-width: 2;
}

.chart-tick {
  font-size: 10px;
  font-weight: 600;
}

.chart-tick--y {
  fill: #4a5568;
}

.chart-tick--x {
  fill: #2d3748;
  font-size: 9.5px;
  font-weight: 700;
}

.chart-axis-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.chart-axis-label--y {
  fill: #4a5568;
}

.chart-axis-label--x {
  fill: #4a5568;
}
</style>
