<template>
  <div class="chart-shell">
    <component :is="VueECharts" :options="options" autoresize style="height:320px; width:100%" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
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
  const stats = [...(props.stats ?? [])].filter((stat) => (stat[metricKey.value] ?? 0) > 0)
  return stats
    .sort((a, b) => Number(b[metricKey.value] ?? 0) - Number(a[metricKey.value] ?? 0))
    .slice(0, 5)
    .map((stat) => ({
      name: stat.className,
      value: Number(stat[metricKey.value] ?? 0)
    }))
})

const options = ref({
  title: { text: props.title ?? `Top ${metricLabel.value}`, left: 'center', textStyle: { color: 'var(--text)' } },
  tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
  grid: { left: '14%', right: '5%', bottom: '10%', top: '16%' },
  xAxis: {
    type: 'value',
    axisLine: { lineStyle: { color: 'rgba(255,255,255,0.12)' } },
    axisLabel: { color: 'var(--text-soft)' }
  },
  yAxis: {
    type: 'category',
    data: seriesData.value.map((item) => item.name),
    axisLine: { lineStyle: { color: 'rgba(255,255,255,0.12)' } },
    axisLabel: { color: 'var(--text)' }
  },
  series: [{
    name: metricLabel.value,
    type: 'bar',
    data: seriesData.value.map((item) => item.value),
    itemStyle: { color: 'var(--tf2-blu)', borderRadius: [0, 8, 8, 0] },
    barWidth: '60%'
  }]
})
</script>

<style scoped>
.chart-shell {
  background: rgba(24, 29, 45, 0.95);
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid rgba(58, 128, 255, 0.1);
}
</style>
