<template>
  <div class="page-log container">
    <Breadcrumbs :items="breadcrumbs" />
    <BackButton fallback="/search" label="Voltar para Busca" />

    <Skeleton v-if="pending" width="100%" height="200px" />
    <div v-else>
      <LogDetail v-if="data" :data="data" />
      <div v-else class="no-data">{{ error ?? 'Log não encontrado' }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAsyncData } from '#app'
import LogDetail from '~/features/search/components/LogDetail.vue'
import Breadcrumbs from '~/components/Breadcrumbs.vue'
import BackButton from '~/components/BackButton.vue'
import type { LogData } from '~/features/analytics/types'

const route = useRoute()
const id = route.params.id as string

const { data: res, pending, error } = await useAsyncData(`log-${id}`, () => $fetch(`/api/log/${encodeURIComponent(id)}`))
const data = res?.data as LogData | undefined

const breadcrumbs = computed(() => [
  { label: 'Search', to: '/search' },
  { label: data?.title ? data.title : `Log ${id}` }
])
</script>

<style scoped>
.page-log { padding:1.25rem }
.no-data { color: var(--muted, #aaa) }
</style>
