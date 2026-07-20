<template>
  <div class="log-detail">
    <LogHeader :data="data" />
    <div class="layout">
      <div class="main">
        <LogPlayersTable :players="data.players ?? []" />
      </div>
      <aside class="side">
        <LogStatsGrid :data="data" />
        <Card class="actions">
          <Button label="Voltar para Busca" @click="goBack" />
          <a v-if="data.url" :href="data.url" target="_blank" class="external">Abrir no logs.tf</a>
        </Card>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import LogHeader from './LogHeader.vue'
import LogPlayersTable from './LogPlayersTable.vue'
import LogStatsGrid from './LogStatsGrid.vue'
import type { LogData } from '~/features/analytics/types'

const props = defineProps<{ data: LogData }>()
const router = useRouter()

const goBack = () => router.push('/search')
</script>

<style scoped>
.log-detail { display:flex; flex-direction:column; gap:1rem }
.layout { display:flex; gap:1rem }
.main { flex:3 }
.side { flex:1; display:flex; flex-direction:column; gap:1rem }
.actions { display:flex; flex-direction:column; gap:.5rem }
.external { color: var(--accent); text-decoration:underline }
@media(max-width:800px){ .layout{ flex-direction:column } }
</style>
