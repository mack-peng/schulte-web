import { describe, expect, it } from 'vitest'
import { fairnessScore, generateGrid, isValidGrid } from './grid'
import { mulberry32 } from './daily'

describe('generateGrid', () => {
  it('keeps every number exactly once', () => {
    const grid = generateGrid(5, mulberry32(42))
    expect(isValidGrid(grid, 5)).toBe(true)
  })

  it('reaches zero adjacent pairs for 4x4 to 6x6', () => {
    for (const size of [4, 5, 6] as const) {
      const grid = generateGrid(size, mulberry32(42 + size))
      expect(fairnessScore(grid, size)).toBe(0)
    }
  })

  it('reaches the 3x3 optimum of one adjacent pair', () => {
    const grid = generateGrid(3, mulberry32(42))
    expect(fairnessScore(grid, 3)).toBe(8)
  })

  it('rejects grids with duplicates', () => {
    expect(isValidGrid([1, 1, 2, 3, 4, 5, 6, 7, 8], 3)).toBe(false)
  })
})
