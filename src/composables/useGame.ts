import { computed, onBeforeUnmount, ref } from 'vue'
import { dailyGrid } from '@/core/daily'
import { generateGrid } from '@/core/grid'
import { summarize } from '@/core/metrics'
import type { GameMode, GameResult, GameStatus, GridSize, TapResult } from '@/core/types'

export function useGame(size: GridSize, mode: GameMode) {
  const grid = ref<number[]>([])
  const status = ref<GameStatus>('idle')
  const next = ref(1)
  const errors = ref(0)
  const done = ref<Set<number>>(new Set())
  const intervals = ref<number[]>([])
  const accumulatedMs = ref(0)
  const runStartedAt = ref(0)
  const lastCorrectAt = ref(0)
  const nowTick = ref(0)
  const result = ref<GameResult | null>(null)
  let tickTimer: ReturnType<typeof setInterval> | null = null

  const elapsedMs = computed(() => {
    const running =
      status.value === 'running' ? Math.max(0, nowTick.value - runStartedAt.value) : 0
    return accumulatedMs.value + running
  })

  const elapsedText = computed(() => (elapsedMs.value / 1000).toFixed(1))
  const totalNumbers = size * size

  function now(): number {
    return typeof performance !== 'undefined' ? performance.now() : Date.now()
  }

  function createGrid(): number[] {
    return mode === 'daily' ? dailyGrid(size) : generateGrid(size)
  }

  function startTicking(): void {
    stopTicking()
    tickTimer = setInterval(() => {
      nowTick.value = now()
    }, 100)
  }

  function stopTicking(): void {
    if (tickTimer !== null) {
      clearInterval(tickTimer)
      tickTimer = null
    }
  }

  function reset(): void {
    stopTicking()
    grid.value = createGrid()
    status.value = 'idle'
    next.value = 1
    errors.value = 0
    done.value = new Set()
    intervals.value = []
    accumulatedMs.value = 0
    runStartedAt.value = 0
    lastCorrectAt.value = 0
    nowTick.value = 0
    result.value = null
  }

  function markDone(value: number): void {
    const updated = new Set(done.value)
    updated.add(value)
    done.value = updated
  }

  function finish(at: number): void {
    stopTicking()
    const totalMs = intervals.value.reduce((sum, interval) => sum + interval, 0)
    status.value = 'finished'
    nowTick.value = at
    result.value = {
      size,
      mode,
      intervals: [...intervals.value],
      ...summarize({ size, totalMs, errors: errors.value, intervals: intervals.value })
    }
  }

  function tap(value: number, at = now()): TapResult {
    if (status.value === 'finished' || status.value === 'paused') return 'ignored'
    if (status.value === 'idle') {
      if (value !== 1) return 'ignored'
      status.value = 'running'
      runStartedAt.value = at
      lastCorrectAt.value = at
      nowTick.value = at
      startTicking()
      markDone(value)
      next.value = 2
      return 'started'
    }
    if (value !== next.value) {
      errors.value += 1
      return 'wrong'
    }
    intervals.value.push(Math.max(0, at - lastCorrectAt.value))
    lastCorrectAt.value = at
    nowTick.value = at
    markDone(value)
    next.value += 1
    if (next.value > totalNumbers) {
      finish(at)
      return 'finished'
    }
    return 'correct'
  }

  function pause(): void {
    if (status.value !== 'running') return
    const at = now()
    accumulatedMs.value += Math.max(0, at - runStartedAt.value)
    runStartedAt.value = 0
    nowTick.value = at
    status.value = 'paused'
    stopTicking()
  }

  function resume(): void {
    if (status.value !== 'paused') return
    const at = now()
    runStartedAt.value = at
    lastCorrectAt.value = at
    nowTick.value = at
    status.value = 'running'
    startTicking()
  }

  function restart(): void {
    reset()
  }

  onBeforeUnmount(stopTicking)

  reset()

  return {
    grid,
    status,
    next,
    errors,
    done,
    intervals,
    elapsedMs,
    elapsedText,
    result,
    totalNumbers,
    tap,
    pause,
    resume,
    restart,
    stopTicking
  }
}
