<template>
  <Card class="log-header">
    <div class="header-row">
      <div>
        <h2>{{ data.title ?? ('Log ' + data.id) }}</h2>
        <div class="meta">
          <span v-if="data.map">Mapa: {{ data.map }}</span>
          <span v-if="data.timestamp"> • {{ formattedDate }}</span>
          <span v-if="data.duration"> • {{ formattedDuration }}</span>
        </div>
      </div>
      <div class="scores">
        <Badge value="Red: {{ data.redScore ?? '-' }}" severity="danger" />
        <Badge value="Blu: {{ data.bluScore ?? '-' }}" class="ml" />
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { LogData } from '~/features/analytics/types'
const props = defineProps<{ data: LogData }>()

const formattedDate = computed(() => props.data.timestamp ? new Date(props.data.timestamp).toLocaleString() : '')
const formattedDuration = computed(() => {
  if (!props.data.duration) return ''
  const mins = Math.floor(props.data.duration / 60)
  const secs = props.data.duration % 60
  return `${mins}m ${secs}s`
})
</script>

<style scoped>
.header-row { display:flex; justify-content:space-between; align-items:center }
.meta { color: var(--muted, #ccc); margin-top:4px }
.scores { display:flex; gap: .5rem; align-items:center }
.ml { margin-left:.5rem }
</style>
