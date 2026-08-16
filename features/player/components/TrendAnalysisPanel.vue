<template>
  <Card class="trend-analysis-card">
    <div class="trend-header">
      <h3>Análise de Tendência</h3>
      <p class="trend-subtitle">Sua evolução nos últimos logs</p>
    </div>

    <div v-if="trends.length" class="trends-grid">
      <div v-for="trend in trends" :key="trend.metric" class="trend-item">
        <div class="trend-top">
          <div class="trend-label">{{ trend.metric }}</div>
          <div class="trend-direction" :class="`direction--${trend.direction}`">
            {{ trend.arrow }} {{ trend.change }}%
          </div>
        </div>

        <div class="trend-bar-container">
          <div class="trend-bar" :style="{ width: `${trend.percentage}%`, backgroundColor: trend.color }" />
        </div>

        <div class="trend-info">
          <span class="trend-first">{{ trend.first }}</span>
          <span class="trend-arrow-small">→</span>
          <span class="trend-last">{{ trend.last }}</span>
        </div>
      </div>
    </div>

    <div v-else class="trend-empty">
      <p>Mais logs necessários para análise de tendência.</p>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PlayerLogReference } from '~~/features/player/types'

interface Trend {
  metric: string
  direction: 'up' | 'down' | 'stable'
  arrow: string
  change: number
  percentage: number
  first: string
  last: string
  color: string
}

const props = defineProps<{
  recentLogs: PlayerLogReference[]
}>()

const trends = computed<Trend[]>(() => {
  const logs = props.recentLogs
  if (logs.length < 5) return []

  const trends: Trend[] = []

  // Split logs into first half and second half
  const mid = Math.ceil(logs.length / 2)
  const firstHalf = logs.slice(0, mid)
  const secondHalf = logs.slice(mid)

  // K/D Analysis
  const firstKd = firstHalf.reduce((sum, l) => sum + (l.kills ?? 0) / Math.max(1, l.deaths ?? 1), 0) / firstHalf.length
  const secondKd = secondHalf.reduce((sum, l) => sum + (l.kills ?? 0) / Math.max(1, l.deaths ?? 1), 0) / secondHalf.length
  const kdChange = ((secondKd - firstKd) / Math.max(0.1, firstKd)) * 100

  trends.push({
    metric: 'K/D Ratio',
    direction: kdChange > 5 ? 'up' : kdChange < -5 ? 'down' : 'stable',
    arrow: kdChange > 5 ? '↑' : kdChange < -5 ? '↓' : '→',
    change: Math.abs(Math.round(kdChange)),
    percentage: Math.min(100, 50 + (kdChange / 2)),
    first: firstKd.toFixed(2),
    last: secondKd.toFixed(2),
    color: kdChange > 5 ? '#22c55e' : kdChange < -5 ? '#ef4444' : '#60a5fa'
  })

  // Damage Analysis
  const firstDmg = firstHalf.reduce((sum, l) => sum + (l.damage ?? 0), 0) / firstHalf.length
  const secondDmg = secondHalf.reduce((sum, l) => sum + (l.damage ?? 0), 0) / secondHalf.length
  const dmgChange = ((secondDmg - firstDmg) / Math.max(1, firstDmg)) * 100

  trends.push({
    metric: 'Damage Médio',
    direction: dmgChange > 5 ? 'up' : dmgChange < -5 ? 'down' : 'stable',
    arrow: dmgChange > 5 ? '↑' : dmgChange < -5 ? '↓' : '→',
    change: Math.abs(Math.round(dmgChange)),
    percentage: Math.min(100, 50 + (dmgChange / 2)),
    first: Math.round(firstDmg).toString(),
    last: Math.round(secondDmg).toString(),
    color: dmgChange > 5 ? '#22c55e' : dmgChange < -5 ? '#ef4444' : '#60a5fa'
  })

  // Consistency (Deaths per match)
  const firstDeaths = firstHalf.reduce((sum, l) => sum + (l.deaths ?? 0), 0) / firstHalf.length
  const secondDeaths = secondHalf.reduce((sum, l) => sum + (l.deaths ?? 0), 0) / secondHalf.length
  const deathChange = ((secondDeaths - firstDeaths) / Math.max(1, firstDeaths)) * 100

  trends.push({
    metric: 'Deaths por Partida',
    direction: deathChange < -5 ? 'up' : deathChange > 5 ? 'down' : 'stable', // Lower is better for deaths
    arrow: deathChange < -5 ? '↓' : deathChange > 5 ? '↑' : '→', // Inverted arrows
    change: Math.abs(Math.round(deathChange)),
    percentage: Math.min(100, 50 + (Math.abs(deathChange) / 2)),
    first: firstDeaths.toFixed(1),
    last: secondDeaths.toFixed(1),
    color: deathChange < -5 ? '#22c55e' : deathChange > 5 ? '#ef4444' : '#60a5fa'
  })

  return trends
})
</script>

<style scoped>
.trend-analysis-card {
  background: rgba(24, 29, 45, 0.95);
  border: 1px solid rgba(255, 79, 60, 0.12);
  border-radius: var(--radius);
  padding: var(--space-md);
}

.trend-header h3 {
  margin: 0;
  color: var(--text);
  font-size: 1.35rem;
}

.trend-subtitle {
  margin: 0.35rem 0 0;
  color: var(--text-soft);
  font-size: 0.82rem;
}

.trends-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--space-md);
  margin-top: var(--space-md);
}

.trend-item {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  padding: 1rem;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 0.2s ease;
}

.trend-item:hover {
  border-color: rgba(255, 79, 60, 0.2);
  background: rgba(255, 79, 60, 0.06);
}

.trend-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.6rem;
}

.trend-label {
  color: var(--text);
  font-weight: 700;
  font-size: 0.9rem;
}

.trend-direction {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.6rem;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.08);
  font-size: 0.7rem;
  font-weight: 700;
  white-space: nowrap;
}

.direction--up {
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
}

.direction--down {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

.direction--stable {
  background: rgba(96, 165, 250, 0.15);
  color: #60a5fa;
}

.trend-bar-container {
  height: 6px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.05);
  overflow: hidden;
}

.trend-bar {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease;
  background: #60a5fa;
}

.trend-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: var(--text-soft);
}

.trend-first,
.trend-last {
  font-weight: 700;
  color: var(--text-soft);
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.04);
}

.trend-arrow-small {
  opacity: 0.6;
}

.trend-empty {
  padding: 1.5rem 1rem;
  text-align: center;
  color: var(--text-soft);
  font-size: 0.88rem;
}

@media (max-width: 768px) {
  .trends-grid {
    grid-template-columns: 1fr;
  }
}
</style>
