<template>
  <Card class="map-breakdown-card">
    <div class="map-header">
      <div>
        <p class="eyebrow">Onde seu jogo aparece</p>
        <h3>Desempenho por mapa</h3>
        <p class="map-subtitle">Top mapas por quantidade de logs · {{ analysisLabel }}</p>
      </div>
    </div>

    <div v-if="maps.length" class="map-list">
      <div v-for="map in maps" :key="map.name" class="map-row">
        <div class="map-name">
          <strong>{{ map.name }}</strong>
          <span>{{ map.count }} {{ map.count === 1 ? 'log' : 'logs' }}</span>
        </div>
        <div class="map-metrics">
          <span>{{ metricLabel }} <strong>{{ formatMetric(map.metric) }}</strong></span>
          <span>K/D <strong>{{ map.kd.toFixed(2) }}</strong></span>
        </div>
      </div>
    </div>

    <div v-else class="map-empty">Nenhum mapa disponível nas logs analisadas.</div>
  </Card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PlayerLogReference } from '~~/features/player/types'

const props = defineProps<{
  logs: PlayerLogReference[]
  mainClassName?: string
  analyzedLogs: number
  totalLogs: number
}>()

const isMedic = computed(() => props.mainClassName?.toLowerCase() === 'medic')
const metricLabel = computed(() => isMedic.value ? 'Cura/partida' : 'Dano/partida')
const analysisLabel = computed(() => `Baseado em ${props.analyzedLogs} logs analisadas de ${props.totalLogs} total`)
const number = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 })

const maps = computed(() => {
  const grouped = new Map<string, { count: number; metric: number; kd: number }>()

  for (const log of props.logs) {
    if (!log.map) continue
    const current = grouped.get(log.map) ?? { count: 0, metric: 0, kd: 0 }
    current.count += 1
    current.metric += isMedic.value ? (log.heals ?? 0) : (log.damage ?? 0)
    current.kd += log.kd ?? 0
    grouped.set(log.map, current)
  }

  return Array.from(grouped.entries())
    .map(([name, stat]) => ({
      name,
      count: stat.count,
      metric: stat.metric / stat.count,
      kd: stat.kd / stat.count
    }))
    .sort((left, right) => right.count - left.count || right.metric - left.metric)
    .slice(0, 5)
})

const formatMetric = (value: number) => number.format(Math.round(value))
</script>

<style scoped>
.map-breakdown-card { padding: var(--space-lg); border: 1px solid rgba(58, 128, 255, 0.18); border-radius: var(--radius); background: rgba(24, 29, 45, 0.95); }
.eyebrow { margin: 0 0 0.35rem; color: var(--tf2-blu); font-size: 0.72rem; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; }
.map-header h3 { margin: 0; color: var(--text); font-size: 1.35rem; }
.map-subtitle { margin: 0.35rem 0 0; color: var(--text-soft); font-size: 0.82rem; line-height: 1.45; }
.map-list { display: grid; gap: 0.55rem; margin-top: var(--space-lg); }
.map-row { display: flex; align-items: center; justify-content: space-between; gap: var(--space-md); padding: 0.75rem; border: 1px solid rgba(255, 255, 255, 0.07); border-radius: 0.65rem; background: rgba(255, 255, 255, 0.03); }
.map-name { display: grid; gap: 0.2rem; min-width: 0; }
.map-name strong { overflow: hidden; color: var(--text); text-overflow: ellipsis; white-space: nowrap; }
.map-name span, .map-metrics span { color: var(--text-soft); font-size: 0.75rem; }
.map-metrics { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 0.75rem; text-align: right; }
.map-metrics strong { color: var(--text); }
.map-empty { padding: 1.5rem 0 0.25rem; color: var(--text-soft); font-size: 0.88rem; }
@media (max-width: 560px) { .map-row { align-items: flex-start; flex-direction: column; }.map-metrics { justify-content: flex-start; text-align: left; } }
</style>