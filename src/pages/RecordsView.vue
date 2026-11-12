<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import TrendBars from '@/components/TrendBars.vue'
import { formatDuration } from '@/core/metrics'
import { bestForSize, clearAll, loadSessions, storageAvailable } from '@/core/storage'
import type { GridSize, SessionRecord } from '@/core/types'

const router = useRouter()
const sizes: GridSize[] = [3, 4, 5, 6]
const sessions = ref<SessionRecord[]>([])
const selected = ref<GridSize>(5)
const storageOk = ref(true)

onMounted(() => {
  storageOk.value = storageAvailable()
  sessions.value = loadSessions()
})

const bests = computed<Record<GridSize, number | null>>(() => ({
  3: bestForSize(3),
  4: bestForSize(4),
  5: bestForSize(5),
  6: bestForSize(6)
}))

const trend = computed(() =>
  sessions.value
    .filter((session) => session.size === selected.value)
    .slice(0, 12)
    .reverse()
)
const recent = computed(() => sessions.value.slice(0, 20))

function bestText(size: GridSize): string {
  const best = bests.value[size]
  return best === null ? '--' : formatDuration(best)
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value))
}

function clearRecords(): void {
  if (!window.confirm('确定清空所有训练记录？此操作不可恢复。')) return
  clearAll()
  sessions.value = []
}
</script>

<template>
  <main class="page records-page">
    <header class="records-head">
      <button type="button" class="back" @click="router.push('/')">← 返回</button>
      <h1 class="records-title">训练记录</h1>
    </header>

    <p v-if="!storageOk" class="storage-warning">当前浏览器无法使用本地存储，记录不会被保存。</p>

    <div class="best-grid">
      <div v-for="size in sizes" :key="size" class="best-card card">
        <span class="best-size">{{ size }}×{{ size }}</span>
        <strong class="best-time">{{ bestText(size) }}</strong>
      </div>
    </div>

    <div class="tabs">
      <button
        v-for="size in sizes"
        :key="size"
        type="button"
        class="tab"
        :class="{ 'is-active': selected === size }"
        @click="selected = size"
      >
        {{ size }}×{{ size }}
      </button>
    </div>

    <TrendBars v-if="trend.length > 0" :values="trend.map((session) => session.totalMs)" />
    <div v-else class="empty card">
      <strong class="empty-title">还没有 {{ selected }}×{{ selected }} 的记录</strong>
      <span>去完成一局，这里会出现你的进步曲线。</span>
      <button type="button" class="btn primary" @click="router.push('/')">去训练</button>
    </div>

    <section class="history-panel">
      <h2 class="section-title history-title">最近训练</h2>
      <ul v-if="recent.length > 0" class="history">
        <li v-for="session in recent" :key="session.id" class="history-item">
          <span>{{ session.size }}×{{ session.size }} · {{ formatDate(session.finishedAt) }}</span>
          <span>{{ formatDuration(session.totalMs) }} · 错 {{ session.errors }}</span>
        </li>
      </ul>
      <p v-else class="empty-hint">暂无训练记录。</p>

      <button v-if="recent.length > 0" type="button" class="btn clear" @click="clearRecords">
        清空记录
      </button>
    </section>
  </main>
</template>
