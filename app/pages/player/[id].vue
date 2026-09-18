<template>
  <div class="page-player">
    <Breadcrumbs :items="breadcrumbs" />
    <BackButton fallback="/search" label="Back to search" />

    <div v-if="pending" class="player-skeleton" aria-busy="true" aria-live="polite">
      <div class="skeleton-line skeleton-line--xl" />
      <div class="skeleton-line" />
      <div class="skeleton-line skeleton-line--md" />
    </div>

    <div v-else-if="hasProfileData" class="profile-content">
      <PlayerHeader :player="player" />

      <section class="profile-section profile-section--primary">
        <div class="section-grid section-grid--two">
          <ExecutiveSummary :overview="filteredOverview" :total-logs="totalRecentLogs" />
          <PlayerStatsOverview :overview="filteredOverview" />
        </div>
      </section>

      <section class="profile-section profile-section--controls">
        <div class="section-heading">
          <div>
            <p class="eyebrow">Janela de análise</p>
            <h2>{{ periodLabel }}</h2>
          </div>
          <div class="period-selector" role="tablist" aria-label="Período de análise">
            <button
              v-for="option in periodOptions"
              :key="option"
              type="button"
              class="period-button"
              :class="{ active: selectedPeriod === option }"
              @click="selectLogLimit(option)"
            >
              {{ option === 'all' ? 'Tudo' : `${option}` }}
            </button>
          </div>
        </div>

        <div v-if="!hasEnoughLogsForAnalysis" class="analysis-warning">
          A análise de evolução precisa de pelo menos {{ minimumLogsForAnalysis }} logs para ser confiável.
        </div>
      </section>

      <section class="profile-section profile-section--analysis">
        <div class="section-grid section-grid--two">
          <PerformanceInsights :overview="filteredOverview" :total-logs="totalRecentLogs" />
          <RecommendationsPanel :overview="filteredOverview" :class-stats="filteredClassStats" :total-logs="totalRecentLogs" />
        </div>
      </section>

      <section class="profile-section profile-section--highlights">
        <div class="section-grid section-grid--two">
          <HighlightsPanel :overview="filteredOverview" :class-stats="filteredClassStats" :recent-logs="visibleLogs" />
          <TrendAnalysisPanel :recent-logs="visibleLogs" />
        </div>
      </section>

      <section class="profile-section profile-section--charts">
        <KDTrendChart :series="kdSeries" title="K/D por partida" series-name="K/D" color="var(--tf2-red)" />
        <KDTrendChart :series="damageTrendSeries" title="Damage por partida" series-name="Damage" color="#4ade80" />
        <ClassUsageRadar :classes="classUsage" />
      </section>

      <section class="profile-section profile-section--charts profile-section--charts-secondary">
        <KDTrendChart :series="healingTrendSeries" title="Cura por partida" series-name="Heals" color="#60a5fa" />
        <ClassPerformanceChart :stats="filteredClassStats" metric="damage" title="Damage por classe" />
      </section>

      <section class="profile-section profile-section--best-logs">
        <BestLogsPanel :logs="bestLogs" :total-logs-analyzed="totalRecentLogs" />
      </section>

      <section class="profile-section profile-section--logs-stats">
        <div class="content-grid">
          <PlayerLogsList
            :logs="visibleLogs"
            :limit="selectedLogLimit"
            :total-logs="player?.totalLogs ?? totalRecentLogs"
            :requested-limit="player?.requestedLimit ?? selectedLogLimit"
            :returned-log-count="player?.logsReturned"
            :analyzed-log-count="player?.logsAnalyzed ?? totalRecentLogs"
            @update:limit="selectedLogLimit = $event"
          />
          <PlayerClassStats :classes="filteredClassStats" />
        </div>
      </section>
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
import { computed, ref, watch } from 'vue'
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
import ExecutiveSummary from '~~/features/player/components/ExecutiveSummary.vue'

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

const selectLogLimit = (option: number | 'all') => {
  selectedPeriod.value = option
  selectedLogLimit.value = option === 'all' ? 10000 : option
}

watch(selectedLogLimit, (limit) => {
  selectedPeriod.value = limit === 10000 ? 'all' : limit
})

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
  --profile-gap: 0.9rem;
  --profile-section-gap: 1.35rem;
  --profile-card-gap: 1rem;
  --profile-card-radius: 12px;
  --profile-card-border: rgba(255, 255, 255, 0.1);
  --profile-card-background: linear-gradient(145deg, rgba(27, 32, 48, 0.96), rgba(15, 18, 28, 0.96));
  --profile-card-shadow: 0 14px 36px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  width: 100%;
  padding: clamp(0.75rem, 2vw, 1.5rem) 0;
}

.profile-content {
  display: flex;
  flex-direction: column;
  gap: var(--profile-section-gap);
  width: min(100%, 1160px);
  margin: 0 auto;
}

.profile-section {
  display: flex;
  flex-direction: column;
  gap: var(--profile-card-gap);
  padding: var(--profile-section-gap) 0 0;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.profile-section:first-of-type {
  border-top: 0;
}

.profile-section--primary {
  gap: var(--profile-card-gap);
  padding-top: 0;
}

.profile-section--controls {
  gap: 0.65rem;
  padding-top: 0.35rem;
  border-top-color: rgba(255, 155, 51, 0.35);
}

.profile-section--charts {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--profile-card-gap);
  align-items: stretch;
}

.profile-section--charts-secondary {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.section-grid {
  display: grid;
  gap: var(--profile-card-gap);
}

.section-grid--two {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.section-grid--two > * {
  min-height: 100%;
}

.player-skeleton {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  padding: var(--space-md);
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

.section-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-md);
  margin: 0;
  padding: 0.15rem 0 0.65rem;
  border-bottom: 1px solid rgba(255, 155, 51, 0.18);
}

.section-heading h2 {
  margin: 0;
  color: var(--text);
  font-size: 1.15rem;
  letter-spacing: 0.01em;
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
  background: rgba(10, 12, 19, 0.8);
  border: 1px solid rgba(58, 128, 255, 0.3);
  border-radius: 8px;
  padding: 0.25rem;
  flex-wrap: wrap;
}

.period-button {
  border: 0;
  background: transparent;
  color: var(--text-soft);
  cursor: pointer;
  border-radius: 5px;
  padding: 0.4rem 0.65rem;
  min-width: 3.2rem;
  font-weight: 700;
}

.period-button.active {
  background: linear-gradient(135deg, var(--tf2-red), var(--tf2-orange));
  color: white;
  box-shadow: 0 12px 22px rgba(255, 79, 60, 0.2);
}

.analysis-warning {
  margin: 0;
  padding: 0.65rem 0.8rem;
  border-radius: 6px;
  background: rgba(255, 179, 71, 0.08);
  border: 1px solid rgba(255, 179, 71, 0.25);
  color: #f7d39a;
  font-size: 0.88rem;
}

.content-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(18rem, 1fr);
  gap: var(--profile-card-gap);
}

:deep(.chart-card),
:deep(.insights-card),
:deep(.recommendations-card),
:deep(.highlights-card),
:deep(.trend-analysis-card),
:deep(.best-logs-card),
:deep(.logs-list-card),
:deep(.class-stats-card) {
  border: 1px solid var(--profile-card-border);
  border-radius: var(--profile-card-radius);
  background: var(--profile-card-background);
  box-shadow: var(--profile-card-shadow);
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
}

:deep(.chart-card:hover),
:deep(.insights-card:hover),
:deep(.recommendations-card:hover),
:deep(.highlights-card:hover),
:deep(.trend-analysis-card:hover),
:deep(.best-logs-card:hover),
:deep(.logs-list-card:hover),
:deep(.class-stats-card:hover),
:deep(.best-log-card:hover),
:deep(.class-card:hover),
:deep(.log-items li:hover) {
  border-color: rgba(255, 155, 51, 0.48);
  box-shadow: 0 18px 42px rgba(0, 0, 0, 0.26);
}

:deep(.insights-card),
:deep(.recommendations-card),
:deep(.highlights-card),
:deep(.trend-analysis-card),
:deep(.best-logs-card),
:deep(.logs-list-card),
:deep(.class-stats-card) {
  padding: var(--space-md);
}

:deep(.insights-header h3),
:deep(.recommendations-header h3),
:deep(.highlights-header h3),
:deep(.trend-header h3),
:deep(.panel-header h3),
:deep(.header-row h3) {
  font-size: 1.05rem;
  letter-spacing: 0;
}

:deep(.insights-grid),
:deep(.recommendations-list),
:deep(.highlights-grid),
:deep(.trends-grid),
:deep(.best-logs-grid) {
  gap: 0.7rem;
  margin-top: 0.9rem;
}

:deep(.chart-card__header) {
  padding: 0.8rem 0.9rem 0.6rem;
}

:deep(.chart-card__canvas),
:deep(.chart-card__empty) {
  height: 250px;
  min-height: 250px;
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
  .section-grid--two {
    grid-template-columns: 1fr;
  }

  .content-grid {
    grid-template-columns: 1fr;
  }

  .content-grid,
  .profile-section--charts,
  .profile-section--charts-secondary {
    grid-template-columns: 1fr;
  }
  .profile-section {
    padding-top: 1rem;
  }

  .section-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .period-selector {
    width: 100%;
    justify-content: space-between;
  }
}

@media (max-width: 520px) {
  .period-selector {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    border-radius: 8px;
  }

  .period-button {
    min-width: 0;
    padding-inline: 0.45rem;
  }
}
</style>
