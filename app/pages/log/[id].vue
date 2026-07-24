<template>
  <div class="page-log">
    <Breadcrumbs :items="breadcrumbs" />
    <BackButton fallback="/search" label="Back to search" />

    <div v-if="pending" class="log-skeleton" aria-busy="true" aria-live="polite">
      <div class="skeleton-line skeleton-line--lg" />
      <div class="skeleton-line" />
      <div class="skeleton-line skeleton-line--md" />
      <div class="skeleton-line skeleton-line--sm" />
    </div>

    <LogDetail v-else-if="data" :data="data" />

    <section v-else class="empty-state" role="alert">
      <p class="empty-state__icon" aria-hidden="true">∅</p>
      <h2>Log not found</h2>
      <p>
        We couldn't load log <code>#{{ id }}</code>.
        {{ errorMessage ? `Reason: ${errorMessage}` : 'Please check the ID and try again.' }}
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
import LogDetail from '~~/features/search/components/LogDetail.vue'
import Breadcrumbs from '~~/components/Breadcrumbs.vue'
import BackButton from '~~/components/BackButton.vue'
import type { LogData } from '~~/features/analytics/types'

// `useRoute`, `useAsyncData`, `$fetch` are auto-imported by Nuxt.

const route = useRoute()
const id = String(route.params.id ?? '')

const { data: res, pending, error } = await useAsyncData(
  `log-${id}`,
  () => $fetch(`/api/log/${encodeURIComponent(id)}`)
)

const data = computed<LogData | undefined>(() => {
  const payload = res.value as { data?: LogData } | null | undefined
  return payload?.data
})

const errorMessage = computed<string | null>(() => {
  if (!error.value) return null
  const e = error.value as { message?: string; statusMessage?: string }
  return e?.statusMessage ?? e?.message ?? String(error.value)
})

const breadcrumbs = computed(() => [
  { label: 'Search', to: '/search' },
  { label: data.value?.title ?? `Log ${id}` }
])
</script>

<style scoped>
.page-log {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
  padding: clamp(1rem, 3vw, 2rem) 0;
}

.log-skeleton {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  padding: var(--space-lg);
  border: 1px solid rgba(255, 79, 60, 0.12);
  border-radius: var(--radius);
  background: rgba(18, 20, 32, 0.5);
  min-height: 200px;
}
.skeleton-line {
  height: 0.75rem;
  border-radius: 0.5rem;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.05));
  background-size: 200% 100%;
  animation: shimmer 1.4s linear infinite;
}
.skeleton-line--lg { height: 1.4rem; width: 55%; }
.skeleton-line--md { width: 70%; }
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
</style>
