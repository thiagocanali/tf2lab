export interface PlayerStat {
  id: string
  name: string
  kills: number
  deaths: number
  assists?: number
  damage?: number
  kd?: number
  [k: string]: any
}

export interface LogData {
  id: string
  title?: string
  map?: string
  timestamp?: string
  duration?: number
  redScore?: number
  bluScore?: number
  players?: PlayerStat[]
  [k: string]: any
}

export default LogData
