import { readBody } from 'h3'

// Simple in-memory cache for quick server-side caching during dev.
const cache = new Map()
const CACHE_TTL = 60 * 1000 // 60s

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
      // Search for specific log by ID
      // logs.tf returns an array of logs when querying by ?id=
      const res = await $fetch(`${logsTfUrl}?id=${encodeURIComponent(query)}`, { method: 'GET' })
      const logs = Array.isArray(res) ? res : (res?.logs ?? res?.results ?? [])
      if (logs.length > 0) {
        primaryResult = logs[0]
        results = logs
        total = 1
      }
    } else if (queryType === 'steamid') {
      // Search logs by player SteamID
      const res = await $fetch(`${logsTfUrl}?player=${encodeURIComponent(query)}&limit=${perPage}&offset=${(page - 1) * perPage}`, { method: 'GET' })
      // API returns { logs: [...], total: N }
      const logs = res?.logs ?? res?.results ?? []
      results = logs.map((log: any) => ({ id: String(log.id), ...log }))
      total = res?.total ?? results.length
      
      // Build a player profile from the first log's player data
      if (logs.length > 0) {
        const firstLog = logs[0]
        const playerInLog = firstLog.players?.find((p: any) => 
          p.steamid === query || p.steamId === query || p.steamID === query
        ) || firstLog.players?.[0]
        
        if (playerInLog) {
          // Aggregate stats from all logs for this player
          let totalKills = 0
          let totalDeaths = 0
          let totalAssists = 0
          let totalDamage = 0
          
          logs.forEach((log: any) => {
            const pl = log.players?.find((p: any) => 
              p.steamid === query || p.steamId === query || p.steamID === query
            )
            if (pl) {
              totalKills += pl.kills ?? 0
              totalDeaths += pl.deaths ?? 0
              totalAssists += pl.assists ?? 0
              totalDamage += pl.damage ?? 0
            }
          })
          
          players = [{
            id: query,
            name: playerInLog.name ?? `Player ${query.slice(-5)}`,
            steamId: query,
            avatarUrl: '',
            overview: {
              totalKills,
              totalDeaths,
              kdRatio: totalDeaths > 0 ? totalKills / totalDeaths : totalKills,
              totalDamage,
              matches: logs.length,
              timePlayed: 0
            },
            classStats: [],
            recentLogs: logs.slice(0, 5).map((log: any) => ({
              id: String(log.id),
              title: log.title ?? `Log ${log.id}`,
              map: log.map,
              timestamp: log.date ? new Date(log.date * 1000).toISOString() : log.timestamp,
              result: log.red_score > log.blu_score ? 'Victory' : 'Defeat'
            }))
          }]
        }
      }
    } else if (queryType === 'playername') {
      // For player name search, search logs by title
      // Note: logs from title search don't include players, only full log detail does
      const res = await $fetch(`${logsTfUrl}?title=${encodeURIComponent(query)}&limit=${perPage}&offset=${(page - 1) * perPage}`, { method: 'GET' })
      const logs = res?.logs ?? res?.results ?? []
      results = logs.map((log: any) => ({ id: String(log.id), ...log }))
      total = res?.total ?? results.length
      
      // For name search, we can't easily get player details without extra API calls
      // Just return logs for now - user can click into a log to see players
      players = []
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