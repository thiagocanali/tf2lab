<template>
  <article class="chart-card">
    <header class="chart-card__header">
      <h3>{{ title ?? 'K/D trend' }}</h3>
      <p>{{ subtitle }}</p>
    </header>
    <div class="chart-card__body">
      <ClientOnly>
        <VChart v-if="points.length" :option="options" autoresize class="chart-card__canvas" />
        <p v-else class="chart-card__empty">Not enough log data to plot this series yet.</p>
      </ClientOnly>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import { TF2_CHART, resolveChartColor, tf2Tooltip } from '~~/features/player/chartTheme'

use([CanvasRenderer, LineChart, GridComponent, TooltipComponent])

const props = defineProps<{
  series?: { date: string; kd?: number; value?: number }[]
  title?: string
  seriesName?: string
  color?: string
}>()

const metricName = computed(() => props.seriesName ?? 'K/D')
const subtitle = computed(
  () => `${metricName.value} across analyzed logs, oldest to newest.`
)
const stroke = computed(() => resolveChartColor(props.color))
const isRatio = computed(() => metricName.value.toUpperCase().includes('K/D'))

const points = computed(() => {
  const raw = [...(props.series ?? [])]
  if (!raw.length) return []
  const dated = raw.every((point) => !Number.isNaN(Date.parse(point.date)))
  if (dated) return raw.sort((a, b) => Date.parse(a.date) - Date.parse(b.date))
  return raw.reverse()
})

const labels = computed(() =>
  points.value.map((point) => {
    const parsed = Date.parse(point.date)
    if (Number.isNaN(parsed)) return point.date
    return new Date(parsed).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  })
)

const values = computed(() =>
  points.value.map((point) => {
    const raw = Number(point.value ?? point.kd ?? 0)
    return isRatio.value ? Number(raw.toFixed(2)) : Math.round(raw)
  })
)

const options = computed(() => {
  const color = stroke.value
  return {
    color: [color],
    tooltip: {
      ...tf2Tooltip,
      trigger: 'axis',
      valueFormatter: (value: number) =>
        isRatio.value ? Number(value).toFixed(2) : new Intl.NumberFormat('en-US').format(value)
    },
    grid: { top: 16, right: 12, bottom: 8, left: 8, containLabel: true },
    xAxis: {
      type: 'category',
      data: labels.value,
      boundaryGap: false,
      axisLine: { lineStyle: { color: TF2_CHART.axis } },
      axisTick: { show: false },
      axisLabel: { color: TF2_CHART.textSoft, fontSize: 11, hideOverlap: true }
    },
    yAxis: {
      type: 'value',
      min: 0,
      axisLine: { show: false },
      axisLabel: { color: TF2_CHART.textSoft, fontSize: 11 },
      splitLine: { lineStyle: { color: TF2_CHART.split } }
    },
    series: [
      {
        name: metricName.value,
        type: 'line',
        data: values.value,
        smooth: true,
        symbol: 'circle',
        symbolSize: 7,
        showSymbol: values.value.length <= 12,
        lineStyle: { width: 2.5, color },
        itemStyle: { color: TF2_CHART.orange, borderColor: color, borderWidth: 2 },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: `${color}61` },
              { offset: 1, color: `${color}05` }
            ]
          }
        }
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
.chart-card__canvas { height: 280px; width: 100%; }
.chart-card__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 280px;
  margin: 0;
  padding: var(--space-md);
  color: var(--text-soft);
  font-size: 0.9rem;
  text-align: center;
}
</style>
