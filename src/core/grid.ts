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

function buildPositions(grid: number[], size: GridSize): number[] {
  const positions = new Array<number>(size * size + 1).fill(0)
  grid.forEach((value, index) => {
    positions[value] = index
  })
  return positions
}

function countAdjacent(positions: number[], size: GridSize): number {
  let adjacent = 0
  for (let value = 1; value < size * size; value++) {
    if (chebyshev(positions[value], positions[value + 1], size) === 1) adjacent += 1
  }
  return adjacent
}

function lineRun(grid: number[], size: number, line: number, isRow: boolean): number {
  let longest = 1
  let run = 1
  for (let index = 1; index < size; index++) {
    const previous = isRow ? grid[line * size + index - 1] : grid[(index - 1) * size + line]
    const current = isRow ? grid[line * size + index] : grid[index * size + line]
    run = current === previous + 1 ? run + 1 : 1
    if (run > longest) longest = run
  }
  return longest
}

function buildLineRuns(
  grid: number[],
  size: GridSize
): { rows: number[]; cols: number[]; maxRun: number } {
  const rows = new Array<number>(size)
  const cols = new Array<number>(size)
  let maxRun = 1
  for (let row = 0; row < size; row++) {
    rows[row] = lineRun(grid, size, row, true)
    if (rows[row] > maxRun) maxRun = rows[row]
  }
  for (let col = 0; col < size; col++) {
    cols[col] = lineRun(grid, size, col, false)
    if (cols[col] > maxRun) maxRun = cols[col]
  }
  return { rows, cols, maxRun }
}

export function fairnessScore(grid: number[], size: GridSize): number {
  const positions = buildPositions(grid, size)
  const adjacent = countAdjacent(positions, size)
  const maxRun = buildLineRuns(grid, size).maxRun
  return adjacent * 8 + Math.max(0, maxRun - 2) * 12
}

function addUniquePair(keys: number[], count: number, value: number, limit: number): number {
  if (value < 1 || value >= limit) return count
  for (let index = 0; index < count; index++) {
    if (keys[index] === value) return count
  }
  keys[count] = value
  return count + 1
}

function localSearch(
  size: GridSize,
  rng: () => number,
  start: number[],
  steps: number,
  target: number
): number[] {
  const grid = start.slice()
  const positions = buildPositions(grid, size)
  const runs = buildLineRuns(grid, size)
  const pairs = [0, 0, 0, 0]
  let adjacent = countAdjacent(positions, size)
  let score = adjacent * 8 + Math.max(0, runs.maxRun - 2) * 12

  for (let step = 0; step < steps && score > target; step++) {
    const first = Math.floor(rng() * grid.length)
    const second = Math.floor(rng() * grid.length)
    if (first === second) continue

    const firstValue = grid[first]
    const secondValue = grid[second]

    let pairCount = 0
    pairCount = addUniquePair(pairs, pairCount, firstValue - 1, grid.length)
    pairCount = addUniquePair(pairs, pairCount, firstValue, grid.length)
    pairCount = addUniquePair(pairs, pairCount, secondValue - 1, grid.length)
    pairCount = addUniquePair(pairs, pairCount, secondValue, grid.length)

    let before = 0
    for (let index = 0; index < pairCount; index++) {
      const pair = pairs[index]
      if (chebyshev(positions[pair], positions[pair + 1], size) === 1) before += 1
    }

    grid[first] = secondValue
    grid[second] = firstValue
    positions[firstValue] = second
    positions[secondValue] = first

    let after = 0
    for (let index = 0; index < pairCount; index++) {
      const pair = pairs[index]
      if (chebyshev(positions[pair], positions[pair + 1], size) === 1) after += 1
    }

    const firstRow = Math.floor(first / size)
    const secondRow = Math.floor(second / size)
    const firstCol = first % size
    const secondCol = second % size

    const firstRowRun = lineRun(grid, size, firstRow, true)
    const secondRowRun = lineRun(grid, size, secondRow, true)
    const firstColRun = lineRun(grid, size, firstCol, false)
    const secondColRun = lineRun(grid, size, secondCol, false)

    let nextMaxRun = 1
    for (let row = 0; row < size; row++) {
      const run = row === firstRow ? firstRowRun : row === secondRow ? secondRowRun : runs.rows[row]
      if (run > nextMaxRun) nextMaxRun = run
    }
    for (let col = 0; col < size; col++) {
      const run = col === firstCol ? firstColRun : col === secondCol ? secondColRun : runs.cols[col]
      if (run > nextMaxRun) nextMaxRun = run
    }

    const nextAdjacent = adjacent + after - before
    const nextScore = nextAdjacent * 8 + Math.max(0, nextMaxRun - 2) * 12

    if (nextScore <= score) {
      adjacent = nextAdjacent
      runs.rows[firstRow] = firstRowRun
      runs.rows[secondRow] = secondRowRun
      runs.cols[firstCol] = firstColRun
      runs.cols[secondCol] = secondColRun
      runs.maxRun = nextMaxRun
      score = nextScore
    } else {
      grid[first] = firstValue
      grid[second] = secondValue
      positions[firstValue] = first
      positions[secondValue] = second
    }
  }

  return grid
}

export function generateGrid(size: GridSize, rng: () => number = Math.random): number[] {
  const target = size === 3 ? 8 : 0
  let best: number[] = []
  let bestScore = Number.POSITIVE_INFINITY

  for (let attempt = 0; attempt < 200; attempt++) {
    const candidate = shuffle(range(size * size), rng)
    const score = fairnessScore(candidate, size)
    if (score < bestScore) {
      best = candidate
      bestScore = score
    }
    if (score <= target) return candidate
  }

  return localSearch(size, rng, best, 30000, target)
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
