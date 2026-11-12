import { describe, expect, it } from 'vitest'
import { dailyGrid, utcDateKey } from './daily'
import { isValidGrid } from './grid'

describe('dailyGrid', () => {
  it('is deterministic for the same UTC date and size', () => {
    expect(dailyGrid(5, '2026-11-12')).toEqual(dailyGrid(5, '2026-11-12'))
  })

  it('changes across dates', () => {
    expect(dailyGrid(5, '2026-11-12')).not.toEqual(dailyGrid(5, '2026-11-13'))
  })

  it('produces a valid grid', () => {
    expect(isValidGrid(dailyGrid(5, '2026-11-12'), 5)).toBe(true)
  })

  it('formats UTC date keys', () => {
    expect(utcDateKey(new Date('2026-11-12T23:59:00Z'))).toBe('2026-11-12')
  })
})
