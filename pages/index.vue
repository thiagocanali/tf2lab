<template>
  <main class="home-page">
    <section class="hero">
      <div class="hero-copy">
        <span class="eyebrow">TF2Lab</span>
        <h1>Helping competitive Team Fortress 2 players improve through data.</h1>
        <p>Search your SteamID or logs.tf URL and start your analytics journey.</p>

        <form class="search-form" @submit.prevent="onSubmit">
          <input
            v-model="query"
            type="text"
            placeholder="SteamID / logs.tf URL"
            aria-label="SteamID or logs.tf URL"
          />
          <button type="submit" :disabled="!query.trim()">Buscar</button>
        </form>

        <p v-if="searchMessage" class="search-message">{{ searchMessage }}</p>
      </div>

      <section class="feature-cards">
        <article class="feature-card">
          <h2>Analytics</h2>
          <p>Track your performance, stats, and evolution across matches.</p>
          <span class="tag disabled">Coming soon</span>
        </article>

        <article class="feature-card">
          <h2>Competitions</h2>
          <p>Manage teams, matches, and tournament workflows in one place.</p>
          <span class="tag disabled">Coming soon</span>
        </article>

        <article class="feature-card">
          <h2>Academy</h2>
          <p>Learn competitive TF2 with curated guides, drills, and training paths.</p>
          <span class="tag disabled">Coming soon</span>
        </article>
      </section>
    </section>
  </main>
</template>

<script setup>
import { ref } from 'vue'
import { useFeatures } from '~/composables/useFeatures'

const query = ref('')
const searchMessage = ref('')
const { isEnabled } = useFeatures()

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
  width: min(100%, 1200px);
  margin: 0 auto;
  padding: 3rem 1.5rem;
}

.hero {
  display: grid;
  gap: 2rem;
}

.hero-copy {
  max-width: 44rem;
}

.eyebrow {
  display: inline-flex;
  padding: 0.35rem 0.8rem;
  border-radius: 999px;
  background: rgba(255, 79, 60, 0.12);
  color: var(--accent);
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

h1 {
  margin: 1rem 0 1rem;
  font-size: clamp(2.5rem, 4vw, 4rem);
  line-height: 1.02;
}

p {
  margin: 0;
  color: var(--text-muted);
  line-height: 1.75;
}

.search-form {
  margin-top: 2rem;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 1rem;
}

.search-form input {
  width: 100%;
  min-height: 4rem;
  padding: 1rem 1.15rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.04);
  color: var(--text);
}

.search-form input:focus {
  outline: none;
  border-color: rgba(255, 79, 60, 0.8);
}

.search-form button {
  min-width: 10rem;
  padding: 1rem 1.5rem;
  border: none;
  border-radius: 1rem;
  background: var(--accent);
  color: #121212;
  font-weight: 700;
  cursor: pointer;
}

.search-form button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.search-message {
  margin-top: 1rem;
}

.feature-cards {
  display: grid;
  gap: 1.25rem;
  margin-top: 3rem;
}

.feature-card {
  padding: 1.75rem;
  border-radius: 1.25rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  display: grid;
  gap: 1rem;
}

.feature-card h2 {
  margin: 0;
}

.feature-card p {
  margin: 0;
}

.tag {
  display: inline-flex;
  padding: 0.45rem 0.75rem;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 700;
  width: fit-content;
}

.tag.disabled {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-muted);
}

@media (min-width: 900px) {
  .feature-cards {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
