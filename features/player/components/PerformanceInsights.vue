<template>
  <Card class="insights-card">
    <div class="insights-header">
      <h3>Entenda suas estatísticas</h3>
      <p class="insights-subtitle">Interpretação do seu desempenho</p>
    </div>

    <div class="insights-grid">
      <!-- K/D Insight -->
      <div class="insight-item">
        <div class="insight-icon">⚔️</div>
        <div class="insight-content">
          <h4>K/D Ratio ({{ overview.avgKd?.toFixed(2) ?? '-' }})</h4>
          <p class="insight-text">{{ kdInsight }}</p>
          <div class="insight-badge" :class="`badge--${kdLevel}`">
            {{ kdLabel }}
          </div>
        </div>
      </div>

      <!-- Damage Insight -->
      <div class="insight-item">
        <div class="insight-icon">💥</div>
        <div class="insight-content">
          <h4>Damage/Partida ({{ Math.round(overview.avgDamage ?? 0) }})</h4>
          <p class="insight-text">{{ damageInsight }}</p>
          <div class="insight-badge" :class="`badge--${damageLevel}`">
            {{ damageLabel }}
          </div>
        </div>
      </div>

      <!-- Healing Insight -->
      <div class="insight-item" v-if="overview.avgHeals">
        <div class="insight-icon">🏥</div>
        <div class="insight-content">
          <h4>Heals/Partida ({{ Math.round(overview.avgHeals ?? 0) }})</h4>
          <p class="insight-text">{{ healingInsight }}</p>
          <div class="insight-badge" :class="`badge--${healingLevel}`">
            {{ healingLabel }}
          </div>
        </div>
      </div>

      <!-- Consistency Insight -->
      <div class="insight-item">
        <div class="insight-icon">📊</div>
        <div class="insight-content">
          <h4>Consistência</h4>
          <p class="insight-text">{{ consistencyInsight }}</p>
          <div class="insight-badge" :class="`badge--${consistencyLevel}`">
            {{ consistencyLabel }}
          </div>
        </div>
      </div>
    </div>

    <div v-if="hasLowSampleWarning" class="insights-warning">
      <span class="warning-icon">⚠️</span>
      <span>A análise é baseada em apenas <strong>{{ totalLogs }} logs</strong>. Mais dados melhoram a precisão.</span>
    </div>

    <div class="insights-legend">
      <div class="legend-item">
        <span class="legend-dot badge--excellent" />
        <span>Excelente</span>
      </div>
      <div class="legend-item">
        <span class="legend-dot badge--good" />
        <span>Bom</span>
      </div>
      <div class="legend-item">
        <span class="legend-dot badge--average" />
        <span>Médio</span>
      </div>
      <div class="legend-item">
        <span class="legend-dot badge--developing" />
        <span>Em desenvolvimento</span>
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PlayerOverviewStats } from '~~/features/player/types'

const props = defineProps<{
  overview: PlayerOverviewStats
  totalLogs: number
}>()

const hasLowSampleWarning = computed(() => props.totalLogs < 10)

// K/D Analysis
const kdLevel = computed(() => {
  const kd = props.overview.avgKd ?? 0
  if (kd >= 2) return 'excellent'
  if (kd >= 1.2) return 'good'
  if (kd >= 0.8) return 'average'
  return 'developing'
})

const kdLabel = computed(() => {
  const level = kdLevel.value
  switch (level) {
    case 'excellent': return 'Excelente!'
    case 'good': return 'Bom'
    case 'average': return 'Médio'
    default: return 'Em desenvolvimento'
  }
})

const kdInsight = computed(() => {
  const kd = props.overview.avgKd ?? 0
  if (kd >= 2) return 'Você mata 2 inimigos para cada morte. Performance de pico!'
  if (kd >= 1.2) return 'Você tem mais kills que deaths. Bom posicionamento e awareness.'
  if (kd >= 0.8) return 'Você morre pouco mais que mata. Há espaço para melhorar posicionamento.'
  return 'Mais focado em suporte? Considere revisar decisões de combate.'
})

// Damage Analysis
const damageLevel = computed(() => {
  const dmg = props.overview.avgDamage ?? 0
  if (dmg >= 400) return 'excellent'
  if (dmg >= 250) return 'good'
  if (dmg >= 150) return 'average'
  return 'developing'
})

const damageLabel = computed(() => {
  const level = damageLevel.value
  switch (level) {
    case 'excellent': return 'Excelente!'
    case 'good': return 'Bom'
    case 'average': return 'Médio'
    default: return 'Em desenvolvimento'
  }
})

const damageInsight = computed(() => {
  const dmg = props.overview.avgDamage ?? 0
  if (dmg >= 400) return 'Você causa muito damage. Protagonista do time em engajamentos.'
  if (dmg >= 250) return 'Damage consistente. Você tem impacto significativo.'
  if (dmg >= 150) return 'Damage aceitável, mas há espaço para aumentar pressão.'
  return 'Foco em outras responsabilidades? Considere traços com mais sustain.'
})

// Healing Analysis
const healingLevel = computed(() => {
  const heals = props.overview.avgHeals ?? 0
  if (heals >= 300) return 'excellent'
  if (heals >= 150) return 'good'
  if (heals >= 50) return 'average'
  return 'developing'
})

const healingLabel = computed(() => {
  const level = healingLevel.value
  switch (level) {
    case 'excellent': return 'Excelente!'
    case 'good': return 'Bom'
    case 'average': return 'Médio'
    default: return 'Em desenvolvimento'
  }
})

const healingInsight = computed(() => {
  const heals = props.overview.avgHeals ?? 0
  if (heals >= 300) return 'Você sustenta bem o time. Médico principal? Distribuição de heals excelente.'
  if (heals >= 150) return 'Boa sustentação. Você oferece suporte relevante.'
  if (heals >= 50) return 'Heals em suporte. Considere expandir responsabilidade de suporte.'
  return 'Pouco foco em sustain. Normal se você joga traços de damage.'
})

// Consistency Analysis
const consistencyLevel = computed(() => {
  if (props.totalLogs < 5) return 'developing'
  // Calculate variance in performance (simplified)
  const avgKd = props.overview.avgKd ?? 0
  const avgDmg = props.overview.avgDamage ?? 0
  
  // If scores are relatively balanced, player is consistent
  if (avgKd >= 1 && avgDmg >= 250) return 'excellent'
  if (avgKd >= 0.9 && avgDmg >= 200) return 'good'
  if (avgKd >= 0.7) return 'average'
  return 'developing'
})

const consistencyLabel = computed(() => {
  const level = consistencyLevel.value
  switch (level) {
    case 'excellent': return 'Muito consistente'
    case 'good': return 'Consistente'
    case 'average': return 'Variável'
    default: return 'Precisa dados'
  }
})

const consistencyInsight = computed(() => {
  if (props.totalLogs < 5) return 'Obtenha mais logs para análise de consistência.'
  
  const level = consistencyLevel.value
  if (level === 'excellent') return 'Seu desempenho é muito estável. Confiável para times competitivos.'
  if (level === 'good') return 'Sua performance é bastante consistente entre partidas.'
  if (level === 'average') return 'Seu desempenho varia bastante. Trabalhe na consistência.'
  return 'Performance muito variável. Análise de demos pode ajudar.'
})
</script>

<style scoped>
.insights-card {
  background: rgba(24, 29, 45, 0.95);
  border: 1px solid rgba(255, 79, 60, 0.12);
  border-radius: var(--radius);
  padding: var(--space-lg);
}

.insights-header h3 {
  margin: 0;
  color: var(--text);
  font-size: 1.35rem;
}

.insights-subtitle {
  margin: 0.35rem 0 0;
  color: var(--text-soft);
  font-size: 0.82rem;
}

.insights-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--space-md);
  margin: var(--space-lg) 0;
  padding-bottom: var(--space-lg);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.insight-item {
  display: flex;
  gap: 0.85rem;
  padding: 0.85rem;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  transition: all 0.2s ease;
}

.insight-item:hover {
  border-color: rgba(255, 79, 60, 0.2);
  background: rgba(255, 79, 60, 0.06);
}

.insight-icon {
  font-size: 1.6rem;
  flex-shrink: 0;
}

.insight-content {
  flex: 1;
}

.insight-content h4 {
  margin: 0 0 0.3rem;
  color: var(--text);
  font-size: 0.95rem;
  font-weight: 700;
}

.insight-text {
  margin: 0 0 0.6rem;
  color: var(--text-soft);
  font-size: 0.82rem;
  line-height: 1.4;
}

.insight-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.6rem;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.badge--excellent {
  background: rgba(34, 197, 94, 0.15);
  color: #86efac;
}

.badge--good {
  background: rgba(96, 165, 250, 0.15);
  color: #93c5fd;
}

.badge--average {
  background: rgba(251, 191, 36, 0.15);
  color: #fbbf24;
}

.badge--developing {
  background: rgba(239, 68, 68, 0.15);
  color: #fca5a5;
}

.insights-warning {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  background: rgba(255, 179, 71, 0.08);
  border: 1px solid rgba(255, 179, 71, 0.2);
  color: #f7d39a;
  font-size: 0.82rem;
  margin-bottom: var(--space-md);
  line-height: 1.4;
}

.warning-icon {
  flex-shrink: 0;
  font-size: 1.1rem;
}

.insights-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  padding-top: var(--space-md);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-soft);
  font-size: 0.75rem;
}

.legend-dot {
  width: 0.6rem;
  height: 0.6rem;
  border-radius: 50%;
  flex-shrink: 0;
}

.badge--excellent { background-color: #86efac; }
.badge--good { background-color: #93c5fd; }
.badge--average { background-color: #fbbf24; }
.badge--developing { background-color: #fca5a5; }

@media (max-width: 768px) {
  .insights-grid {
    grid-template-columns: 1fr;
    gap: var(--space-sm);
  }

  .insights-card {
    padding: var(--space-md);
  }
}
</style>
