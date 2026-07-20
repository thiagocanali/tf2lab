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
.search-form input { flex:1; padding:.5rem }
.results ul { list-style: none; padding:0 }
.results li { padding:.5rem 0; border-bottom: 1px solid rgba(0,0,0,.06) }
</style>
