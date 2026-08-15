<template>
  <Card class="stats-card">
    <header class="stats-header">
      <h3>Match at a glance</h3>
      <p class="subtitle">Quick numbers from this log</p>
    </header>

    <div class="stats-grid">
      <div class="stat">
        <span class="label">Players</span>
        <span class="value">{{ playersCount }}</span>
      </div>
      <div class="stat">
        <span class="label">Duration</span>
        <span class="value">{{ duration }}</span>
      </div>
      <div class="stat">
        <span class="label">Total kills</span>
        <span class="value">{{ totalKills }}</span>
      </div>
      <div class="stat">
        <span class="label">Total damage</span>
        <span class="value">{{ totalDamage }}</span>
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { LogData } from '~~/features/analytics/types'

const props = defineProps<{ data: LogData }>()

const playersCount = computed(() => props.data.players?.length ?? 0)

const duration = computed(() => {
  const d = Number(props.data.duration ?? 0)
  if (!d || d < 0) return '—'
  const m = Math.floor(d / 60)
  const s = Math.floor(d % 60)
  return `${m}m ${s.toString().padStart(2, '0')}s`
})

const totalKills = computed(() => {
  const players = props.data.players ?? []
  return new Intl.NumberFormat('en-US').format(
    players.reduce((sum, p) => sum + Number(p.kills ?? 0), 0)
  )
})

const totalDamage = computed(() => {
  const players = props.data.players ?? []
  const dmg = players.reduce((sum, p) => sum + Number(p.damage ?? 0), 0)
  return new Intl.NumberFormat('en-US').format(dmg)
})
</script>

<style scoped>
.stats-card {
  background: rgba(24, 29, 45, 0.95);
  border: 1px solid rgba(255, 79, 60, 0.14);
  border-radius: var(--radius);
  padding: var(--space-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.stats-header h3 {
  margin: 0;
  font-size: var(--font-size-lg);
  color: var(--text);
}
.subtitle {
  margin: 0.15rem 0 0;
  font-size: 0.82rem;
  color: var(--text-muted);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding: 0.85rem 1rem;
  background: linear-gradient(160deg, rgba(255, 79, 60, 0.06), rgba(58, 128, 255, 0.04));
  border: 1px solid rgba(255, 79, 60, 0.1);
  border-radius: 12px;
  transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease;
}
.stat:hover {
  transform: translateY(-2px);
  border-color: rgba(255, 79, 60, 0.3);
  background: linear-gradient(160deg, rgba(255, 79, 60, 0.12), rgba(58, 128, 255, 0.08));
}
.label {
  color: var(--text-muted);
  font-size: 0.72rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  font-weight: 700;
}
.value {
  color: var(--text);
  font-weight: 800;
  font-size: 1.25rem;
  font-variant-numeric: tabular-nums;
}
</style>
