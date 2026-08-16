<template>
  <div class="chart-card">
    <div class="chart-header">
      <h4 class="chart-title">{{ title ?? 'K/D Trend' }}</h4>
    </div>
    <div class="chart-shell">
      <ClientOnly>
        <component v-if="hasData" :is="VueECharts" :option="chartOptions" autoresize style="height: 320px; width: 100%;" />
        <div v-else class="chart-empty">
          <span>📊</span>
          <p>Sem dados</p>
        </div>
      </ClientOnly>
    </div>
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
  tooltip: { trigger: 'axis' },
  grid: { left: '8%', right: '6%', bottom: '10%', top: '8%' },
  xAxis: {
    type: 'category',
    data: safeSeries.value.map((item) => item.date),
    axisLine: { lineStyle: { color: 'rgba(255,255,255,0.12)' } },
    axisLabel: { color: '#a9b0cc', fontSize: 11 }
  },
  yAxis: {
    type: 'value',
    axisLine: { lineStyle: { color: 'rgba(255,255,255,0.12)' } },
    axisLabel: { color: '#a9b0cc', fontSize: 11 },
    splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } }
  },
  series: [{
    name: props.seriesName ?? 'K/D',
    type: 'line',
    smooth: true,
    data: safeSeries.value.map((item) => item.value ?? item.kd ?? 0),
    areaStyle: { opacity: 0.15 },
    lineStyle: { width: 3, color: props.color ?? '#ff3b30' },
    itemStyle: { color: props.color ?? '#ff3b30', borderWidth: 2 },
    symbolSize: 6
  }]
}))
</script>

<style scoped>
.chart-card {
  display: flex;
  flex-direction: column;
  gap: 0;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.01));
  overflow: hidden;
  transition: all 0.2s ease;
}

.chart-card:hover {
  border-color: rgba(255, 79, 60, 0.15);
  background: linear-gradient(135deg, rgba(255, 79, 60, 0.05), rgba(255, 79, 60, 0.02));
}

.chart-header {
  padding: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.chart-title {
  margin: 0;
  color: var(--text);
  font-size: 0.95rem;
  font-weight: 700;
}

.chart-shell {
  background: transparent;
  border: none;
  border-radius: 0;
  padding: 0;
  flex: 1;
}

.chart-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  height: 320px;
  color: var(--text-soft);
}

.chart-empty span {
  font-size: 2rem;
  opacity: 0.5;
}

.chart-empty p {
  margin: 0;
  font-size: 0.88rem;
}
</style>
