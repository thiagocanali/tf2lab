<template>
  <Card class="best-logs-card">
    <div class="panel-header">
      <div>
        <p class="eyebrow">Melhores logs</p>
        <h3>Partidas mais fortes</h3>
        <p class="section-subtitle">Desempenho de pico baseado em score total</p>
      </div>
      <span v-if="logs.length" class="log-count">{{ logs.length }} / {{ totalLogsAnalyzed }}</span>
    </div>

    <div v-if="!logs.length" class="empty-best">
      <p>Nenhuma partida registrada para este período.</p>
    </div>

    <div v-else class="best-logs-grid">
      <NuxtLink
        v-for="(log, index) in logs"
        :key="log.id"
        :to="`/log/${log.id}`"
        class="best-log-card"
        :class="{ 'best-log-card--peak': index === 0 }"
      >
        <div class="best-log-rank">
          <span class="rank-badge">#{{ index + 1 }}</span>
          <span class="score-badge">{{ scoreLabel(log) }}</span>
        </div>

        <div class="best-log-title">
          <strong>{{ log.title ?? `Log ${log.id}` }}</strong>
        </div>

        <div class="best-log-info">
          <span class="info-item">
            <span class="info-label">Mapa</span>
            <span class="info-value">{{ log.map ?? '?' }}</span>
          </span>
          <span class="info-item">
            <span class="info-label">Data</span>
            <span class="info-value">{{ formatDate(log.timestamp) }}</span>
          </span>
        </div>

        <div class="best-log-stats">
          <div class="stat-block">
            <div class="stat-value">{{ log.kills ?? 0 }}</div>
            <div class="stat-label">Kills</div>
          </div>
          <div class="stat-block">
            <div class="stat-value">{{ log.deaths ?? 0 }}</div>
            <div class="stat-label">Deaths</div>
          </div>
          <div class="stat-block">
            <div class="stat-value">{{ formatNumber(log.damage ?? 0) }}</div>
            <div class="stat-label">Dmg</div>
          </div>
          <div class="stat-block">
            <div class="stat-value">{{ formatNumber(log.heals ?? 0) }}</div>
            <div class="stat-label">Heals</div>
          </div>
        </div>

        <div class="best-log-action">
          <span class="action-text">Ver detalhes</span>
          <span class="action-arrow">→</span>
        </div>
      </NuxtLink>
    </div>
  </Card>
</template>

<script setup lang="ts">
import type { PlayerLogReference } from '~~/features/player/types'

const props = defineProps<{
  logs: PlayerLogReference[]
  totalLogsAnalyzed?: number
}>()

const formatDate = (value?: string) => value ? new Date(value).toLocaleDateString('pt-BR') : '?'
const formatNumber = (value?: number) => new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(value ?? 0)

const scoreLabel = (log: { score?: number; kills?: number; damage?: number; heals?: number }) => {
  const score = log.score ?? ((log.kills ?? 0) * 2 + (log.damage ?? 0) / 25 + (log.heals ?? 0) / 18)
  return `${score.toFixed(0)} pts`
}
</script>

<style scoped>
.best-logs-card {
  background: rgba(24, 29, 45, 0.95);
  border: 1px solid rgba(255, 79, 60, 0.12);
  border-radius: var(--radius);
  padding: var(--space-lg);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-md);
  margin-bottom: var(--space-md);
}

.panel-header h3 {
  margin: 0;
  color: var(--text);
  font-size: 1.35rem;
}

.eyebrow {
  margin: 0 0 0.35rem;
  color: var(--text-soft);
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.section-subtitle {
  margin: 0.35rem 0 0;
  color: var(--text-soft);
  font-size: 0.82rem;
}

.log-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 4rem;
  height: 2rem;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: var(--text-soft);
  font-size: 0.78rem;
  font-weight: 700;
}

.empty-best {
  padding: 2rem 1rem;
  text-align: center;
  color: var(--text-soft);
  font-size: 0.95rem;
}

.best-logs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--space-md);
}

.best-log-card {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  padding: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.02));
  text-decoration: none;
  color: inherit;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.best-log-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255, 255, 255, 0.08), transparent 50%);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.best-log-card:hover {
  border-color: rgba(255, 79, 60, 0.32);
  background: linear-gradient(135deg, rgba(255, 79, 60, 0.08), rgba(255, 79, 60, 0.04));
  box-shadow: 0 8px 16px rgba(255, 79, 60, 0.12);
  transform: translateY(-2px);
}

.best-log-card:hover::before {
  opacity: 1;
}

.best-log-card--peak {
  border-color: rgba(255, 191, 92, 0.35);
  background: linear-gradient(135deg, rgba(255, 191, 92, 0.1), rgba(255, 191, 92, 0.05));
  box-shadow: inset 0 0 20px rgba(255, 191, 92, 0.06), 0 0 20px rgba(255, 191, 92, 0.08);
}

.best-log-card--peak:hover {
  border-color: rgba(255, 191, 92, 0.45);
  background: linear-gradient(135deg, rgba(255, 191, 92, 0.15), rgba(255, 191, 92, 0.08));
}

.best-log-rank {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.rank-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2.2rem;
  height: 2.2rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--text);
  font-weight: 700;
  font-size: 0.9rem;
}

.best-log-card--peak .rank-badge {
  background: rgba(255, 191, 92, 0.2);
  border-color: rgba(255, 191, 92, 0.35);
  color: #fbbf24;
}

.score-badge {
  margin-left: auto;
  padding: 0.35rem 0.65rem;
  border-radius: 6px;
  background: rgba(58, 128, 255, 0.15);
  border: 1px solid rgba(58, 128, 255, 0.28);
  color: #93c5fd;
  font-weight: 700;
  font-size: 0.78rem;
}

.best-log-card--peak .score-badge {
  background: rgba(255, 191, 92, 0.15);
  border-color: rgba(255, 191, 92, 0.28);
  color: #fbbf24;
}

.best-log-title {
  display: flex;
  align-items: center;
}

.best-log-title strong {
  color: var(--text);
  font-size: 1rem;
  line-height: 1.2;
  word-break: break-word;
}

.best-log-info {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
}

.info-label {
  color: var(--text-soft);
}

.info-value {
  color: var(--text);
  font-weight: 600;
}

.best-log-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.6rem;
  padding-top: 0.6rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.stat-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  padding: 0.5rem;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.03);
}

.stat-value {
  color: var(--text);
  font-weight: 700;
  font-size: 0.95rem;
}

.stat-label {
  color: var(--text-soft);
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.best-log-action {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.4rem;
  padding-top: 0.6rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  color: var(--accent);
  font-weight: 700;
  font-size: 0.82rem;
  opacity: 0.8;
  transition: opacity 0.2s ease;
}

.best-log-card:hover .best-log-action {
  opacity: 1;
}

.action-arrow {
  transition: transform 0.2s ease;
}

.best-log-card:hover .action-arrow {
  transform: translateX(3px);
}

@media (max-width: 768px) {
  .best-logs-grid {
    grid-template-columns: 1fr;
  }

  .panel-header {
    flex-direction: column;
    gap: var(--space-sm);
  }

  .best-logs-card {
    padding: var(--space-md);
  }
}
</style>
