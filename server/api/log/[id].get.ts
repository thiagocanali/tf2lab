import { getQuery } from 'h3'

export default defineEventHandler(async (event) => {
  const params = getQuery(event) as Record<string, string>
  const id = params.id ?? params['id'] ?? event.context.params?.id

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
