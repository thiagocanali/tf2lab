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
  title: { text: 'Class Usage', left: 'center', textStyle: { color: '#f5f7fb' } },
  tooltip: {},
  radar: {
    indicator: safeClasses.value.map((item) => ({ name: item.name, max: 100 })),
    axisLine: { lineStyle: { color: 'rgba(255,255,255,0.12)' } },
    splitLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } }
  },
  series: [{
    name: 'Usage',
    type: 'radar',
    data: [{ value: safeClasses.value.map((item) => item.value), name: 'Classes' }],
    areaStyle: { opacity: 0.55 },
    lineStyle: { width: 2, color: '#3a80ff' },
    itemStyle: { color: '#3a80ff' }
  }]
}))
</script>

<style scoped>
.chart-shell {
  min-height: 320px;
  background: linear-gradient(180deg, rgba(18, 20, 32, 0.97), rgba(31, 36, 58, 0.95));
  border: 1px solid rgba(58, 128, 255, 0.08);
  border-radius: 16px;
  padding: 1rem;
}
</style>
