<template>
  <div class="chart-card">
    <div class="chart-header">
      <h4 class="chart-title">Distribuição de Classes</h4>
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
import { RadarChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, LegendComponent } from 'echarts/components'

use([CanvasRenderer, RadarChart, TitleComponent, TooltipComponent, LegendComponent])

const props = defineProps<{ classes?: { name: string; value: number }[] }>()

const safeClasses = computed(() => (props.classes?.length ? props.classes : [
  { name: 'Soldier', value: 40 },
  { name: 'Scout', value: 25 },
  { name: 'Demo', value: 20 },
  { name: 'Medic', value: 10 },
  { name: 'Sniper', value: 5 }
]))

const hasData = computed(() => safeClasses.value.length > 0)
const chartOptions = computed(() => ({
  tooltip: {},
  radar: {
    indicator: safeClasses.value.map((item) => ({ name: item.name, max: 100 })),
    axisLine: { lineStyle: { color: 'rgba(255,255,255,0.12)' } },
    splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } },
    name: { textStyle: { color: '#a9b0cc', fontSize: 11 } }
  },
  series: [{
    name: 'Usage',
    type: 'radar',
    data: [{ value: safeClasses.value.map((item) => item.value), name: 'Classes' }],
    areaStyle: { opacity: 0.25 },
    lineStyle: { width: 2.5, color: '#60a5fa' },
    itemStyle: { color: '#60a5fa', borderWidth: 2 },
    symbolSize: 5
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
  border-color: rgba(96, 165, 250, 0.15);
  background: linear-gradient(135deg, rgba(96, 165, 250, 0.05), rgba(96, 165, 250, 0.02));
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
