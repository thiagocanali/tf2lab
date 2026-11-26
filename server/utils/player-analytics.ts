/**
 * Statistics that cannot be reliably inferred are absent, rather than fake.
 * A nonzero kills / zero deaths ratio is not finite; omit it from aggregate UI.
 */
export function observedKd(kills: number, deaths: number): number | undefined {
  if (!Number.isFinite(kills) || !Number.isFinite(deaths) || kills < 0 || deaths < 0) return undefined
  if (deaths === 0) return kills === 0 ? 0 : undefined
  return kills / deaths
}

export type ObservedResult = 'Victory' | 'Defeat' | 'Draw' | 'Result unavailable'

export function observedMatchResult(
  teams: Record<string, { score?: number | string } | undefined>,
  playerTeam: unknown
): ObservedResult {
  if (playerTeam !== 'Red' && playerTeam !== 'Blue') return 'Result unavailable'
  const opponent = playerTeam === 'Red' ? 'Blue' : 'Red'
  const own = teams[playerTeam]?.score
  const other = teams[opponent]?.score
  if (own === undefined || own === null || other === undefined || other === null) return 'Result unavailable'
  if (String(own).trim() === '' || String(other).trim() === '') return 'Result unavailable'
  const ownScore = Number(own)
  const opponentScore = Number(other)
  if (!Number.isFinite(ownScore) || !Number.isFinite(opponentScore) || ownScore < 0 || opponentScore < 0) return 'Result unavailable'
  if (ownScore > opponentScore) return 'Victory'
  if (ownScore < opponentScore) return 'Defeat'
  return 'Draw'
}
