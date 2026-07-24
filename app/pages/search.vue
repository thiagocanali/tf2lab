<template>
  <div class="page-search">
    <Breadcrumbs :items="[{ label: 'Search' }]" />

    <header class="search-header">
      <p class="eyebrow"><span aria-hidden="true">⌕</span> TF2Lab search</p>
      <h1>Find a log.</h1>
      <p class="search-description">
        Search by SteamID, player name, or logs.tf log ID.
      </p>
    </header>

    <form class="search-form" @submit.prevent="onSubmit">
      <label class="sr-only" for="search-input">Search</label>
      <span class="search-icon" aria-hidden="true">⌕</span>
      <input
        id="search-input"
        v-model="query"
        type="search"
        placeholder="SteamID, player, or log ID"
        autocomplete="off"
      >
      <button type="submit" :disabled="!query.trim() || loading">
        {{ loading ? 'Searching...' : 'Search' }}
      </button>
    </form>

    <!-- Loading skeletons -->
    <div v-if="loading" class="results-grid" aria-busy="true" aria-live="polite">
      <div v-for="n in 3" :key="n" class="result-card result-card--skeleton">
        <div class="skeleton-line skeleton-line--lg" />
        <div class="skeleton-line" />
        <div class="skeleton-line skeleton-line--sm" />
      </div>
    </div>

    <!-- Results: Players first (priority), then logs -->
    <section v-else-if="hasResults" class="results-grid" aria-live="polite">
      <!-- Player Results (priority) -->
      <article v-for="p in players" :key="p.id" class="result-card result-card--player">
        <div class="result-card__head">
          <div class="player-info">
            <div class="avatar-wrapper">
              <img v-if="p.avatarUrl" :src="p.avatarUrl" alt="" />
              <div v-else class="avatar-fallback">{{ getInitials(p.name) }}</div>
            </div>
            <div>
              <h2>{{ p.name }}</h2>
              <span class="result-card__id">SteamID: {{ p.steamId }}</span>
            </div>
          </div>
          <span v-if="queryType === 'steamid'" class="badge badge--success">Exact match</span>
        </div>
        <div class="result-card__meta">
          <span v-if="p.overview.matches">Matches: <strong>{{ p.overview.matches }}</strong></span>
          <span v-if="p.overview.kdRatio">• K/D: <strong>{{ p.overview.kdRatio.toFixed(2) }}</strong></span>
        </div>
        <div class="result-card__actions">
          <NuxtLink class="action-link action-link--primary" :to="`/player/${p.steamId ?? p.id}`">
            View player profile
          </NuxtLink>
        </div>
      </article>

      <!-- Log Results -->
      <article v-for="r in results" :key="r.id" class="result-card">
        <div class="result-card__head">
          <h2>{{ r.title ?? ('Log ' + r.id) }}</h2>
          <span v-if="r.url" class="result-card__id">#{{ r.id }}</span>
        </div>
        <div class="result-card__meta">
          <span v-if="r.map">Map: <strong>{{ r.map }}</strong></span>
          <span v-if="r.timestamp">• {{ formatDate(r.timestamp) }}</span>
        </div>
        <div class="result-card__actions">
          <NuxtLink class="action-link action-link--primary" :to="`/log/${r.id}`">
            View log
          </NuxtLink>
          <NuxtLink
            v-if="r.players?.[0]?.steamid || r.players?.[0]?.steamId"
            class="action-link"
            :to="`/player/${r.players[0].steamid ?? r.players[0].steamId}`"
          >
            Player profile
          </NuxtLink>
          <a
            v-if="r.url"
            class="action-link"
            :href="r.url"
            target="_blank"
            rel="noopener noreferrer"
          >
            Open on logs.tf ↗
          </a>
        </div>
      </article>
    </section>

    <!-- Empty state: searched but nothing found -->
    <section v-else-if="hasSearched" class="empty-state">
      <p class="empty-state__icon" aria-hidden="true">∅</p>
      <h2>No results for "{{ lastQuery }}"</h2>
      <p v-if="queryType === 'steamid'">
        This SteamID64 wasn't found in logs.tf. Make sure it's a valid 17-digit SteamID64 (starts with 7656119).
      </p>
      <p v-else-if="queryType === 'logid'">
        Log ID <code>{{ lastQuery }}</code> not found on logs.tf.
      </p>
      <p v-else-if="queryType === 'playername'">
        No logs found for player "<strong>{{ lastQuery }}</strong>". Try their SteamID64 for better results.
      </p>
      <p v-else>
        Try a different SteamID, player name, or log ID.
      </p>
      <div class="empty-state__suggestions" v-if="queryType !== 'empty'">
        <p class="suggestions-label">Suggestions:</p>
        <ul>
          <li>SteamID64: <code>76561198000000001</code></li>
          <li>Player name: <code>saxton</code></li>
          <li>Log ID: <code>1234567</code></li>
        </ul>
      </div>
    </section>

    <!-- Initial state: never searched -->
    <section v-else class="empty-state">
      <p class="empty-state__icon" aria-hidden="true">⌕</p>
      <h2>Search the TF2Lab log archive</h2>
      <p>Enter a SteamID, player name, or logs.tf log ID above to start.</p>
      <div class="empty-state__suggestions">
        <p class="suggestions-label">Try searching for:</p>
        <ul>
          <li>SteamID64: <code>76561198000000001</code></li>
          <li>Player name: <code>saxton</code></li>
          <li>Log ID: <code>1234567</code></li>
        </ul>
      </div>
    </section>

    <!-- Pagination -->
    <nav v-if="!loading && totalPages > 1" class="pagination" aria-label="Pagination">
      <button :disabled="page <= 1" @click="goToPage(page - 1)">← Previous</button>
      <span class="pagination__label">Page {{ page }} of {{ totalPages }}</span>
      <button :disabled="page >= totalPages" @click="goToPage(page + 1)">Next →</button>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import useLogsService from '~~/features/analytics/services/logsService'
import type { PlayerLogReference } from '~~/features/player/types'

// `useRoute` and `useRouter` are auto-imported by Nuxt.

const PER_PAGE = 10
const DEFAULT_PAGE = 1

const route = useRoute()
const router = useRouter()
const service = useLogsService()

const query = ref<string>(typeof route.query.q === 'string' ? route.query.q : '')
const results = ref<any[]>([])
const players = ref<any[]>([])
const loading = ref<boolean>(false)
const page = ref<number>(readPageFromRoute())
const total = ref<number>(0)
const hasSearched = ref<boolean>(false)
const lastQuery = ref<string>('')
const queryType = ref<string>('')

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / PER_PAGE)))

const hasResults = computed(() => results.value.length > 0 || players.value.length > 0)

function readPageFromRoute(): number {
  const raw = Number(route.query.page ?? DEFAULT_PAGE)
  return Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_PAGE
}

function formatDate(timestamp: string): string {
  try {
    return new Date(timestamp).toLocaleString()
  } catch {
    return timestamp
  }
}

function getInitials(name: string): string {
  const parts = name.split(' ')
  return parts.map((part) => part[0]).slice(0, 2).join('').toUpperCase()
}

async function runSearch(term: string, targetPage: number = DEFAULT_PAGE) {
  const trimmed = term.trim()
  if (!trimmed) return

  loading.value = true
  hasSearched.value = true
  lastQuery.value = trimmed

  try {
    const res = await service.search(trimmed, targetPage, PER_PAGE)
    results.value = (res?.results ?? res?.data ?? []) as any[]
    players.value = (res?.players ?? []) as any[]
    queryType.value = res?.queryType ?? ''
    page.value = res?.page ?? targetPage
    total.value = res?.total ?? results.value.length
  } catch (err) {
    results.value = []
    players.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

function syncRouteQuery(term: string, targetPage: number) {
  router.replace({
    query: {
      ...route.query,
      q: term || undefined,
      page: targetPage > 1 ? String(targetPage) : undefined
    }
  })
}

function onSubmit() {
  const term = query.value.trim()
  if (!term) return
  page.value = DEFAULT_PAGE
  syncRouteQuery(term, DEFAULT_PAGE)
  runSearch(term, DEFAULT_PAGE)
}

function goToPage(targetPage: number) {
  if (targetPage < 1 || targetPage > totalPages.value) return
  page.value = targetPage
  syncRouteQuery(query.value.trim(), targetPage)
  runSearch(query.value, targetPage)
  if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
}

watch(
  () => route.query.q,
  (newQ) => {
    const next = typeof newQ === 'string' ? newQ : ''
    if (next === query.value) return
    query.value = next
    if (next.trim()) runSearch(next, page.value)
  }
)

onMounted(() => {
  if (query.value.trim()) runSearch(query.value, page.value)
})
</script>

<style scoped>
.page-search {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
  padding: clamp(1rem, 3vw, 2rem) 0;
}

.search-header { display: flex; flex-direction: column; gap: var(--space-sm); }
.eyebrow {
  display: flex;
  gap: 0.45rem;
  align-items: center;
  margin: 0;
  color: var(--accent-soft);
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.13em;
  text-transform: uppercase;
}
.eyebrow span { font-size: 1rem; }
.search-header h1 {
  margin: 0;
  font-size: clamp(2.4rem, 5vw, 4rem);
  letter-spacing: -0.06em;
  line-height: 0.95;
}
.search-description {
  margin: 0;
  color: var(--text-soft);
  font-size: 1rem;
  max-width: 36rem;
}

.search-form {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.55rem 0.55rem 0.55rem 1.1rem;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 1.1rem;
  background: rgba(7, 8, 13, 0.68);
  box-shadow: 0 16px 50px rgba(0, 0, 0, 0.24);
}
.search-icon { color: var(--accent-soft); font-size: 1.6rem; line-height: 1; transform: rotate(-18deg); }
.search-form input {
  min-width: 0;
  flex: 1;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--text);
  font-size: 1rem;
}
.search-form input::placeholder { color: var(--text-muted); }
.search-form button {
  border: 0;
  border-radius: 0.78rem;
  padding: 0.85rem 1.15rem;
  background: var(--accent);
  color: #160807;
  font-weight: 800;
  cursor: pointer;
  transition: transform 0.2s ease, background 0.2s ease, opacity 0.2s ease;
}
.search-form button:hover:not(:disabled) { background: #ff765d; transform: translateY(-1px); }
.search-form button:disabled { cursor: not-allowed; opacity: 0.45; }

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--space-md);
}

.result-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  padding: var(--space-lg);
  border: 1px solid rgba(255, 79, 60, 0.12);
  border-radius: var(--radius);
  background: linear-gradient(180deg, rgba(18, 20, 32, 0.95), rgba(28, 34, 52, 0.95));
  box-shadow: var(--shadow-soft);
  transition: transform 0.2s ease, border-color 0.2s ease;
}
.result-card:hover { transform: translateY(-2px); border-color: rgba(255, 79, 60, 0.32); }

.result-card--player {
  border-color: rgba(0, 200, 81, 0.2);
  background: linear-gradient(180deg, rgba(18, 20, 32, 0.98), rgba(28, 34, 52, 0.98));
}
.result-card--player:hover { border-color: rgba(0, 200, 81, 0.4); }

.player-info {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}
.avatar-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.08);
  flex-shrink: 0;
}
.avatar-wrapper img { width: 100%; height: 100%; object-fit: cover; }
.avatar-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text);
  font-weight: 700;
  font-size: 1.1rem;
}
.player-info h2 { margin: 0; font-size: var(--font-size-lg); color: var(--text); }
.player-info .result-card__id { font-size: 0.75rem; }

.result-card__head { display: flex; align-items: center; justify-content: space-between; gap: var(--space-sm); flex-wrap: wrap; }
.result-card__head h2 { margin: 0; font-size: var(--font-size-xl); color: var(--text); }
.result-card__id { color: var(--text-muted); font-family: var(--font-family-mono); font-size: 0.85rem; }
.result-card__meta { display: flex; flex-wrap: wrap; gap: 0.5rem; color: var(--text-soft); font-size: 0.9rem; }
.result-card__actions { display: flex; flex-wrap: wrap; gap: 0.75rem; margin-top: var(--space-xs); }

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
  transition: background 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
}
.action-link:hover { background: rgba(255, 79, 60, 0.16); border-color: rgba(255, 79, 60, 0.32); transform: translateY(-1px); }
.action-link--primary { background: var(--accent); color: #160807; border-color: transparent; }
.action-link--primary:hover { background: #ff765d; color: #160807; }

.result-card--skeleton { gap: 0.85rem; }
.skeleton-line {
  height: 0.75rem;
  border-radius: 0.5rem;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.05));
  background-size: 200% 100%;
  animation: shimmer 1.4s linear infinite;
}
.skeleton-line--lg { height: 1.2rem; width: 60%; }
.skeleton-line--sm { width: 35%; }
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

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
.empty-state p { margin: 0; color: var(--text-soft); }

.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
  padding-top: var(--space-sm);
}
.pagination button {
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 999px;
  padding: 0.6rem 1.1rem;
  background: rgba(255, 255, 255, 0.04);
  color: var(--text);
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease;
}
.pagination button:hover:not(:disabled) { background: rgba(255, 79, 60, 0.16); border-color: rgba(255, 79, 60, 0.32); }
.pagination button:disabled { cursor: not-allowed; opacity: 0.4; }
.pagination__label { color: var(--text-soft); font-size: 0.9rem; }

.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.badge--success {
  background: rgba(0, 200, 81, 0.16);
  color: #6ef59e;
  border: 1px solid rgba(0, 200, 81, 0.3);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (max-width: 520px) {
  .search-form { flex-wrap: wrap; padding: 0.7rem; }
  .search-form input { min-height: 2.6rem; }
  .search-form button { width: 100%; }
  .pagination { flex-direction: column; }
}
</style>
