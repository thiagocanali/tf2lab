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
import { LineChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, LegendComponent, GridComponent } from 'echarts/components'

use([CanvasRenderer, LineChart, TitleComponent, TooltipComponent, LegendComponent, GridComponent])

const props = defineProps<{
  series?: { date: string; kd?: number; value?: number }[]
  title?: string
  seriesName?: string
  color?: string
}>()

const safeSeries = computed(() => (props.series?.length ? props.series : [
  { date: 'M1', value: 1400 },
  { date: 'M2', value: 1800 },
  { date: 'M3', value: 2200 },
  { date: 'M4', value: 2100 },
  { date: 'M5', value: 2500 }
]))

const hasData = computed(() => safeSeries.value.length > 0)
const chartOptions = computed(() => ({
  title: { text: props.title ?? 'K/D Trend', left: 'center', textStyle: { color: '#f5f7fb' } },
  tooltip: { trigger: 'axis' },
  grid: { left: '8%', right: '6%', bottom: '12%', top: '18%' },
  xAxis: {
    type: 'category',
    data: safeSeries.value.map((item) => item.date),
    axisLine: { lineStyle: { color: 'rgba(255,255,255,0.12)' } },
    axisLabel: { color: '#a9b0cc' }
  },
  yAxis: {
    type: 'value',
    axisLine: { lineStyle: { color: 'rgba(255,255,255,0.12)' } },
    axisLabel: { color: '#a9b0cc' }
  },
  series: [{
    name: props.seriesName ?? 'K/D',
    type: 'line',
    smooth: true,
    data: safeSeries.value.map((item) => item.value ?? item.kd ?? 0),
    areaStyle: { opacity: 0.15 },
    lineStyle: { width: 3, color: props.color ?? '#ff3b30' },
    itemStyle: { color: props.color ?? '#ff3b30' }
  }]
}))
</script>

<style scoped>
.chart-shell {
  min-height: 320px;
  background: linear-gradient(180deg, rgba(18, 20, 32, 0.97), rgba(31, 36, 58, 0.95));
  border: 1px solid rgba(255, 79, 60, 0.08);
  border-radius: 16px;
  padding: 1rem;
}
</style>
