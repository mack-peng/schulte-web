<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import type { GridSize } from '@/core/types'

const props = defineProps<{
  grid: number[]
  size: GridSize
  done: Set<number>
  hardMode: boolean
  wrongValue: number | null
  disabled?: boolean
}>()

const emit = defineEmits<{
  tap: [value: number, index: number, event: MouseEvent]
}>()

const boardRef = ref<HTMLElement | null>(null)
const boardWidth = ref(0)
let observer: ResizeObserver | null = null

const gap = computed(() => (props.size <= 4 ? 8 : 6))
const cellPx = computed(() => {
  const available = Math.min(boardWidth.value || 320, 480)
  const inner = available - gap.value * (props.size - 1)
  return Math.max(28, Math.floor(inner / props.size))
})
const boardPx = computed(() => cellPx.value * props.size + gap.value * (props.size - 1))
const fontPx = computed(() => Math.max(13, Math.round(cellPx.value * 0.38)))

const boardStyle = computed(() => ({
  width: `${boardPx.value}px`,
  height: `${boardPx.value}px`,
  gap: `${gap.value}px`,
  gridTemplateColumns: `repeat(${props.size}, ${cellPx.value}px)`
}))

const cellStyle = computed(() => ({
  width: `${cellPx.value}px`,
  height: `${cellPx.value}px`,
  fontSize: `${fontPx.value}px`
}))

function isDone(value: number): boolean {
  return props.done.has(value)
}

function showValue(value: number): boolean {
  return !isDone(value) || props.hardMode
}

function onTap(value: number, index: number, event: MouseEvent): void {
  if (props.disabled) return
  emit('tap', value, index, event)
}

onMounted(() => {
  if (!boardRef.value) return
  observer = new ResizeObserver((entries) => {
    const entry = entries[0]
    if (entry) boardWidth.value = entry.contentRect.width
  })
  observer.observe(boardRef.value)
  boardWidth.value = boardRef.value.clientWidth
})

onBeforeUnmount(() => {
  observer?.disconnect()
  observer = null
})
</script>

<template>
  <div ref="boardRef" class="board-wrap">
    <div
      class="board"
      :style="boardStyle"
      role="grid"
      :aria-label="`${size}乘${size}舒尔特方格`"
    >
      <button
        v-for="(value, index) in grid"
        :key="index"
        type="button"
        class="cell"
        :class="{ 'is-done': isDone(value), 'is-hard': hardMode, 'is-wrong': wrongValue === value }"
        :style="cellStyle"
        :aria-label="`数字 ${value}`"
        @click="onTap(value, index, $event)"
      >
        <span v-if="showValue(value)">{{ value }}</span>
        <span v-else class="dot" aria-hidden="true" />
      </button>
    </div>
  </div>
</template>
