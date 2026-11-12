import { describe, expect, it } from 'vitest'
import { bestBySize } from './storage'
import type { GridSize, SessionRecord } from './types'

function record(size: GridSize, totalMs: number): SessionRecord {
  return {
    id: `${size}-${totalMs}`,
    size,
    mode: 'free',
    totalMs,
    errors: 0,
    perNumberMs: 0,
    medianIntervalMs: 0,
    cv: 0,
    drift: 0,
    level: '优秀',
    finishedAt: new Date().toISOString()
  }
}

describe('bestBySize', () => {
  it('returns null for empty sessions', () => {
    expect(bestBySize([])).toEqual({ 3: null, 4: null, 5: null, 6: null })
  })

  it('picks the minimum time per size', () => {
    const result = bestBySize([
      record(5, 30000),
      record(5, 20000),
      record(3, 10000),
      record(6, 50000)
    ])
    expect(result).toEqual({ 3: 10000, 4: null, 5: 20000, 6: 50000 })
  })
})
