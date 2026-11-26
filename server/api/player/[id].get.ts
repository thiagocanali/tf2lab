import { observedKd, observedMatchResult } from '../../utils/player-analytics'
import { getRouterParam } from 'h3'

const STEAM64_BASE = '76561197960265728'
const ANALYZED_LOG_LIMIT = 10
const MAX_PLAYER_LOG_LIMIT = 100
const DETAIL_CACHE_TTL_MS = 5 * 60 * 1000
const DETAIL_CACHE_MAX = 128
const TRENDS_CACHE_MAX = 128
const LOGS_TF_MAX_PAGE_SIZE = 10000
const LOG_DETAIL_CONCURRENCY = 10
const LOG_DETAIL_ATTEMPTS = 3
const LOG_DETAIL_TIMEOUT_MS = 2500
const LOG_DETAIL_RETRY_DELAY_MS = 150
const LOG_DETAIL_BUDGET_MS = 20000
const TRENDS_TF_TIMEOUT_MS = 3000
const TRENDS_TF_CACHE_TTL_MS = 60 * 1000

const logDetailCache = new Map<string, { expiresAt: number; value: Promise<any | null> }>()
const trendsCache = new Map<string, { expiresAt: number; value: Promise<any> }>()

async function fetchPlayerLogSummaries(logsTfUrl: string, playerId: string, requestedLimit: number) {
  const targetLimit = Math.max(1, requestedLimit || ANALYZED_LOG_LIMIT)
  const pageSize = Math.min(LOGS_TF_MAX_PAGE_SIZE, targetLimit)
  const results: any[] = []
  let total: number | undefined
  let offset = 0

  while (results.length < targetLimit) {
    const response = await $fetch(`${logsTfUrl}?player=${encodeURIComponent(playerId)}&limit=${pageSize}&offset=${offset}`, { method: 'GET', timeout: 4000, retry: 0 })
    if (response?.success === false || !Array.isArray(response?.logs ?? response?.results)) throw new Error('Invalid logs.tf response')
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

async function fetchTrendsLogSummaries(trendsTfUrl: string, playerId: string, requestedLimit: number) {
  const cacheKey = `${trendsTfUrl}|${playerId}|${requestedLimit}`
  const cached = trendsCache.get(cacheKey)
  if (cached && cached.expiresAt > Date.now()) return cached.value

  const request = (async () => {
    const response = await $fetch(trendsTfUrl, {
      method: 'GET',
      query: {
        steamid64: playerId,
        limit: Math.min(100, Math.max(1, requestedLimit))
      },
      timeout: TRENDS_TF_TIMEOUT_MS
    })
    if (response?.success === false || !Array.isArray(response?.logs ?? response?.results)) throw new Error('Invalid trends.tf response')
    const logs = response?.logs ?? response?.results ?? []
    const total = Number(response?.total)

    return {
      logs: logs.map((log: any) => ({
        id: String(log.logid ?? log.id),
        title: log.title,
        map: log.map,
        timestamp: log.time ? new Date(Number(log.time) * 1000).toISOString() : undefined,
        format: log.format,
        league: log.league
      })).filter((log: any) => log.id && log.id !== 'undefined'),
      total: Number.isFinite(total) ? total : logs.length,
      available: true
    }
  })()

  while (trendsCache.size >= TRENDS_CACHE_MAX) {
    const oldest = trendsCache.keys().next().value
    if (oldest === undefined) break
    trendsCache.delete(oldest)
  }
  trendsCache.set(cacheKey, { expiresAt: Date.now() + TRENDS_TF_CACHE_TTL_MS, value: request })
  request.catch(() => {
    if (trendsCache.get(cacheKey)?.value === request) trendsCache.delete(cacheKey)
  })
  return request
}

async function fetchSteamAvatar(steamId: string, apiKey: string | undefined): Promise<string> {
  if (!apiKey) return ''
  try {
    const response = await $fetch('https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/', {
      method: 'GET',
      timeout: 3000,
      retry: 0,
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
  if (cached && cached.expiresAt > Date.now()) return cached.value
  logDetailCache.delete(cacheKey)

  let request: Promise<any | null>
  request = (async () => {
    for (let attempt = 0; attempt < LOG_DETAIL_ATTEMPTS; attempt++) {
      try {
        const response = await $fetch(`${logsTfUrl}/${encodeURIComponent(logId)}`, {
          method: 'GET',
          timeout: LOG_DETAIL_TIMEOUT_MS,
          retry: 0
        })
        return response?.success === false || !response?.players || typeof response.players !== 'object' ? null : { ...response, id: logId }
      } catch {
        if (attempt < LOG_DETAIL_ATTEMPTS - 1) {
          const delay = Math.min(1000, LOG_DETAIL_RETRY_DELAY_MS * (2 ** attempt))
          await new Promise((resolve) => setTimeout(resolve, delay))
        }
      }
    }

    return null
  })().then((detail) => {
    if (detail === null && logDetailCache.get(cacheKey)?.value === request) logDetailCache.delete(cacheKey)
    return detail
  })

  while (logDetailCache.size >= DETAIL_CACHE_MAX) {
    const oldest = logDetailCache.keys().next().value
    if (oldest === undefined) break
    logDetailCache.delete(oldest)
  }
  logDetailCache.set(cacheKey, { expiresAt: Date.now() + DETAIL_CACHE_TTL_MS, value: request })
  return request
}

function summaryTimestamp(summary: any): number {
  const value = summary.time ?? summary.date ?? summary.timestamp
  if (typeof value === 'number') return value < 10_000_000_000 ? value * 1000 : value
  const timestamp = Date.parse(String(value ?? ''))
  return Number.isFinite(timestamp) ? timestamp : 0
}

function logFormat(summary: any, log: any): string | undefined {
  const explicit = summary?.format ?? log.info?.format
  const text = [explicit, summary?.title, log.info?.title, summary?.league, log.info?.league]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  if (/highlander|\bhl\b/.test(text)) return 'HL'
  if (/6v6|\b6s\b|sixes|sixvsix/.test(text)) return '6s'
  return typeof explicit === 'string' && explicit.trim() ? explicit.trim() : undefined
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

export default defineEventHandler(async (event) => {
  const id = String(getRouterParam(event, 'id') ?? '')
  if (!/^7656119\d{10}$/.test(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid SteamID64' })
  }

  const query = getQuery(event)
  const requestedLimit = Number(query.limit ?? ANALYZED_LOG_LIMIT)
  const safeLimit = Number.isFinite(requestedLimit)
    ? Math.min(Math.max(1, Math.floor(requestedLimit)), MAX_PLAYER_LOG_LIMIT)
    : ANALYZED_LOG_LIMIT

  const config = useRuntimeConfig()
  const logsTfUrl = config.public?.logsTfUrl ?? 'https://logs.tf/api/v1/log'
  const trendsTfUrl = config.public?.trendsTfUrl ?? 'https://trends.tf/api/v1/logs'
  const steamApiKey = config.steamApiKey

  try {
    const [logsResult, trendsResult] = await Promise.allSettled([
      fetchPlayerLogSummaries(logsTfUrl, id, safeLimit),
      fetchTrendsLogSummaries(trendsTfUrl, id, safeLimit)
    ])
    if (logsResult.status === 'rejected' && trendsResult.status === 'rejected') {
      throw createError({ statusCode: 502, statusMessage: 'Player statistics sources unavailable' })
    }
    const logsTfData = logsResult.status === 'fulfilled' ? logsResult.value : { logs: [], total: 0 }
    const trendsTfData = trendsResult.status === 'fulfilled' ? trendsResult.value : { logs: [], total: 0, available: false }
    const logsTfSummaries = logsTfData.logs
    const trendsTfSummaries = trendsTfData.logs
    const logsById = new Map(logsTfSummaries.map((log: any) => [String(log.id), log]))
    const trendsOnlySummaries = trendsTfSummaries
      .filter((log: any) => !logsById.has(String(log.id)))
      .map((log: any) => ({ ...log, source: 'trends.tf' }))
    const summaries = Array.from(new Map<string, any>([...logsTfSummaries.map((log: any) => ({ ...log, source: 'logs.tf' })), ...trendsOnlySummaries].filter((log: any) => /^\d+$/.test(String(log.id))).map((log: any) => [String(log.id), log])).values())
      .sort((left: any, right: any) => summaryTimestamp(right) - summaryTimestamp(left))
      .slice(0, safeLimit)
    const totalLogs = logsTfResultTotal(logsTfData.total, trendsTfData.total, logsTfSummaries.length, trendsTfSummaries.length)
    
    const details = await fetchLogDetails(logsTfUrl, summaries, LOG_DETAIL_BUDGET_MS)
    if (summaries.length > 0 && details.every((detail) => !detail)) {
      throw createError({ statusCode: 502, statusMessage: 'Match details unavailable' })
    }

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
    let analyzedPlayerLogs = 0

    for (const log of details.filter(Boolean)) {
      const player = log.players?.[steam3Id]
      if (!player) continue
      analyzedPlayerLogs += 1

      name = log.names?.[steam3Id] ?? name
      totalKills += player.kills ?? 0
      totalDeaths += player.deaths ?? 0
      totalDamage += player.dmg ?? 0
      totalHeals += player.heals ?? 0
      timePlayed += (player.class_stats ?? []).reduce((seconds: number, stat: any) => seconds + (Number(stat.total_time) || 0), 0)

      const classesSeenInLog = new Set<string>()
      for (const stat of player.class_stats ?? []) {
        const current = classMap.get(stat.type) ?? {
          timePlayed: 0,
          kills: 0,
          deaths: 0,
          assists: 0,
          damage: 0,
          heals: 0,
          matches: 0
        }

        current.timePlayed += stat.total_time ?? 0
        current.kills += stat.kills ?? 0
        current.deaths += stat.deaths ?? 0
        current.assists += stat.assists ?? 0
        current.damage += stat.dmg ?? 0
        current.heals += stat.heals ?? 0
        if (!classesSeenInLog.has(stat.type)) {
          current.matches += 1
          classesSeenInLog.add(stat.type)
        }
        classMap.set(stat.type, current)
      }

      if (recentLogs.length < safeLimit) {
        const result = observedMatchResult(log.teams ?? {}, player.team)
        const kills = player.kills ?? 0
        const deaths = player.deaths ?? 0
        const damage = player.dmg ?? 0
        const heals = player.heals ?? 0
        const kd = observedKd(kills, deaths)

        const summary = summaries.find((entry: any) => String(entry.id) === String(log.id))
        recentLogs.push({
          id: String(log.id),
          source: summary?.source ?? 'logs.tf',
          title: log.info?.title ?? `Log ${log.id}`,
          map: log.info?.map,
          format: logFormat(summary, log),
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

    const classStats = Array.from(classMap.entries())
      .map(([className, stats]) => {
        const safeHeals = stats.heals ?? 0
        const safeDamage = stats.damage ?? 0
        const matchCount = stats.matches ?? 0

        return {
          className,
          ...stats,
          kd: observedKd(stats.kills, stats.deaths),
          heals: safeHeals,
          healsPerMatch: matchCount ? safeHeals / matchCount : safeHeals,
          avgKills: matchCount ? (stats.kills ?? 0) / matchCount : 0,
          avgDeaths: matchCount ? (stats.deaths ?? 0) / matchCount : 0,
          avgDamage: matchCount ? (safeDamage || 0) / matchCount : 0,
          avgHeals: matchCount ? (safeHeals || 0) / matchCount : 0,
          avgKd: observedKd(stats.kills ?? 0, stats.deaths),
          matches: matchCount,
          // Class breakdowns and historical trends are omitted until observed
          // per-class/per-match source data can support them accurately.
          mostHealedClasses: undefined,
          deathsByClass: undefined,
          performanceTrend: undefined
        }
      })
      .sort((a, b) => b.timePlayed - a.timePlayed)

    const matches = analyzedPlayerLogs
    const mainClass = classStats[0]
      ? {
          className: classStats[0].className,
          timePlayed: classStats[0].timePlayed,
          timePercentage: timePlayed > 0
            ? Math.min(100, (classStats[0].timePlayed / timePlayed) * 100)
            : 0,
          matches: classStats[0].matches ?? 0
        }
      : undefined
    const avgKills = matches ? totalKills / matches : 0
    const avgDeaths = matches ? totalDeaths / matches : 0
    const avgDamage = matches ? totalDamage / matches : 0
    const avgHeals = matches ? totalHeals / matches : 0
    const avgKd = observedKd(totalKills, totalDeaths)

    return {
      data: {
        id,
        name,
        steamId: id,
        avatarUrl,
        steamPlaytime,
        totalLogs: totalLogs,
        requestedLimit: safeLimit,
        sourceStatus: { logsTf: logsResult.status === 'fulfilled' ? 'available' : 'unavailable', trendsTf: trendsResult.status === 'fulfilled' ? 'available' : 'unavailable' },
        partial: logsResult.status === 'rejected' || trendsResult.status === 'rejected' || analyzedPlayerLogs < summaries.length || requestedLimit > safeLimit,
        logsReturned: summaries.length,
        logsAnalyzed: analyzedPlayerLogs,
        logsDetailsReturned: details.filter(Boolean).length,
        logsTfReturned: logsTfSummaries.length,
        trendsTfReturned: trendsTfSummaries.length,
        trendsTfAvailable: trendsTfData.available,
        mainClass,
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
  } catch (error: any) {
    if (error?.statusCode) throw error
    throw createError({ statusCode: 502, statusMessage: 'Unable to retrieve player statistics' })
  }
})

function logsTfResultTotal(logsTfTotal: number, trendsTfTotal: number, logsTfCount: number, trendsTfCount: number) {
  if (logsTfCount > 0 || logsTfTotal > 0) return Number.isFinite(logsTfTotal) ? logsTfTotal : logsTfCount
  return Number.isFinite(trendsTfTotal) ? trendsTfTotal : trendsTfCount
}
