<template>
  <div class="chart-shell">
    <component :is="VueECharts" :options="options" autoresize style="height:320px; width:100%" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import VueECharts from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, LegendComponent, GridComponent } from 'echarts/components'

use([CanvasRenderer, LineChart, TitleComponent, TooltipComponent, LegendComponent, GridComponent])

const props = defineProps<{ series?: { date: string; kd: number }[] }>()

const series = props.series ?? [
  { date: '2026-06-01', kd: 1.12 },
  { date: '2026-06-10', kd: 1.25 },
  { date: '2026-06-20', kd: 1.18 },
  { date: '2026-07-01', kd: 1.30 },
  { date: '2026-07-12', kd: 1.36 }
]

const dates = computed(() => series.map((s) => s.date))
const values = computed(() => series.map((s) => s.kd))

const options = ref({
  title: { text: 'K/D Trend', left: 'center', textStyle: { color: 'var(--text)'} },
  tooltip: { trigger: 'axis' },
  xAxis: { type: 'category', data: dates.value, axisLine: { lineStyle: { color: 'rgba(255,255,255,0.12)'} } },
  yAxis: { type: 'value', axisLine: { lineStyle: { color: 'rgba(255,255,255,0.12)'} } },
  grid: { left: '6%', right: '6%', bottom: '8%' },
  series: [
    { name: 'K/D', type: 'line', data: values.value, smooth: true, areaStyle: {}, lineStyle: { width: 2, color: 'var(--tf2-red)' } }
  ]
})
</script>

<style scoped>
.chart-shell { background: rgba(24,29,45,0.95); padding: 1rem; border-radius: 12px; border: 1px solid rgba(255,79,60,0.08) }
</style>
