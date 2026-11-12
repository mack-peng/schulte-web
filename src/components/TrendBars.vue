<script setup lang="ts">
import { computed } from 'vue'
import { formatDuration } from '@/core/metrics'

const props = defineProps<{ values: number[] }>()

const max = computed(() => Math.max(...props.values, 1))
const min = computed(() => Math.min(...props.values, max.value))

function height(value: number): string {
  const span = Math.max(1, max.value - min.value)
  const ratio = 0.25 + 0.75 * ((max.value - value) / span)
  return `${Math.round(ratio * 100)}%`
}
</script>

<template>
  <div class="trend" role="img" :aria-label="`最近 ${values.length} 局用时趋势`">
    <div v-for="(value, index) in values" :key="index" class="trend-bar-wrap">
      <div class="trend-bar" :style="{ height: height(value) }" />
      <span class="trend-label">{{ formatDuration(value) }}</span>
    </div>
  </div>
</template>
