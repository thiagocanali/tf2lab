<template>
  <Card class="log-header">
    <div class="header-grid">
      <div class="info">
        <div class="eyebrow">
          <span class="log-id">Log #{{ data.id }}</span>
          <span v-if="data.map" class="map-badge" :title="`Map: ${data.map}`">
            {{ formattedMap }}
          </span>
        </div>
        <h1 class="title">{{ data.title?.trim() || `Log #${data.id}` }}</h1>
        <ul class="meta-list">
          <li v-if="formattedDate" class="meta-item">
            <span class="meta-label">Played</span>
            <span class="meta-value">{{ formattedDate }}</span>
          </li>
          <li class="meta-item">
            <span class="meta-label">Duration</span>
            <span class="meta-value">{{ formattedDuration }}</span>
          </li>
          <li v-if="data.players?.length" class="meta-item">
            <span class="meta-label">Players</span>
            <span class="meta-value">{{ data.players.length }}</span>
          </li>
        </ul>
      </div>

      <div class="scoreboard" role="group" aria-label="Match score">
        <div class="team team--red" :class="{ 'team--winner': redWins }">
          <span class="team-name">RED</span>
          <span class="team-score">{{ redDisplay }}</span>
        </div>
        <div class="versus" aria-hidden="true">VS</div>
        <div class="team team--blu" :class="{ 'team--winner': bluWins }">
          <span class="team-name">BLU</span>
          <span class="team-score">{{ bluDisplay }}</span>
        </div>
        <p v-if="winnerLabel" class="winner-label">{{ winnerLabel }}</p>
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { LogData } from '~~/features/analytics/types'

const props = defineProps<{ data: LogData }>()

const formattedDate = computed(() => {
  if (!props.data.timestamp) return ''
  try {
    return new Date(props.data.timestamp).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return ''
  }
})

const formattedDuration = computed(() => {
  const d = Number(props.data.duration ?? 0)
  if (!d || d < 0) return '—'
  const mins = Math.floor(d / 60)
  const secs = Math.floor(d % 60)
  return `${mins}m ${secs.toString().padStart(2, '0')}s`
})

const formattedMap = computed(() => {
  const raw = props.data.map
  if (!raw) return ''
  return raw
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
})

const redDisplay = computed(() => formatScore(props.data.redScore))
const bluDisplay = computed(() => formatScore(props.data.bluScore))

const redWins = computed(() => isWinner(props.data.redScore, props.data.bluScore))
const bluWins = computed(() => isWinner(props.data.bluScore, props.data.redScore))

const winnerLabel = computed(() => {
  if (redWins.value) return 'RED victory'
  if (bluWins.value) return 'BLU victory'
  return ''
})

function formatScore(value: number | undefined): string {
  if (value === undefined || value === null || value < 0) return '—'
  return String(value)
}

function isWinner(a: number | undefined, b: number | undefined): boolean {
  if (a === undefined || a === null || a < 0) return false
  if (b === undefined || b === null || b < 0) return false
  return a > b
}
</script>

<style scoped>
.log-header {
  position: relative;
  overflow: hidden;
  background:
    linear-gradient(135deg, rgba(255, 59, 48, 0.08), transparent 55%),
    linear-gradient(225deg, rgba(58, 128, 255, 0.08), transparent 55%),
    linear-gradient(180deg, rgba(18, 20, 32, 0.95), rgba(28, 34, 52, 0.95));
  border: 1px solid rgba(255, 79, 60, 0.18);
  border-radius: var(--radius);
  padding: clamp(1.25rem, 2.5vw, 2rem);
  box-shadow: var(--shadow);
}

.header-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: var(--space-lg);
  align-items: center;
}

.info { display: flex; flex-direction: column; gap: 0.75rem; min-width: 0; }

.eyebrow {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
  color: var(--text-muted);
  font-size: 0.78rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-weight: 700;
}
.log-id { color: var(--text-soft); }
.map-badge {
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  background: rgba(255, 155, 51, 0.14);
  color: var(--tf2-orange);
  border: 1px solid rgba(255, 155, 51, 0.3);
  letter-spacing: 0.04em;
}

.title {
  margin: 0;
  font-size: clamp(1.6rem, 3vw, 2.2rem);
  line-height: 1.1;
  font-weight: 800;
  color: var(--text);
  word-break: break-word;
}

.meta-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 1.25rem;
}
.meta-item {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  min-width: 0;
}
.meta-label {
  color: var(--text-muted);
  font-size: 0.7rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  font-weight: 700;
}
.meta-value {
  color: var(--text);
  font-size: 0.95rem;
  font-weight: 600;
}

.scoreboard {
  display: grid;
  grid-template-columns: auto auto auto;
  align-items: center;
  gap: 0.6rem;
  padding: 0.85rem 1.1rem;
  border-radius: 14px;
  background: rgba(7, 8, 13, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.team {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.15rem;
  padding: 0.4rem 0.9rem;
  border-radius: 10px;
  min-width: 72px;
  background: rgba(255, 255, 255, 0.04);
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}
.team--red { border: 1px solid rgba(255, 59, 48, 0.4); }
.team--blu { border: 1px solid rgba(58, 128, 255, 0.4); }
.team-name {
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.18em;
}
.team--red .team-name { color: var(--tf2-red); }
.team--blu .team-name { color: var(--tf2-blu); }
.team-score {
  font-size: 1.8rem;
  font-weight: 800;
  line-height: 1;
  color: var(--text);
}
.team--winner {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
}
.team--red.team--winner { background: rgba(255, 59, 48, 0.22); }
.team--blu.team--winner { background: rgba(58, 128, 255, 0.22); }

.versus {
  font-size: 0.75rem;
  font-weight: 800;
  color: var(--text-muted);
  letter-spacing: 0.2em;
}

.winner-label {
  grid-column: 1 / -1;
  margin: 0.4rem 0 0;
  text-align: center;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--tf2-orange);
}

@media (max-width: 780px) {
  .header-grid {
    grid-template-columns: 1fr;
  }
  .scoreboard {
    justify-self: stretch;
    justify-content: center;
  }
}
</style>
