<template>
  <div class="overview-grid">
    <Card class="stat-card" v-for="item in stats" :key="item.label">
      <p class="stat-label">{{ item.label }}</p>
      <p class="stat-value">{{ item.value }}</p>
    </Card>
  </div>
</template>

<script setup lang="ts">
import type { PlayerOverviewStats } from '~~/features/player/types'
const props = defineProps<{ overview: PlayerOverviewStats }>()

const stats = [
  { label: 'Kills', value: props.overview.totalKills },
  { label: 'Deaths', value: props.overview.totalDeaths },
  { label: 'K/D', value: props.overview.kdRatio.toFixed(2) },
  { label: 'Damage', value: props.overview.totalDamage },
  { label: 'Matches', value: props.overview.matches },
  { label: 'Tempo jogado', value: `${Math.floor(props.overview.timePlayed / 3600)}h` }
]
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
