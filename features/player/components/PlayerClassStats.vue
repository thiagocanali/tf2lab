<template>
  <Card class="class-stats-card">
    <div class="header-row">
      <h3>Estatísticas por classe</h3>
      <span class="class-count">{{ classes.length }} classes</span>
    </div>
    <div class="class-grid">
      <div class="class-card" v-for="stat in classes" :key="stat.className">
        <div class="class-label">{{ stat.className }}</div>
        <div class="class-values">
          <span>Kills: {{ stat.kills }}</span>
          <span>Deaths: {{ stat.deaths }}</span>
          <span>K/D: {{ stat.kd?.toFixed(2) ?? '-' }}</span>
          <span>Damage: {{ stat.damage ?? 0 }}</span>
        </div>
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
import type { PlayerClassStat } from '~~/features/player/types'
const props = defineProps<{ classes: PlayerClassStat[] }>()
</script>

<style scoped>
.class-stats-card {
  background: rgba(24, 29, 45, 0.95);
  border: 1px solid rgba(255, 79, 60, 0.12);
  border-radius: var(--radius);
  padding: var(--space-md);
}
.header-row {
  display:flex;
  justify-content:space-between;
  align-items:center;
  margin-bottom: var(--space-sm);
}
.class-grid {
  display:grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-sm);
}
.class-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 14px;
  padding: var(--space-sm);
}
.class-label {
  color: var(--accent);
  font-weight: 700;
  margin-bottom: 0.75rem;
}
.class-values {
  display:grid;
  gap: 0.35rem;
  color: var(--text-soft);
}
@media (max-width: 760px) {
  .class-grid {
    grid-template-columns: 1fr;
  }
}
</style>
