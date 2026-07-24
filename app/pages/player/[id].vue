<template>
  <div class="page-player">
    <Breadcrumbs :items="breadcrumbs" />
    <BackButton fallback="/search" label="Back to search" />

    <div v-if="pending" class="player-skeleton" aria-busy="true" aria-live="polite">
      <div class="skeleton-line skeleton-line--xl" />
      <div class="skeleton-line" />
      <div class="skeleton-line skeleton-line--md" />
    </div>

    <div v-else-if="player">
      <PlayerHeader :player="player" />
      <PlayerStatsOverview :overview="player.overview" />
      <div class="charts-grid">
        <KDTrendChart :series="mockKDSeries" />
        <ClassUsageRadar :classes="mockClasses" />
        <DamageBreakdownChart :data="mockDamage" />
      </div>
      <div class="content-grid">
        <PlayerLogsList :logs="player.recentLogs ?? []" />
        <PlayerClassStats :classes="player.classStats ?? []" />
      </div>
    </div>

    <section v-else class="empty-state" role="alert">
      <p class="empty-state__icon" aria-hidden="true">∅</p>
      <h2>Player not found</h2>
      <p>
        We couldn't load player <code>#{{ id }}</code>.
        {{ errorMessage ? `Reason: ${errorMessage}` : 'Please check the SteamID and try again.' }}
      </p>
      <div class="empty-state__actions">
        <BackButton fallback="/search" label="Back to search" />
        <NuxtLink to="/search" class="action-link">New search</NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PlayerProfile } from '~~/features/player/types'
import Breadcrumbs from '~~/components/Breadcrumbs.vue'
import BackButton from '~~/components/BackButton.vue'
import PlayerHeader from '~~/features/player/components/PlayerHeader.vue'
import PlayerStatsOverview from '~~/features/player/components/PlayerStatsOverview.vue'
import PlayerLogsList from '~~/features/player/components/PlayerLogsList.vue'
import PlayerClassStats from '~~/features/player/components/PlayerClassStats.vue'
import KDTrendChart from '~~/features/player/components/KDTrendChart.vue'
import ClassUsageRadar from '~~/features/player/components/ClassUsageRadar.vue'
import DamageBreakdownChart from '~~/features/player/components/DamageBreakdownChart.vue'

// `useRoute`, `useAsyncData`, `$fetch` are auto-imported by Nuxt.

const route = useRoute()
const id = String(route.params.id ?? '')

const { data: res, pending, error } = await useAsyncData(
  `player-${id}`,
  () => $fetch(`/api/player/${encodeURIComponent(id)}`)
)

const player = computed<PlayerProfile | undefined>(() => {
  const payload = res.value as { data?: PlayerProfile } | null | undefined
  return payload?.data
})

const errorMessage = computed<string | null>(() => {
  if (!error.value) return null
  const e = error.value as { message?: string; statusMessage?: string }
  return e?.statusMessage ?? e?.message ?? String(error.value)
})

const mockKDSeries = computed(() =>
  player.value?.recentLogs?.map((l, idx) => ({
    date: l.timestamp ?? `#${idx + 1}`,
    kd: +(1 + ((idx % 3) * 0.1)).toFixed(2)
  })) ?? undefined
)

const mockClasses = computed(() =>
  player.value?.classStats?.map((c) => ({
    name: c.className,
    value: Math.max(1, Math.round((c.timePlayed ?? 0) / 1000))
  })) ?? undefined
)

const mockDamage = computed(() => [
  { name: 'Damage', value: player.value?.overview?.totalDamage ?? 1 },
  { name: 'Other', value: Math.max(1, Math.round((player.value?.overview?.matches ?? 1) / 2)) }
])

const breadcrumbs = computed(() => [
  { label: 'Search', to: '/search' },
  { label: player.value?.name ?? `Player ${id}` }
])
</script>

<style scoped>
.page-player {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
  padding: clamp(1rem, 3vw, 2rem) 0;
}

.player-skeleton {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  padding: var(--space-lg);
  border: 1px solid rgba(255, 79, 60, 0.12);
  border-radius: var(--radius);
  background: rgba(18, 20, 32, 0.5);
  min-height: 320px;
}
.skeleton-line {
  height: 0.75rem;
  border-radius: 0.5rem;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.05));
  background-size: 200% 100%;
  animation: shimmer 1.4s linear infinite;
}
.skeleton-line--xl { height: 1.8rem; width: 50%; }
.skeleton-line--md { width: 70%; }
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

.content-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: var(--space-lg);
}
.charts-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-lg);
  margin: var(--space-lg) 0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--space-sm);
  padding: var(--space-2xl) var(--space-lg);
  border: 1px dashed rgba(255, 255, 255, 0.12);
  border-radius: var(--radius);
  background: rgba(18, 20, 32, 0.5);
}
.empty-state__icon { margin: 0; font-size: 2.5rem; color: var(--accent-soft); }
.empty-state h2 { margin: 0; font-size: var(--font-size-xl); color: var(--text); }
.empty-state p { margin: 0; color: var(--text-soft); max-width: 32rem; }
.empty-state code {
  font-family: var(--font-family-mono);
  padding: 0.1rem 0.4rem;
  border-radius: 0.4rem;
  background: rgba(255, 255, 255, 0.08);
  color: var(--text);
}
.empty-state__actions { display: flex; flex-wrap: wrap; gap: 0.75rem; margin-top: var(--space-sm); justify-content: center; }
.action-link {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.6rem 0.95rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.04);
  color: var(--text);
  font-weight: 700;
  font-size: 0.88rem;
  text-decoration: none;
  transition: background 0.2s ease, border-color 0.2s ease;
}
.action-link:hover { background: rgba(255, 79, 60, 0.16); border-color: rgba(255, 79, 60, 0.32); }

@media (max-width: 960px) {
  .content-grid { grid-template-columns: 1fr; }
}
</style>
