<template>
  <article class="chart-card">
    <header class="chart-card__header">
      <h3>{{ title ?? 'Damage breakdown' }}</h3>
      <p>{{ subtitle }}</p>
    </header>
    <div class="chart-card__body">
      <ClientOnly>
        <VChart v-if="hasData" :option="options" autoresize class="chart-card__canvas" />
        <p v-else class="chart-card__empty">No damage data available yet.</p>
      </ClientOnly>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart } from 'echarts/charts'
import { TooltipComponent, LegendComponent } from 'echarts/components'
import { TF2_CHART, tf2Tooltip, resolveChartColor } from '~~/features/player/chartTheme'

use([CanvasRenderer, PieChart, TooltipComponent, LegendComponent])

const props = defineProps<{
  data?: { name: string; value: number }[]
  title?: string
  color?: string
}>()

const safeData = computed(() => (props.data ?? []).filter((item) => Number(item.value ?? 0) > 0))

const hasData = computed(() => safeData.value.length > 0)

const subtitle = computed(
  () => `${safeData.value.length} damage types recorded across analyzed logs.`
)

const stroke = computed(() => resolveChartColor(props.color))

const options = computed(() => {
  const color = stroke.value
  return {
    color: [color, TF2_CHART.blu, TF2_CHART.orange, TF2_CHART.red],
    tooltip: {
      ...tf2Tooltip,
      trigger: 'item',
      valueFormatter: (value: number) => new Intl.NumberFormat('en-US').format(value)
    },
    legend: {
      bottom: 0,
      textStyle: { color: TF2_CHART.textSoft, fontSize: 11 }
    },
    series: [
      {
        name: 'Breakdown',
        type: 'pie',
        radius: ['42%', '68%'],
        avoidLabelOverlap: false,
        data: safeData.value,
        label: { color: TF2_CHART.text, fontSize: 11 },
        emphasis: { itemStyle: { shadowBlur: 12, shadowColor: 'rgba(0,0,0,0.25)' } }
      }
    ]
  }
})
</script>

<style scoped>
.chart-card {
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
  background:
    linear-gradient(180deg, rgba(255, 59, 48, 0.07), transparent 42%),
    rgba(24, 29, 45, 0.95);
  border: 1px solid rgba(255, 79, 60, 0.14);
  border-radius: var(--radius);
  transition: border-color 0.2s ease;
}
.chart-card:hover {
  border-color: rgba(255, 79, 60, 0.28);
}
.chart-card__header {
  padding: var(--space-md) var(--space-md) 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}
.chart-card__header h3 {
  margin: 0;
  color: var(--text);
  font-size: 0.98rem;
  font-weight: 800;
  letter-spacing: -0.02em;
}
.chart-card__header p {
  margin: 0.35rem 0 0;
  color: var(--text-soft);
  font-size: 0.82rem;
  line-height: 1.4;
}
.chart-card__body { min-width: 0; }
.chart-card__canvas { height: 320px; width: 100%; }
.chart-card__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 320px;
  margin: 0;
  padding: var(--space-md);
  color: var(--text-soft);
  font-size: 0.9rem;
  text-align: center;
}
</style>
