<template>
  <Card class="highlights-card">
    <div class="highlights-header">
      <h3>Destaques</h3>
      <p class="highlights-subtitle">Fatos interessantes sobre sua performance</p>
    </div>

    <div v-if="highlights.length" class="highlights-grid">
      <div v-for="(highlight, index) in highlights" :key="index" class="highlight-item">
        <div class="highlight-icon">{{ highlight.icon }}</div>
        <div class="highlight-content">
          <p class="highlight-label">{{ highlight.label }}</p>
          <p class="highlight-value">{{ highlight.value }}</p>
        </div>
      </div>
    </div>

    <div v-else class="highlights-empty">
      <p>Mais dados necessários para gerar destaques.</p>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PlayerOverviewStats, PlayerClassStat, PlayerLogReference } from '~~/features/player/types'

interface Highlight {
  label: string
  value: string
  icon: string
}

const props = defineProps<{
  overview: PlayerOverviewStats
  classStats: PlayerClassStat[]
  recentLogs: PlayerLogReference[]
}>()

const highlights = computed<Highlight[]>(() => {
  const results: Highlight[] = []

  // Best class (most matches)
  if (props.classStats.length > 0) {
    const bestClass = [...props.classStats].sort((a, b) => (b.matches ?? 0) - (a.matches ?? 0))[0]
    if (bestClass) {
      results.push({
        label: 'Classe Favorita',
        value: `${bestClass.className} (${bestClass.matches ?? 0} logs)`,
        icon: '🎪'
      })
    }

    // Best KD class
    const bestKdClass = [...props.classStats]
      .filter(s => (s.matches ?? 0) >= 2)
      .sort((a, b) => (b.avgKd ?? b.kd ?? 0) - (a.avgKd ?? a.kd ?? 0))[0]
    if (bestKdClass && (bestKdClass.avgKd ?? bestKdClass.kd ?? 0) > 0.8) {
      results.push({
        label: 'Melhor K/D',
        value: `${bestKdClass.className}: ${(bestKdClass.avgKd ?? bestKdClass.kd ?? 0).toFixed(2)}`,
        icon: '⚔️'
      })
    }
  }

  // Best map (if available in logs)
  const mapStats = new Map<string, { count: number; totalKd: number }>()
  props.recentLogs.forEach(log => {
    if (log.map) {
      const stat = mapStats.get(log.map) || { count: 0, totalKd: 0 }
      stat.count += 1
      stat.totalKd += log.kd ?? 0
      mapStats.set(log.map, stat)
    }
  })

  if (mapStats.size > 0) {
    const bestMap = Array.from(mapStats.entries())
      .filter(([_, stat]) => stat.count >= 2)
      .sort((a, b) => (b[1].totalKd / b[1].count) - (a[1].totalKd / a[1].count))[0]

    if (bestMap) {
      const avgKd = bestMap[1].totalKd / bestMap[1].count
      results.push({
        label: 'Melhor Mapa',
        value: `${bestMap[0]} (${bestMap[1].count} logs)`,
        icon: '🗺️'
      })
    }
  }

  // Kill streak (if available)
  const maxKills = Math.max(...(props.recentLogs.map(l => l.kills ?? 0) || [0]))
  if (maxKills > 0) {
    results.push({
      label: 'Mais Kills em uma Partida',
      value: `${maxKills} kills`,
      icon: '🎯'
    })
  }

  // Win rate estimate (higher KD usually means wins)
  const avgKd = props.overview.avgKd ?? 0
  let performance = 'Normal'
  if (avgKd >= 1.5) performance = 'Excelente'
  else if (avgKd >= 1.2) performance = 'Muito Bom'
  else if (avgKd >= 1.0) performance = 'Bom'
  else if (avgKd >= 0.8) performance = 'Aceitável'

  results.push({
    label: 'Performance Geral',
    value: performance,
    icon: avgKd >= 1.2 ? '⭐' : '📈'
  })

  return results.slice(0, 4)
})
</script>

<style scoped>
.highlights-card {
  background: rgba(24, 29, 45, 0.95);
  border: 1px solid rgba(255, 79, 60, 0.12);
  border-radius: var(--radius);
  padding: var(--space-md);
}

.highlights-header h3 {
  margin: 0;
  color: var(--text);
  font-size: 1.35rem;
}

.highlights-subtitle {
  margin: 0.35rem 0 0;
  color: var(--text-soft);
  font-size: 0.82rem;
}

.highlights-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-sm);
  margin-top: var(--space-md);
}

.highlight-item {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  padding: 0.85rem;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 0.2s ease;
}

.highlight-item:hover {
  border-color: rgba(255, 79, 60, 0.2);
  background: rgba(255, 79, 60, 0.06);
  transform: translateY(-2px);
}

.highlight-icon {
  font-size: 1.4rem;
  flex-shrink: 0;
}

.highlight-content {
  flex: 1;
}

.highlight-label {
  margin: 0;
  color: var(--text-soft);
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 700;
}

.highlight-value {
  margin: 0.3rem 0 0;
  color: var(--text);
  font-size: 0.95rem;
  font-weight: 700;
  line-height: 1.2;
}

.highlights-empty {
  padding: 1rem;
  text-align: center;
  color: var(--text-soft);
  font-size: 0.88rem;
}

@media (max-width: 768px) {
  .highlights-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .highlights-grid {
    grid-template-columns: 1fr;
  }
}
</style>
