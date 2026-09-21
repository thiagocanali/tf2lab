<template>
  <section v-if="mainClass && classStat" class="main-class-card" aria-labelledby="main-class-title">
    <div class="main-class-header">
      <div>
        <p class="eyebrow">Sua classe</p>
        <h2 id="main-class-title">{{ mainClass.className }}</h2>
        <p class="main-class-summary">
          {{ mainClass.timePercentage.toFixed(0) }}% do tempo nas logs · {{ mainClass.matches }} partidas com esta classe
        </p>
      </div>
      <span class="main-class-badge">Mais jogada</span>
    </div>

    <div class="class-metrics">
      <div v-for="metric in metrics" :key="metric.label" class="class-metric">
        <span>{{ metric.label }}</span>
        <strong>{{ metric.value }}</strong>
      </div>
    </div>

    <p v-if="lowConfidence" class="confidence-warning">
      Amostra baixa: use estes números como direção, não como diagnóstico. São {{ analyzedLogs }} logs analisadas.
    </p>
    <p v-else class="confidence-note">Baseado em {{ analyzedLogs }} logs analisadas.</p>
  </section>

  <section v-else class="main-class-empty" aria-live="polite">
    <p class="eyebrow">Sua classe</p>
    <h2>Ainda não há dados por classe</h2>
    <p>Precisamos de pelo menos uma log analisada com estatísticas de classe para mostrar seu foco principal.</p>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PlayerClassStat, PlayerMainClassInsight } from '~~/features/player/types'

const props = defineProps<{
  mainClass?: PlayerMainClassInsight
  classStat?: PlayerClassStat
  analyzedLogs: number
}>()

const number = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 })
const decimal = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 })
const className = computed(() => props.mainClass?.className.toLowerCase() ?? '')
const lowConfidence = computed(() => props.analyzedLogs < 5 || (props.mainClass?.matches ?? 0) < 5)

const metrics = computed(() => {
  const stat = props.classStat
  if (!stat) return []

  const shared = [
    { label: 'K/D médio', value: (stat.avgKd ?? stat.kd ?? 0).toFixed(2) },
    { label: 'Deaths / partida', value: decimal.format(stat.avgDeaths ?? 0) }
  ]

  if (className.value === 'medic') {
    return [
      { label: 'Cura / partida', value: number.format(Math.round(stat.avgHeals ?? 0)) },
      ...shared,
      { label: 'Partidas', value: String(stat.matches ?? 0) }
    ]
  }

  if (['scout', 'soldier', 'demoman'].includes(className.value)) {
    return [
      { label: 'Damage / partida', value: number.format(Math.round(stat.avgDamage ?? 0)) },
      { label: 'Kills / partida', value: decimal.format(stat.avgKills ?? 0) },
      ...shared,
      { label: 'Partidas', value: String(stat.matches ?? 0) }
    ]
  }

  return [
    { label: 'Damage / partida', value: number.format(Math.round(stat.avgDamage ?? 0)) },
    ...shared,
    { label: 'Cura / partida', value: number.format(Math.round(stat.avgHeals ?? 0)) },
    { label: 'Partidas', value: String(stat.matches ?? 0) }
  ]
})
</script>

<style scoped>
.main-class-card,
.main-class-empty {
  padding: var(--space-lg);
  border: 1px solid rgba(255, 155, 51, 0.34);
  border-radius: var(--profile-card-radius, 12px);
  background: linear-gradient(135deg, rgba(255, 155, 51, 0.12), rgba(18, 20, 32, 0.96) 62%);
  box-shadow: var(--profile-card-shadow, 0 14px 36px rgba(0, 0, 0, 0.2));
}

.main-class-header { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--space-md); }
.eyebrow { margin: 0 0 0.35rem; color: var(--tf2-orange); font-size: 0.72rem; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; }
h2 { margin: 0; color: var(--text); font-size: clamp(1.35rem, 3vw, 2rem); }
.main-class-summary { margin: 0.45rem 0 0; color: var(--text-soft); font-size: 0.88rem; }
.main-class-badge { flex: 0 0 auto; padding: 0.35rem 0.55rem; border: 1px solid rgba(255, 155, 51, 0.35); border-radius: 999px; color: #ffc477; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; }
.class-metrics { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 0.65rem; margin-top: 1.25rem; }
.class-metric { min-width: 0; padding: 0.75rem; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 0.65rem; background: rgba(7, 8, 13, 0.34); }
.class-metric span { display: block; overflow: hidden; color: var(--text-soft); font-size: 0.7rem; text-overflow: ellipsis; text-transform: uppercase; white-space: nowrap; }
.class-metric strong { display: block; margin-top: 0.25rem; color: var(--text); font-size: 1.05rem; }
.confidence-note, .confidence-warning { margin: 0.8rem 0 0; color: var(--text-soft); font-size: 0.78rem; }
.confidence-warning { color: #f7d39a; }
.main-class-empty h2 { font-size: 1.2rem; }
.main-class-empty > p:last-child { max-width: 42rem; margin: 0.5rem 0 0; color: var(--text-soft); font-size: 0.88rem; line-height: 1.55; }

@media (max-width: 640px) {
  .main-class-header { flex-direction: column; }
  .class-metrics { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
</style>