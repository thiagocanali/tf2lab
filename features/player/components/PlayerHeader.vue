<template>
  <header class="player-header-card">
    <div class="player-header-row">
      <div class="player-labels">
        <div class="avatar-wrapper">
          <img v-if="player.avatarUrl" :src="player.avatarUrl" alt="Avatar do jogador" />
          <div v-else class="avatar-fallback">{{ initials }}</div>
        </div>

        <div class="identity-block">
          <p class="subtitle">Perfil do jogador</p>
          <h1>{{ player.name }}</h1>
          <div class="meta">
            <span>SteamID: {{ player.steamId ?? player.id }}</span>
            <span>•</span>
            <span>Tempo jogado: {{ formattedTime }}</span>
            <span>•</span>
            <span>{{ player.totalLogs ?? player.overview?.matches ?? 0 }} logs</span>
          </div>
        </div>
      </div>

      <div class="badge-wrap">
        <span class="status-badge">TF2Lab</span>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PlayerProfile } from '~~/features/player/types'

const props = defineProps<{ player: PlayerProfile }>()

const initials = computed(() => {
  const parts = (props.player.name || 'Player').split(' ').filter(Boolean)
  return parts.slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'PL'
})

const formattedTime = computed(() => {
  const seconds = Number(props.player.overview?.timePlayed ?? 0)
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return `${hours}h ${minutes}m`
})
</script>

<style scoped>
.player-header-card {
  background: linear-gradient(180deg, rgba(16, 19, 30, 0.98), rgba(26, 31, 46, 0.96));
  border: 1px solid rgba(255, 79, 60, 0.18);
  border-radius: var(--radius);
  padding: var(--space-lg);
  box-shadow: var(--shadow-soft);
  margin-bottom: var(--space-md);
}

.player-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-lg);
}

.player-labels {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  min-width: 0;
}

.identity-block {
  min-width: 0;
}

.avatar-wrapper {
  width: 84px;
  height: 84px;
  border-radius: 22px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.06);
  flex-shrink: 0;
}

.avatar-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-fallback {
  color: var(--text);
  font-weight: 700;
  font-size: 1.4rem;
}

.subtitle {
  margin: 0 0 0.25rem;
  color: var(--text-soft);
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

h1 {
  margin: 0;
  color: var(--text);
  font-size: clamp(1.7rem, 2.8vw, 2.6rem);
  line-height: 1.1;
  word-break: break-word;
}

.meta {
  margin-top: 0.55rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  color: var(--text-soft);
  font-size: 0.82rem;
}

.badge-wrap {
  flex-shrink: 0;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 0.75rem;
  border-radius: 999px;
  background: rgba(255, 79, 60, 0.12);
  border: 1px solid rgba(255, 79, 60, 0.22);
  color: var(--accent);
  font-size: 0.78rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-weight: 700;
}

@media (max-width: 680px) {
  .player-header-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .player-labels {
    width: 100%;
    align-items: flex-start;
  }

  .badge-wrap {
    align-self: flex-end;
  }
}
</style>
