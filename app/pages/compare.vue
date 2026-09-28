<template>
  <div class="page-compare">
    <Breadcrumbs :items="[{ label: 'Compare' }]" />

    <header class="compare-header">
      <p class="eyebrow">TF2Lab comparison</p>
      <h1>Compare two players.</h1>
      <p>Coloque dois SteamID64 lado a lado e veja onde cada jogador se destaca.</p>
    </header>

    <form class="compare-form" @submit.prevent="comparePlayers">
      <div class="player-input">
        <label for="player-a">Player A</label>
        <input id="player-a" v-model.trim="playerAId" inputmode="numeric" pattern="[0-9]{17}" maxlength="17" placeholder="SteamID64" autocomplete="off" :aria-invalid="Boolean(formError && !isValidSteamId(playerAId))">
      </div>
      <button type="button" class="swap-button" aria-label="Trocar jogadores de posição" @click="swapPlayers">↔</button>
      <div class="player-input">
        <label for="player-b">Player B</label>
        <input id="player-b" v-model.trim="playerBId" inputmode="numeric" pattern="[0-9]{17}" maxlength="17" placeholder="SteamID64" autocomplete="off" :aria-invalid="Boolean(formError && !isValidSteamId(playerBId))">
      </div>
      <label class="window-input" for="comparison-window">
        <span>Janela</span>
        <select id="comparison-window" v-model="comparisonWindow">
          <option v-for="option in windowOptions" :key="option" :value="option">Últimos {{ option }} jogos</option>
        </select>
      </label>
      <button type="submit" :disabled="!canCompare || loading">{{ loading ? 'Comparando...' : 'Compare players' }}</button>
      <button v-if="profiles.length === 2" type="button" class="clear-button" @click="clearComparison">Limpar</button>
    </form>

    <p v-if="formError" class="form-error" role="alert">{{ formError }}</p>

    <section v-if="loading" class="comparison-grid" aria-busy="true" aria-label="Carregando comparação">
      <article v-for="n in 2" :key="n" class="comparison-card skeleton-card">
        <div class="skeleton-line skeleton-line--xl" />
        <div class="skeleton-line" />
        <div class="skeleton-line skeleton-line--md" />
      </article>
    </section>

    <section v-else-if="profiles.length === 2" class="comparison-results" aria-live="polite">
      <div class="comparison-grid">
        <article v-for="(profile, index) in profiles" :key="profile.steamId" class="comparison-card">
          <div class="player-heading">
            <div class="avatar-fallback">{{ initials(profile.name) }}</div>
            <div>
              <p class="eyebrow">Player {{ index === 0 ? 'A' : 'B' }}</p>
              <h2>{{ profile.name }}</h2>
              <span>{{ profile.steamId }}</span>
            </div>
          </div>
          <NuxtLink class="action-link" :to="`/player/${profile.steamId}`">View full profile →</NuxtLink>
        </article>
      </div>

      <div class="comparison-summary" aria-label="Resumo da comparação">
        <p class="eyebrow">Resumo rápido</p>
        <p><strong>{{ profiles[0].name }}</strong> lidera em <strong>{{ winningMetrics(0) }}</strong>, enquanto <strong>{{ profiles[1].name }}</strong> lidera em <strong>{{ winningMetrics(1) }}</strong>.</p>
      </div>

      <div class="metrics-table-wrap">
        <table class="metrics-table">
          <caption>Performance comparison</caption>
          <thead><tr><th scope="col">Metric</th><th scope="col">{{ profiles[0].name }}</th><th scope="col">{{ profiles[1].name }}</th></tr></thead>
          <tbody>
            <tr v-for="metric in metrics" :key="metric.key">
              <th scope="row">{{ metric.label }}</th>
              <td :class="winnerClass(metric.key, 0)">{{ formatMetric(profiles[0], metric) }}</td>
              <td :class="winnerClass(metric.key, 1)">{{ formatMetric(profiles[1], metric) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section v-else class="empty-state">
      <p class="empty-state__icon" aria-hidden="true">VS</p>
      <h2>Escolha dois jogadores</h2>
      <p>Use SteamID64 para criar uma comparação consistente entre perfis analisados pelo TF2Lab.</p>
      <div class="empty-state__suggestions">
        <p class="suggestions-label">Exemplo:</p>
        <button type="button" @click="playerAId = '76561198000000001'; playerBId = '76561198000000002'">Carregar dois jogadores de exemplo</button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const { t } = useLocale()

interface Profile { name: string; steamId: string; overview?: Record<string, number> }
interface Metric { key: string; label: string; decimals?: number }

const route = useRoute()
const router = useRouter()
const initialQuery = route.query
const playerAId = ref(typeof initialQuery.a === 'string' ? initialQuery.a : '')
const playerBId = ref(typeof initialQuery.b === 'string' ? initialQuery.b : '')
const profiles = ref<Profile[]>([])
const loading = ref(false)
const windowOptions = [10, 25, 50]
const queryWindow = Number(initialQuery.window)
const comparisonWindow = ref(windowOptions.includes(queryWindow) ? queryWindow : 25)
const formError = ref('')
const isValidSteamId = (id: string) => /^7656119\d{10}$/.test(id)
const canCompare = computed(() => isValidSteamId(playerAId.value) && isValidSteamId(playerBId.value) && playerAId.value !== playerBId.value)
const metrics: Metric[] = [
  { key: 'matches', label: 'Matches' },
  { key: 'kdRatio', label: 'K/D', decimals: 2 },
  { key: 'totalKills', label: 'Kills' },
  { key: 'totalDeaths', label: 'Deaths' },
  { key: 'totalDamage', label: 'Damage' },
  { key: 'totalHeals', label: 'Heals' }
]

function initials(name: string) { return name.split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase() || '?' }
function value(profile: Profile, key: string) { return Number(profile.overview?.[key] ?? 0) }
function formatMetric(profile: Profile, metric: Metric) { const result = value(profile, metric.key); return metric.decimals ? result.toFixed(metric.decimals) : result.toLocaleString() }
function winnerClass(key: string, index: number) {
  const first = value(profiles.value[0], key); const second = value(profiles.value[1], key)
  if (first === second) return ''
  const lowerIsBetter = key === 'totalDeaths'
  const wins = lowerIsBetter ? (index === 0 ? first < second : second < first) : (index === 0 ? first > second : second > first)
  return wins ? 'is-winner' : ''
}

function winningMetrics(index: number) {
  return metrics.filter((metric) => winnerClass(metric.key, index) === 'is-winner').map((metric) => metric.label).join(', ') || 'nenhum indicador'
}

function swapPlayers() {
  const currentA = playerAId.value
  playerAId.value = playerBId.value
  playerBId.value = currentA
}

function clearComparison() {
  profiles.value = []
  formError.value = ''
  playerAId.value = ''
  playerBId.value = ''
  void router.replace({ query: {} })
}

async function comparePlayers() {
  if (!isValidSteamId(playerAId.value) || !isValidSteamId(playerBId.value)) {
    formError.value = 'Informe dois SteamID64 válidos com 17 dígitos.'
    return
  }
  if (playerAId.value === playerBId.value) {
    formError.value = 'Escolha dois jogadores diferentes.'
    return
  }
  loading.value = true; formError.value = ''; profiles.value = []
  try {
    const response = await Promise.all([playerAId.value, playerBId.value].map((id) => $fetch<Profile>(`/api/player/${encodeURIComponent(id)}`, { query: { limit: comparisonWindow.value } })))
    profiles.value = response
    await router.replace({ query: { a: playerAId.value, b: playerBId.value, window: String(comparisonWindow.value) } })
  } catch { formError.value = 'Não foi possível carregar um dos perfis. Verifique os SteamID64 e tente novamente.' }
  finally { loading.value = false }
}
</script>

<style scoped>
.page-compare { max-width: 1120px; margin: 0 auto; padding-bottom: 4rem; }
.compare-header { margin: 2.5rem 0 2rem; max-width: 680px; }
.compare-header h1 { margin: .35rem 0 .75rem; font-size: clamp(2rem, 5vw, 3.6rem); letter-spacing: -.05em; }
.compare-header p:last-child { color: var(--text-muted); font-size: 1.05rem; }
.compare-form { display: grid; grid-template-columns: 1fr auto 1fr auto; align-items: end; gap: 1rem; padding: 1.25rem; border: 1px solid var(--border); border-radius: 1rem; background: rgba(255,255,255,.03); }
.player-input { display: grid; gap: .5rem; } .player-input label { color: var(--text-soft); font-size: .78rem; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; }
.player-input input { width: 100%; padding: .85rem 1rem; border: 1px solid var(--border); border-radius: .65rem; background: var(--surface); color: var(--text); }
.window-input { display: grid; gap: .5rem; color: var(--text-soft); font-size: .78rem; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; }
.window-input select { min-width: 9rem; padding: .85rem .75rem; border: 1px solid var(--border); border-radius: .65rem; background: var(--surface); color: var(--text); font: inherit; text-transform: none; letter-spacing: normal; }
.compare-form button { padding: .85rem 1.1rem; border: 0; border-radius: .65rem; background: var(--tf2-red); color: #fff; font-weight: 700; cursor: pointer; } .compare-form button:disabled { opacity: .5; cursor: not-allowed; }
.versus { padding-bottom: .85rem; color: var(--tf2-red); font-weight: 800; font-size: .8rem; }
.swap-button { align-self: end; padding: .65rem .75rem; border: 1px solid var(--border); border-radius: .65rem; background: transparent; color: var(--text-muted); font-size: 1.1rem; cursor: pointer; }
.swap-button:hover, .swap-button:focus-visible { border-color: var(--tf2-red); color: var(--tf2-red); }
.form-error { margin: 1rem 0; color: #fca5a5; }
.clear-button { padding: .85rem 1.1rem; border: 1px solid var(--border); border-radius: .65rem; background: transparent; color: var(--text-muted); font-weight: 700; cursor: pointer; }
.clear-button:hover { color: var(--text); border-color: var(--text-muted); }
.comparison-summary { margin-top: 2rem; padding: 1.25rem 1.5rem; border-left: 3px solid var(--tf2-red); border-radius: 0 .75rem .75rem 0; background: rgba(255,79,60,.08); }
.comparison-summary p:last-child { margin: .35rem 0 0; color: var(--text-muted); }
.comparison-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; margin-top: 2rem; }
.comparison-card { display: flex; flex-direction: column; justify-content: space-between; gap: 1.5rem; padding: 1.5rem; border: 1px solid var(--border); border-radius: 1rem; background: var(--surface); }
.player-heading { display: flex; align-items: center; gap: 1rem; } .player-heading h2 { margin: .25rem 0; } .player-heading span { color: var(--text-muted); font-size: .8rem; }
.avatar-fallback { display: grid; place-items: center; width: 3.5rem; height: 3.5rem; flex: 0 0 auto; border-radius: 50%; background: rgba(255,79,60,.16); color: var(--tf2-red); font-weight: 800; }
.metrics-table-wrap { margin-top: 1rem; overflow-x: auto; border: 1px solid var(--border); border-radius: 1rem; background: var(--surface); }
.metrics-table { width: 100%; border-collapse: collapse; min-width: 560px; } .metrics-table caption { padding: 1.25rem 1.25rem .5rem; text-align: left; color: var(--text); font-size: 1.15rem; font-weight: 700; } .metrics-table th, .metrics-table td { padding: .9rem 1.25rem; border-bottom: 1px solid var(--border); text-align: right; } .metrics-table th:first-child, .metrics-table td:first-child { text-align: left; } .metrics-table tbody th { color: var(--text-muted); font-weight: 500; } .metrics-table td { font-variant-numeric: tabular-nums; } .metrics-table .is-winner { color: #86efac; font-weight: 800; }
.skeleton-card { min-height: 190px; } .skeleton-line { height: 1rem; border-radius: .35rem; background: rgba(255,255,255,.08); } .skeleton-line--xl { width: 60%; height: 2rem; } .skeleton-line--md { width: 35%; }
.empty-state { margin-top: 2rem; }
@media (max-width: 980px) { .compare-form { grid-template-columns: 1fr 1fr; } .swap-button { align-self: end; } .window-input { grid-column: span 2; } }
@media (max-width: 760px) { .compare-form { grid-template-columns: 1fr; } .versus { padding: 0; text-align: center; } .swap-button { justify-self: center; } .window-input { grid-column: auto; } .window-input select, .compare-form button { width: 100%; } .comparison-grid { grid-template-columns: 1fr; } }
</style>
