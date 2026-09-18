export interface PlayerLogReference {
  id: string
  source?: 'logs.tf' | 'trends.tf' | 'both'
  title?: string
  map?: string
  timestamp?: string
  result?: string
  kills?: number
  deaths?: number
  damage?: number
  heals?: number
  kd?: number
  score?: number
}

export interface BrTf2PickupMatch {
  id: string
  map?: string
  score?: number | string
  date?: string
  logsUrl?: string
  demoUrl?: string
}

export interface ClassMetricBreakdown {
  name: string
  value: number
}

export interface PlayerClassTrendPoint {
  label: string
  value: number
}

export interface PlayerClassStat {
  className: string
  timePlayed: number
  kills: number
  deaths: number
  assists?: number
  damage?: number
  kd?: number
  heals?: number
  healsPerMatch?: number
  avgKills?: number
  avgDeaths?: number
  avgDamage?: number
  avgHeals?: number
  avgKd?: number
  matches?: number
  mostHealedClasses?: ClassMetricBreakdown[]
  deathsByClass?: ClassMetricBreakdown[]
  performanceTrend?: PlayerClassTrendPoint[]
}

export interface PlayerOverviewStats {
  totalKills: number
  totalDeaths: number
  kdRatio: number
  totalDamage: number
  totalHeals?: number
  healsPerMatch?: number
  matches: number
  timePlayed: number
  avgKills?: number
  avgDeaths?: number
  avgDamage?: number
  avgHeals?: number
  avgKd?: number
}

export interface PlayerProfile {
  id: string
  name: string
  steamId?: string
  avatarUrl?: string
  steamPlaytime?: {
    totalMinutes: number
    recentMinutes: number
  }
  totalLogs?: number
  requestedLimit?: number
  logsReturned?: number
  logsAnalyzed?: number
  logsTfReturned?: number
  trendsTfReturned?: number
  trendsTfAvailable?: boolean
  overview: PlayerOverviewStats
  classStats?: PlayerClassStat[]
  recentLogs?: PlayerLogReference[]
}
