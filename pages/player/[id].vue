<template>
  <div class="page-player container">
    <Breadcrumbs :items="breadcrumbs" />
    <BackButton fallback="/search" label="Voltar para Busca" />

    <Skeleton v-if="pending" width="100%" height="320px" />
    <div v-else class="player-shell">
      <PlayerHeader :player="player" />
      <PlayerStatsOverview :overview="filteredOverview" />

      <div class="charts-grid">
        <KDTrendChart :series="logTrendSeries" title="K/D por partida" series-name="K/D" color="var(--tf2-red)" />
        <ClassUsageRadar :classes="filteredClassUsage" />
        <DamageBreakdownChart :data="damageBreakdown" />
      </div>

      <div class="charts-grid charts-grid--secondary">
        <ClassPerformanceChart :stats="filteredClassStats" metric="heals" title="Classes que mais curam" />
        <ClassPerformanceChart :stats="filteredClassStats" metric="damage" title="Damage por classe" />
      </div>

      <div class="content-grid">
        <PlayerLogsList
          :logs="visibleLogs"
          :limit="selectedLogLimit"
          @update:limit="selectedLogLimit = $event"
        />
        <PlayerClassStats :classes="filteredClassStats" />
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
const logLimitOptions = [5, 10, 20, 30, 50]

const totalRecentLogs = computed(() => player?.recentLogs?.length ?? 0)
const visibleLogs = computed(() => {
  const logs = player?.recentLogs ?? []
  const limit = Math.max(1, Math.min(selectedLogLimit.value, logs.length || 1))
  return logs.slice(0, limit)
})

const selectedScale = computed(() => {
  const total = totalRecentLogs.value || 1
  return Math.min(1, (visibleLogs.value.length || 1) / total)
})

const filteredOverview = computed(() => {
  const base = player?.overview ?? {
    totalKills: 0,
    totalDeaths: 0,
    kdRatio: 0,
    totalDamage: 0,
    totalHeals: 0,
    healsPerMatch: 0,
    matches: 0,
    timePlayed: 0
  }

  const selectedMatches = visibleLogs.value.length
  const totalMatches = totalRecentLogs.value || 1
  const scale = totalMatches > 0 ? Math.min(1, selectedMatches / totalMatches) : 1

  const totalKills = Math.round((base.totalKills ?? 0) * scale)
  const totalDeaths = Math.round((base.totalDeaths ?? 0) * scale)
  const totalDamage = Math.round((base.totalDamage ?? 0) * scale)
  const totalHeals = Math.round((base.totalHeals ?? 0) * scale)
  const timePlayed = Math.round((base.timePlayed ?? 0) * scale)

  return {
    ...base,
    totalKills,
    totalDeaths,
    kdRatio: totalDeaths > 0 ? totalKills / totalDeaths : totalKills,
    totalDamage,
    totalHeals,
    healsPerMatch: selectedMatches ? totalHeals / selectedMatches : 0,
    matches: selectedMatches,
    timePlayed
  }
})

const filteredClassStats = computed(() => {
  return (player?.classStats ?? []).map((stat) => ({
    ...stat,
    kills: Math.round((stat.kills ?? 0) * selectedScale.value),
    deaths: Math.round((stat.deaths ?? 0) * selectedScale.value),
    damage: Math.round((stat.damage ?? 0) * selectedScale.value),
    heals: Math.round((stat.heals ?? 0) * selectedScale.value),
    kd: (stat.deaths ?? 0) > 0 ? ((stat.kills ?? 0) * selectedScale.value) / Math.max(1, (stat.deaths ?? 0) * selectedScale.value) : (stat.kills ?? 0) * selectedScale.value,
    healsPerMatch: ((stat.healsPerMatch ?? 0) * selectedScale.value),
    performanceTrend: (stat.performanceTrend ?? []).map((point) => ({
      ...point,
      value: Math.round(point.value * selectedScale.value)
    }))
  }))
})

const filteredClassUsage = computed(() => {
  return (player?.classStats ?? []).map((stat) => ({
    name: stat.className,
    value: Math.max(1, Math.round(((stat.timePlayed ?? 0) / Math.max(1, player?.overview?.timePlayed ?? 1)) * 100))
  }))
})

const logTrendSeries = computed(() => {
  return visibleLogs.value.map((log, index) => ({
    date: `L${index + 1}`,
    value: Number(log.kills ?? 0) / Math.max(1, Number(log.deaths ?? 0))
  }))
})

const damageBreakdown = computed(() => [
  { name: 'Damage', value: filteredOverview.value.totalDamage },
  { name: 'Heals', value: filteredOverview.value.totalHeals ?? 0 },
  { name: 'Logs', value: Math.max(1, filteredOverview.value.matches) }
])

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
