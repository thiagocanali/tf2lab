<template>
  <div class="page-search container">
    <h1>Buscar logs</h1>
    <div class="search-form">
      <input v-model="query" placeholder="Digite jogador, mapa ou id do log" />
      <button :disabled="loading" @click="onSearch">{{ loading ? 'Buscando...' : 'Buscar' }}</button>
    </div>

    <div v-if="results.length" class="results">
      <h2>Resultados</h2>
      <ul>
        <li v-for="r in results" :key="r.id">
          <strong>{{ r.title ?? r.id }}</strong>
          <div>{{ r.map ? 'Mapa: ' + r.map : '' }}</div>
          <div>{{ r.timestamp }}</div>
          <div v-if="r.url"><a :href="r.url" target="_blank">Abrir log</a></div>
        </li>
      </ul>
    </div>

    <div v-else-if="!loading">
      <p>Nenhum resultado — tente outra busca.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import useLogsService from '~/features/analytics/services/logsService'

const query = ref('')
const results = ref<any[]>([])
const loading = ref(false)

const service = useLogsService()

const onSearch = async () => {
  loading.value = true
  try {
    const res = await service.search(query.value)
    // normalize common shapes: { results: [] } or { data: [] } or direct array
    results.value = res?.results ?? res?.data ?? (Array.isArray(res) ? res : [])
  } catch (err) {
    // simple error fallback
    results.value = [{ id: 'err', title: String(err) }]
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.page-search { padding: 1.25rem }
.search-form { display:flex; gap: .5rem; margin-bottom: 1rem }
.search-form input { flex:1; padding:.5rem }
.results ul { list-style: none; padding:0 }
.results li { padding:.5rem 0; border-bottom: 1px solid rgba(0,0,0,.06) }
</style>
