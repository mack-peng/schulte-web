import type { GridSize } from './types'

export function shuffle<T>(items: T[], rng: () => number = Math.random): T[] {
  const result = items.slice()
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    const current = result[i]
    result[i] = result[j]
    result[j] = current
  }
  return result
}

function range(length: number): number[] {
  return Array.from({ length }, (_, index) => index + 1)
}

function chebyshev(a: number, b: number, size: number): number {
  const rowA = Math.floor(a / size)
  const colA = a % size
  const rowB = Math.floor(b / size)
  const colB = b % size
  return Math.max(Math.abs(rowA - rowB), Math.abs(colA - colB))
}

function longestRun(grid: number[], size: number): number {
  let longest = 1
  for (let row = 0; row < size; row++) {
    let run = 1
    for (let col = 1; col < size; col++) {
      const previous = grid[row * size + col - 1]
      const current = grid[row * size + col]
      run = current === previous + 1 ? run + 1 : 1
      longest = Math.max(longest, run)
    }
  }
  for (let col = 0; col < size; col++) {
    let run = 1
    for (let row = 1; row < size; row++) {
      const previous = grid[(row - 1) * size + col]
      const current = grid[row * size + col]
      run = current === previous + 1 ? run + 1 : 1
      longest = Math.max(longest, run)
    }
  }
  return longest
}

export function fairnessScore(grid: number[], size: GridSize): number {
  const positions = new Array<number>(size * size + 1).fill(0)
  grid.forEach((value, index) => {
    positions[value] = index
  })
  let adjacent = 0
  for (let value = 1; value < size * size; value++) {
    if (chebyshev(positions[value], positions[value + 1], size) === 1) adjacent += 1
  }
  const run = longestRun(grid, size)
  return adjacent * 8 + Math.max(0, run - 2) * 12
}

function localSearch(size: GridSize, rng: () => number, start: number[], steps: number): number[] {
  let grid = start
  let score = fairnessScore(grid, size)
  for (let step = 0; step < steps && score > 0; step++) {
    const first = Math.floor(rng() * grid.length)
    const second = Math.floor(rng() * grid.length)
    if (first === second) continue
    const candidate = grid.slice()
    const swapped = candidate[first]
    candidate[first] = candidate[second]
    candidate[second] = swapped
    const candidateScore = fairnessScore(candidate, size)
    if (candidateScore <= score) {
      grid = candidate
      score = candidateScore
    }
  }
  return grid
}

export function generateGrid(size: GridSize, rng: () => number = Math.random): number[] {
  let best: number[] = []
  let bestScore = Number.POSITIVE_INFINITY
  for (let attempt = 0; attempt < 200; attempt++) {
    const candidate = shuffle(range(size * size), rng)
    const score = fairnessScore(candidate, size)
    if (score < bestScore) {
      best = candidate
      bestScore = score
    }
    if (score === 0) return candidate
  }
  return localSearch(size, rng, best, 30000)
}

export function isValidGrid(grid: number[], size: GridSize): boolean {
  if (grid.length !== size * size) return false
  const seen = new Set(grid)
  if (seen.size !== size * size) return false
  for (let value = 1; value <= size * size; value++) {
    if (!seen.has(value)) return false
  }
  return true
}
