<template>
  <div class="page-player">
    <Breadcrumbs :items="breadcrumbs" />
    <BackButton fallback="/search" label="Back to search" />

    <div v-if="pending" class="player-skeleton" aria-busy="true" aria-live="polite">
      <div class="skeleton-line skeleton-line--xl" />
      <div class="skeleton-line" />
      <div class="skeleton-line skeleton-line--md" />
    </div>

    <div v-else-if="hasProfileData">
      <PlayerHeader :player="player" />
      <PlayerStatsOverview :overview="filteredOverview" />

      <PerformanceInsights :overview="filteredOverview" :total-logs="totalRecentLogs" />

      <RecommendationsPanel :overview="filteredOverview" :class-stats="filteredClassStats" :total-logs="totalRecentLogs" />

      <HighlightsPanel :overview="filteredOverview" :class-stats="filteredClassStats" :recent-logs="visibleLogs" />

      <TrendAnalysisPanel :recent-logs="visibleLogs" />

      <div class="analysis-toolbar">
        <div>
          <p class="eyebrow">Análise por período</p>
          <h3>{{ periodLabel }}</h3>
        </div>
        <div class="period-selector" role="tablist" aria-label="Período de análise">
          <button
            v-for="option in periodOptions"
            :key="option"
            type="button"
            class="period-button"
            :class="{ active: selectedPeriod === option }"
            @click="selectedPeriod = option"
          >
            {{ option === 'all' ? 'Tudo' : `${option}` }}
          </button>
        </div>
      </div>

      <div v-if="!hasEnoughLogsForAnalysis" class="analysis-warning">
        A análise de evolução precisa de pelo menos {{ minimumLogsForAnalysis }} logs para ser confiável.
      </div>

      <div class="charts-grid">
        <KDTrendChart :series="kdSeries" title="K/D por partida" series-name="K/D" color="var(--tf2-red)" />
        <KDTrendChart :series="damageTrendSeries" title="Damage por partida" series-name="Damage" color="#4ade80" />
        <ClassUsageRadar :classes="classUsage" />
      </div>

      <div class="charts-grid charts-grid--secondary">
        <KDTrendChart :series="healingTrendSeries" title="Cura por partida" series-name="Heals" color="#60a5fa" />
        <ClassPerformanceChart :stats="filteredClassStats" metric="damage" title="Damage por classe" />
      </div>

      <BestLogsPanel :logs="bestLogs" :total-logs-analyzed="totalRecentLogs" />

      <div class="content-grid">
        <PlayerLogsList
          :logs="visibleLogs"
          :limit="selectedLogLimit"
          :total-logs="player?.totalLogs ?? totalRecentLogs"
          :requested-limit="selectedLogLimit"
          @update:limit="selectedLogLimit = $event"
        />
        <PlayerClassStats :classes="filteredClassStats" />
      </div>
    </div>

    <section v-else class="empty-state" role="alert">
      <p class="empty-state__icon" aria-hidden="true">∅</p>
      <h2>Player not found</h2>
      <p>
        No analyzed performance data is available for <code>#{{ id }}</code>.
        {{ errorMessage ? `Reason: ${errorMessage}` : 'Check the SteamID or try a player with public logs.' }}
      </p>
      <div class="empty-state__actions">
        <BackButton fallback="/search" label="Back to search" />
        <NuxtLink to="/search" class="action-link">New search</NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
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
import ClassPerformanceChart from '~~/features/player/components/ClassPerformanceChart.vue'
import BestLogsPanel from '~~/features/player/components/BestLogsPanel.vue'
import PerformanceInsights from '~~/features/player/components/PerformanceInsights.vue'
import RecommendationsPanel from '~~/features/player/components/RecommendationsPanel.vue'
import HighlightsPanel from '~~/features/player/components/HighlightsPanel.vue'
import TrendAnalysisPanel from '~~/features/player/components/TrendAnalysisPanel.vue'

// `useRoute`, `useAsyncData`, `$fetch` are auto-imported by Nuxt.

const route = useRoute()
const id = String(route.params.id ?? '')

const selectedLogLimit = ref(30)
const selectedPeriod = ref<number | 'all'>(30)
const minimumLogsForAnalysis = 5
const periodOptions: Array<number | 'all'> = [10, 30, 60, 'all']

const { data: res, pending, error } = await useAsyncData(
  `player-${id}`,
  () => $fetch(`/api/player/${encodeURIComponent(id)}`, {
    query: { limit: selectedLogLimit.value }
  }),
  {
    watch: [selectedLogLimit]
  }
)

const player = computed<PlayerProfile | undefined>(() => {
  const payload = res.value as { data?: PlayerProfile } | null | undefined
  return payload?.data
})

const totalRecentLogs = computed(() => player.value?.recentLogs?.length ?? 0)
const periodLabel = computed(() => selectedPeriod.value === 'all' ? 'Todo o histórico' : `Últimos ${selectedPeriod.value} logs`)
const hasEnoughLogsForAnalysis = computed(() => (player.value?.recentLogs?.length ?? 0) >= minimumLogsForAnalysis)

const visibleLogs = computed(() => {
  const logs = player.value?.recentLogs ?? []
  const limit = selectedPeriod.value === 'all'
    ? logs.length
    : Math.max(1, Math.min(Number(selectedPeriod.value), logs.length || 1))
  return logs.slice(0, limit)
})

const selectedScale = computed(() => {
  const total = totalRecentLogs.value || 1
  return Math.min(1, (visibleLogs.value.length || 1) / total)
})

const filteredOverview = computed(() => {
  const base = player.value?.overview ?? {
    totalKills: 0,
    totalDeaths: 0,
    kdRatio: 0,
    totalDamage: 0,
    totalHeals: 0,
    healsPerMatch: 0,
    matches: 0,
    timePlayed: 0,
    avgKills: 0,
    avgDeaths: 0,
    avgDamage: 0,
    avgHeals: 0,
    avgKd: 0
  }

  const matches = Math.max(1, visibleLogs.value.length || base.matches || 1)
  const totalKills = Math.round(base.totalKills ?? 0)
  const totalDeaths = Math.round(base.totalDeaths ?? 0)
  const totalDamage = Math.round(base.totalDamage ?? 0)
  const totalHeals = Math.round(base.totalHeals ?? 0)

  return {
    ...base,
    totalKills,
    totalDeaths,
    kdRatio: totalDeaths > 0 ? totalKills / totalDeaths : totalKills,
    totalDamage,
    totalHeals,
    healsPerMatch: matches ? totalHeals / matches : 0,
    matches,
    avgKills: base.avgKills ?? (matches ? totalKills / matches : 0),
    avgDeaths: base.avgDeaths ?? (matches ? totalDeaths / matches : 0),
    avgDamage: base.avgDamage ?? (matches ? totalDamage / matches : 0),
    avgHeals: base.avgHeals ?? (matches ? totalHeals / matches : 0),
    avgKd: base.avgKd ?? (totalDeaths > 0 ? totalKills / totalDeaths : totalKills),
    timePlayed: base.timePlayed ?? 0
  }
})

const filteredClassStats = computed(() =>
  (player.value?.classStats ?? []).map((stat) => {
    const matchCount = Math.max(1, visibleLogs.value.length || 1)
    const kills = stat.kills ?? 0
    const deaths = stat.deaths ?? 0
    const damage = stat.damage ?? 0
    const heals = stat.heals ?? 0

    return {
      ...stat,
      kills,
      deaths,
      damage,
      heals,
      kd: deaths > 0 ? kills / deaths : kills,
      avgKills: stat.avgKills ?? (matchCount ? kills / matchCount : 0),
      avgDeaths: stat.avgDeaths ?? (matchCount ? deaths / matchCount : 0),
      avgDamage: stat.avgDamage ?? (matchCount ? damage / matchCount : 0),
      avgHeals: stat.avgHeals ?? (matchCount ? heals / matchCount : 0),
      avgKd: stat.avgKd ?? (deaths > 0 ? kills / deaths : kills),
      healsPerMatch: stat.healsPerMatch ?? (matchCount ? heals / matchCount : 0),
      performanceTrend: (stat.performanceTrend ?? []).map((point) => ({
        ...point,
        value: point.value
      }))
    }
  })
)

const hasProfileData = computed(() => (player.value?.overview.matches ?? 0) > 0)

const errorMessage = computed<string | null>(() => {
  if (!error.value) return null
  const e = error.value as { message?: string; statusMessage?: string }
  return e?.statusMessage ?? e?.message ?? String(error.value)
})

// Real KD trend from recent logs (compute K/D per log from player's stats)
const kdSeries = computed(() => {
  const logs = visibleLogs.value
  if (!logs.length) return undefined
  return logs.map((l, idx) => ({
    date: l.timestamp ?? `#${idx + 1}`,
    value: l.kd ?? (l.deaths ? (l.kills ?? 0) / l.deaths : (l.kills ?? 0))
  }))
})

const damageTrendSeries = computed(() => {
  const logs = visibleLogs.value
  if (!logs.length) return undefined
  return logs.map((l, idx) => ({
    date: l.timestamp ?? `#${idx + 1}`,
    value: l.damage ?? 0
  }))
})

const healingTrendSeries = computed(() => {
  const logs = visibleLogs.value
  if (!logs.length) return undefined
  return logs.map((l, idx) => ({
    date: l.timestamp ?? `#${idx + 1}`,
    value: l.heals ?? 0
  }))
})

const bestLogs = computed(() => {
  return [...visibleLogs.value]
    .sort((left, right) => (right.score ?? 0) - (left.score ?? 0))
    .slice(0, 5)
})

const formatDate = (value?: string) => value ? new Date(value).toLocaleDateString() : 'Date unavailable'
const formatNumber = (value?: number) => new Intl.NumberFormat('en-US').format(value ?? 0)
const scoreLabel = (log: { score?: number; kills?: number; damage?: number; heals?: number }) => {
  const score = log.score ?? ((log.kills ?? 0) * 2 + (log.damage ?? 0) / 25 + (log.heals ?? 0) / 18)
  return `${score.toFixed(1)} pts`
}

// Real class usage from classStats
const classUsage = computed(() =>
  player.value?.classStats?.map((c) => ({
    name: c.className,
    value: Math.max(1, Math.round(((c.timePlayed ?? 0) / Math.max(1, player.value?.overview.timePlayed ?? 1)) * 100))
  })) ?? undefined
)

// Real damage breakdown
const damageBreakdown = computed(() => {
  const dmg = filteredOverview.value.totalDamage ?? 0
  const matches = filteredOverview.value.matches ?? 1
  return [
    { name: 'Damage', value: dmg },
    { name: 'Avg/Match', value: Math.round(dmg / matches) },
    { name: 'Logs', value: matches }
  ]
})

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

.analysis-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-md);
  margin-bottom: var(--space-md);
}

.analysis-toolbar h3 {
  margin: 0;
  color: var(--text);
}

.eyebrow {
  margin: 0 0 0.35rem;
  color: var(--text-soft);
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.period-selector {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 999px;
  padding: 0.35rem;
  flex-wrap: wrap;
}

.period-button {
  border: 0;
  background: transparent;
  color: var(--text-soft);
  cursor: pointer;
  border-radius: 999px;
  padding: 0.45rem 0.7rem;
  min-width: 3.2rem;
  font-weight: 700;
}

.period-button.active {
  background: linear-gradient(135deg, var(--tf2-red), var(--tf2-orange));
  color: white;
  box-shadow: 0 12px 22px rgba(255, 79, 60, 0.2);
}

.analysis-warning {
  margin-bottom: var(--space-md);
  padding: 0.85rem 1rem;
  border-radius: 12px;
  background: rgba(255, 179, 71, 0.08);
  border: 1px solid rgba(255, 179, 71, 0.25);
  color: #f7d39a;
  font-size: 0.88rem;
}

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
