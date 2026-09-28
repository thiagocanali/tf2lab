<template>
  <div class="page-search">
    <Breadcrumbs :items="[{ label: copy.breadcrumb }]" />

    <header class="search-header">
      <p class="eyebrow"><span aria-hidden="true">⌕</span> {{ copy.eyebrow }}</p>
      <h1>{{ copy.title }}</h1>
      <p class="search-description">{{ copy.description }}</p>
    </header>

    <form class="search-form" :aria-busy="loading" @submit.prevent="onSubmit">
      <label class="sr-only" for="search-input">{{ copy.label }}</label>
      <span class="search-icon" aria-hidden="true">⌕</span>
      <input
        id="search-input"
        ref="searchInput"
        v-model="query"
        type="search"
        :placeholder="copy.placeholder"
        autocomplete="off"
        enterkeyhint="search"
        aria-describedby="search-help"
      >
      <button
        v-if="query"
        type="button"
        class="search-clear"
        :aria-label="copy.clear"
        @click="clearSearch"
      >
        {{ copy.clear }}
      </button>
      <button type="submit" :disabled="!query.trim() || loading">
        {{ loading ? copy.searching : copy.search }}
      </button>
    </form>
    <p id="search-help" class="search-help">
      {{ copy.help.split(' / ')[0] }} <kbd>/</kbd> {{ copy.help.split(' / ')[1] }}
    </p>

    <!-- Loading skeletons -->
    <div v-if="loading" class="results-grid" aria-busy="true" aria-live="polite">
      <div v-for="n in 4" :key="n" class="result-card result-card--skeleton result-card--player-skeleton">
        <div class="skeleton-line skeleton-line--avatar" />
        <div class="skeleton-line skeleton-line--name" />
        <div class="skeleton-line skeleton-line--meta" />
        <div class="skeleton-line skeleton-line--meta" />
      </div>
    </div>

    <!-- Results: players are the primary result, logs provide context -->
    <section v-else-if="searchError" class="empty-state empty-state--error" role="alert">
      <p class="empty-state__icon" aria-hidden="true">!</p>
      <h2>{{ copy.unavailable }}</h2>
      <p>{{ copy.unavailableText }}</p>
      <button type="button" class="action-link action-link--primary" @click="runSearch(lastQuery)">{{ copy.retry }}</button>
    </section>

    <section v-else-if="hasResults" class="result-groups" aria-live="polite">
      <section v-if="players.length" class="result-group result-group--players">
        <div class="result-group__header">
          <div>
            <p class="eyebrow">{{ copy.primary }}</p>
            <h2>{{ copy.players }}</h2>
          </div>
          <span class="result-group__count">{{ players.length }}</span>
        </div>

        <div class="results-grid">
          <article v-for="p in players" :key="p.id" class="result-card result-card--player">
            <div class="result-card__head">
              <div class="player-info">
                <div class="avatar-wrapper">
                  <img v-if="p.avatarUrl" :src="p.avatarUrl" :alt="`${p.name} avatar`" />
                  <div v-else class="avatar-fallback">{{ getInitials(p.name) }}</div>
                </div>
                <div>
                  <h2>{{ p.name }}</h2>
                  <span class="result-card__id">SteamID: {{ p.steamId }}</span>
                </div>
              </div>
              <span v-if="queryType === 'steamid'" class="badge badge--success">{{ copy.exact }}</span>
            </div>
            <div class="result-card__meta player-stats">
              <div class="stat" v-if="p.overview.matches">
                <span>{{ copy.matches }}</span>
                <strong>{{ p.overview.matches }}</strong>
              </div>
              <div class="stat" v-if="p.overview.kdRatio !== undefined">
                <span>K/D</span>
                <strong>{{ p.overview.kdRatio.toFixed(2) }}</strong>
              </div>
              <div class="stat" v-if="p.overview.totalKills">
                <span>{{ copy.kills }}</span>
                <strong>{{ p.overview.totalKills }}</strong>
              </div>
              <div class="stat" v-if="p.overview.totalDamage">
                <span>{{ copy.damage }}</span>
                <strong>{{ p.overview.totalDamage.toLocaleString() }}</strong>
              </div>
            </div>
            <div class="result-card__actions">
              <NuxtLink class="action-link action-link--primary" :to="`/player/${p.steamId ?? p.id}`">
                {{ copy.profile }}
              </NuxtLink>
            </div>
          </article>
        </div>
      </section>

      <section v-if="results.length" class="result-group result-group--logs">
        <div class="result-group__header">
          <div>
<p class="eyebrow">{{ copy.secondary }}</p>
          <h2>{{ copy.related }}</h2>
          </div>
          <span class="result-group__count">{{ results.length }}</span>
        </div>

        <p v-if="queryType === 'playername' && players.length === 0" class="player-search-hint">
          {{ copy.hint }}
        </p>

        <div class="results-grid results-grid--logs">
          <article v-for="r in results" :key="r.id" class="result-card">
            <div class="result-card__head">
              <h2>{{ r.title ?? ('Log ' + r.id) }}</h2>
              <span v-if="r.url" class="result-card__id">#{{ r.id }}</span>
            </div>
            <div class="result-card__meta">
              <span v-if="r.map">{{ copy.map }}: <strong>{{ r.map }}</strong></span>
              <span v-if="r.timestamp">• {{ formatDate(r.timestamp) }}</span>
            </div>
            <div class="result-card__actions">
              <NuxtLink class="action-link action-link--primary" :to="`/log/${r.id}`">
                {{ copy.viewLog }}
              </NuxtLink>
              <NuxtLink
                v-if="r.players?.[0]?.steamid || r.players?.[0]?.steamId"
                class="action-link"
                :to="`/player/${r.players[0].steamid ?? r.players[0].steamId}`"
              >
                {{ copy.playerProfile }}
              </NuxtLink>
              <a
                v-if="r.url"
                class="action-link"
                :href="r.url"
                target="_blank"
                rel="noopener noreferrer"
              >
                {{ copy.openLogs }}
              </a>
            </div>
          </article>
        </div>
      </section>
    </section>

    <!-- Empty state: searched but nothing found -->
    <section v-else-if="hasSearched" class="empty-state">
      <p class="empty-state__icon" aria-hidden="true">∅</p>
      <h2>{{ copy.noResults }} "{{ lastQuery }}"</h2>
      <p v-if="queryType === 'steamid'">
        {{ copy.emptySteamId }}
      </p>
      <p v-else-if="queryType === 'logid'">
        {{ copy.emptyLogId.replace('{id}', lastQuery) }}
      </p>
      <p v-else-if="queryType === 'playername'">
        {{ copy.emptyPlayer.replace('{name}', lastQuery) }}
      </p>
      <p v-else>
        {{ copy.tryDifferent }}
      </p>
      <div class="empty-state__suggestions">
        <p class="suggestions-label">{{ copy.suggestions }}</p>
        <div class="suggestion-list">
          <button type="button" @click="useSuggestion('76561198000000001')">{{ copy.steamIdExample }}: <code>76561198000000001</code></button>
          <button type="button" @click="useSuggestion('saxton')">{{ copy.playerNameExample }}: <code>saxton</code></button>
          <button type="button" @click="useSuggestion('3690111')">{{ copy.logIdExample }}: <code>3690111</code></button>
        </div>
      </div>
    </section>

    <!-- Initial state: never searched -->
    <section v-else class="empty-state">
      <p class="empty-state__icon" aria-hidden="true">⌕</p>
      <h2>{{ copy.archive }}</h2>
      <p>{{ copy.start }}</p>
      <div class="empty-state__suggestions">
        <p class="suggestions-label">{{ copy.examples }}</p>
        <div class="suggestion-list">
          <button type="button" @click="useSuggestion('76561198000000001')">{{ copy.steamIdExample }}: <code>76561198000000001</code></button>
          <button type="button" @click="useSuggestion('saxton')">{{ copy.playerNameExample }}: <code>saxton</code></button>
          <button type="button" @click="useSuggestion('3690111')">{{ copy.logIdExample }}: <code>3690111</code></button>
        </div>
      </div>
    </section>

    <!-- Pagination -->
    <nav v-if="!loading && totalPages > 1" class="pagination" :aria-label="copy.pagination">
              <button type="button" :disabled="page <= 1" @click="goToPage(page - 1)">{{ copy.previous }}</button>
              <span class="pagination__label" aria-live="polite">{{ copy.page }} {{ page }} {{ copy.of }} {{ totalPages }}</span>
              <button type="button" :disabled="page >= totalPages" @click="goToPage(page + 1)">{{ copy.next }}</button>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const { t, locale } = useLocale()
const copy = computed(() => t.value.search)
import useLogsService from '~~/features/analytics/services/logsService'
import type { PlayerLogReference } from '~~/features/player/types'

// `useRoute` and `useRouter` are auto-imported by Nuxt.

const PER_PAGE = 10
const DEFAULT_PAGE = 1

const route = useRoute()
const router = useRouter()
const service = useLogsService()

const searchInput = ref<HTMLInputElement | null>(null)
const query = ref<string>(typeof route.query.q === 'string' ? route.query.q : '')
const results = ref<any[]>([])
const players = ref<any[]>([])
const loading = ref<boolean>(false)
const page = ref<number>(readPageFromRoute())
const total = ref<number>(0)
const hasSearched = ref<boolean>(false)
const lastQuery = ref<string>('')
const queryType = ref<string>('')
const searchError = ref(false)
let searchRequestId = 0

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / PER_PAGE)))

const hasResults = computed(() => results.value.length > 0 || players.value.length > 0)

function readPageFromRoute(): number {
  const raw = Number(route.query.page ?? DEFAULT_PAGE)
  return Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_PAGE
}

function formatDate(timestamp: string): string {
  try {
    const language = locale.value === 'pt' ? 'pt-BR' : 'en-US'
    return new Intl.DateTimeFormat(language, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(timestamp))
  } catch {
    return timestamp
  }
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  const initials = parts.map((part) => part[0]).slice(0, 2).join('').toUpperCase()
  return initials || '?'
}

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return String(num)
}

async function runSearch(term: string, targetPage: number = DEFAULT_PAGE) {
  const trimmed = term.trim()
  if (!trimmed) return

  const requestId = ++searchRequestId
  loading.value = true
  hasSearched.value = true
  lastQuery.value = trimmed
  searchError.value = false

  try {
    const res = await service.search(trimmed, targetPage, PER_PAGE)
    if (requestId !== searchRequestId) return

    results.value = (res?.results ?? res?.data ?? []) as any[]
    players.value = (res?.players ?? []) as any[]
    queryType.value = res?.queryType ?? ''
    page.value = res?.page ?? targetPage
    total.value = res?.total ?? results.value.length
  } catch {
    if (requestId !== searchRequestId) return

    results.value = []
    players.value = []
    total.value = 0
    searchError.value = true
  } finally {
    if (requestId === searchRequestId) loading.value = false
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
  syncRouteQuery(term, DEFAULT_PAGE)
}

function clearSearch() {
  query.value = ''
  results.value = []
  players.value = []
  total.value = 0
  hasSearched.value = false
  lastQuery.value = ''
  queryType.value = ''
  searchError.value = false
  syncRouteQuery('', DEFAULT_PAGE)
}

function useSuggestion(term: string) {
  query.value = term
  syncRouteQuery(term, DEFAULT_PAGE)
}

function goToPage(targetPage: number) {
  if (targetPage < 1 || targetPage > totalPages.value) return
  syncRouteQuery(query.value.trim(), targetPage)
  if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
}

watch(
  () => [route.query.q, route.query.page],
  ([newQ, newPage]) => {
    const next = typeof newQ === 'string' ? newQ : ''
    const nextPage = Number(newPage ?? DEFAULT_PAGE)
    page.value = Number.isFinite(nextPage) && nextPage > 0 ? nextPage : DEFAULT_PAGE

    if (next !== query.value) query.value = next
    if (next.trim()) runSearch(next, page.value)
  }
)

function handleSearchShortcut(event: KeyboardEvent) {
  const target = event.target as HTMLElement | null
  const isTyping = target?.matches('input, textarea, select, [contenteditable="true"]')

  if (event.key === '/' && !isTyping) {
    event.preventDefault()
    searchInput.value?.focus()
  }

  if (event.key === 'Escape' && document.activeElement === searchInput.value && query.value) {
    clearSearch()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleSearchShortcut)
  if (query.value.trim()) runSearch(query.value, page.value)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleSearchShortcut)
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
.search-help {
  margin: -0.65rem 0 0;
  color: var(--text-muted);
  font-size: 0.78rem;
}
.search-help kbd {
  display: inline-flex;
  min-width: 1.35rem;
  justify-content: center;
  padding: 0.08rem 0.3rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-bottom-width: 2px;
  border-radius: 0.3rem;
  color: var(--text-soft);
  font: inherit;
  font-weight: 700;
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
.search-form .search-clear {
  padding: 0.55rem 0.7rem;
  background: transparent;
  color: var(--text-muted);
  font-size: 0.8rem;
  font-weight: 700;
}
.search-form .search-clear:hover { background: rgba(255, 255, 255, 0.08); color: var(--text); transform: none; }
.search-form input:focus-visible,
.search-form button:focus-visible,
.pagination button:focus-visible,
.action-link:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--space-md);
}

.result-groups {
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
}

.result-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.result-group--players {
  padding: var(--space-md);
  border: 1px solid rgba(255, 79, 60, 0.18);
  border-left: 3px solid var(--tf2-red);
  border-radius: 8px;
  background: linear-gradient(105deg, rgba(255, 59, 48, 0.08), rgba(18, 20, 32, 0.22) 62%);
}

.result-group__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
}

.result-group__header .eyebrow {
  margin-bottom: 0.25rem;
  color: var(--tf2-orange);
}

.result-group__header h2 {
  margin: 0;
  color: var(--text);
  font-size: 1.2rem;
}

.result-group__count {
  display: inline-flex;
  min-width: 2rem;
  justify-content: center;
  padding: 0.3rem 0.5rem;
  border: 1px solid rgba(58, 128, 255, 0.32);
  border-radius: 5px;
  background: rgba(58, 128, 255, 0.12);
  color: #a9c7ff;
  font-size: 0.78rem;
  font-weight: 800;
}

.results-grid--logs {
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
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
  border-color: rgba(255, 155, 51, 0.28);
  background: linear-gradient(180deg, rgba(30, 34, 48, 0.98), rgba(18, 20, 32, 0.98));
}
.result-card--player:hover { border-color: rgba(255, 155, 51, 0.62); }

.player-info {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}
.avatar-wrapper {
  width: 56px;
  height: 56px;
  border-radius: 8px;
  overflow: hidden;
  background: linear-gradient(135deg, rgba(255, 79, 60, 0.22), rgba(58, 128, 255, 0.22));
  border: 1px solid rgba(255, 155, 51, 0.45);
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

.player-stats {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-md);
  color: var(--text-soft);
  font-size: 0.85rem;
}
.player-stats .stat {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}
.player-stats .stat strong {
  color: var(--text);
  font-size: 0.9rem;
  font-weight: 700;
}

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
.result-card--player-skeleton {
  padding: var(--space-lg);
}
.skeleton-line {
  height: 0.75rem;
  border-radius: 0.5rem;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.05));
  background-size: 200% 100%;
  animation: shimmer 1.4s linear infinite;
}
.skeleton-line--lg { height: 1.2rem; width: 60%; }
.skeleton-line--sm { width: 35%; }
.skeleton-line--avatar { height: 48px; width: 48px; border-radius: 12px; }
.skeleton-line--name { height: 1.3rem; width: 45%; }
.skeleton-line--meta { height: 0.85rem; width: 30%; }
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
.empty-state--error .empty-state__icon { color: var(--tf2-orange); }
.empty-state h2 { margin: 0; font-size: var(--font-size-xl); color: var(--text); }
.empty-state p { margin: 0; color: var(--text-soft); }
.player-search-hint { margin: 0; color: var(--text-soft); font-size: 0.9rem; }

.empty-state__suggestions {
  margin-top: var(--space-md);
  width: 100%;
  max-width: 400px;
  text-align: left;
}
.empty-state__suggestions .suggestions-label {
  margin: 0 0 var(--space-sm);
  color: var(--text-soft);
  font-size: 0.85rem;
  font-weight: 600;
}
.suggestion-list {
  display: grid;
  gap: 0.5rem;
}
.suggestion-list button {
  width: 100%;
  padding: 0.6rem 0.9rem;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.03);
  color: var(--text);
  font: inherit;
  font-size: 0.9rem;
  text-align: left;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
}
.suggestion-list button:hover,
.suggestion-list button:focus-visible {
  background: rgba(255, 79, 60, 0.08);
  border-color: rgba(255, 79, 60, 0.2);
}
.suggestion-list button:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
.empty-state__suggestions code {
  font-family: var(--font-family-mono);
  color: var(--accent);
  background: rgba(255, 79, 60, 0.1);
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
}

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
  .result-groups { gap: var(--space-lg); }
  .result-group--players { padding: var(--space-sm); }
  .result-group__header { align-items: flex-start; }
  .results-grid,
  .results-grid--logs { grid-template-columns: minmax(0, 1fr); }
  .result-card { min-width: 0; padding: var(--space-md); }
  .result-card__actions .action-link { flex: 1 1 100%; justify-content: center; }
}
</style>
