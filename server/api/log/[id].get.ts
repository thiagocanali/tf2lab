import { getRouterParam } from 'h3'

const STEAM64_BASE = '76561197960265728'

function addDecimalStrings(left: string, right: string): string {
  let carry = 0
  let result = ''
  for (let index = 0; index < Math.max(left.length, right.length); index++) {
    const sum = Number(left[left.length - 1 - index] ?? 0) + Number(right[right.length - 1 - index] ?? 0) + carry
    result = String(sum % 10) + result
    carry = Math.floor(sum / 10)
  }
  return String(carry || '') + result
}

function toSteam64Id(steam3Id: string): string | undefined {
  const match = /^\[U:1:(\d+)]$/.exec(steam3Id)
  return match ? addDecimalStrings(STEAM64_BASE, match[1]) : undefined
}

export default defineEventHandler(async (event) => {
  const id = String(getRouterParam(event, 'id') ?? '')
  if (!id) return { error: 'Missing log id' }

  const logsTfUrl = useRuntimeConfig()?.public?.logsTfUrl ?? 'https://logs.tf/api/v1/log'
  try {
    const log = await $fetch(`${logsTfUrl}/${encodeURIComponent(id)}`, { method: 'GET' })
    if (log?.success === false) return { error: 'Log not found' }
    const info = log?.info ?? {}
    const players = Object.entries(log?.players ?? {}).map(([steam3Id, stats]: [string, any]) => ({
      id: steam3Id,
      steamId: toSteam64Id(steam3Id),
      name: log?.names?.[steam3Id] ?? 'Unknown player',
      kills: stats.kills ?? 0,
      deaths: stats.deaths ?? 0,
      assists: stats.assists ?? 0,
      damage: stats.dmg ?? 0,
      kd: stats.deaths ? stats.kills / stats.deaths : stats.kills ?? 0,
      team: stats.team
    })).sort((first, second) => second.damage - first.damage)

    const timestamp = info.date ? new Date(info.date * 1000).toISOString() : null
    const duration = Number(log?.length ?? info?.total_length ?? 0) || 0
    const redScore = Number(log?.teams?.Red?.score ?? -1)
    const bluScore = Number(log?.teams?.Blue?.score ?? -1)
    const mapName = info.map ?? null

    return { data: {
      id,
      title: info.title?.trim() || `Log #${id}`,
      map: mapName,
      timestamp,
      duration,
      redScore,
      bluScore,
      players,
      url: `https://logs.tf/${id}`
    } }
  } catch {
    return { error: 'Unable to load this public log' }
  }
})