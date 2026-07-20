import { readBody } from 'h3'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const query = body?.query ?? ''

  const runtime = useRuntimeConfig()
  const logsTfUrl = runtime?.public?.logsTfUrl

  // If no external logs.tf URL configured, return a mocked response
  if (!logsTfUrl) {
    return {
      mock: true,
      query,
      results: [
        {
          id: 'mock-1',
          title: `Log simulado para \"${query}\"`,
          map: 'cp_process_final',
          timestamp: new Date().toISOString(),
          url: null
        }
      ]
    }
  }

  try {
    // NOTE: endpoint path is provider-specific. This proxies to the configured
    // `logsTfUrl` and forwards the query. Adjust path/params when API details
    // are confirmed (e.g. /search, /logs, query param names, auth).
    const res = await $fetch(`${logsTfUrl}/search`, {
      method: 'POST',
      body: { query }
    })

    return res
  } catch (err) {
    return { error: String(err) }
  }
})
