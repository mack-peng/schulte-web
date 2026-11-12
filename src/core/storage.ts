import type { DailyResult, GridSize, SessionRecord, Settings } from './types'

const KEYS = {
  sessions: 'schulte.sessions.v1',
  daily: 'schulte.daily.v1',
  settings: 'schulte.settings.v1'
} as const

const MAX_SESSIONS = 200
const MAX_DAILY_DAYS = 60

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function write(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

export function storageAvailable(): boolean {
  try {
    const key = '__schulte_probe__'
    localStorage.setItem(key, '1')
    localStorage.removeItem(key)
    return true
  } catch {
    return false
  }
}

export function loadSessions(): SessionRecord[] {
  const value = read<SessionRecord[]>(KEYS.sessions, [])
  return Array.isArray(value) ? value : []
}

export function appendSession(record: SessionRecord): boolean {
  const sessions = [record, ...loadSessions()].slice(0, MAX_SESSIONS)
  return write(KEYS.sessions, sessions)
}

export function bestForSize(size: GridSize): number | null {
  const sessions = loadSessions().filter((session) => session.size === size)
  if (sessions.length === 0) return null
  return Math.min(...sessions.map((session) => session.totalMs))
}

export function loadDaily(): Record<string, DailyResult> {
  const value = read<Record<string, DailyResult>>(KEYS.daily, {})
  return value && typeof value === 'object' ? value : {}
}

export function saveDailyResult(dateKey: string, totalMs: number): boolean {
  const daily = loadDaily()
  const existing = daily[dateKey]
  daily[dateKey] = {
    bestMs: existing ? Math.min(existing.bestMs, totalMs) : totalMs,
    attempts: existing ? existing.attempts + 1 : 1,
    updatedAt: new Date().toISOString()
  }
  const entries = Object.entries(daily)
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, MAX_DAILY_DAYS)
  return write(KEYS.daily, Object.fromEntries(entries))
}

export function loadSettings(): Settings {
  const value = read<Settings>(KEYS.settings, { hardMode: false })
  return { hardMode: Boolean(value.hardMode) }
}

export function saveSettings(settings: Settings): boolean {
  return write(KEYS.settings, settings)
}

export function clearAll(): void {
  try {
    Object.values(KEYS).forEach((key) => localStorage.removeItem(key))
  } catch {
    // Storage can be unavailable; clearing is best-effort.
  }
}

export function createSessionId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}
