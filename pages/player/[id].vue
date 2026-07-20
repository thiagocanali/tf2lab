<template>
  <div class="page-player container">
    <Breadcrumbs :items="breadcrumbs" />
    <BackButton fallback="/search" label="Voltar para Busca" />

    <Skeleton v-if="pending" width="100%" height="320px" />
    <div v-else>
      <PlayerHeader :player="player" />
      <PlayerStatsOverview :overview="player.overview" />
      <div class="content-grid">
        <PlayerLogsList :logs="player.recentLogs ?? []" />
        <PlayerClassStats :classes="player.classStats ?? []" />
      </div>
    </div>
    <div v-if="error" class="error-message">{{ error.message ?? error }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAsyncData } from '#app'
import type { PlayerProfile } from '~/features/player/types'
import Breadcrumbs from '~/components/Breadcrumbs.vue'
import BackButton from '~/components/BackButton.vue'
import PlayerHeader from '~/features/player/components/PlayerHeader.vue'
import PlayerStatsOverview from '~/features/player/components/PlayerStatsOverview.vue'
import PlayerLogsList from '~/features/player/components/PlayerLogsList.vue'
import PlayerClassStats from '~/features/player/components/PlayerClassStats.vue'

const route = useRoute()
const id = route.params.id as string

const { data: res, pending, error } = await useAsyncData(`player-${id}`, () => $fetch(`/api/player/${encodeURIComponent(id)}`))
const player = res?.data as PlayerProfile

const breadcrumbs = computed(() => [
  { label: 'Search', to: '/search' },
  { label: player?.name ?? `Player ${id}` }
])
</script>

<style scoped>
.page-player { padding: var(--space-xl) 0 }
.content-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: var(--space-lg);
}
.error-message {
  margin-top: var(--space-md);
  color: var(--danger);
}
@media (max-width: 960px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}
</style>
