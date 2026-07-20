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
          <div class="result-actions">
            <NuxtLink :to="`/log/${r.id}`">Detalhes do log</NuxtLink>
            <NuxtLink v-if="r.steamid" :to="`/player/${r.steamid}`">Perfil do jogador</NuxtLink>
            <a v-if="r.url" :href="r.url" target="_blank">Abrir no logs.tf</a>
          </div>
        </li>
      </ul>
      <div class="pagination">
        <button @click="prevPage" :disabled="page <= 1">Anterior</button>
        <span>Página {{ page }} / {{ totalPages() }}</span>
        <button @click="nextPage" :disabled="page >= totalPages()">Próxima</button>
      </div>
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
const page = ref(1)
const perPage = 10
const total = ref(0)

const service = useLogsService()

const onSearch = async (newPage = page.value) => {
  loading.value = true
  try {
    const res = await service.search(query.value, newPage, perPage)
    results.value = res?.results ?? res?.data ?? (Array.isArray(res) ? res : [])
    page.value = res?.page ?? newPage
    total.value = res?.total ?? results.value.length
  } catch (err) {
    results.value = [{ id: 'err', title: String(err) }]
    total.value = 0
  } finally {
    loading.value = false
  }
}

const totalPages = () => Math.max(1, Math.ceil(total.value / perPage))

const nextPage = () => {
  if (page.value < totalPages()) {
    onSearch(page.value + 1)
  }
}

const prevPage = () => {
  if (page.value > 1) {
    onSearch(page.value - 1)
  }
}
</script>

<style scoped>
.page-search { padding: 1.25rem }
.search-form { display:flex; gap: .5rem; margin-bottom: 1rem }
.search-form input { flex:1; padding:.75rem; border-radius: 12px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); color: var(--text); }
.search-form button { padding: .75rem 1.25rem; border-radius: 12px; border: none; background: var(--tf2-red); color: white; cursor: pointer; }
.results ul { list-style: none; padding:0 }
.results li { padding: 1rem; border: 1px solid rgba(255,255,255,.07); border-radius: 16px; margin-bottom: 1rem; background: rgba(255,255,255,0.02); }
.result-actions { display:flex; gap: 1rem; flex-wrap: wrap; margin-top: .75rem; }
.result-actions a, .result-actions a.router-link { color: var(--accent); }
.pagination { display:flex; justify-content:space-between; align-items:center; gap:1rem; margin-top:1rem }
</style>
