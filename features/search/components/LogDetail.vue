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
          <BackButton fallback="/search" label="Voltar para Busca" />
          <a v-if="data.url" :href="data.url" target="_blank" class="external">Abrir no logs.tf</a>
        </Card>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import LogHeader from './LogHeader.vue'
import LogPlayersTable from './LogPlayersTable.vue'
import LogStatsGrid from './LogStatsGrid.vue'
import BackButton from '~/components/BackButton.vue'
import type { LogData } from '~/features/analytics/types'

const props = defineProps<{ data: LogData }>()
const router = useRouter()

const goBack = () => router.push('/search')
</script>

<style scoped>
.log-detail {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}
.layout {
  display: grid;
  grid-template-columns: 2.4fr 1fr;
  gap: var(--space-lg);
}
.main {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}
.side {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}
.actions {
  background: rgba(24, 29, 45, 0.95);
  border: 1px solid rgba(255, 79, 60, 0.12);
  border-radius: var(--radius);
  padding: var(--space-md);
  display: grid;
  gap: var(--space-sm);
}
.external {
  color: var(--tf2-orange);
  text-decoration: none;
  font-weight: 700;
}
.external:hover {
  color: var(--accent);
}
@media (max-width: 860px) {
  .layout {
    grid-template-columns: 1fr;
  }
}
</style>
