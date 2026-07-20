<template>
  <Card>
    <h3>Estatísticas</h3>
    <div class="stats-grid">
      <div class="stat">
        <div class="label">Players</div>
        <div class="value">{{ playersCount }}</div>
      </div>
      <div class="stat">
        <div class="label">Duração</div>
        <div class="value">{{ duration }}</div>
      </div>
      <div class="stat">
        <div class="label">Red</div>
        <div class="value">{{ data.redScore ?? '-' }}</div>
      </div>
      <div class="stat">
        <div class="label">Blu</div>
        <div class="value">{{ data.bluScore ?? '-' }}</div>
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
import type { LogData } from '~/features/analytics/types'
import { computed } from 'vue'
const props = defineProps<{ data: LogData }>()

const playersCount = computed(() => props.data.players?.length ?? 0)
const duration = computed(() => {
  if (!props.data.duration) return '-'
  const m = Math.floor(props.data.duration / 60)
  const s = props.data.duration % 60
  return `${m}m ${s}s`
})
</script>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-sm);
}
.stat {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 79, 60, 0.08);
  border-radius: var(--radius);
  padding: var(--space-md);
  transition: transform 0.2s ease, background 0.2s ease;
}
.stat:hover {
  transform: translateY(-2px);
  background: rgba(255, 79, 60, 0.1);
}
.label {
  color: var(--text-soft);
  font-size: 0.85rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.value {
  margin-top: 0.5rem;
  font-weight: 700;
  font-size: 1.35rem;
  color: var(--text);
}
</style>
