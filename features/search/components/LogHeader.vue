<template>
  <Card class="log-header">
    <div class="header-row">
      <div class="header-copy">
        <h2>{{ data.title ?? ('Log ' + data.id) }}</h2>
        <div class="meta">
          <span v-if="data.map">Mapa: {{ data.map }}</span>
          <span v-if="data.timestamp">• {{ formattedDate }}</span>
          <span v-if="data.duration">• {{ formattedDuration }}</span>
        </div>
      </div>
      <div class="scores">
        <Badge class="score-badge badge-red" value="Red: {{ data.redScore ?? '-' }}" />
        <Badge class="score-badge badge-blu" value="Blu: {{ data.bluScore ?? '-' }}" />
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { LogData } from '~~/features/analytics/types'
const props = defineProps<{ data: LogData }>()

const formattedDate = computed(() => props.data.timestamp ? new Date(props.data.timestamp).toLocaleString() : '')
const formattedDuration = computed(() => {
  if (!props.data.duration) return ''
  const mins = Math.floor(props.data.duration / 60)
  const secs = props.data.duration % 60
  return `${mins}m ${secs}s`
})
</script>

<style scoped>
.log-header {
  background: linear-gradient(180deg, rgba(18, 20, 32, 0.95), rgba(28, 34, 52, 0.95));
  border: 1px solid rgba(255, 79, 60, 0.18);
  border-radius: var(--radius);
  padding: var(--space-lg);
  box-shadow: var(--shadow);
}
.header-row {
  display: flex;
  justify-content: space-between;
  gap: var(--space-lg);
  align-items: flex-start;
  flex-wrap: wrap;
}
.header-copy h2 {
  margin: 0;
  font-size: var(--font-size-2xl);
  line-height: 1.05;
  color: var(--text);
}
.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 0.75rem;
  color: var(--text-soft);
  font-size: var(--font-size-sm);
}
.scores {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
}
.score-badge {
  border-radius: 999px;
  padding: 0.7rem 1rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.badge-red {
  background: var(--tf2-red);
  color: #fff;
}
.badge-blu {
  background: var(--tf2-blu);
  color: #fff;
}
@media (max-width: 780px) {
  .header-row {
    flex-direction: column;
  }
}
</style>
