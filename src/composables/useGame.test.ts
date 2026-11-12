import { effectScope } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useGame } from './useGame'

describe('useGame pause', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('preserves the partial interval across pause/resume', () => {
    vi.useFakeTimers()
    const times = [0, 2000, 5000, 20000, 22000]
    let index = 0
    vi.spyOn(performance, 'now').mockImplementation(() => times[index++] ?? 22000)

    const scope = effectScope()
    const game = scope.run(() => useGame(5, 'free'))!

    expect(game.tap(1)).toBe('started')
    expect(game.tap(2)).toBe('correct')
    game.pause()
    game.resume()
    expect(game.tap(3)).toBe('correct')
    expect(game.intervals.value).toEqual([2000, 5000])

    game.stopTicking()
    scope.stop()
  })
})
