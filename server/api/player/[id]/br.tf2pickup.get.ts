import { getRouterParam } from 'h3'

const BR_TF2PICKUP_BASE_URL = 'https://br.tf2pickup.org/api/v1'
const CACHE_TTL_MS = 60 * 1000
const REQUEST_TIMEOUT_MS = 4000

interface BrTf2PickupResponse {
  data: Array<{
    id: string
    map?: string
    score?: number | string
    date?: string
    logsUrl?: string
    demoUrl?: string
  }>
  available: boolean
}

const cache = new Map<string, { expiresAt: number; value: Promise<BrTf2PickupResponse> }>()

function emptyResponse(available = false): BrTf2PickupResponse {
  return { data: [], available }
}

function asDate(value: unknown): string | undefined {
  if (typeof value === 'string') return value
  if (typeof value === 'number' && Number.isFinite(value)) {
    return new Date(value < 10_000_000_000 ? value * 1000 : value).toISOString()
  }
  return undefined
}

function normalizeGames(response: any) {
  const games = Array.isArray(response) ? response : response?.games ?? response?.results ?? response?.data ?? []
  if (!Array.isArray(games)) return []

  return games.slice(0, 10).map((game: any, index: number) => ({
    id: String(game.id ?? game.gameId ?? game.number ?? index),
    map: game.map ?? game.mapName,
    score: game.score,
    date: asDate(game.date ?? game.createdAt ?? game.startedAt ?? game.timestamp),
    logsUrl: typeof game.logsUrl === 'string' ? game.logsUrl : undefined,
    demoUrl: typeof game.demoUrl === 'string' ? game.demoUrl : undefined
  }))
}

export default defineEventHandler(async (event) => {
  const steamId = String(getRouterParam(event, 'id') ?? '')
  if (!steamId) return emptyResponse()

  const cached = cache.get(steamId)
  if (cached && cached.expiresAt > Date.now()) return cached.value

  const request = (async () => {
    try {
      const response = await $fetch(`${BR_TF2PICKUP_BASE_URL}/players/${encodeURIComponent(steamId)}/games`, {
        method: 'GET',
        query: { limit: 10 },
        timeout: REQUEST_TIMEOUT_MS
      })

      return { data: normalizeGames(response), available: true }
    } catch {
      return emptyResponse()
    }
  })()

  cache.set(steamId, { expiresAt: Date.now() + CACHE_TTL_MS, value: request })
  return request
})