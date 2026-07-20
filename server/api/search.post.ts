import { readBody } from 'h3'

// Simple in-memory cache for quick server-side caching during dev.
const cache = new Map()
const CACHE_TTL = 60 * 1000 // 60s

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

  // If no query provided, return a mocked paginated response
  if (!query) {
    const mockResults = Array.from({ length: Math.min(perPage, 3) }).map((_, i) => ({
      id: `mock-${(page - 1) * perPage + i + 1}`,
      title: `Log simulado para "${query}" (#${(page - 1) * perPage + i + 1})`,
      map: 'cp_process_final',
      timestamp: new Date().toISOString(),
      url: null
    }))

    const payload = {
      mock: true,
      query,
      results: mockResults,
      page,
      perPage,
      total: 3
    }

    cache.set(cacheKey, { ts: now, data: payload })
    return payload
  }

  try {
    // Proxy to external logsTfUrl. Adjust path/params when API contract is known.
    // logs.tf exposes a log endpoint at: https://logs.tf/api/v1/log?id=<id>
    // We'll call the configured `logsTfUrl` with the `id` query parameter.
    const res = await $fetch(`${logsTfUrl}?id=${encodeURIComponent(query)}`, {
      method: 'GET'
    })

    // Normalize response: the logs.tf `log` object may be nested.
    const logData = res?.log ?? res
    const results = logData ? [logData] : []
    const total = results.length

    const payload = { results, page, perPage, total }
    cache.set(cacheKey, { ts: now, data: payload })
    return payload
  } catch (err) {
    return { error: String(err) }
  }
})
