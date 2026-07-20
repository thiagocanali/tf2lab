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
.stats-grid { display:grid; grid-template-columns:repeat(2,1fr); gap: .75rem }
.stat { background: rgba(255,255,255,0.03); padding:.75rem; border-radius:6px }
.label { color:var(--muted,#ccc); font-size:12px }
.value { font-weight:600; font-size:18px }
</style>
