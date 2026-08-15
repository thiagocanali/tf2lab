<template>
  <div class="page-player container">
    <Breadcrumbs :items="breadcrumbs" />
    <BackButton fallback="/search" label="Voltar para Busca" />

    <Skeleton v-if="pending" width="100%" height="320px" />
    <div v-else class="player-shell">
      <PlayerHeader :player="player" />
      <PlayerStatsOverview :overview="player.overview" />

      <div class="charts-grid">
        <KDTrendChart :series="medicTrendSeries" title="Medic Healing Trend" series-name="Heals" color="var(--tf2-blu)" />
        <ClassUsageRadar :classes="mockClasses" />
        <DamageBreakdownChart :data="mockDamage" />
      </div>

      <div class="charts-grid charts-grid--secondary">
        <ClassPerformanceChart :stats="player.classStats ?? []" metric="heals" title="Classes que mais curam" />
        <ClassPerformanceChart :stats="player.classStats ?? []" metric="damage" title="Damage por classe" />
      </div>

      <div class="content-grid">
        <PlayerLogsList
          :logs="visibleLogs"
          :limit="selectedLogLimit"
          @update:limit="selectedLogLimit = $event"
        />
        <PlayerClassStats :classes="player.classStats ?? []" />
      </div>
    </div>

    <div v-if="error" class="error-message">{{ error.message ?? error }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useAsyncData } from '#app'
import type { PlayerProfile } from '~/features/player/types'
import Breadcrumbs from '~/components/Breadcrumbs.vue'
import BackButton from '~/components/BackButton.vue'
import PlayerHeader from '~/features/player/components/PlayerHeader.vue'
import PlayerStatsOverview from '~/features/player/components/PlayerStatsOverview.vue'
import PlayerLogsList from '~/features/player/components/PlayerLogsList.vue'
import PlayerClassStats from '~/features/player/components/PlayerClassStats.vue'
import KDTrendChart from '~/features/player/components/KDTrendChart.vue'
import ClassUsageRadar from '~/features/player/components/ClassUsageRadar.vue'
import DamageBreakdownChart from '~/features/player/components/DamageBreakdownChart.vue'
import ClassPerformanceChart from '~/features/player/components/ClassPerformanceChart.vue'

const route = useRoute()
const id = route.params.id as string

const { data: res, pending, error } = await useAsyncData(`player-${id}`, () => $fetch(`/api/player/${encodeURIComponent(id)}`))
const player = res?.data as PlayerProfile
const selectedLogLimit = ref(10)
const logLimitOptions = [5, 10, 20, 50]

const visibleLogs = computed(() => (player?.recentLogs ?? []).slice(0, selectedLogLimit.value))
const medicTrendSeries = player?.classStats?.find((stat) => stat.className === 'Medic')?.performanceTrend?.map((point) => ({ date: point.label, value: point.value })) ?? [
  { date: 'M1', value: 2100 },
  { date: 'M2', value: 2500 },
  { date: 'M3', value: 2980 },
  { date: 'M4', value: 3450 },
  { date: 'M5', value: 3320 }
]
const mockClasses = player?.classStats?.map((c) => ({ name: c.className, value: Math.max(1, Math.round((c.timePlayed ?? 0) / 1000)) })) ?? undefined
const mockDamage = [
  { name: 'Damage', value: player?.overview?.totalDamage ?? 1 },
  { name: 'Heals', value: player?.classStats?.find((stat) => stat.className === 'Medic')?.heals ?? player?.overview?.totalHeals ?? 1 },
  { name: 'Matches', value: Math.max(1, Math.round((player?.overview?.matches ?? 1) / 2)) }
]

const breadcrumbs = computed(() => [
  { label: 'Search', to: '/search' },
  { label: player?.name ?? `Player ${id}` }
])
</script>

<style scoped>
.page-player {
  padding: var(--space-xl) 0;
}

.player-shell {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.content-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr);
  gap: var(--space-lg);
  align-items: start;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-lg);
}

.charts-grid--secondary {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.error-message {
  margin-top: var(--space-md);
  color: var(--danger);
}

@media (max-width: 960px) {
  .content-grid,
  .charts-grid,
  .charts-grid--secondary {
    grid-template-columns: 1fr;
  }
}
</style>
