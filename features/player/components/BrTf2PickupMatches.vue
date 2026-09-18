<template>
  <section class="pickup-card" aria-labelledby="pickup-title">
    <div class="pickup-header">
      <div>
        <p class="eyebrow">PUGs brasileiros</p>
        <h2 id="pickup-title">Partidas no br.tf2pickup</h2>
        <p class="pickup-subtitle">Histórico recente de partidas na comunidade brasileira.</p>
      </div>
      <a href="https://br.tf2pickup.org" target="_blank" rel="noopener noreferrer" class="pickup-link">Abrir br.tf2pickup ↗</a>
    </div>

    <div v-if="pending" class="pickup-empty" aria-live="polite">Carregando partidas...</div>
    <div v-else-if="!matches.length" class="pickup-empty">Nenhuma partida encontrada no br.tf2pickup.</div>
    <div v-else class="pickup-list">
      <article v-for="match in matches" :key="match.id" class="pickup-match">
        <div class="match-main">
          <strong>{{ match.map ?? 'Mapa não informado' }}</strong>
          <span>{{ formatDate(match.date) }}</span>
        </div>
        <span v-if="match.score !== undefined" class="match-score">Score {{ match.score }}</span>
        <div v-if="match.logsUrl || match.demoUrl" class="match-links">
          <a v-if="match.logsUrl" :href="match.logsUrl" target="_blank" rel="noopener noreferrer">Logs</a>
          <a v-if="match.demoUrl" :href="match.demoUrl" target="_blank" rel="noopener noreferrer">Demo</a>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { BrTf2PickupMatch } from '~~/features/player/types'

defineProps<{
  matches: BrTf2PickupMatch[]
  pending?: boolean
}>()

const formatDate = (value?: string) => value ? new Date(value).toLocaleDateString('pt-BR') : 'Data indisponível'
</script>

<style scoped>
.pickup-card {
  padding: var(--space-lg);
  border: 1px solid rgba(58, 128, 255, 0.2);
  border-radius: var(--profile-card-radius, 12px);
  background: linear-gradient(145deg, rgba(27, 32, 48, 0.96), rgba(15, 18, 28, 0.96));
  box-shadow: var(--profile-card-shadow, 0 14px 36px rgba(0, 0, 0, 0.2));
}

.pickup-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-md);
  margin-bottom: var(--space-md);
}

.eyebrow {
  margin: 0 0 0.35rem;
  color: var(--text-soft);
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

h2 { margin: 0; color: var(--text); font-size: 1.35rem; }
.pickup-subtitle { margin: 0.35rem 0 0; color: var(--text-soft); font-size: 0.82rem; }
.pickup-link, .match-links a { color: #93c5fd; font-size: 0.8rem; font-weight: 700; text-decoration: none; }
.pickup-link:hover, .match-links a:hover { color: var(--text); }
.pickup-list { display: grid; gap: 0.55rem; }
.pickup-match { display: flex; align-items: center; gap: 1rem; padding: 0.8rem 0; border-top: 1px solid rgba(255, 255, 255, 0.08); }
.match-main { display: grid; gap: 0.2rem; min-width: 0; flex: 1; }
.match-main strong { overflow: hidden; color: var(--text); text-overflow: ellipsis; white-space: nowrap; }
.match-main span, .match-score { color: var(--text-soft); font-size: 0.78rem; }
.match-score { white-space: nowrap; }
.match-links { display: flex; gap: 0.7rem; white-space: nowrap; }
.pickup-empty { padding: 1rem 0 0.25rem; color: var(--text-soft); font-size: 0.88rem; }

@media (max-width: 560px) {
  .pickup-header { flex-direction: column; }
  .pickup-match { align-items: flex-start; flex-wrap: wrap; gap: 0.45rem 0.8rem; }
  .match-main { flex-basis: calc(100% - 0.8rem); }
  .match-score { margin-right: auto; }
}
</style>