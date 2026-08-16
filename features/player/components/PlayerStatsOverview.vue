<template>
  <div class="stats-container">
    <!-- Key Metrics Section -->
    <div class="stats-section">
      <div class="section-header">
        <p class="section-label">Desempenho por partida</p>
        <span class="section-badge">Médias</span>
      </div>
      <div class="stats-grid stats-grid--key">
        <div v-for="item in keyMetrics" :key="item.label" class="stat-card stat-card--key">
          <div class="stat-icon">{{ item.icon }}</div>
          <div class="stat-content">
            <p class="stat-label">{{ item.label }}</p>
            <p class="stat-value">{{ item.value }}</p>
            <p class="stat-subtext" v-if="item.subtext">{{ item.subtext }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Secondary Metrics Section -->
    <div class="stats-section">
      <div class="section-header">
        <p class="section-label">Totalizadores</p>
        <span class="section-badge">Acumulado</span>
      </div>
      <div class="stats-grid stats-grid--secondary">
        <div v-for="item in secondaryMetrics" :key="item.label" class="stat-card stat-card--secondary">
          <div class="stat-info">
            <p class="stat-label">{{ item.label }}</p>
            <p class="stat-value">{{ item.value }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PlayerOverviewStats } from '~/features/player/types'

const props = defineProps<{ overview: PlayerOverviewStats }>()
const number = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 })

const keyMetrics = computed(() => [
  {
    label: 'K/D Médio',
    value: (props.overview.avgKd ?? props.overview.kdRatio ?? 0).toFixed(2),
    icon: '⚔️',
    subtext: `${(props.overview.avgKills ?? 0).toFixed(1)} K / ${(props.overview.avgDeaths ?? 0).toFixed(1)} D`
  },
  {
    label: 'Damage/Partida',
    value: number.format(Math.round(props.overview.avgDamage ?? 0)),
    icon: '💥',
    subtext: `${number.format(props.overview.totalDamage)} total`
  },
  {
    label: 'Cura/Partida',
    value: number.format(Math.round(props.overview.avgHeals ?? 0)),
    icon: '🏥',
    subtext: `${number.format(props.overview.totalHeals ?? 0)} total`
  }
])

const secondaryMetrics = computed(() => [
  {
    label: 'Partidas Analisadas',
    value: props.overview.matches
  },
  {
    label: 'Kills Totais',
    value: number.format(props.overview.totalKills)
  },
  {
    label: 'Deaths Totais',
    value: number.format(props.overview.totalDeaths)
  },
  {
    label: 'Tempo Jogado',
    value: `${Math.floor(props.overview.timePlayed / 3600)}h`
  }
])
</script>

<style scoped>
.stats-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.stats-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  padding: var(--space-md) 0;
  border-bottom: 1px solid rgba(255, 79, 60, 0.08);
}

.stats-section:last-child {
  border-bottom: none;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-sm);
}

.section-label {
  margin: 0;
  color: var(--text);
  font-size: 0.95rem;
  font-weight: 700;
}

.section-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.55rem;
  border-radius: 6px;
  background: rgba(255, 79, 60, 0.15);
  color: #ff6d46;
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stats-grid {
  display: grid;
  gap: var(--space-sm);
}

.stats-grid--key {
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.stats-grid--secondary {
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
}

.stat-card {
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
  padding: 0.9rem;
  transition: all 0.2s ease;
}

.stat-card--key {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  border: 1px solid rgba(255, 79, 60, 0.15);
  background: linear-gradient(135deg, rgba(255, 79, 60, 0.08), rgba(255, 79, 60, 0.04));
  padding: 1rem;
}

.stat-card--key:hover {
  border-color: rgba(255, 79, 60, 0.28);
  background: linear-gradient(135deg, rgba(255, 79, 60, 0.12), rgba(255, 79, 60, 0.06));
}

.stat-card--secondary {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0.8rem;
}

.stat-card--secondary:hover {
  border-color: rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.06);
}

.stat-icon {
  font-size: 1.8rem;
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
}

.stat-label {
  margin: 0;
  color: var(--text-soft);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 700;
}

.stat-value {
  margin: 0.3rem 0 0;
  color: var(--text);
  font-size: 1.35rem;
  font-weight: 700;
  line-height: 1;
}

.stat-subtext {
  margin: 0.4rem 0 0;
  color: var(--text-soft);
  font-size: 0.7rem;
  line-height: 1.3;
}

.stat-info {
  flex: 1;
}

@media (max-width: 900px) {
  .stats-grid--key {
    grid-template-columns: 1fr 1fr;
  }

  .stats-grid--secondary {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .stats-grid--key {
    grid-template-columns: 1fr;
  }

  .stats-grid--secondary {
    grid-template-columns: 1fr;
  }

  .stat-card--key {
    gap: 0.6rem;
    padding: 0.8rem;
  }

  .stat-icon {
    font-size: 1.5rem;
  }

  .stat-value {
    font-size: 1.2rem;
  }
}
</style>
