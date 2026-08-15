<template>
  <Card class="players-card">
    <header class="players-header">
      <div>
        <h3>Players</h3>
        <p class="subtitle">Sorted by damage dealt</p>
      </div>
      <span class="player-count">{{ players.length }} {{ players.length === 1 ? 'player' : 'players' }}</span>
    </header>

    <div v-if="players.length" class="table-wrap" role="region" aria-label="Player stats">
      <table class="players-table">
        <thead>
          <tr>
            <th class="th-player" scope="col">Player</th>
            <th class="th-team" scope="col">Team</th>
            <th class="th-num" scope="col" title="Kills">K</th>
            <th class="th-num" scope="col" title="Deaths">D</th>
            <th class="th-num" scope="col" title="Assists">A</th>
            <th class="th-num" scope="col" title="K/D ratio">K/D</th>
            <th class="th-num" scope="col" title="Damage">DMG</th>
            <th class="th-num" scope="col" title="Damage per minute">DPM</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(player, idx) in players" :key="player.id ?? player.steamId ?? idx">
            <td class="td-player">
              <NuxtLink
                v-if="player.steamId"
                :to="`/player/${player.steamId}`"
                class="player-link"
              >
                <span class="player-rank">{{ idx + 1 }}</span>
                <span class="player-name">{{ player.name || 'Unknown player' }}</span>
              </NuxtLink>
              <span v-else class="player-link player-link--disabled">
                <span class="player-rank">{{ idx + 1 }}</span>
                <span class="player-name">{{ player.name || 'Unknown player' }}</span>
              </span>
            </td>
            <td class="td-team">
              <span
                v-if="player.team"
                class="team-pill"
                :class="`team-pill--${normalizeTeam(player.team)}`"
              >
                {{ normalizeTeam(player.team) }}
              </span>
              <span v-else class="team-pill team-pill--none">—</span>
            </td>
            <td class="td-num">{{ player.kills ?? 0 }}</td>
            <td class="td-num">{{ player.deaths ?? 0 }}</td>
            <td class="td-num">{{ player.assists ?? 0 }}</td>
            <td class="td-num kd" :class="kdClass(player.kd)">
              {{ formatKd(player.kd) }}
            </td>
            <td class="td-num">{{ formatNumber(player.damage) }}</td>
            <td class="td-num dpm">{{ formatNumber(dpm(player)) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="empty-players" role="status">
      <p class="empty-icon" aria-hidden="true">∅</p>
      <p class="empty-title">No player statistics were recorded in this log.</p>
      <p class="empty-hint">Try a different log ID or check that the match contains public data.</p>
    </div>
  </Card>
</template>

<script setup lang="ts">
import type { PlayerStat } from '~~/features/analytics/types'

const props = defineProps<{ players: PlayerStat[] }>()

function formatNumber(value: number | undefined): string {
  const n = Number(value ?? 0)
  return new Intl.NumberFormat('en-US').format(Number.isFinite(n) ? n : 0)
}

function formatKd(value: number | undefined): string {
  const n = Number(value ?? 0)
  if (!Number.isFinite(n)) return '0.00'
  return n.toFixed(2)
}

function kdClass(value: number | undefined): string {
  const n = Number(value ?? 0)
  if (!Number.isFinite(n) || n <= 0) return 'kd--neutral'
  if (n >= 1.5) return 'kd--strong'
  if (n >= 1) return 'kd--ok'
  return 'kd--weak'
}

function normalizeTeam(team: string | number | undefined): 'red' | 'blu' | 'other' {
  if (team === undefined || team === null) return 'other'
  const t = String(team).toLowerCase()
  if (t === 'red' || t === 'r' || t === '2') return 'red'
  if (t === 'blu' || t === 'blue' || t === 'b' || t === '3') return 'blu'
  return 'other'
}

function dpm(player: PlayerStat): number {
  const dmg = Number(player.damage ?? 0)
  const duration = Number((player as any).duration ?? 0)
  if (!duration || duration <= 0) return 0
  return Math.round((dmg / duration) * 60)
}
</script>

<style scoped>
.players-card {
  background: rgba(24, 29, 45, 0.95);
  border: 1px solid rgba(255, 79, 60, 0.14);
  border-radius: var(--radius);
  padding: var(--space-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.players-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: var(--space-md);
  flex-wrap: wrap;
}
.players-header h3 {
  margin: 0;
  font-size: var(--font-size-lg);
  color: var(--text);
}
.subtitle {
  margin: 0.15rem 0 0;
  font-size: 0.82rem;
  color: var(--text-muted);
}
.player-count {
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-soft);
  padding: 0.3rem 0.7rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.table-wrap {
  width: 100%;
  overflow-x: auto;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.players-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.92rem;
  min-width: 640px;
}

.players-table thead th {
  text-align: left;
  font-size: 0.72rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-muted);
  font-weight: 700;
  padding: 0.7rem 0.85rem;
  background: rgba(7, 8, 13, 0.45);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  white-space: nowrap;
}
.th-num { text-align: right !important; }

.players-table tbody tr {
  transition: background 0.15s ease;
}
.players-table tbody tr:hover {
  background: rgba(255, 79, 60, 0.06);
}
.players-table tbody tr:nth-child(even) {
  background: rgba(255, 255, 255, 0.02);
}
.players-table tbody tr:nth-child(even):hover {
  background: rgba(255, 79, 60, 0.08);
}

.players-table td {
  padding: 0.7rem 0.85rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  color: var(--text);
  vertical-align: middle;
}
.players-table tbody tr:last-child td {
  border-bottom: none;
}

.td-player { min-width: 12rem; }
.player-link {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  color: var(--text);
  font-weight: 600;
  text-decoration: none;
  transition: color 0.15s ease;
}
.player-link:hover { color: var(--tf2-orange); }
.player-link--disabled { cursor: default; opacity: 0.85; }
.player-rank {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.6rem;
  height: 1.6rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-muted);
  font-size: 0.72rem;
  font-weight: 700;
}
.player-link:hover .player-rank {
  background: rgba(255, 155, 51, 0.2);
  color: var(--tf2-orange);
}

.team-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2.4rem;
  padding: 0.18rem 0.5rem;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
.team-pill--red { background: rgba(255, 59, 48, 0.18); color: var(--tf2-red); border: 1px solid rgba(255, 59, 48, 0.4); }
.team-pill--blu { background: rgba(58, 128, 255, 0.18); color: var(--tf2-blu); border: 1px solid rgba(58, 128, 255, 0.4); }
.team-pill--other { background: rgba(255, 255, 255, 0.05); color: var(--text-soft); border: 1px solid rgba(255, 255, 255, 0.1); }
.team-pill--none { background: transparent; color: var(--text-muted); border: 1px dashed rgba(255, 255, 255, 0.1); }

.td-num {
  text-align: right;
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  white-space: nowrap;
}

.kd { font-weight: 700; }
.kd--strong { color: var(--success); }
.kd--ok { color: var(--tf2-orange); }
.kd--weak { color: var(--danger); }
.kd--neutral { color: var(--text-soft); }

.dpm { color: var(--text-soft); }

.empty-players {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: var(--space-xl) var(--space-md);
  gap: 0.4rem;
  border: 1px dashed rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  background: rgba(7, 8, 13, 0.35);
}
.empty-icon { margin: 0; font-size: 2rem; color: var(--accent-soft); }
.empty-title { margin: 0; font-weight: 700; color: var(--text); }
.empty-hint { margin: 0; color: var(--text-soft); font-size: 0.9rem; }
</style>
