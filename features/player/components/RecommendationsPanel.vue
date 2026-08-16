<template>
  <Card class="recommendations-card">
    <div class="recommendations-header">
      <h3>Recomendações de Treino</h3>
      <p class="recommendations-subtitle">Baseado em sua análise de performance</p>
    </div>

    <div v-if="recommendations.length" class="recommendations-list">
      <article v-for="(rec, index) in recommendations" :key="index" class="recommendation-item" :class="`priority--${rec.priority}`">
        <div class="rec-icon">{{ rec.icon }}</div>
        <div class="rec-content">
          <h4 class="rec-title">{{ rec.title }}</h4>
          <p class="rec-text">{{ rec.description }}</p>
          <div v-if="rec.action" class="rec-action">
            <span class="action-label">{{ rec.action }}</span>
          </div>
        </div>
      </article>
    </div>

    <div v-else class="recommendations-empty">
      <p>Parabéns! Seu desempenho está equilibrado.</p>
    </div>

    <div class="recommendations-footer">
      <p>💡 Dica: Análise com mais de 30 logs oferece recomendações mais precisas.</p>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PlayerOverviewStats, PlayerClassStat } from '~~/features/player/types'

interface Recommendation {
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  icon: string
  action?: string
}

const props = defineProps<{
  overview: PlayerOverviewStats
  classStats: PlayerClassStat[]
  totalLogs: number
}>()

const recommendations = computed<Recommendation[]>(() => {
  const recs: Recommendation[] = []
  const kd = props.overview.avgKd ?? 0
  const dmg = props.overview.avgDamage ?? 0
  const heals = props.overview.avgHeals ?? 0
  const totalLogs = props.totalLogs

  // Low K/D recommendation
  if (kd < 0.8) {
    recs.push({
      title: 'Melhorar Posicionamento',
      description: `Seu K/D (${kd.toFixed(2)}) está abaixo da média. Foque em posicionamento defensivo e evite engajamentos sem suporte.`,
      priority: 'high',
      icon: '🎯',
      action: 'Assista demos de top players na sua classe'
    })
  } else if (kd < 1.0) {
    recs.push({
      title: 'Aumentar Awareness',
      description: `K/D em torno de ${kd.toFixed(2)}. Trabalhando awareness e timing de engajamentos pode melhorar.`,
      priority: 'medium',
      icon: '👁️',
      action: 'Pratique previsão de posições inimigas'
    })
  }

  // Low damage recommendation
  if (dmg < 200) {
    recs.push({
      title: 'Aumentar Impacto em Dano',
      description: `${Math.round(dmg)} dmg/partida é baixo. Procure por mais engajamentos e sustente pressão no inimigo.`,
      priority: 'high',
      icon: '💥',
      action: 'Treinar DPS e poke damage'
    })
  } else if (dmg < 300) {
    recs.push({
      title: 'Optimizar Eficiência de Dano',
      description: `Seu dano (${Math.round(dmg)}/partida) é aceitável. Focando em shots certeiros pode aumentar o impacto.`,
      priority: 'medium',
      icon: '🎱',
      action: 'Treinar aim e rocket jump'
    })
  }

  // Healing analysis
  if (heals > 0 && heals < 100) {
    recs.push({
      title: 'Aumentar Cura (Se Medic)',
      description: `Sua cura (${Math.round(heals)}/partida) é baixa. Se jogando Medic, distribua heals mais frequentemente.`,
      priority: 'medium',
      icon: '🏥',
      action: 'Praticar spray contínuo e gerenciamento de ammo'
    })
  }

  // Class consistency
  const reliableClasses = props.classStats.filter(stat => (stat.matches ?? 0) >= 5).length
  const totalClasses = props.classStats.length
  if (reliableClasses < totalClasses / 2 && totalLogs >= 10) {
    recs.push({
      title: 'Especializar em Classes',
      description: `Você joga ${totalClasses} classes, mas apenas ${reliableClasses} com amostra confiável. Especialização melhora desempenho.`,
      priority: 'medium',
      icon: '🎪',
      action: 'Escolha 2-3 classes principais'
    })
  }

  // Low sample warning
  if (totalLogs < 10) {
    recs.push({
      title: 'Coletar Mais Dados',
      description: `Com apenas ${totalLogs} logs, a análise é limitada. Suba para 15-20+ para recomendações mais precisas.`,
      priority: 'low',
      icon: '📊',
      action: 'Jogar mais competitivas'
    })
  }

  // Consistency check
  if (kd >= 1.2 && dmg >= 250) {
    recs.push({
      title: 'Manutenha a Consistência',
      description: `Excelente K/D (${kd.toFixed(2)}) e dano (${Math.round(dmg)}). Continue praticando e refinando sua mecânica.`,
      priority: 'low',
      icon: '⭐',
      action: 'Mantenha os bons hábitos'
    })
  }

  // Sort by priority
  recs.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    return priorityOrder[a.priority] - priorityOrder[b.priority]
  })

  return recs.slice(0, 4) // Limit to top 4 recommendations
})
</script>

<style scoped>
.recommendations-card {
  background: rgba(24, 29, 45, 0.95);
  border: 1px solid rgba(255, 79, 60, 0.12);
  border-radius: var(--radius);
  padding: var(--space-md);
}

.recommendations-header h3 {
  margin: 0;
  color: var(--text);
  font-size: 1.35rem;
}

.recommendations-subtitle {
  margin: 0.35rem 0 0;
  color: var(--text-soft);
  font-size: 0.82rem;
}

.recommendations-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
  padding-bottom: var(--space-md);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.recommendation-item {
  display: flex;
  gap: 0.85rem;
  padding: 0.9rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(255, 255, 255, 0.03);
  transition: all 0.2s ease;
}

.recommendation-item:hover {
  border-color: rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.06);
}

.recommendation-item.priority--high {
  border-color: rgba(239, 68, 68, 0.25);
  background: rgba(239, 68, 68, 0.08);
}

.recommendation-item.priority--medium {
  border-color: rgba(251, 191, 36, 0.25);
  background: rgba(251, 191, 36, 0.08);
}

.recommendation-item.priority--low {
  border-color: rgba(34, 197, 94, 0.15);
  background: rgba(34, 197, 94, 0.05);
}

.rec-icon {
  font-size: 1.6rem;
  flex-shrink: 0;
}

.rec-content {
  flex: 1;
}

.rec-title {
  margin: 0 0 0.3rem;
  color: var(--text);
  font-size: 0.95rem;
  font-weight: 700;
}

.rec-text {
  margin: 0 0 0.5rem;
  color: var(--text-soft);
  font-size: 0.82rem;
  line-height: 1.4;
}

.rec-action {
  display: inline-block;
}

.action-label {
  display: inline-flex;
  align-items: center;
  padding: 0.35rem 0.7rem;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-soft);
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.recommendations-empty {
  padding: 1.5rem 1rem;
  text-align: center;
  color: var(--text-soft);
  font-size: 0.95rem;
}

.recommendations-footer {
  padding: 0.65rem;
  border-radius: 8px;
  background: rgba(255, 179, 71, 0.06);
  border: 1px solid rgba(255, 179, 71, 0.15);
  color: var(--text-soft);
  font-size: 0.78rem;
  line-height: 1.4;
}

.recommendations-footer p {
  margin: 0;
}

@media (max-width: 768px) {
  .recommendations-list {
    gap: 0.5rem;
  }

  .recommendation-item {
    gap: 0.7rem;
    padding: 0.75rem;
  }

  .rec-icon {
    font-size: 1.4rem;
  }
}
</style>
