<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import GridBoard from '@/components/GridBoard.vue'
import ResultCard from '@/components/ResultCard.vue'
import { useGame } from '@/composables/useGame'
import { utcDateKey } from '@/core/daily'
import { formatDuration } from '@/core/metrics'
import {
  appendSession,
  bestForSize,
  createSessionId,
  loadSettings,
  saveDailyResult
} from '@/core/storage'
import type { GameMode, GridSize, SessionRecord } from '@/core/types'

const route = useRoute()
const router = useRouter()
const rawSize = Number(route.query.size)
const size: GridSize =
  rawSize === 3 || rawSize === 4 || rawSize === 5 || rawSize === 6 ? rawSize : 5
const mode: GameMode = route.query.mode === 'daily' ? 'daily' : 'free'
const settings = loadSettings()

const { grid, status, next, errors, done, elapsedText, result, tap, pause, resume, restart } =
  useGame(size, mode)

const wrongValue = ref<number | null>(null)
const personalBest = ref(false)
const shareState = ref('')
let wrongTimer: ReturnType<typeof setTimeout> | null = null
let saved = false

function flashWrong(value: number): void {
  wrongValue.value = value
  if (wrongTimer) clearTimeout(wrongTimer)
  wrongTimer = setTimeout(() => {
    wrongValue.value = null
    wrongTimer = null
  }, 260)
}

function onTap(value: number, _index: number, event: MouseEvent): void {
  const outcome = tap(value, event.timeStamp || performance.now())
  if (outcome === 'wrong') {
    flashWrong(value)
    if (typeof navigator.vibrate === 'function') navigator.vibrate(20)
  }
}

watch(result, (value) => {
  if (!value || saved) return
  saved = true
  const previousBest = bestForSize(size)
  personalBest.value = previousBest === null || value.totalMs < previousBest
  const record: SessionRecord = {
    id: createSessionId(),
    size,
    mode,
    totalMs: value.totalMs,
    errors: value.errors,
    perNumberMs: value.perNumberMs,
    medianIntervalMs: value.medianIntervalMs,
    cv: value.cv,
    drift: value.drift,
    level: value.level,
    finishedAt: new Date().toISOString(),
    ...(mode === 'daily' ? { utcDate: utcDateKey() } : {})
  }
  appendSession(record)
  if (mode === 'daily') saveDailyResult(utcDateKey(), value.totalMs)
})

function onVisibility(): void {
  if (document.visibilityState === 'hidden') pause()
}

onMounted(() => {
  document.addEventListener('visibilitychange', onVisibility)
})

onBeforeUnmount(() => {
  document.removeEventListener('visibilitychange', onVisibility)
  if (wrongTimer) clearTimeout(wrongTimer)
})

function togglePause(): void {
  if (status.value === 'running') pause()
  else if (status.value === 'paused') resume()
}

function again(): void {
  saved = false
  personalBest.value = false
  shareState.value = ''
  wrongValue.value = null
  restart()
}

function goHome(): void {
  router.push('/')
}

function goRecords(): void {
  router.push('/records')
}

async function copyText(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }
  const area = document.createElement('textarea')
  area.value = text
  area.style.position = 'fixed'
  area.style.opacity = '0'
  document.body.appendChild(area)
  area.select()
  const copied = document.execCommand('copy')
  document.body.removeChild(area)
  if (!copied) throw new Error('copy failed')
}

async function share(): Promise<void> {
  if (!result.value) return
  const text = `我在舒尔特方格 ${size}×${size} 用了 ${formatDuration(result.value.totalMs)}，错误 ${result.value.errors} 次。来试试？`
  const url = `${location.origin}${location.pathname}`
  try {
    if (navigator.share) {
      await navigator.share({ title: '舒尔特方格', text, url })
      shareState.value = '已分享'
    } else {
      await copyText(`${text} ${url}`)
      shareState.value = '已复制分享文案'
    }
  } catch (error) {
    if ((error as DOMException)?.name === 'AbortError') return
    try {
      await copyText(`${text} ${url}`)
      shareState.value = '已复制分享文案'
    } catch {
      shareState.value = '分享失败，请手动复制'
    }
  }
  setTimeout(() => {
    shareState.value = ''
  }, 2000)
}
</script>

<template>
  <main class="page game-page">
    <div class="game-layout">
      <aside class="game-panel">
        <div class="game-top">
          <button type="button" class="back" @click="goHome">← 返回</button>
          <span class="game-mode">{{ size }}×{{ size }} · {{ mode === 'daily' ? '今日挑战' : '自由训练' }}</span>
        </div>

        <div class="hud">
          <div class="hud-item">
            <span class="hud-label">用时</span>
            <strong class="hud-value">{{ elapsedText }}</strong>
          </div>
          <div class="hud-item">
            <span class="hud-label">下一个</span>
            <strong class="hud-value target">{{ status === 'idle' ? 1 : next }}</strong>
          </div>
          <div class="hud-item">
            <span class="hud-label">错误</span>
            <strong class="hud-value">{{ errors }}</strong>
          </div>
        </div>

        <p class="tip">
          {{ status === 'idle' ? '点击 1 开始计时 · 视线尽量留在方格中央' : '保持节奏，先准后快' }}
        </p>

        <div class="actions">
          <button type="button" class="btn ghost" @click="togglePause">
            {{ status === 'paused' ? '继续' : '暂停' }}
          </button>
          <button type="button" class="btn ghost" @click="again">重开</button>
        </div>
      </aside>

      <div class="game-board-area">
        <GridBoard
          :grid="grid"
          :size="size"
          :done="done"
          :hard-mode="settings.hardMode"
          :wrong-value="wrongValue"
          :disabled="status === 'paused' || status === 'finished'"
          @tap="onTap"
        />
      </div>
    </div>

    <div v-if="status === 'paused'" class="overlay" @click="resume">
      <div class="overlay-card pause-card">
        <strong class="pause-title">已暂停</strong>
        <span class="pause-desc">点击任意处继续</span>
      </div>
    </div>

    <div v-if="result" class="overlay">
      <ResultCard
        :result="result"
        :personal-best="personalBest"
        :share-state="shareState"
        @again="again"
        @home="goHome"
        @records="goRecords"
        @share="share"
      />
    </div>
  </main>
</template>
