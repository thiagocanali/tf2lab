<template>
  <Card class="class-stats-card">
    <div class="header-row">
      <div>
        <h3>Estatísticas por classe</h3>
        <p class="section-subtitle">Médias por partida e contexto por classe</p>
      </div>
      <span class="class-count">{{ classes.length }} classes</span>
    </div>
    <div class="class-grid">
      <div class="class-card" v-for="stat in classes" :key="stat.className" :class="{ 'class-card--medic': stat.className === 'Medic' }">
        <div class="class-header">
          <div class="class-label">{{ stat.className }}</div>
          <span class="class-match-count">{{ stat.matches ?? 0 }} logs</span>
        </div>

        <div class="class-kpis">
          <div class="kpi">
            <span class="kpi-label">K/D</span>
            <strong>{{ stat.avgKd?.toFixed(2) ?? stat.kd?.toFixed(2) ?? '-' }}</strong>
          </div>
          <div class="kpi">
            <span class="kpi-label">Dmg</span>
            <strong>{{ Math.round(stat.avgDamage ?? 0) }}</strong>
          </div>
          <div v-if="stat.avgHeals !== undefined" class="kpi">
            <span class="kpi-label">Cura</span>
            <strong>{{ Math.round(stat.avgHeals ?? 0) }}</strong>
          </div>
        </div>

        <div class="class-values">
          <span>Kills / partida: {{ (stat.avgKills ?? 0).toFixed(1) }}</span>
          <span>Deaths / partida: {{ (stat.avgDeaths ?? 0).toFixed(1) }}</span>
          <span v-if="stat.damage !== undefined">Damage total: {{ stat.damage }}</span>
          <span v-if="stat.heals !== undefined">Heals total: {{ stat.heals }}</span>
          <span v-if="stat.healsPerMatch !== undefined">Heals/partida: {{ stat.healsPerMatch.toFixed(1) }}</span>
          <span v-if="stat.mostHealedClasses?.length">Top cura: {{ stat.mostHealedClasses[0].name }} ({{ stat.mostHealedClasses[0].value }})</span>
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
  align-items:flex-start;
  gap: var(--space-sm);
  margin-bottom: var(--space-sm);
}
.header-row h3 {
  margin: 0;
  color: var(--text);
}
.section-subtitle {
  margin: 0.3rem 0 0;
  color: var(--text-soft);
  font-size: 0.76rem;
}
.class-count {
  color: var(--text-soft);
  font-size: 0.78rem;
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
.class-card--medic {
  border-color: rgba(96, 165, 250, 0.45);
  background: rgba(96, 165, 250, 0.06);
}
.class-header {
  display:flex;
  justify-content:space-between;
  align-items:center;
  gap: var(--space-sm);
  margin-bottom: 0.75rem;
}
.class-label {
  color: var(--accent);
  font-weight: 700;
}
.class-match-count {
  color: var(--text-soft);
  font-size: 0.72rem;
}
.class-kpis {
  display:grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.5rem;
  margin-bottom: 0.7rem;
}
.kpi {
  padding: 0.5rem 0.4rem;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.04);
  text-align: center;
}
.kpi-label {
  display:block;
  font-size: 0.68rem;
  color: var(--text-soft);
  margin-bottom: 0.2rem;
}
.kpi strong {
  color: var(--text);
  font-size: 0.82rem;
}
.class-values {
  display:grid;
  gap: 0.35rem;
  color: var(--text-soft);
  font-size: 0.82rem;
}
@media (max-width: 760px) {
  .class-grid {
    grid-template-columns: 1fr;
  }
  .class-kpis {
    grid-template-columns: 1fr 1fr 1fr;
  }
}
</style>
