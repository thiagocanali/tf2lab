<template>
  <div class="log-detail">
    <LogHeader :data="data" />
    <div class="layout">
      <div class="main">
        <LogPlayersTable :players="data.players ?? []" />
      </div>
      <aside class="side">
        <LogStatsGrid :data="data" />
        <Card class="actions">
          <h3>More</h3>
          <p class="actions-hint">Open this log on logs.tf to see chat, healing, captures and more.</p>
          <div class="actions-row">
            <BackButton fallback="/search" label="Back to search" />
            <a
              v-if="data.url"
              :href="data.url"
              target="_blank"
              rel="noopener noreferrer"
              class="external"
            >
              Open on logs.tf
              <span aria-hidden="true">↗</span>
            </a>
          </div>
        </Card>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import LogHeader from './LogHeader.vue'
import LogPlayersTable from './LogPlayersTable.vue'
import LogStatsGrid from './LogStatsGrid.vue'
import BackButton from '~~/components/BackButton.vue'
import type { LogData } from '~~/features/analytics/types'

defineProps<{ data: LogData }>()
</script>

<style scoped>
.log-detail {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.layout {
  display: grid;
  grid-template-columns: minmax(0, 2.4fr) minmax(0, 1fr);
  gap: var(--space-lg);
}

.main {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
  min-width: 0;
}

.side {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
  min-width: 0;
}

.actions {
  background: rgba(24, 29, 45, 0.95);
  border: 1px solid rgba(255, 79, 60, 0.14);
  border-radius: var(--radius);
  padding: var(--space-md);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.actions h3 {
  margin: 0;
  font-size: var(--font-size-lg);
  color: var(--text);
}
.actions-hint {
  margin: 0;
  color: var(--text-soft);
  font-size: 0.88rem;
}
.actions-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}
.external {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.55rem 0.9rem;
  border-radius: 10px;
  background: rgba(255, 155, 51, 0.14);
  color: var(--tf2-orange);
  border: 1px solid rgba(255, 155, 51, 0.35);
  font-weight: 700;
  font-size: 0.88rem;
  text-decoration: none;
  transition: background 0.2s ease, color 0.2s ease, transform 0.2s ease;
}
.external:hover {
  background: rgba(255, 155, 51, 0.24);
  color: #fff;
  transform: translateY(-1px);
}

@media (max-width: 960px) {
  .layout {
    grid-template-columns: 1fr;
  }
}
</style>
