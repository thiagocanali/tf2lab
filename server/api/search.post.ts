import { readBody } from 'h3'

// Simple in-memory cache for quick server-side caching during dev.
const cache = new Map()
const CACHE_TTL = 60 * 1000 // 60s
const STEAM64_BASE = '76561197960265728'
const PROFILE_LOG_LIMIT = 5

function toSteam3Id(steamId: string): string {
  if (!/^\d{17}$/.test(steamId)) return steamId

  let borrow = 0
  const digits = new Array(steamId.length)
  for (let index = steamId.length - 1; index >= 0; index--) {
    const value = Number(steamId[index]) - Number(STEAM64_BASE[index]) - borrow
    borrow = value < 0 ? 1 : 0
    digits[index] = value < 0 ? value + 10 : value
  }

  return `[U:1:${digits.join('').replace(/^0+/, '') || '0'}]`
}

function getPlayerFromLog(log: any, steamId: string) {
  const steam3Id = toSteam3Id(steamId)
  const players = log?.players ?? {}

  if (Array.isArray(players)) {
    return players.find((player: any) =>
      player.steamid === steamId || player.steamId === steamId || player.steamID === steamId
    )
  }

  const stats = players[steam3Id]
  return stats ? { ...stats, steamid: steamId, name: log?.names?.[steam3Id] } : undefined
}

function toLogReference(log: any) {
  const info = log?.info ?? log
  return {
    id: String(log?.id ?? info?.id ?? ''),
    title: info?.title ?? `Log ${log?.id ?? info?.id ?? ''}`,
    map: info?.map,
    timestamp: info?.date ? new Date(info.date * 1000).toISOString() : info?.timestamp
  }
}

async function fetchLogDetails(logsTfUrl: string, logs: any[]) {
  return await Promise.all(
    logs.slice(0, PROFILE_LOG_LIMIT).map(async (log) => {
      try {
        return await $fetch(`${logsTfUrl}/${encodeURIComponent(log.id)}`, { method: 'GET' })
      } catch {
        return null
      }
    })
  )
}

function buildPlayerCard(steamId: string, details: any[]) {
  let totalKills = 0
  let totalDeaths = 0
  let totalDamage = 0
  let name = `Player ${steamId.slice(-5)}`

  const matchedLogs = details.filter(Boolean)
  for (const log of matchedLogs) {
    const player = getPlayerFromLog(log, steamId)
    if (!player) continue
    name = player.name ?? name
    totalKills += player.kills ?? 0
    totalDeaths += player.deaths ?? 0
    totalDamage += player.dmg ?? player.damage ?? 0
  }

  return {
    id: steamId,
    name,
    steamId,
    avatarUrl: '',
    overview: {
      totalKills,
      totalDeaths,
      kdRatio: totalDeaths > 0 ? totalKills / totalDeaths : totalKills,
      totalDamage,
      matches: matchedLogs.length,
      timePlayed: 0
    }
  }
}

function detectQueryType(query: string): 'steamid' | 'logid' | 'playername' | 'unknown' {
  const trimmed = query.trim()
  
  // SteamID64: 17 digits starting with 7656119
  if (/^7656119\d{10}$/.test(trimmed)) {
    return 'steamid'
  }
  
  // Log ID: numeric (logs.tf log IDs are numeric)
  if (/^\d+$/.test(trimmed)) {
    return 'logid'
  }
  
  // Player name: anything else with reasonable length
  if (trimmed.length >= 2) {
    return 'playername'
  }
  
  return 'unknown'
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const query = String(body?.query ?? '')
  const page = Number(body?.page ?? 1)
  const perPage = Number(body?.perPage ?? 10)

  const cacheKey = `${query}|${page}|${perPage}`
  const now = Date.now()
  const cached = cache.get(cacheKey)
  if (cached && (now - cached.ts) < CACHE_TTL) {
    return { ...cached.data, cached: true }
  }

  const runtime = useRuntimeConfig()
  const logsTfUrl = runtime?.public?.logsTfUrl ?? 'https://logs.tf/api/v1/log'

  // If no query provided, return empty with suggestion
  if (!query.trim()) {
    const payload = {
      queryType: 'empty',
      query: '',
      results: [],
      players: [],
      page,
      perPage,
      total: 0
    }
    cache.set(cacheKey, { ts: now, data: payload })
    return payload
  }

  const queryType = detectQueryType(query)
  
  try {
    let results: any[] = []
    let players: any[] = []
    let total = 0
    let primaryResult: any = null

    if (queryType === 'logid') {
      // The list endpoint does not support filtering by ID; use the detail endpoint.
      const log = await $fetch(`${logsTfUrl}/${encodeURIComponent(query)}`, { method: 'GET' })
      if (log?.success !== false) {
        primaryResult = toLogReference({ ...log, id: query })
        results = [primaryResult]
        total = 1
      }
    } else if (queryType === 'steamid') {
      // Search logs by player SteamID
      const res = await $fetch(`${logsTfUrl}?player=${encodeURIComponent(query)}&limit=${perPage}&offset=${(page - 1) * perPage}`, { method: 'GET' })
      // API returns { logs: [...], total: N }
      const logs = res?.logs ?? res?.results ?? []
      results = logs.map((log: any) => ({ id: String(log.id), ...log }))
      total = res?.total ?? results.length
      
      // List responses only contain log metadata. Fetch a small detail sample so
      // the primary result is a real player card with meaningful performance stats.
      if (logs.length > 0) {
        const details = await fetchLogDetails(logsTfUrl, logs)
        players = [buildPlayerCard(query, details)]
      }
    } else if (queryType === 'playername') {
      // For player name search, fetch recent logs and extract players from them
      // First, search logs by title to get log IDs
      const searchRes = await $fetch(`${logsTfUrl}?title=${encodeURIComponent(query)}&limit=${Math.min(perPage, 5)}`, { method: 'GET' })
      const searchLogs = searchRes?.logs ?? searchRes?.results ?? []
      results = searchLogs.map((log: any) => ({ id: String(log.id), ...log }))
      total = searchRes?.total ?? results.length

      // For each log found, fetch full details to extract players
      // We'll fetch up to 3 logs to get player data
      const logsToFetch = searchLogs.slice(0, 3)
      const seenPlayers = new Map<string, any>()

      for (const log of logsToFetch) {
        try {
          const detailRes = await $fetch(`${logsTfUrl}?id=${encodeURIComponent(log.id)}`, { method: 'GET' })
          const fullLog = Array.isArray(detailRes) ? detailRes[0] : (detailRes?.log ?? detailRes)
          if (fullLog?.players) {
            fullLog.players.forEach((p: any) => {
              const key = p.steamid ?? p.steamId ?? p.name
              const nameLower = p.name?.toLowerCase() ?? ''
              const queryLower = query.toLowerCase()
              
              // Only include players whose name matches the search query
              if (key && !seenPlayers.has(key) && nameLower.includes(queryLower)) {
                seenPlayers.set(key, {
                  id: key,
                  name: p.name,
                  steamId: p.steamid ?? p.steamId,
                  avatarUrl: '',
                  overview: {
                    totalKills: p.kills ?? 0,
                    totalDeaths: p.deaths ?? 0,
                    kdRatio: p.deaths ? (p.kills ?? 0) / p.deaths : (p.kills ?? 0),
                    totalDamage: p.damage ?? 0,
                    matches: 1,
                    timePlayed: 0
                  },
                  classStats: [],
                  recentLogs: [{
                    id: String(fullLog.id),
                    title: fullLog.title ?? `Log ${fullLog.id}`,
                    map: fullLog.map,
                    timestamp: fullLog.date ? new Date(fullLog.date * 1000).toISOString() : fullLog.timestamp,
                    result: fullLog.red_score > fullLog.blu_score ? 'Victory' : 'Defeat'
                  }]
                })
              }
            })
          }
        } catch {
          // Skip failed log fetches
        }
      }
      players = Array.from(seenPlayers.values()).slice(0, 10)
    }

    const payload = {
      queryType,
      query,
      results,
      players,
      primaryResult,
      page,
      perPage,
      total
    }
    
    cache.set(cacheKey, { ts: now, data: payload })
    return payload
  } catch (err) {
    return { error: String(err), queryType, query, results: [], players: [], page, perPage, total: 0 }
  }
})