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
      <p>💡 {{ confidenceNote }}</p>
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
  mainClassName?: string
  classStat?: PlayerClassStat
}>()

const classRecommendations = computed<Recommendation[]>(() => {
  const stat = props.classStat
  const className = props.mainClassName?.toLowerCase()
  if (!stat || !className) return []

  const deathRate = (stat.avgDeaths ?? 0).toFixed(1)
  const recommendationsByClass: Record<string, Recommendation[]> = {
    medic: [
      { title: 'Revisar posicionamento', description: `Você registra ${deathRate} deaths/partida como Medic. Revise as mortes para encontrar posições que deixam seu time sem cura.`, priority: 'high', icon: '🛡️', action: 'Anote a posição antes de cada morte' },
      { title: 'Treinar cross e leitura', description: 'Pratique acompanhar o jogador que precisa de cura sem perder a visão do próximo perigo.', priority: 'medium', icon: '👁️', action: 'Revise transições entre alvos' },
      { title: 'Revisar uso de Über', description: 'Use as demos para observar quando a Über foi usada, guardada ou perdida e relacionar isso ao resultado da luta.', priority: 'medium', icon: '⚡', action: 'Marque cada decisão de Über na demo' }
    ],
    scout: [
      { title: 'Treinar DM com saída', description: `Sua média é ${(stat.avgKills ?? 0).toFixed(1)} kills e ${deathRate} deaths por partida. Pratique entrar, causar dano e sair antes do overextend.`, priority: 'high', icon: '🎯', action: 'Faça blocos curtos de DM' },
      { title: 'Evitar overextend', description: 'Revise as primeiras mortes para separar uma abertura útil de uma entrada sem suporte.', priority: 'medium', icon: '↩️', action: 'Espere o próximo timing do time' },
      { title: 'Manter pressão e caps', description: 'Treine alternar entre pressionar jogadores isolados e tocar o objetivo quando a luta abrir espaço.', priority: 'medium', icon: '🚩', action: 'Escolha uma prioridade por round' }
    ],
    demoman: [
      { title: 'Treinar spam útil', description: `Seu damage médio é ${Math.round(stat.avgDamage ?? 0)} por partida. Pratique manter dano em choke points sem gastar recursos sem propósito.`, priority: 'high', icon: '💣', action: 'Revise onde seu spam criou espaço' },
      { title: 'Revisar posicionamento', description: `Com ${deathRate} deaths/partida, observe quando você ficou sem rota de saída antes de uma luta.`, priority: 'medium', icon: '🗺️', action: 'Marque suas rotas de retirada' },
      { title: 'Aprimorar stickies', description: 'Use treinos de traps e detonação para transformar controle de espaço em dano confirmado.', priority: 'medium', icon: '◉', action: 'Pratique uma trap por mapa' }
    ],
    soldier: [
      { title: 'Aumentar dano seguro', description: `Seu damage médio é ${Math.round(stat.avgDamage ?? 0)} por partida. Treine pressão constante sem trocar vida por dano sem suporte.`, priority: 'high', icon: '💥', action: 'Pratique spam antes do bomb' },
      { title: 'Revisar entradas', description: `Você registra ${deathRate} deaths/partida. Revise se cada bomb tinha suporte e uma rota de saída.`, priority: 'medium', icon: '🚀', action: 'Marque bombs com e sem follow-up' },
      { title: 'Treinar mira sob pressão', description: 'Alterne rocket jumps e tiros em alvos móveis para manter impacto depois da entrada.', priority: 'medium', icon: '🎯', action: 'Faça um bloco de aim antes da fila' }
    ],
    sniper: [
      { title: 'Escolher ângulos úteis', description: `Seu damage médio é ${Math.round(stat.avgDamage ?? 0)} por partida. Revise quais ângulos geraram impacto sem expor sua rotação.`, priority: 'high', icon: '🔭', action: 'Marque ângulos seguros por mapa' },
      { title: 'Treinar troca de alvo', description: `Com ${(stat.avgKills ?? 0).toFixed(1)} kills/partida, pratique trocar rapidamente para o alvo que muda a luta.`, priority: 'medium', icon: '🎯', action: 'Priorize Medic e ameaças abertas' },
      { title: 'Revisar mortes evitáveis', description: `Observe as ${deathRate} deaths/partida e identifique quando a posição ficou previsível.`, priority: 'medium', icon: '🧭', action: 'Mude de ângulo após cada pick' }
    ]
  }

  return recommendationsByClass[className] ?? [
    { title: 'Aumentar impacto', description: `Seu damage médio é ${Math.round(stat.avgDamage ?? 0)} por partida. Escolha uma situação recorrente para revisar nas demos.`, priority: 'high', icon: '💥', action: 'Marque uma decisão por partida' },
    { title: 'Revisar posicionamento', description: `Você registra ${deathRate} deaths/partida. Procure padrões nas mortes antes de ajustar sua rotina.`, priority: 'medium', icon: '🧭', action: 'Anote a causa de cada morte' },
    { title: 'Consolidar a função', description: `Use as ${stat.matches ?? 0} partidas analisadas para repetir uma responsabilidade específica por sessão.`, priority: 'medium', icon: '📌', action: 'Escolha um objetivo por mapa' }
  ]
})

const confidenceNote = computed(() => props.totalLogs < 5
  ? `Amostra baixa: estas dicas usam apenas ${props.totalLogs} logs analisadas.`
  : `Dicas baseadas em ${props.totalLogs} logs analisadas da sua classe principal.`)

const recommendations = computed<Recommendation[]>(() => {
  if (props.classStat && props.mainClassName) return classRecommendations.value

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
  padding: var(--space-lg);
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
  gap: var(--space-md);
  margin: var(--space-lg) 0;
  padding-bottom: var(--space-lg);
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

.recommendation-item.priority--high:hover {
  border-color: rgba(239, 68, 68, 0.35);
  background: rgba(239, 68, 68, 0.12);
}

.recommendation-item.priority--medium {
  border-color: rgba(251, 191, 36, 0.25);
  background: rgba(251, 191, 36, 0.08);
}

.recommendation-item.priority--medium:hover {
  border-color: rgba(251, 191, 36, 0.35);
  background: rgba(251, 191, 36, 0.12);
}

.recommendation-item.priority--low {
  border-color: rgba(34, 197, 94, 0.15);
  background: rgba(34, 197, 94, 0.05);
}

.recommendation-item.priority--low:hover {
  border-color: rgba(34, 197, 94, 0.25);
  background: rgba(34, 197, 94, 0.08);
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
  padding: 0.75rem;
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

  .recommendations-card {
    padding: var(--space-md);
  }
}
</style>
