export type GridSize = 3 | 4 | 5 | 6
export type GameMode = 'free' | 'daily'
export type GameStatus = 'idle' | 'running' | 'paused' | 'finished'
export type Level = '优秀' | '良好' | '及格' | '继续练'
export type TapResult = 'ignored' | 'started' | 'correct' | 'wrong' | 'finished'

export interface Metrics {
  totalMs: number
  errors: number
  perNumberMs: number
  medianIntervalMs: number
  cv: number
  drift: number
  level: Level
}

export interface SessionRecord extends Metrics {
  id: string
  size: GridSize
  mode: GameMode
  finishedAt: string
  utcDate?: string
}

export interface DailyResult {
  bestMs: number
  attempts: number
  updatedAt: string
}

export interface Settings {
  hardMode: boolean
}

export interface GameResult extends Metrics {
  size: GridSize
  mode: GameMode
  intervals: number[]
}
