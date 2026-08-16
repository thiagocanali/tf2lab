<template>
  <div class="executive-summary">
    <div class="summary-container">
      <!-- Score Visual -->
      <div class="summary-card summary-score">
        <div class="score-ring">
          <svg viewBox="0 0 100 100" class="score-svg">
            <circle cx="50" cy="50" r="45" class="score-bg" />
            <circle
              cx="50"
              cy="50"
              r="45"
              class="score-progress"
              :style="{ strokeDashoffset: scoreOffset }"
            />
          </svg>
          <div class="score-content">
            <p class="score-label">Performance</p>
            <p class="score-value">{{ scoreGrade }}</p>
          </div>
        </div>
      </div>

      <!-- Key Stats -->
      <div class="summary-card summary-stats">
        <div class="stat-row">
          <span class="stat-icon">⚔️</span>
          <div>
            <p class="stat-name">K/D Médio</p>
            <p class="stat-value">{{ (overview.avgKd ?? 0).toFixed(2) }}</p>
          </div>
        </div>
        <div class="stat-row">
          <span class="stat-icon">💥</span>
          <div>
            <p class="stat-name">Damage/Partida</p>
            <p class="stat-value">{{ Math.round(overview.avgDamage ?? 0) }}</p>
          </div>
        </div>
        <div class="stat-row">
          <span class="stat-icon">🏥</span>
          <div>
            <p class="stat-name">Heals/Partida</p>
            <p class="stat-value">{{ Math.round(overview.avgHeals ?? 0) }}</p>
          </div>
        </div>
      </div>

      <!-- Status -->
      <div class="summary-card summary-status">
        <p class="status-label">Status</p>
        <p class="status-value">{{ statusText }}</p>
        <p class="status-hint">{{ statusHint }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PlayerOverviewStats } from '~~/features/player/types'

const props = defineProps<{
  overview: PlayerOverviewStats
  totalLogs: number
}>()

// Calculate performance score (0-100)
const performanceScore = computed(() => {
  const kd = props.overview.avgKd ?? 0
  const dmg = props.overview.avgDamage ?? 0
  
  let score = 50 // Base score
  
  // K/D component (0-25 points)
  if (kd >= 2) score += 25
  else if (kd >= 1.5) score += 20
  else if (kd >= 1.2) score += 15
  else if (kd >= 1.0) score += 10
  else if (kd >= 0.8) score += 5
  
  // Damage component (0-25 points)
  if (dmg >= 400) score += 25
  else if (dmg >= 300) score += 20
  else if (dmg >= 250) score += 15
  else if (dmg >= 200) score += 10
  else if (dmg >= 150) score += 5
  
  return Math.min(100, score)
})

const scoreGrade = computed(() => {
  const score = performanceScore.value
  if (score >= 90) return 'S'
  if (score >= 80) return 'A'
  if (score >= 70) return 'B'
  if (score >= 60) return 'C'
  return 'D'
})

const scoreOffset = computed(() => {
  const circumference = 2 * Math.PI * 45
  return circumference - (performanceScore.value / 100) * circumference
})

const statusText = computed(() => {
  const kd = props.overview.avgKd ?? 0
  const dmg = props.overview.avgDamage ?? 0
  const logs = props.totalLogs

  if (logs < 5) return 'Poucos dados'
  if (kd >= 1.5 && dmg >= 300) return '⭐ Desempenho excepcional'
  if (kd >= 1.2 && dmg >= 250) return '✅ Desempenho bom'
  if (kd >= 1.0 && dmg >= 200) return '➡️ Desempenho aceitável'
  if (kd >= 0.8 && dmg >= 150) return '⚠️ Espaço para melhoria'
  return '🎯 Foco em fundamentais'
})

const statusHint = computed(() => {
  const logs = props.totalLogs
  if (logs < 5) return `Colete ${5 - logs} mais logs para melhor análise`
  return 'Continue praticando e melhorando'
})
</script>

<style scoped>
.executive-summary {
  margin: var(--space-lg) 0;
  padding-bottom: var(--space-lg);
  border-bottom: 2px solid rgba(255, 79, 60, 0.12);
}

.summary-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-md);
}

.summary-card {
  padding: 1.2rem;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(255, 79, 60, 0.06), rgba(255, 79, 60, 0.03));
  border: 1px solid rgba(255, 79, 60, 0.15);
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.6rem;
}

.summary-score {
  grid-column: span 1;
  align-items: center;
  justify-content: center;
  min-height: 180px;
}

.score-ring {
  position: relative;
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.score-svg {
  position: absolute;
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.score-bg {
  fill: none;
  stroke: rgba(255, 255, 255, 0.08);
  stroke-width: 3;
}

.score-progress {
  fill: none;
  stroke: url(#scoreGradient);
  stroke-width: 3;
  stroke-linecap: round;
  transition: stroke-dashoffset 0.5s ease;
  stroke-dasharray: 282.7;
}

.score-content {
  position: absolute;
  text-align: center;
}

.score-label {
  margin: 0;
  color: var(--text-soft);
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 700;
}

.score-value {
  margin: 0.2rem 0 0;
  color: var(--text);
  font-size: 2.2rem;
  font-weight: 900;
  line-height: 1;
}

.summary-stats {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.stat-row {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.stat-icon {
  font-size: 1.4rem;
}

.stat-name {
  margin: 0;
  color: var(--text-soft);
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 700;
}

.stat-value {
  margin: 0.15rem 0 0;
  color: var(--text);
  font-size: 1rem;
  font-weight: 700;
}

.summary-status {
  min-height: 120px;
  justify-content: center;
}

.status-label {
  margin: 0;
  color: var(--text-soft);
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 700;
}

.status-value {
  margin: 0.3rem 0 0;
  color: var(--text);
  font-size: 1.1rem;
  font-weight: 700;
  line-height: 1.3;
}

.status-hint {
  margin: 0.4rem 0 0;
  color: var(--text-soft);
  font-size: 0.78rem;
  line-height: 1.3;
}

@media (max-width: 900px) {
  .summary-container {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .summary-container {
    grid-template-columns: 1fr;
  }

  .score-ring {
    width: 100px;
    height: 100px;
  }

  .score-value {
    font-size: 1.8rem;
  }
}
</style>
