<template>
  <main class="home-page">
    <section class="hero">
      <h1>TF2Lab</h1>
      <p>Helping competitive Team Fortress 2 players improve through data.</p>
      <form class="search-form" @submit.prevent="onSubmit">
        <input
          v-model="query"
          type="text"
          placeholder="SteamID / logs.tf URL"
          aria-label="SteamID or logs.tf URL"
        />
        <button type="submit" :disabled="!query.trim()">Search</button>
      </form>
      <p v-if="searchMessage" class="search-message">{{ searchMessage }}</p>
    </section>
  </main>
</template>

<script setup>
import { ref } from 'vue'

const query = ref('')
const searchMessage = ref('')

const onSubmit = () => {
  if (!query.value.trim()) {
    searchMessage.value = ''
    return
  }

  searchMessage.value = `Searching for: ${query.value.trim()}`
}
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 2rem;
}

.hero {
  text-align: center;
  max-width: 30rem;
}

.search-form {
  margin-top: 1.5rem;
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  justify-content: center;
}

.search-form input {
  min-width: 220px;
  width: 100%;
  max-width: 20rem;
  padding: 0.9rem 1rem;
  border: 1px solid #ccc;
  border-radius: 0.75rem;
}

.search-form button {
  padding: 0.95rem 1.5rem;
  border: none;
  background: #111;
  color: #fff;
  border-radius: 0.75rem;
  cursor: pointer;
}

.search-form button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.search-message {
  margin-top: 1rem;
  color: #444;
}
</style>
