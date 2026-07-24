<template>
  <Card class="players-card">
    <div class="players-header">
      <h3>Jogadores</h3>
      <span class="player-count">{{ players.length }} jogadores</span>
    </div>
    <DataTable :value="players" :rowClassName="rowClass" responsiveLayout="scroll">
      <Column header="Jogador">
        <template #body="slotProps">
          <NuxtLink
            v-if="slotProps.data.steamid || slotProps.data.steamId"
            :to="`/player/${slotProps.data.steamid ?? slotProps.data.steamId}`"
            class="player-link"
          >
            {{ slotProps.data.name ?? '-' }}
          </NuxtLink>
          <span v-else>{{ slotProps.data.name ?? '-' }}</span>
        </template>
      </Column>
      <Column header="Kills">
        <template #body="slotProps">
          <span :class="['stat-pill', { 'highlight': slotProps.data.kills === bestKills }]">
            {{ slotProps.data.kills ?? '-' }}
          </span>
        </template>
      </Column>
      <Column field="deaths" header="Deaths" />
      <Column field="assists" header="Assists" />
      <Column field="damage" header="Damage" />
    </DataTable>
  </Card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PlayerStat } from '~~/features/analytics/types'
const props = defineProps<{ players: PlayerStat[] }>()

const bestKills = computed(() => {
  if (!props.players.length) return 0
  return Math.max(...props.players.map((player) => player.kills ?? 0))
})

const rowClass = (player: PlayerStat) => ({
  'best-row': player.kills === bestKills.value
})
</script>

<style scoped>
.players-card {
  background: rgba(24, 29, 45, 0.95);
  border: 1px solid rgba(255, 79, 60, 0.12);
  border-radius: var(--radius);
  padding: var(--space-md);
}
.players-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-sm);
}
.players-header h3 {
  margin: 0;
  font-size: var(--font-size-lg);
}
.player-count {
  color: var(--text-soft);
  font-size: var(--font-size-sm);
}
.p-datatable table {
  width: 100%;
}
.p-datatable-tbody > tr:nth-child(odd) {
  background: rgba(255, 255, 255, 0.03);
}
.p-datatable-tbody > tr.best-row {
  background: rgba(255, 79, 60, 0.12);
}
.p-datatable-tbody > tr:hover {
  background: rgba(255, 255, 255, 0.08);
}
.stat-pill {
  display: inline-flex;
  padding: 0.35rem 0.65rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  color: var(--text);
  font-weight: 700;
}
.stat-pill.highlight {
  background: rgba(255, 79, 60, 0.22);
  color: #fff;
}
.player-link {
  color: var(--accent);
  font-weight: 700;
  text-decoration: none;
}
.player-link:hover {
  text-decoration: underline;
}
</style>
