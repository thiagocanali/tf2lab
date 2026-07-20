export interface PlayerLogReference {
  id: string
  title?: string
  map?: string
  timestamp?: string
  result?: string
}

export interface PlayerClassStat {
  className: string
  timePlayed: number
  kills: number
  deaths: number
  assists?: number
  damage?: number
  kd?: number
}

export interface PlayerOverviewStats {
  totalKills: number
  totalDeaths: number
  kdRatio: number
  totalDamage: number
  matches: number
  timePlayed: number
}

export interface PlayerProfile {
  id: string
  name: string
  steamId?: string
  avatarUrl?: string
  overview: PlayerOverviewStats
  classStats?: PlayerClassStat[]
  recentLogs?: PlayerLogReference[]
}
