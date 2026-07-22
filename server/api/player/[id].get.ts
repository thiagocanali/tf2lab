import { getRouterParam } from 'h3'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    return { error: 'Missing player id' }
  }

  const runtime = useRuntimeConfig()
  const logsTfUrl = runtime?.public?.logsTfUrl ?? 'https://logs.tf/api/v1/log'

  try {
    // TODO: ajustar para a API real de jogador quando disponível.
    // Atualmente retornando perfil mock baseado em SteamID.
    return {
      data: {
        id: String(id),
        name: `Player ${String(id).slice(-5)}`,
        steamId: String(id),
        avatarUrl: '',
        overview: {
          totalKills: 12854,
          totalDeaths: 9872,
          kdRatio: 1.30,
          totalDamage: 314752,
          matches: 243,
          timePlayed: 93240
        },
        classStats: [
          { className: 'Soldier', timePlayed: 21000, kills: 4321, deaths: 3210, assists: 452, damage: 98000, kd: 1.35 },
          { className: 'Scout', timePlayed: 18000, kills: 3210, deaths: 2400, assists: 390, damage: 76000, kd: 1.34 },
          { className: 'Demo', timePlayed: 12000, kills: 2410, deaths: 1820, assists: 290, damage: 62000, kd: 1.32 }
        ],
        recentLogs: [
          { id: `${id}-1001`, title: 'CP Process Final', map: 'cp_process_final', timestamp: '2026-07-18 21:45', result: 'Victory' },
          { id: `${id}-1002`, title: 'Koth Viaduct', map: 'koth_viaduct_rc4', timestamp: '2026-07-16 19:20', result: 'Defeat' },
          { id: `${id}-1003`, title: 'Payload Badwater', map: 'pl_badwater', timestamp: '2026-07-14 17:08', result: 'Victory' }
        ]
      }
    }
  } catch (err) {
    return { error: String(err) }
  }
})
