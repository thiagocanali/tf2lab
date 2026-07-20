<template>
  <Card class="logs-list-card">
    <div class="header-row">
      <h3>Últimos logs</h3>
      <span class="log-count">{{ logs.length }} logs</span>
    </div>
    <ul class="log-items">
      <li v-for="log in logs" :key="log.id">
        <div>
          <strong>{{ log.title ?? log.id }}</strong>
          <div class="details">{{ log.map ?? 'Mapa desconhecido' }} • {{ log.timestamp ?? '—' }}</div>
        </div>
        <NuxtLink :to="`/log/${log.id}`">Ver</NuxtLink>
      </li>
    </ul>
  </Card>
</template>

<script setup lang="ts">
import type { PlayerLogReference } from '~/features/player/types'
const props = defineProps<{ logs: PlayerLogReference[] }>()
</script>

<style scoped>
.logs-list-card {
  background: rgba(24, 29, 45, 0.95);
  border: 1px solid rgba(255, 79, 60, 0.12);
  border-radius: var(--radius);
  padding: var(--space-md);
}
.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-sm);
}
.log-count {
  color: var(--text-soft);
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
  gap: var(--space-md);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 14px;
  padding: var(--space-sm) var(--space-md);
}
.details {
  color: var(--text-soft);
  font-size: 0.9rem;
  margin-top: 0.25rem;
}
.nuxt-link {
  color: var(--accent);
  font-weight: 700;
}
</style>
