<script setup lang="ts">
import { computed, ref } from 'vue'
import { formatDuration } from '@/core/metrics'
import type { GameResult } from '@/core/types'

const props = defineProps<{
  result: GameResult
  personalBest: boolean
  shareState: string
}>()

const emit = defineEmits<{
  again: []
  home: []
  records: []
  share: []
}>()

const showDetails = ref(false)
const perNumber = computed(() => (props.result.perNumberMs / 1000).toFixed(2))
const medianInterval = computed(() => (props.result.medianIntervalMs / 1000).toFixed(2))
</script>

<template>
  <div class="result" role="status">
    <span class="result-eyebrow">{{ result.size }}×{{ result.size }} · {{ result.mode === 'daily' ? '今日挑战' : '自由训练' }}</span>
    <strong class="result-time">{{ formatDuration(result.totalMs) }}</strong>
    <span class="result-level">{{ result.level }}</span>
    <p v-if="personalBest" class="result-best">新的个人最佳</p>

    <div class="result-grid">
      <div class="result-item">
        <span class="ri-label">错误</span>
        <span class="ri-value">{{ result.errors }}</span>
      </div>
      <div class="result-item">
        <span class="ri-label">每数字</span>
        <span class="ri-value">{{ perNumber }}s</span>
      </div>
      <div class="result-item">
        <span class="ri-label">节奏波动</span>
        <span class="ri-value">{{ result.cv.toFixed(2) }}</span>
      </div>
    </div>

    <button type="button" class="details-toggle" @click="showDetails = !showDetails">
      {{ showDetails ? '收起详情' : '查看详情' }}
    </button>
    <div v-if="showDetails" class="details">
      <p>间隔中位数：{{ medianInterval }}s</p>
      <p>前后半段漂移：{{ result.drift.toFixed(2) }}</p>
      <p>成绩受设备、视距与练习影响，请与自己的历史成绩比较。</p>
    </div>

    <p class="result-note">成人参考区间，非官方常模。</p>
    <p v-if="shareState" class="result-share">{{ shareState }}</p>

    <div class="result-actions">
      <button type="button" class="btn primary" @click="emit('again')">再来一局</button>
      <button type="button" class="btn ghost" @click="emit('home')">返回首页</button>
    </div>
    <div class="result-actions secondary">
      <button type="button" class="btn ghost" @click="emit('share')">分享成绩</button>
      <button type="button" class="btn ghost" @click="emit('records')">查看记录</button>
    </div>
  </div>
</template>
