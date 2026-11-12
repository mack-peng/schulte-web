import { describe, expect, it } from 'vitest'
import { formatDuration, levelFor, median, summarize } from './metrics'

describe('median', () => {
  it('handles odd, even and empty arrays', () => {
    expect(median([3, 1, 2])).toBe(2)
    expect(median([4, 1, 3, 2])).toBe(2.5)
    expect(median([])).toBe(0)
  })
})

describe('levelFor', () => {
  it('uses the adult reference bands', () => {
    expect(levelFor(5, 20000)).toBe('优秀')
    expect(levelFor(5, 20001)).toBe('良好')
    expect(levelFor(5, 25001)).toBe('及格')
    expect(levelFor(5, 30001)).toBe('继续练')
  })
})

describe('summarize', () => {
  it('computes metrics without NaN', () => {
    const metrics = summarize({
      size: 5,
      totalMs: 8000,
      errors: 1,
      intervals: [1000, 1000, 3000, 3000]
    })
    expect(metrics.perNumberMs).toBe(320)
    expect(metrics.medianIntervalMs).toBe(2000)
    expect(metrics.cv).toBeGreaterThan(0)
    expect(metrics.drift).toBe(3)
    expect(metrics.level).toBe('优秀')
  })

  it('handles empty intervals', () => {
    const metrics = summarize({ size: 5, totalMs: 0, errors: 0, intervals: [] })
    expect(metrics.medianIntervalMs).toBe(0)
    expect(metrics.cv).toBe(0)
    expect(metrics.drift).toBe(1)
    expect(Number.isNaN(metrics.perNumberMs)).toBe(false)
  })

  it('uses chronological halves for drift', () => {
    const accelerated = summarize({
      size: 5,
      totalMs: 8000,
      errors: 0,
      intervals: [3000, 3000, 1000, 1000]
    })
    const decelerated = summarize({
      size: 5,
      totalMs: 8000,
      errors: 0,
      intervals: [1000, 1000, 3000, 3000]
    })
    expect(accelerated.drift).toBeCloseTo(1 / 3)
    expect(decelerated.drift).toBe(3)
  })
})

describe('formatDuration', () => {
  it('formats seconds and minutes', () => {
    expect(formatDuration(23400)).toBe('23.4s')
    expect(formatDuration(62300)).toBe('1:02.3')
  })
})
