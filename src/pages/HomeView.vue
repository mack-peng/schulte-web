<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useTheme } from '@/composables/useTheme'
import { utcDateKey } from '@/core/daily'
import { formatDuration } from '@/core/metrics'
import {
  bestBySize,
  loadDaily,
  loadSessions,
  loadSettings,
  saveSettings,
  storageAvailable
} from '@/core/storage'
import type { DailyResult, GameMode, GridSize, Settings } from '@/core/types'

const router = useRouter()
const { theme, toggleTheme } = useTheme()
const modes: { size: GridSize; tag: string; desc: string }[] = [
  { size: 3, tag: '入门', desc: '儿童 / 热身' },
  { size: 4, tag: '轻松', desc: '过渡尺寸' },
  { size: 5, tag: '标准', desc: '最常用' },
  { size: 6, tag: '挑战', desc: '进阶' }
]

const bests = ref<Record<GridSize, number | null>>({ 3: null, 4: null, 5: null, 6: null })
const daily = ref<DailyResult | null>(null)
const settings = ref<Settings>({ hardMode: false })
const showHelp = ref(false)
const storageOk = ref(true)
const today = utcDateKey()
const todayLabel = new Intl.DateTimeFormat('zh-CN', {
  month: 'long',
  day: 'numeric',
  weekday: 'short'
}).format(new Date())

const dailyText = computed(() =>
  daily.value ? `今日最佳 ${formatDuration(daily.value.bestMs)} · 已完成` : '每天一张，和昨天比'
)

onMounted(() => {
  storageOk.value = storageAvailable()
  settings.value = loadSettings()
  bests.value = bestBySize(loadSessions())
  daily.value = loadDaily()[today] ?? null
})

function bestText(size: GridSize): string {
  const best = bests.value[size]
  return best === null ? '--' : formatDuration(best)
}

function toggleHardMode(): void {
  settings.value = { ...settings.value, hardMode: !settings.value.hardMode }
  saveSettings(settings.value)
}

function start(size: GridSize, mode: GameMode = 'free'): void {
  router.push({ name: 'game', query: { size: String(size), mode } })
}
</script>

<template>
  <main class="page home-page">
    <div class="home-main">
    <header class="hero">
      <button
        type="button"
        class="theme-toggle"
        :aria-label="theme === 'dark' ? '切换到浅色模式' : '切换到深色模式'"
        @click="toggleTheme"
      >
        {{ theme === 'dark' ? '☀' : '☾' }}
      </button>
      <span class="eyebrow">VISUAL SEARCH TRAINING</span>
      <h1 class="title">舒尔特方格</h1>
      <p class="subtitle">按顺序找到数字，训练视觉搜索与持续注意。</p>
    </header>

    <button type="button" class="daily card" @click="start(5, 'daily')">
      <span class="daily-copy">
        <span class="daily-label">今日挑战 · {{ todayLabel }}</span>
        <strong class="daily-title">5 × 5 · 全球同一张表</strong>
        <span class="daily-hint">{{ dailyText }}</span>
      </span>
      <span class="daily-badge" aria-hidden="true">→</span>
    </button>

    <section class="modes-section">
    <div class="section-head">
      <h2 class="section-title">选择尺寸</h2>
      <span class="section-note">成人标准 5×5</span>
    </div>

    <div class="modes">
      <button
        v-for="mode in modes"
        :key="mode.size"
        type="button"
        class="mode card"
        @click="start(mode.size)"
      >
        <span class="mode-top">
          <span class="mode-size">{{ mode.size }}×{{ mode.size }}</span>
          <span class="mode-tag">{{ mode.tag }}</span>
        </span>
        <span class="mode-desc">{{ mode.desc }}</span>
        <span class="mode-best">
          <span class="best-label">最佳</span>
          <span class="best-value">{{ bestText(mode.size) }}</span>
        </span>
      </button>
    </div>
    </section>
    </div>

    <aside class="home-aside">
    <div class="settings-row card">
      <span>
        <span class="settings-label">困难模式</span>
        <span class="settings-desc">已找数字保持可见</span>
      </span>
      <button
        type="button"
        class="switch"
        :class="{ 'is-on': settings.hardMode }"
        :aria-pressed="settings.hardMode"
        aria-label="切换困难模式"
        @click="toggleHardMode"
      >
        <span class="switch-knob" />
      </button>
    </div>

    <div class="tips card">
      <span class="tips-title">训练提示</span>
      <ul class="tips-list">
        <li>视线留在方格中央，用周边视觉找数字。</li>
        <li>先准后快，误点比慢半秒更伤节奏。</li>
        <li>看最近几局的中位数，不看单次最好。</li>
      </ul>
    </div>

    <p v-if="!storageOk" class="storage-warning">当前浏览器无法使用本地存储，成绩不会被保存。</p>

    <div class="links">
      <button type="button" class="link" @click="router.push('/records')">训练记录</button>
      <button type="button" class="link" @click="showHelp = true">玩法与说明</button>
    </div>

    <p class="disclaimer">
      本工具为视觉搜索训练游戏，不构成医疗或心理诊断。成绩受设备、视距与练习影响，请与自己历史成绩比较。
    </p>
    </aside>

    <div v-if="showHelp" class="overlay" @click.self="showHelp = false">
      <div class="overlay-card help-card">
        <h2 class="help-title">怎么玩</h2>
        <ol class="help-list">
          <li>选择尺寸，点击数字 1 开始计时。</li>
          <li>按 1、2、3……顺序尽快点击，点错会计入错误。</li>
          <li>视线尽量留在方格中央，用周边视觉找下一个数字。</li>
          <li>每天 5–10 分钟，先准后快；看多局中位数，不看单次最好。</li>
        </ol>
        <p class="help-note">练同一张表会变成位置记忆。定期换尺寸或使用每日挑战。</p>
        <button type="button" class="btn primary" @click="showHelp = false">知道了</button>
      </div>
    </div>
  </main>
</template>
