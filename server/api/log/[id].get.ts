import { getRouterParam } from 'h3'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    return { error: 'Missing log id' }
  }

  const runtime = useRuntimeConfig()
  const logsTfUrl = runtime?.public?.logsTfUrl ?? 'https://logs.tf/api/v1/log'

  // Try the upstream logs.tf API first.
  try {
    const res = await $fetch(`${logsTfUrl}?id=${encodeURIComponent(String(id))}`)
    const logData = res?.log ?? res
    if (logData) {
      return { data: { id: String(id), ...logData } }
    }
  } catch {
    // Fall through to mock below.
  }

  // Fallback: deterministic mock so the UI is always renderable while the
  // upstream integration is being wired up.
  const mockLog = {
    id: String(id),
    title: `Log ${id}`,
    map: 'cp_process_final',
    timestamp: new Date().toISOString(),
    duration: 1620,
    redScore: 4,
    bluScore: 2,
    players: [
      { id: 'p1', name: 'saxton',    kills: 28, deaths: 12, assists: 6,  damage: 8420, steamId: '76561198000000001' },
      { id: 'p2', name: 'demoknight', kills: 22, deaths: 14, assists: 8,  damage: 7120, steamId: '76561198000000002' },
      { id: 'p3', name: 'medic_uf',  kills: 8,  deaths: 16, assists: 24, damage: 4120, steamId: '76561198000000003' },
      { id: 'p4', name: 'spy_kun',   kills: 19, deaths: 11, assists: 4,  damage: 5220, steamId: '76561198000000004' },
      { id: 'p5', name: 'engi_pt',   kills: 14, deaths: 13, assists: 11, damage: 4810, steamId: '76561198000000005' },
      { id: 'p6', name: 'sniper_br', kills: 17, deaths: 10, assists: 3,  damage: 6310, steamId: '76561198000000006' }
    ],
    url: `https://logs.tf/${id}`
  }

  return { data: mockLog, mock: true }
})
