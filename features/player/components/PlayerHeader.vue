<template>
  <Card class="player-header-card">
    <div class="player-header-row">
      <div class="player-labels">
        <div class="avatar-wrapper">
          <img v-if="player.avatarUrl" :src="player.avatarUrl" alt="Avatar" />
          <div v-else class="avatar-fallback">{{ initials }}</div>
        </div>
        <div>
          <p class="subtitle">Perfil do jogador</p>
          <h1>{{ player.name }}</h1>
          <div class="meta">
            <span>SteamID: {{ player.steamId ?? player.id }}</span>
            <span> • Tempo jogado: {{ formattedTime }}</span>
          </div>
        </div>
      </div>
      <Badge value="TG2" severity="info" />
    </div>
  </Card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PlayerProfile } from '~~/features/player/types'
const props = defineProps<{ player: PlayerProfile }>()

const initials = computed(() => {
  const parts = props.player.name.split(' ')
  return parts.map((part) => part[0]).slice(0, 2).join('').toUpperCase()
})

const formattedTime = computed(() => {
  const seconds = props.player.overview.timePlayed
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return `${hours}h ${minutes}m`
})
</script>

<style scoped>
.player-header-card {
  background: linear-gradient(180deg, rgba(18, 20, 32, 0.97), rgba(31, 36, 58, 0.95));
  border: 1px solid rgba(255, 79, 60, 0.16);
  border-radius: var(--radius);
  padding: var(--space-lg);
  box-shadow: var(--shadow);
}
.player-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-lg);
}
.player-labels {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}
.avatar-wrapper {
  width: 88px;
  height: 88px;
  border-radius: 24px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.08);
  display:flex;
  align-items:center;
  justify-content:center;
}
.avatar-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.avatar-fallback {
  color: var(--text);
  font-weight: 700;
  font-size: 1.5rem;
}
.subtitle {
  color: var(--text-soft);
  margin: 0 0 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 0.75rem;
}
h1 {
  margin: 0;
  color: var(--text);
  font-size: var(--font-size-2xl);
}
.meta {
  color: var(--text-soft);
  margin-top: 0.65rem;
  font-size: var(--font-size-sm);
}
</style>
