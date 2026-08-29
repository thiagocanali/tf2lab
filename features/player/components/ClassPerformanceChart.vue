<template>
  <article class="chart-card">
    <header class="chart-card__header">
      <h3>{{ title ?? displayTitle }}</h3>
      <p>{{ subtitle }}</p>
    </header>
    <div class="chart-card__body">
      <ClientOnly>
        <VChart v-if="hasData" :option="options" autoresize class="chart-card__canvas" />
        <p v-else class="chart-card__empty">No class performance data available yet.</p>
      </ClientOnly>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart } from 'echarts/charts'
import { TooltipComponent, GridComponent } from 'echarts/components'
import { TF2_CHART, tf2Tooltip, resolveChartColor } from '~~/features/player/chartTheme'
import type { PlayerClassStat } from '~/features/player/types'

use([CanvasRenderer, BarChart, TooltipComponent, GridComponent])

const props = defineProps<{
  stats?: PlayerClassStat[]
  metric?: 'heals' | 'damage' | 'kills' | 'deaths'
  title?: string
  color?: string
}>()

const metricKey = computed(() => props.metric ?? 'heals')

const metricLabel = computed(() => {
  switch (metricKey.value) {
    case 'damage':
      return 'Damage'
    case 'kills':
      return 'Kills'
    case 'deaths':
      return 'Deaths'
    default:
      return 'Heals'
  }
})

const displayTitle = computed(() => `Top ${metricLabel.value} by class`)

const stroke = computed(() => resolveChartColor(props.color))

const seriesData = computed(() => {
  const stats = [...(props.stats ?? [])].filter((stat) => Number(stat[metricKey.value] ?? 0) > 0)
  return stats
    .sort((a, b) => Number(b[metricKey.value] ?? 0) - Number(a[metricKey.value] ?? 0))
    .slice(0, 5)
    .map((stat) => ({ name: stat.className, value: Number(stat[metricKey.value] ?? 0) }))
})

const hasData = computed(() => seriesData.value.length > 0)

const subtitle = computed(
  () => `${seriesData.value.length} classes ranked by ${metricLabel.value.toLowerCase()} across analyzed logs.`
)

const options = computed(() => {
  const color = stroke.value
  return {
    color: [color],
    tooltip: {
      ...tf2Tooltip,
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      valueFormatter: (value: number) => new Intl.NumberFormat('en-US').format(value)
    },
    grid: { left: '16%', right: '6%', bottom: '10%', top: '18%', containLabel: true },
    xAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: TF2_CHART.axis } },
      axisLabel: { color: TF2_CHART.textSoft, fontSize: 11 },
      splitLine: { lineStyle: { color: TF2_CHART.split } }
    },
    yAxis: {
      type: 'category',
      data: seriesData.value.map((item) => item.name),
      axisLine: { lineStyle: { color: TF2_CHART.axis } },
      axisTick: { show: false },
      axisLabel: { color: TF2_CHART.text, fontSize: 11 }
    },
    series: [
      {
        name: metricLabel.value,
        type: 'bar',
        data: seriesData.value.map((item) => item.value),
        itemStyle: { color, borderRadius: [0, 8, 8, 0] },
        barWidth: '60%',
        label: {
          show: true,
          position: 'right',
          color: TF2_CHART.textSoft,
          fontSize: 11,
          formatter: (params: { value: number }) => new Intl.NumberFormat('en-US').format(params.value)
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
