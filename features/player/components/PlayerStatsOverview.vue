<template>
  <div class="overview-grid">
    <Card class="stat-card" v-for="item in stats" :key="item.label">
      <p class="stat-label">{{ item.label }}</p>
      <p class="stat-value">{{ item.value }}</p>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PlayerOverviewStats } from '~/features/player/types'

const props = defineProps<{ overview: PlayerOverviewStats }>()
const number = new Intl.NumberFormat('en-US')

const stats = computed(() => [
  { label: 'K/D médio', value: (props.overview.avgKd ?? props.overview.kdRatio ?? 0).toFixed(2) },
  { label: 'Kills / partida', value: (props.overview.avgKills ?? 0).toFixed(1) },
  { label: 'Damage / partida', value: number.format(Math.round(props.overview.avgDamage ?? 0)) },
  { label: 'Cura / partida', value: number.format(Math.round(props.overview.avgHeals ?? 0)) },
  { label: 'Kills totais', value: number.format(props.overview.totalKills) },
  { label: 'Damage total', value: number.format(props.overview.totalDamage) },
  { label: 'Heals totais', value: number.format(props.overview.totalHeals ?? 0) },
  { label: 'Partidas', value: props.overview.matches },
  { label: 'Tempo jogado', value: `${Math.floor(props.overview.timePlayed / 3600)}h` }
])
</script>

<style scoped>
.overview-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-sm);
}
.stat-card {
  background: rgba(24, 29, 45, 0.95);
  border: 1px solid rgba(255, 79, 60, 0.12);
  border-radius: var(--radius);
  padding: var(--space-md);
}
.stat-label {
  color: var(--text-soft);
  margin: 0 0 0.5rem;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.stat-value {
  margin: 0;
  font-size: var(--font-size-xl);
  color: var(--text);
  font-weight: 700;
}
@media (max-width: 900px) {
  .overview-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 600px) {
  .overview-grid {
    grid-template-columns: 1fr;
  }
}
</style>
