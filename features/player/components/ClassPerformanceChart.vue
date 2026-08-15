<template>
  <div class="chart-shell">
    <ClientOnly>
      <component v-if="hasData" :is="VueECharts" :option="chartOptions" autoresize style="height: 320px; width: 100%;" />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import VueECharts from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, GridComponent, LegendComponent } from 'echarts/components'
import type { PlayerClassStat } from '~/features/player/types'

use([CanvasRenderer, BarChart, TitleComponent, TooltipComponent, GridComponent, LegendComponent])

const props = defineProps<{
  stats?: PlayerClassStat[]
  metric?: 'heals' | 'damage' | 'kills' | 'deaths'
  title?: string
}>()

const metricKey = computed(() => props.metric ?? 'heals')
const metricLabel = computed(() => {
  switch (metricKey.value) {
    case 'damage': return 'Damage'
    case 'kills': return 'Kills'
    case 'deaths': return 'Mortes'
    default: return 'Heals'
  }
})

const seriesData = computed(() => {
  const stats = [...(props.stats ?? [])].filter((stat) => Number(stat[metricKey.value] ?? 0) > 0)
  return stats
    .sort((a, b) => Number(b[metricKey.value] ?? 0) - Number(a[metricKey.value] ?? 0))
    .slice(0, 5)
    .map((stat) => ({ name: stat.className, value: Number(stat[metricKey.value] ?? 0) }))
})

const hasData = computed(() => seriesData.value.length > 0)
const chartOptions = computed(() => ({
  title: { text: props.title ?? `Top ${metricLabel.value}`, left: 'center', textStyle: { color: '#f5f7fb' } },
  tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
  grid: { left: '16%', right: '6%', bottom: '10%', top: '18%' },
  xAxis: {
    type: 'value',
    axisLine: { lineStyle: { color: 'rgba(255,255,255,0.12)' } },
    axisLabel: { color: '#a9b0cc' }
  },
  yAxis: {
    type: 'category',
    data: seriesData.value.map((item) => item.name),
    axisLine: { lineStyle: { color: 'rgba(255,255,255,0.12)' } },
    axisLabel: { color: '#f5f7fb' }
  },
  series: [{
    name: metricLabel.value,
    type: 'bar',
    data: seriesData.value.map((item) => item.value),
    itemStyle: { color: '#3a80ff', borderRadius: [0, 8, 8, 0] },
    barWidth: '60%'
  }]
}))
</script>

<style scoped>
.chart-shell {
  min-height: 320px;
  background: linear-gradient(180deg, rgba(18, 20, 32, 0.97), rgba(31, 36, 58, 0.95));
  border: 1px solid rgba(58, 128, 255, 0.1);
  border-radius: 16px;
  padding: 1rem;
}
</style>
