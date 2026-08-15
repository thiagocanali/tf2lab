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
import { PieChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, LegendComponent } from 'echarts/components'

use([CanvasRenderer, PieChart, TitleComponent, TooltipComponent, LegendComponent])

const props = defineProps<{ data?: { name: string; value: number }[] }>()

const safeData = computed(() => (props.data?.length ? props.data : [
  { name: 'Damage', value: 65 },
  { name: 'Healing', value: 20 },
  { name: 'Utility', value: 15 }
]))

const hasData = computed(() => safeData.value.length > 0)
const chartOptions = computed(() => ({
  title: { text: 'Damage Breakdown', left: 'center', textStyle: { color: '#f5f7fb' } },
  tooltip: { trigger: 'item' },
  legend: { bottom: 0, textStyle: { color: '#a9b0cc' } },
  series: [{
    name: 'Breakdown',
    type: 'pie',
    radius: ['42%', '68%'],
    avoidLabelOverlap: false,
    data: safeData.value,
    label: { color: '#f5f7fb', fontSize: 11 },
    emphasis: { itemStyle: { shadowBlur: 12, shadowColor: 'rgba(0,0,0,0.25)' } }
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
