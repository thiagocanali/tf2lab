<template>
  <Card class="logs-list-card">
    <div class="header-row">
      <div>
        <p class="eyebrow">Recent logs</p>
        <h3>Partidas analisadas</h3>
      </div>

      <div class="limit-selector" role="tablist" aria-label="Quantidade de logs por página">
        <button
          v-for="option in limitOptions"
          :key="option"
          type="button"
          class="limit-button"
          :class="{ active: option === limit }"
          @click="emit('update:limit', option)"
        >
          {{ option }}
        </button>
      </div>
    </div>

    <div class="summary-row">
      <span>{{ logs.length }} logs</span>
      <span class="meta">Padrão: 10</span>
    </div>

    <ul v-if="logs.length" class="log-items">
      <li v-for="log in logs" :key="log.id">
        <div class="log-copy">
          <strong>{{ log.title ?? log.id }}</strong>
          <div class="details">{{ log.map ?? 'Unknown map' }} • {{ date(log.timestamp) }}</div>
          <div class="performance">{{ log.kills ?? 0 }} K · {{ log.deaths ?? 0 }} D · {{ number(log.damage) }} dmg</div>
        </div>
        <NuxtLink class="log-link" :to="`/log/${log.id}`" :aria-label="`Open log ${log.id}`">Open log →</NuxtLink>
      </li>
    </ul>

    <p v-else class="empty-logs">No public logs were available for this player.</p>
  </Card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PlayerLogReference } from '~~/features/player/types'

const props = defineProps<{ logs: PlayerLogReference[]; limit?: number }>()
const emit = defineEmits<{ 'update:limit': [value: number] }>()

const limit = computed(() => props.limit ?? 10)
const limitOptions = [5, 10, 20, 50]

const date = (value?: string) => value ? new Date(value).toLocaleDateString() : 'Date unavailable'
const number = (value?: number) => new Intl.NumberFormat('en-US').format(value ?? 0)
</script>

<style scoped>
.logs-list-card {
  background: rgba(24, 29, 45, 0.95);
  border: 1px solid rgba(255, 79, 60, 0.12);
  border-radius: var(--radius);
  padding: var(--space-md);
  height: 100%;
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-md);
  margin-bottom: var(--space-sm);
}

.eyebrow {
  margin: 0 0 0.35rem;
  color: var(--text-soft);
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.header-row h3 {
  margin: 0;
  color: var(--text);
  font-size: 1.1rem;
}

.limit-selector {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 999px;
  padding: 0.35rem;
}

.limit-button {
  border: 0;
  background: transparent;
  color: var(--text-soft);
  cursor: pointer;
  border-radius: 999px;
  padding: 0.45rem 0.7rem;
  min-width: 2.75rem;
  font-weight: 700;
  transition: all 0.2s ease;
}

.limit-button.active {
  background: linear-gradient(135deg, var(--tf2-red), var(--tf2-orange));
  color: white;
  box-shadow: 0 12px 22px rgba(255, 79, 60, 0.2);
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-sm);
  color: var(--text-soft);
  font-size: 0.85rem;
}

.meta {
  opacity: 0.8;
}

.log-items {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 0.75rem;
}

.log-items li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-md);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 14px;
  padding: var(--space-sm) var(--space-md);
}

.log-copy {
  min-width: 0;
}

.log-copy strong {
  color: var(--text);
  display: block;
}

.details,
.empty-logs {
  color: var(--text-soft);
  font-size: 0.85rem;
  margin: 0.25rem 0 0;
}

.performance {
  font-size: 0.85rem;
  margin-top: 0.35rem;
  color: var(--text-soft);
}

.log-link {
  color: var(--accent);
  font-weight: 700;
  white-space: nowrap;
}

@media (max-width: 640px) {
  .header-row,
  .log-items li {
    flex-direction: column;
    align-items: flex-start;
  }

  .limit-selector {
    width: 100%;
    justify-content: space-between;
  }
}
</style>