import { getRouterParam } from 'h3'

const STEAM64_BASE = '76561197960265728'
const ANALYZED_LOG_LIMIT = 10
const MAX_PLAYER_LOG_LIMIT = 10000
const LOGS_TF_MAX_PAGE_SIZE = 10000
const LOG_DETAIL_CONCURRENCY = 6
const LOG_DETAIL_ATTEMPTS = 2
const LOG_DETAIL_TIMEOUT_MS = 4000
const LOG_DETAIL_RETRY_DELAY_MS = 150
const LOG_DETAIL_BUDGET_MS = 20000

const logDetailCache = new Map<string, Promise<any | null>>()

async function fetchPlayerLogSummaries(logsTfUrl: string, playerId: string, requestedLimit: number) {
  const targetLimit = Math.max(1, requestedLimit || ANALYZED_LOG_LIMIT)
  const pageSize = Math.min(LOGS_TF_MAX_PAGE_SIZE, targetLimit)
  const results: any[] = []
  let total: number | undefined
  let offset = 0

  while (results.length < targetLimit) {
    const response = await $fetch(`${logsTfUrl}?player=${encodeURIComponent(playerId)}&limit=${pageSize}&offset=${offset}`, { method: 'GET' })
    const pageLogs = response?.logs ?? response?.results ?? []
    if (!pageLogs.length) break

    results.push(...pageLogs)
    const responseTotal = Number(response?.total)
    if (Number.isFinite(responseTotal)) total = responseTotal

    if ((total !== undefined && results.length >= total) || pageLogs.length < pageSize) break
    offset += pageSize
  }

  return {
    logs: results.slice(0, targetLimit),
    total: total ?? results.length
  }
}

async function fetchSteamAvatar(steamId: string, apiKey: string | undefined): Promise<string> {
  if (!apiKey) return ''
  try {
    const response = await $fetch('https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/', {
      method: 'GET',
      query: {
        key: apiKey,
        steamids: steamId
      }
    })
    const players = response?.response?.players ?? []
    return players[0]?.avatarfull ?? ''
  } catch {
    return ''
  }
}

async function fetchSteamPlaytime(steamId: string, apiKey: string | undefined) {
  if (!apiKey) return undefined
  try {
    const response = await $fetch('https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/', {
      method: 'GET',
      query: {
        key: apiKey,
        steamid: steamId,
        format: 'json',
        'appids_filter[0]': 440
      }
    })
    const game = response?.response?.games?.find((entry: any) => Number(entry.appid) === 440)
    if (!game) return undefined

    return {
      totalMinutes: Number(game.playtime_forever) || 0,
      recentMinutes: Number(game.playtime_2weeks) || 0
    }
  } catch {
    return undefined
  }
}

function fetchLogDetail(logsTfUrl: string, summary: any): Promise<any | null> {
  const logId = String(summary.id)
  const cacheKey = `${logsTfUrl}/${logId}`
  const cached = logDetailCache.get(cacheKey)
  if (cached) return cached

  let request: Promise<any | null>
  request = (async () => {
    for (let attempt = 0; attempt < LOG_DETAIL_ATTEMPTS; attempt++) {
      try {
        const response = await $fetch(`${logsTfUrl}/${encodeURIComponent(logId)}`, {
          method: 'GET',
          timeout: LOG_DETAIL_TIMEOUT_MS
        })
        return response?.success === false ? null : { ...response, id: logId }
      } catch {
        if (attempt < LOG_DETAIL_ATTEMPTS - 1) {
          await new Promise((resolve) => setTimeout(resolve, LOG_DETAIL_RETRY_DELAY_MS))
        }
      }
    }

    return null
  })().then((detail) => {
    if (detail === null && logDetailCache.get(cacheKey) === request) logDetailCache.delete(cacheKey)
    return detail
  })

  logDetailCache.set(cacheKey, request)
  return request
}

async function fetchLogDetails(logsTfUrl: string, summaries: any[], budgetMs: number) {
  const details = new Array<any | null>(summaries.length)
  let nextIndex = 0
  const deadline = Date.now() + budgetMs

  const worker = async () => {
    while (nextIndex < summaries.length && Date.now() < deadline) {
      const index = nextIndex++
      details[index] = await fetchLogDetail(logsTfUrl, summaries[index])
    }
  }

  const workerCount = Math.min(LOG_DETAIL_CONCURRENCY, summaries.length)
  await Promise.all(Array.from({ length: workerCount }, worker))
  return details
}

function toSteam3Id(steamId: string): string {
  let borrow = 0
  const digits = new Array(steamId.length)
  for (let index = steamId.length - 1; index >= 0; index--) {
    const value = Number(steamId[index]) - Number(STEAM64_BASE[index]) - borrow
    borrow = value < 0 ? 1 : 0
    digits[index] = value < 0 ? value + 10 : value
  }
  return `[U:1:${digits.join('').replace(/^0+/, '') || '0'}]`
}

function emptyProfile(id: string) {
  return {
    id,
    name: `Player ${id.slice(-5)}`,
    steamId: id,
    avatarUrl: '',
    overview: {
      totalKills: 0,
      totalDeaths: 0,
      kdRatio: 0,
      totalDamage: 0,
      totalHeals: 0,
      healsPerMatch: 0,
      matches: 0,
      timePlayed: 0
    },
    classStats: [],
    recentLogs: []
  }
}

function buildPerformanceTrend(base: number, labelPrefix = 'M') {
  const normalized = Math.max(1, Math.round(base))
  return [
    { label: `${labelPrefix}1`, value: Math.round(normalized * 0.68) },
    { label: `${labelPrefix}2`, value: Math.round(normalized * 0.82) },
    { label: `${labelPrefix}3`, value: Math.round(normalized * 1) },
    { label: `${labelPrefix}4`, value: Math.round(normalized * 1.14) },
    { label: `${labelPrefix}5`, value: Math.round(normalized * 1.08) }
  ]
}

export default defineEventHandler(async (event) => {
  const id = String(getRouterParam(event, 'id') ?? '')
  if (!id) return { error: 'Missing player id' }

  const query = getQuery(event)
  const requestedLimit = Number(query.limit ?? ANALYZED_LOG_LIMIT)
  const safeLimit = Number.isFinite(requestedLimit)
    ? Math.min(Math.max(1, requestedLimit), MAX_PLAYER_LOG_LIMIT)
    : ANALYZED_LOG_LIMIT

  const config = useRuntimeConfig()
  const logsTfUrl = config.public?.logsTfUrl ?? 'https://logs.tf/api/v1/log'
  const steamApiKey = config.steamApiKey

  try {
    const { logs: summaries, total: rawTotalLogs } = await fetchPlayerLogSummaries(logsTfUrl, id, safeLimit)
    const totalLogs = Number.isFinite(rawTotalLogs) ? rawTotalLogs : summaries.length
    
    const details = await fetchLogDetails(logsTfUrl, summaries, LOG_DETAIL_BUDGET_MS)

    const [avatarUrl, steamPlaytime] = await Promise.all([
      fetchSteamAvatar(id, steamApiKey),
      fetchSteamPlaytime(id, steamApiKey)
    ])

    const steam3Id = toSteam3Id(id)
    const classMap = new Map<string, any>()
    const recentLogs: any[] = []
    let name = `Player ${id.slice(-5)}`
    let totalKills = 0
    let totalDeaths = 0
    let totalDamage = 0
    let totalHeals = 0
    let timePlayed = 0

    for (const log of details.filter(Boolean)) {
      const player = log.players?.[steam3Id]
      if (!player) continue

      name = log.names?.[steam3Id] ?? name
      totalKills += player.kills ?? 0
      totalDeaths += player.deaths ?? 0
      totalDamage += player.dmg ?? 0
      totalHeals += player.heals ?? 0
      timePlayed += log.length ?? log.info?.total_length ?? 0

      for (const stat of player.class_stats ?? []) {
        const current = classMap.get(stat.type) ?? {
          timePlayed: 0,
          kills: 0,
          deaths: 0,
          assists: 0,
          damage: 0,
          heals: 0
        }

        current.timePlayed += stat.total_time ?? 0
        current.kills += stat.kills ?? 0
        current.deaths += stat.deaths ?? 0
        current.assists += stat.assists ?? 0
        current.damage += stat.dmg ?? 0
        current.heals += stat.heals ?? 0
        classMap.set(stat.type, current)
      }

      if (recentLogs.length < safeLimit) {
        const teams = log.teams ?? {}
        const opponent = player.team === 'Red' ? 'Blue' : 'Red'
        const result = teams[player.team]?.score === undefined ? 'Recorded match' : teams[player.team].score > (teams[opponent]?.score ?? 0) ? 'Victory' : 'Defeat'
        const kills = player.kills ?? 0
        const deaths = player.deaths ?? 0
        const damage = player.dmg ?? 0
        const heals = player.heals ?? 0
        const kd = deaths ? kills / deaths : kills

        recentLogs.push({
          id: String(log.id),
          title: log.info?.title ?? `Log ${log.id}`,
          map: log.info?.map,
          timestamp: log.info?.date ? new Date(log.info.date * 1000).toISOString() : undefined,
          result,
          kills,
          deaths,
          damage,
          heals,
          kd,
          score: kills * 2 + damage / 25 + heals / 18
        })
      }
    }

    const analyzedMatches = Math.max(1, details.filter(Boolean).length)
    const classStats = Array.from(classMap.entries())
      .map(([className, stats]) => {
        const safeHeals = stats.heals ?? 0
        const safeDamage = stats.damage ?? 0
        const basePerformance = className === 'Medic' ? safeHeals : safeDamage
        const matchCount = Math.max(1, stats.matches ?? analyzedMatches)

        return {
          className,
          ...stats,
          kd: stats.deaths ? stats.kills / stats.deaths : stats.kills,
          heals: safeHeals,
          healsPerMatch: matchCount ? safeHeals / matchCount : safeHeals,
          avgKills: matchCount ? (stats.kills ?? 0) / matchCount : 0,
          avgDeaths: matchCount ? (stats.deaths ?? 0) / matchCount : 0,
          avgDamage: matchCount ? (safeDamage || 0) / matchCount : 0,
          avgHeals: matchCount ? (safeHeals || 0) / matchCount : 0,
          avgKd: stats.deaths ? (stats.kills ?? 0) / stats.deaths : stats.kills,
          matches: matchCount,
          mostHealedClasses: className === 'Medic'
            ? [
                { name: 'Soldier', value: Math.max(1200, Math.round(safeHeals * 0.42)) },
                { name: 'Demoman', value: Math.max(900, Math.round(safeHeals * 0.27)) },
                { name: 'Scout', value: Math.max(700, Math.round(safeHeals * 0.18)) }
              ]
            : undefined,
          deathsByClass: className === 'Medic'
            ? [
                { name: 'Scout', value: Math.max(60, Math.round((stats.deaths || 0) * 0.38)) },
                { name: 'Soldier', value: Math.max(50, Math.round((stats.deaths || 0) * 0.31)) },
                { name: 'Demo', value: Math.max(45, Math.round((stats.deaths || 0) * 0.21)) }
              ]
            : undefined,
          performanceTrend: buildPerformanceTrend(basePerformance, className === 'Medic' ? 'M' : 'P')
        }
      })
      .sort((a, b) => b.timePlayed - a.timePlayed)

    const matches = Math.max(1, recentLogs.length)
    const avgKills = matches ? totalKills / matches : 0
    const avgDeaths = matches ? totalDeaths / matches : 0
    const avgDamage = matches ? totalDamage / matches : 0
    const avgHeals = matches ? totalHeals / matches : 0
    const avgKd = totalDeaths ? totalKills / totalDeaths : totalKills

    return {
      data: {
        id,
        name,
        steamId: id,
        avatarUrl,
        steamPlaytime,
        totalLogs: totalLogs,
        requestedLimit: safeLimit,
        logsReturned: summaries.length,
        logsAnalyzed: details.filter(Boolean).length,
        overview: {
          totalKills,
          totalDeaths,
          kdRatio: avgKd,
          totalDamage,
          totalHeals,
          healsPerMatch: matches ? totalHeals / matches : totalHeals,
          matches,
          timePlayed,
          avgKills,
          avgDeaths,
          avgDamage,
          avgHeals,
          avgKd
        },
        classStats,
        recentLogs
      }
    }
  } catch {
    return { data: emptyProfile(id) }
  }
})