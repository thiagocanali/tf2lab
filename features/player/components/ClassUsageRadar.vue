<template>
  <article class="chart-card">
    <header class="chart-card__header">
      <h3>{{ title ?? 'Class usage' }}</h3>
      <p>{{ subtitle }}</p>
    </header>
    <div class="chart-card__body">
      <ClientOnly>
        <VChart v-if="hasData" :option="options" autoresize class="chart-card__canvas" />
        <p v-else class="chart-card__empty">No class data available yet.</p>
      </ClientOnly>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { RadarChart } from 'echarts/charts'
import { TooltipComponent } from 'echarts/components'
import { TF2_CHART, tf2Tooltip } from '~~/features/player/chartTheme'

use([CanvasRenderer, RadarChart, TooltipComponent])

const props = defineProps<{
  classes?: { name: string; value: number }[]
  title?: string
  unit?: string
}>()

const subtitle = computed(
  () => `${props.classes?.length ?? 0} classes played across analyzed logs.`
)

const safeClasses = computed(() =>
  (props.classes ?? []).filter((item) => Number(item.value ?? 0) > 0)
)

const hasData = computed(() => safeClasses.value.length > 0)

const maxValue = computed(() => {
  if (!safeClasses.value.length) return 100
  const max = Math.max(...safeClasses.value.map((item) => Number(item.value ?? 0)))
  return Math.ceil(max / 10) * 10 || 100
})

const options = computed(() => {
  const unit = props.unit ?? '%'
  return {
    color: [TF2_CHART.red],
    tooltip: {
      ...tf2Tooltip,
      trigger: 'item',
      valueFormatter: (value: number) => `${value}${unit}`
    },
    radar: {
      indicator: safeClasses.value.map((item) => ({ name: item.name, max: maxValue.value })),
      axisName: { color: TF2_CHART.text, fontSize: 12, fontWeight: 600 },
      axisLine: { lineStyle: { color: TF2_CHART.axis } },
      splitLine: { lineStyle: { color: TF2_CHART.split } },
      splitArea: { areaStyle: { color: ['rgba(255, 255, 255, 0.02)', 'rgba(255, 255, 255, 0.04)'] } }
    },
    series: [
      {
        name: 'Usage',
        type: 'radar',
        data: [
          {
            value: safeClasses.value.map((item) => Number(item.value ?? 0)),
            name: 'Classes',
            areaStyle: { color: 'rgba(255, 59, 48, 0.22)' },
            lineStyle: { width: 2.5, color: TF2_CHART.red },
            itemStyle: { color: TF2_CHART.red, borderColor: TF2_CHART.orange, borderWidth: 2 },
            symbolSize: 6
          }
        ]
      }
    ]
  }
})
</script>

<style scoped>
.chart-card {
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
  background:
    linear-gradient(180deg, rgba(255, 59, 48, 0.07), transparent 42%),
    rgba(24, 29, 45, 0.95);
  border: 1px solid rgba(255, 79, 60, 0.14);
  border-radius: var(--radius);
  transition: border-color 0.2s ease;
}
.chart-card:hover {
  border-color: rgba(255, 79, 60, 0.28);
}
.chart-card__header {
  padding: var(--space-md) var(--space-md) 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}
.chart-card__header h3 {
  margin: 0;
  color: var(--text);
  font-size: 0.98rem;
  font-weight: 800;
  letter-spacing: -0.02em;
}
.chart-card__header p {
  margin: 0.35rem 0 0;
  color: var(--text-soft);
  font-size: 0.82rem;
  line-height: 1.4;
}
.chart-card__body { min-width: 0; }
.chart-card__canvas { height: 320px; width: 100%; }
.chart-card__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 320px;
  margin: 0;
  padding: var(--space-md);
  color: var(--text-soft);
  font-size: 0.9rem;
  text-align: center;
}
</style>
