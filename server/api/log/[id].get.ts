import { getRouterParam } from 'h3'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    return { error: 'Missing log id' }
  }

  const runtime = useRuntimeConfig()
  const logsTfUrl = runtime?.public?.logsTfUrl ?? 'https://logs.tf/api/v1/log'

  try {
    const res = await $fetch(`${logsTfUrl}?id=${encodeURIComponent(String(id))}`)
    // Normalize response
    const logData = res?.log ?? res
    return { data: logData }
  } catch (err) {
    return { error: String(err) }
  }
})
