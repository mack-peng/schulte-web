import type { GridSize, Level, Metrics } from './types'

const BANDS: Record<GridSize, [number, number, number]> = {
  3: [5000, 8000, 12000],
  4: [10000, 16000, 20000],
  5: [20000, 25000, 30000],
  6: [40000, 50000, 60000]
}

const PERCENTILE_ANCHORS: Record<GridSize, [number, number, number]> = {
  3: [3000, 4000, 5000],
  4: [6000, 8000, 16000],
  5: [10000, 15000, 25000],
  6: [14000, 22000, 36000]
}

function medianSorted(sorted: number[], start = 0, end = sorted.length): number {
  const length = end - start
  if (length <= 0) return 0
  const middle = start + Math.floor(length / 2)
  return length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle]
}

export function median(values: number[]): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  return medianSorted(sorted)
}

export function mean(values: number[]): number {
  if (values.length === 0) return 0
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

export function stdev(values: number[]): number {
  if (values.length < 2) return 0
  const average = mean(values)
  const variance =
    values.reduce((sum, value) => sum + (value - average) ** 2, 0) / values.length
  return Math.sqrt(variance)
}

export function levelFor(size: GridSize, totalMs: number): Level {
  const [excellent, good, pass] = BANDS[size]
  if (totalMs <= excellent) return '优秀'
  if (totalMs <= good) return '良好'
  if (totalMs <= pass) return '及格'
  return '继续练'
}

export function percentileFor(size: GridSize, totalMs: number): number {
  const [t100, t90, t80] = PERCENTILE_ANCHORS[size]
  let value: number
  if (totalMs <= t100) {
    value = 100
  } else if (totalMs <= t90) {
    value = 100 - ((totalMs - t100) / (t90 - t100)) * 10
  } else if (totalMs <= t80) {
    value = 90 - ((totalMs - t90) / (t80 - t90)) * 10
  } else {
    value = 80 - ((totalMs - t80) / (t80 - t90)) * 10
  }
  return Math.min(100, Math.max(1, Number(value.toFixed(2))))
}

export function formatDuration(ms: number): string {
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  const minutes = Math.floor(ms / 60000)
  const seconds = ((ms % 60000) / 1000).toFixed(1)
  return `${minutes}:${seconds.padStart(4, '0')}`
}

export interface SummarizeInput {
  size: GridSize
  totalMs: number
  errors: number
  intervals: number[]
}

export function summarize({ size, totalMs, errors, intervals }: SummarizeInput): Metrics {
  const positive = intervals.filter((interval) => interval > 0)
  const average = mean(positive)
  const deviation = stdev(positive)
  const cv = average > 0 ? deviation / average : 0
  const middle = Math.floor(positive.length / 2)
  const firstHalf = median(positive.slice(0, middle))
  const secondHalf = median(positive.slice(middle))
  const drift = firstHalf > 0 ? secondHalf / firstHalf : 1
  return {
    totalMs,
    errors,
    perNumberMs: totalMs / (size * size),
    medianIntervalMs: median(positive),
    cv,
    drift,
    level: levelFor(size, totalMs)
  }
}
