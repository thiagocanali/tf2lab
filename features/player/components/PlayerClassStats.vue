<template>
  <Card class="class-stats-card">
    <div class="header-row">
      <div>
        <h3>Estatísticas por classe</h3>
        <p class="section-subtitle">Médias por partida, contexto por classe e amostragem confiável</p>
      </div>
      <span class="class-count">{{ classes.length }} classes</span>
    </div>

    <div v-if="sortedClasses.length" class="insight-row">
      <div class="insight-pill">
        <span class="insight-pill__label">Top dano</span>
        <strong>{{ bestDamageClass?.className ?? '-' }}</strong>
        <span>{{ formatNumber(bestDamageClass?.avgDamage ?? 0) }}/partida</span>
      </div>
      <div class="insight-pill">
        <span class="insight-pill__label">Top cura</span>
        <strong>{{ bestHealingClass?.className ?? '-' }}</strong>
        <span>{{ formatNumber(bestHealingClass?.avgHeals ?? 0) }}/partida</span>
      </div>
      <div class="insight-pill">
        <span class="insight-pill__label">Amostra confiável</span>
        <strong>{{ reliableClasses }}</strong>
        <span>{{ reliableClasses === 1 ? 'classe' : 'classes' }}</span>
      </div>
    </div>

    <div class="class-grid">
      <div
        v-for="(stat, index) in sortedClasses"
        :key="stat.className"
        class="class-card"
        :class="{
          'class-card--medic': stat.className === 'Medic',
          'class-card--top': index === 0,
          'class-card--reliable': (stat.matches ?? 0) >= 5
        }"
      >
        <div class="class-header">
          <div class="class-label-wrap">
            <span class="class-rank">#{{ index + 1 }}</span>
            <div class="class-label">{{ stat.className }}</div>
          </div>
          <span class="class-match-count" :class="{ 'class-match-count--reliable': (stat.matches ?? 0) >= 5 }">
            {{ stat.matches ?? 0 }} logs
          </span>
        </div>

        <div class="class-kpis">
          <div class="kpi">
            <span class="kpi-label">K/D</span>
            <strong>{{ stat.avgKd?.toFixed(2) ?? stat.kd?.toFixed(2) ?? '-' }}</strong>
          </div>
          <div class="kpi">
            <span class="kpi-label">Dmg</span>
            <strong>{{ formatNumber(Math.round(stat.avgDamage ?? 0)) }}</strong>
          </div>
          <div v-if="stat.avgHeals !== undefined" class="kpi">
            <span class="kpi-label">Cura</span>
            <strong>{{ formatNumber(Math.round(stat.avgHeals ?? 0)) }}</strong>
          </div>
        </div>

        <div class="class-badges">
          <span v-if="(stat.matches ?? 0) >= 5" class="badge badge--ok">Amostra forte</span>
          <span v-if="stat.className === 'Medic'" class="badge badge--medic">Medic</span>
          <span v-if="index === 0" class="badge badge--top">Top da lista</span>
        </div>

        <div class="class-values">
          <span>Kills / partida: {{ (stat.avgKills ?? 0).toFixed(1) }}</span>
          <span>Deaths / partida: {{ (stat.avgDeaths ?? 0).toFixed(1) }}</span>
          <span v-if="stat.healsPerMatch !== undefined">Heals / partida: {{ stat.healsPerMatch.toFixed(1) }}</span>
          <span v-if="stat.damage !== undefined">Damage total: {{ formatNumber(stat.damage) }}</span>
          <span v-if="stat.heals !== undefined">Heals total: {{ formatNumber(stat.heals) }}</span>
          <span v-if="stat.mostHealedClasses?.length">Top cura: {{ stat.mostHealedClasses[0].name }} ({{ stat.mostHealedClasses[0].value }})</span>
        </div>
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PlayerClassStat } from '~~/features/player/types'

const props = defineProps<{ classes: PlayerClassStat[] }>()

const formatNumber = (value: number) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value)

const sortedClasses = computed(() => {
  return [...props.classes].sort((a, b) => {
    const damageA = Number(a.avgDamage ?? a.damage ?? 0)
    const damageB = Number(b.avgDamage ?? b.damage ?? 0)
    return damageB - damageA
  })
})

const bestDamageClass = computed(() => sortedClasses.value[0])
const bestHealingClass = computed(() => {
  return [...sortedClasses.value].sort((a, b) => {
    const healsA = Number(a.avgHeals ?? a.heals ?? 0)
    const healsB = Number(b.avgHeals ?? b.heals ?? 0)
    return healsB - healsA
  })[0]
})
const reliableClasses = computed(() => sortedClasses.value.filter((stat) => (stat.matches ?? 0) >= 5).length)
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
.insight-row {
  display:flex;
  flex-wrap:wrap;
  gap: 0.5rem;
  margin-bottom: 0.8rem;
}
.insight-pill {
  display:flex;
  align-items:center;
  gap: 0.4rem;
  padding: 0.45rem 0.7rem;
  border-radius: 999px;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(255,255,255,0.04);
  color: var(--text-soft);
  font-size: 0.72rem;
}
.insight-pill strong {
  color: var(--text);
}
.insight-pill__label {
  color: var(--text-soft);
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
.class-card--top {
  box-shadow: inset 0 0 0 1px rgba(255, 191, 92, 0.18);
}
.class-card--reliable {
  border-color: rgba(74, 222, 128, 0.22);
}
.class-header {
  display:flex;
  justify-content:space-between;
  align-items:center;
  gap: var(--space-sm);
  margin-bottom: 0.75rem;
}
.class-label-wrap {
  display:flex;
  align-items:center;
  gap: 0.45rem;
}
.class-rank {
  display:inline-flex;
  align-items:center;
  justify-content:center;
  min-width: 1.8rem;
  height: 1.8rem;
  border-radius: 999px;
  background: rgba(255,255,255,0.06);
  color: var(--text-soft);
  font-size: 0.7rem;
}
.class-label {
  color: var(--accent);
  font-weight: 700;
}
.class-match-count {
  color: var(--text-soft);
  font-size: 0.72rem;
}
.class-match-count--reliable {
  color: #86efac;
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
.class-badges {
  display:flex;
  flex-wrap:wrap;
  gap: 0.35rem;
  margin-bottom: 0.65rem;
}
.badge {
  display:inline-flex;
  align-items:center;
  padding: 0.2rem 0.45rem;
  border-radius: 999px;
  font-size: 0.65rem;
  font-weight: 700;
}
.badge--ok {
  background: rgba(34, 197, 94, 0.12);
  color: #86efac;
}
.badge--medic {
  background: rgba(96, 165, 250, 0.12);
  color: #93c5fd;
}
.badge--top {
  background: rgba(251, 191, 36, 0.12);
  color: #fbbf24;
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
