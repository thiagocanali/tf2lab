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
import { PieChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, LegendComponent } from 'echarts/components'

use([CanvasRenderer, PieChart, TitleComponent, TooltipComponent, LegendComponent])

const props = defineProps<{ data?: { name: string; value: number }[] }>()

const data = props.data ?? [
  { name: 'Damage', value: 65 },
  { name: 'Healing', value: 20 },
  { name: 'Utility', value: 15 }
]

const options = ref({
  title: { text: 'Damage Breakdown', left: 'center', textStyle: { color: 'var(--text)'} },
  tooltip: { trigger: 'item' },
  legend: { bottom: 0, textStyle: { color: 'var(--text-soft)' } },
  series: [{ name: 'Breakdown', type: 'pie', radius: ['40%', '65%'], avoidLabelOverlap: false, data, emphasis: { itemStyle: { shadowBlur: 10 } } }]
})
</script>

<style scoped>
.chart-shell { background: rgba(24,29,45,0.95); padding: 1rem; border-radius: 12px; border: 1px solid rgba(255,79,60,0.08) }
</style>
