import { readBody } from 'h3'

// Simple in-memory cache for quick server-side caching during dev.
const cache = new Map()
const CACHE_TTL = 60 * 1000 // 60s
const STEAM64_BASE = '76561197960265728'
const PROFILE_LOG_LIMIT = 5
const NAME_SEARCH_LOG_LIMIT = 40

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

async function fetchLogDetails(logsTfUrl: string, logs: any[], limit = PROFILE_LOG_LIMIT) {
  return await Promise.all(
    logs.slice(0, limit).map(async (log) => {
      try {
        const detail = await $fetch(`${logsTfUrl}/${encodeURIComponent(log.id)}`, { method: 'GET' })
        return { ...detail, id: log.id }
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

function addDecimalStrings(left: string, right: string): string {
  let carry = 0
  let result = ''
  const length = Math.max(left.length, right.length)

  for (let index = 0; index < length; index++) {
    const leftDigit = Number(left[left.length - 1 - index] ?? 0)
    const rightDigit = Number(right[right.length - 1 - index] ?? 0)
    const sum = leftDigit + rightDigit + carry
    result = String(sum % 10) + result
    carry = Math.floor(sum / 10)
  }

  return String(carry || '') + result
}

function toSteam64Id(steam3Id: string): string | undefined {
  const match = /^\[U:1:(\d+)]$/.exec(steam3Id)
  return match ? addDecimalStrings(STEAM64_BASE, match[1]) : undefined
}

function normalizePlayerName(name: string): string {
  return name.trim().toLocaleLowerCase().replace(/\s+/g, ' ')
}

function getPlayersFromLog(log: any) {
  const players = log?.players ?? {}
  if (Array.isArray(players)) {
    return players.map((player: any) => ({
      ...player,
      steamId: player.steamid ?? player.steamId ?? player.steamID,
      name: player.name
    }))
  }

  return Object.entries(players).map(([steam3Id, stats]: [string, any]) => ({
    ...stats,
    steamId: toSteam64Id(steam3Id),
    name: log?.names?.[steam3Id]
  }))
}

function scoreNameMatch(query: string, candidate: string): number {
  const normalizedQuery = normalizePlayerName(query)
  const normalizedCandidate = normalizePlayerName(candidate)

  if (!normalizedQuery || !normalizedCandidate) return 0
  if (normalizedCandidate === normalizedQuery) return 100
  if (normalizedCandidate.startsWith(normalizedQuery)) return 90
  if (normalizedCandidate.includes(normalizedQuery)) return 80

  const queryTokens = normalizedQuery.split(' ').filter(Boolean)
  const candidateTokens = normalizedCandidate.split(' ').filter(Boolean)
  const matches = queryTokens.filter((token) => candidateTokens.some((candidateToken) => candidateToken.includes(token))).length
  if (matches > 0) return 60 + matches * 10
  return 0
}

function buildNamePlayerCards(query: string, details: any[]) {
  const cards = new Map<string, any>()

  for (const log of details.filter(Boolean)) {
    for (const player of getPlayersFromLog(log)) {
      if (!player.steamId || !player.name) continue
      const matchScore = scoreNameMatch(query, player.name)
      if (matchScore <= 0) continue

      const card = cards.get(player.steamId) ?? {
        id: player.steamId,
        name: player.name,
        steamId: player.steamId,
        avatarUrl: '',
        overview: { totalKills: 0, totalDeaths: 0, kdRatio: 0, totalDamage: 0, matches: 0, timePlayed: 0 }
      }
      card.name = card.name || player.name
      card.overview.totalKills += player.kills ?? 0
      card.overview.totalDeaths += player.deaths ?? 0
      card.overview.totalDamage += player.dmg ?? player.damage ?? 0
      card.overview.matches += 1
      card.overview.kdRatio = card.overview.totalDeaths > 0
        ? card.overview.totalKills / card.overview.totalDeaths
        : card.overview.totalKills
      card.matchScore = Math.max(card.matchScore ?? 0, matchScore)
      cards.set(player.steamId, card)
    }
  }

  return Array.from(cards.values())
    .sort((first, second) => (second.matchScore ?? 0) - (first.matchScore ?? 0) || second.overview.matches - first.overview.matches || second.overview.totalDamage - first.overview.totalDamage)
    .slice(0, 10)
}

function mergeLogs(...groups: any[][]) {
  const unique = new Map<string, any>()
  for (const log of groups.flat()) unique.set(String(log.id), log)
  return Array.from(unique.values())
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
      // logs.tf indexes titles, not player names. We sample both title matches and
      // recent public logs, then keep only cards whose actual nick matches the query.
      const [titleResponse, recentResponse] = await Promise.all([
        $fetch(`${logsTfUrl}?title=${encodeURIComponent(query)}&limit=${NAME_SEARCH_LOG_LIMIT}`, { method: 'GET' }),
        $fetch(`${logsTfUrl}?limit=${NAME_SEARCH_LOG_LIMIT}&offset=0`, { method: 'GET' })
      ])
      const titleLogs = titleResponse?.logs ?? titleResponse?.results ?? []
      const recentLogs = recentResponse?.logs ?? recentResponse?.results ?? []
      const candidateLogs = mergeLogs(titleLogs, recentLogs)

      results = titleLogs.map((log: any) => ({ id: String(log.id), ...log }))
      total = titleResponse?.total ?? results.length
      players = buildNamePlayerCards(query, await fetchLogDetails(logsTfUrl, candidateLogs, NAME_SEARCH_LOG_LIMIT))
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