<template>
  <div class="page-compare">
    <Breadcrumbs :items="[{ label: t.compare.breadcrumb }]" />

    <header class="compare-header">
      <p class="eyebrow">{{ t.compare.eyebrow }}</p>
      <h1>{{ t.compare.title }}</h1>
      <p>{{ t.compare.description }}</p>
    </header>

    <form class="compare-form" @submit.prevent="comparePlayers">
      <div class="player-input player-picker">
        <label for="player-a">{{ t.compare.playerA }}</label>
        <input id="player-a" v-model.trim="playerAQuery" inputmode="search" placeholder="Nome ou SteamID64" autocomplete="off" role="combobox" :aria-expanded="activePicker === 'a' && suggestions.length > 0" aria-controls="player-a-suggestions" :aria-invalid="Boolean(formError && !isValidSteamId(playerAId))" @focus="activePicker = 'a'; searchPlayers(playerAQuery)" @input="onPlayerInput('a')" @keydown.esc="closeSuggestions">
        <div v-if="activePicker === 'a' && suggestions.length" id="player-a-suggestions" class="player-suggestions" role="listbox">
          <button v-for="player in suggestions" :key="player.steamId" type="button" role="option" class="player-suggestion" @click="selectPlayer('a', player)">
            <span class="suggestion-avatar">{{ initials(player.name) }}</span><span><strong>{{ player.name }}</strong><small>{{ player.steamId }}</small></span>
          </button>
        </div>
      </div>
      <button type="button" class="swap-button" aria-label="Trocar jogadores de posição" @click="swapPlayers">↔</button>
      <div class="player-input player-picker">
        <label for="player-b">{{ t.compare.playerB }}</label>
        <input id="player-b" v-model.trim="playerBQuery" inputmode="search" placeholder="Nome ou SteamID64" autocomplete="off" role="combobox" :aria-expanded="activePicker === 'b' && suggestions.length > 0" aria-controls="player-b-suggestions" :aria-invalid="Boolean(formError && !isValidSteamId(playerBId))" @focus="activePicker = 'b'; searchPlayers(playerBQuery)" @input="onPlayerInput('b')" @keydown.esc="closeSuggestions">
        <div v-if="activePicker === 'b' && suggestions.length" id="player-b-suggestions" class="player-suggestions" role="listbox">
          <button v-for="player in suggestions" :key="player.steamId" type="button" role="option" class="player-suggestion" @click="selectPlayer('b', player)">
            <span class="suggestion-avatar">{{ initials(player.name) }}</span><span><strong>{{ player.name }}</strong><small>{{ player.steamId }}</small></span>
          </button>
        </div>
      </div>
      <label class="window-input" for="comparison-window">
        <span>{{ t.compare.window }}</span>
        <select id="comparison-window" v-model="comparisonWindow">
          <option v-for="option in windowOptions" :key="option" :value="option">{{ t.compare.games.replace('{n}', String(option)) }}</option>
        </select>
      </label>
      <button type="submit" :disabled="!canCompare || loading">{{ loading ? t.compare.comparing : t.compare.compare }}</button>
      <button v-if="profiles.length === 2" type="button" class="clear-button" @click="clearComparison">{{ t.compare.clear }}</button>
    </form>

    <p v-if="formError" class="form-error" role="alert">{{ formError }}</p>

    <section v-if="loading" class="comparison-grid" aria-busy="true" :aria-label="t.compare.loading">
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
              <p class="eyebrow">{{ index === 0 ? t.compare.playerA : t.compare.playerB }}</p>
              <h2>{{ profile.name }}</h2>
              <span>{{ profile.steamId }}</span>
            </div>
          </div>
          <NuxtLink class="action-link" :to="`/player/${profile.steamId}`">{{ t.compare.fullProfile }}</NuxtLink>
        </article>
      </div>

      <div class="comparison-summary" aria-label="Resumo da comparação">
        <p class="eyebrow">{{ t.compare.summary }}</p>
        <p><strong>{{ profiles[0].name }}</strong> {{ t.compare.leads }} <strong>{{ winningMetrics(0) }}</strong>, enquanto <strong>{{ profiles[1].name }}</strong> {{ t.compare.leads }} <strong>{{ winningMetrics(1) }}</strong>.</p>
      </div>

      <div class="metrics-table-wrap">
        <table class="metrics-table">
          <caption>{{ t.compare.table }}</caption>
          <thead><tr><th scope="col">{{ t.compare.metric }}</th><th scope="col">{{ profiles[0].name }}</th><th scope="col">{{ profiles[1].name }}</th></tr></thead>
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
      <h2>{{ t.compare.choose }}</h2>
      <p>{{ t.compare.chooseText }}</p>
      <div class="empty-state__suggestions">
        <p class="suggestions-label">{{ t.compare.example }}</p>
        <button type="button" @click="playerAId = '76561198000000001'; playerBId = '76561198000000002'">{{ t.compare.loadExample }}</button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

const { t } = useLocale()

interface Profile { name: string; steamId: string; overview?: Record<string, number> }
interface PlayerSuggestion { name: string; steamId: string; avatarUrl?: string }
interface Metric { key: string; label: string; decimals?: number }

const route = useRoute()
const router = useRouter()
const initialQuery = route.query
const playerAId = ref(typeof initialQuery.a === 'string' ? initialQuery.a : '')
const playerBId = ref(typeof initialQuery.b === 'string' ? initialQuery.b : '')
const playerAQuery = ref(playerAId.value)
const playerBQuery = ref(playerBId.value)
const suggestions = ref<PlayerSuggestion[]>([])
const activePicker = ref<'a' | 'b' | null>(null)
let searchRequest = 0
const profiles = ref<Profile[]>([])
const loading = ref(false)
const windowOptions = [10, 25, 50]
const queryWindow = Number(initialQuery.window)
const comparisonWindow = ref(windowOptions.includes(queryWindow) ? queryWindow : 25)
const formError = ref('')
const isValidSteamId = (id: string) => /^7656119\d{10}$/.test(id)
const canCompare = computed(() => isValidSteamId(playerAId.value) && isValidSteamId(playerBId.value) && playerAId.value !== playerBId.value)
  const metrics = computed<Metric[]>(() => [
    { key: 'matches', label: t.value.compare.matches },
    { key: 'kdRatio', label: 'K/D', decimals: 2 },
    { key: 'totalKills', label: t.value.compare.kills },
    { key: 'totalDeaths', label: t.value.compare.deaths },
    { key: 'totalDamage', label: t.value.compare.damage },
    { key: 'totalHeals', label: t.value.compare.heals }
  ])

function initials(name: string) { return name.split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase() || '?' }
function value(profile: Profile, key: string) { return Number(profile.overview?.[key] ?? 0) }

function onPlayerInput(side: 'a' | 'b') {
  const query = side === 'a' ? playerAQuery.value : playerBQuery.value
  if (side === 'a') playerAId.value = query
  else playerBId.value = query
  activePicker.value = side
  void searchPlayers(query)
}

async function searchPlayers(query: string) {
  const normalized = query.trim()
  if (normalized.length < 2) { suggestions.value = []; return }
  const requestId = ++searchRequest
  if (isValidSteamId(normalized)) {
    suggestions.value = [{ name: normalized, steamId: normalized }]
    return
  }
  try {
    const response = await $fetch<{ players?: PlayerSuggestion[] }>('/api/search', { method: 'POST', body: { query: normalized, perPage: 5 } })
    if (requestId === searchRequest) suggestions.value = (response.players ?? []).filter((player) => player.steamId !== (activePicker.value === 'a' ? playerBId.value : playerAId.value)).slice(0, 5)
  } catch { if (requestId === searchRequest) suggestions.value = [] }
}

function selectPlayer(side: 'a' | 'b', player: PlayerSuggestion) {
  if (side === 'a') { playerAId.value = player.steamId; playerAQuery.value = player.name }
  else { playerBId.value = player.steamId; playerBQuery.value = player.name }
  suggestions.value = []
  activePicker.value = null
}

function closeSuggestions() { activePicker.value = null; suggestions.value = [] }
function formatMetric(profile: Profile, metric: Metric) { const result = value(profile, metric.key); return metric.decimals ? result.toFixed(metric.decimals) : result.toLocaleString() }
function winnerClass(key: string, index: number) {
  const first = value(profiles.value[0], key); const second = value(profiles.value[1], key)
  if (first === second) return ''
  const lowerIsBetter = key === 'totalDeaths'
  const wins = lowerIsBetter ? (index === 0 ? first < second : second < first) : (index === 0 ? first > second : second > first)
  return wins ? 'is-winner' : ''
}

function winningMetrics(index: number) {
  return metrics.value.filter((metric) => winnerClass(metric.key, index) === 'is-winner').map((metric) => metric.label).join(', ') || t.value.compare.none
}

function swapPlayers() {
  const currentA = playerAId.value
  playerAId.value = playerBId.value
  playerBId.value = currentA
  const currentAQuery = playerAQuery.value
  playerAQuery.value = playerBQuery.value
  playerBQuery.value = currentAQuery
}

function clearComparison() {
  profiles.value = []
  formError.value = ''
  playerAId.value = ''
  playerBId.value = ''
  playerAQuery.value = ''
  playerBQuery.value = ''
  closeSuggestions()
  void router.replace({ query: {} })
}

async function comparePlayers() {
  if (!isValidSteamId(playerAId.value) || !isValidSteamId(playerBId.value)) {
    formError.value = t.value.compare.invalid
    return
  }
  if (playerAId.value === playerBId.value) {
    formError.value = t.value.compare.same
    return
  }
  loading.value = true; formError.value = ''; profiles.value = []
  try {
    const response = await Promise.all([playerAId.value, playerBId.value].map((id) => $fetch<Profile>(`/api/player/${encodeURIComponent(id)}`, { query: { limit: comparisonWindow.value } })))
    profiles.value = response
    await router.replace({ query: { a: playerAId.value, b: playerBId.value, window: String(comparisonWindow.value) } })
  } catch { formError.value = t.value.compare.failed }
  finally { loading.value = false }
}

onMounted(() => {
  if (canCompare.value) void comparePlayers()
})
</script>

<style scoped>
.page-compare { max-width: 1120px; margin: 0 auto; padding-bottom: 4rem; }
.compare-header { margin: 2.5rem 0 2rem; max-width: 680px; }
.compare-header h1 { margin: .35rem 0 .75rem; font-size: clamp(2rem, 5vw, 3.6rem); letter-spacing: -.05em; }
.compare-header p:last-child { color: var(--text-muted); font-size: 1.05rem; }
.compare-form { display: grid; grid-template-columns: 1fr auto 1fr auto; align-items: end; gap: 1rem; padding: 1.25rem; border: 1px solid var(--border); border-radius: 1rem; background: rgba(255,255,255,.03); }
.player-input { display: grid; gap: .5rem; } .player-input label { color: var(--text-soft); font-size: .78rem; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; }
.player-picker { position: relative; }
.player-input input { width: 100%; padding: .85rem 1rem; border: 1px solid var(--border); border-radius: .65rem; background: var(--surface); color: var(--text); }
.player-suggestions { position: absolute; z-index: 5; top: calc(100% + .35rem); right: 0; left: 0; overflow: hidden; border: 1px solid var(--border); border-radius: .7rem; background: var(--surface); box-shadow: 0 14px 30px rgba(0,0,0,.3); }
.player-suggestion { display: flex; width: 100%; align-items: center; gap: .7rem; padding: .7rem .8rem; border: 0; border-bottom: 1px solid var(--border); background: transparent; color: var(--text); text-align: left; cursor: pointer; }
.player-suggestion:last-child { border-bottom: 0; }
.player-suggestion:hover, .player-suggestion:focus-visible { background: rgba(255,79,60,.1); outline: 0; }
.player-suggestion span:last-child { display: grid; gap: .15rem; min-width: 0; }
.player-suggestion strong, .player-suggestion small { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.player-suggestion small { color: var(--text-muted); font-size: .72rem; }
.suggestion-avatar { display: grid; place-items: center; width: 2rem; height: 2rem; flex: 0 0 auto; border-radius: 50%; background: rgba(255,79,60,.16); color: var(--tf2-red); font-size: .7rem; font-weight: 800; }
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
