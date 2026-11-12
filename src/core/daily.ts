import type { GridSize } from './types'
import { generateGrid } from './grid'

export function utcDateKey(now = new Date()): string {
  return now.toISOString().slice(0, 10)
}

export function hashString(input: string): number {
  let hash = 2166136261
  for (let index = 0; index < input.length; index++) {
    hash ^= input.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

export function mulberry32(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

export function dailyGrid(size: GridSize, dateKey = utcDateKey()): number[] {
  return generateGrid(size, mulberry32(hashString(`schulte:${dateKey}:${size}`)))
}
