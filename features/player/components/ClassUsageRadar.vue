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
import { RadarChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, LegendComponent } from 'echarts/components'

use([CanvasRenderer, RadarChart, TitleComponent, TooltipComponent, LegendComponent])

const props = defineProps<{ classes?: { name: string; value: number }[] }>()

const classes = props.classes ?? [
  { name: 'Soldier', value: 40 },
  { name: 'Scout', value: 25 },
  { name: 'Demo', value: 20 },
  { name: 'Medic', value: 10 },
  { name: 'Sniper', value: 5 }
]

const indicators = computed(() => classes.map((c) => ({ name: c.name, max: 100 })))
const values = computed(() => classes.map((c) => c.value))

const options = ref({
  title: { text: 'Class Usage', left: 'center', textStyle: { color: 'var(--text)'} },
  tooltip: {},
  radar: { indicator: indicators.value, axisLine: { lineStyle: { color: 'rgba(255,255,255,0.12)' } } },
  series: [{ name: 'Usage', type: 'radar', data: [{ value: values.value, name: 'Classes' }], areaStyle: { opacity: 0.6, color: 'var(--tf2-blu)' } }]
})
</script>

<style scoped>
.chart-shell { background: rgba(24,29,45,0.95); padding: 1rem; border-radius: 12px; border: 1px solid rgba(58,128,255,0.08) }
</style>
