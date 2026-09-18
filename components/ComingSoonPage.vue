<template>
  <main class="coming-soon" :class="`coming-soon--${accent}`">
    <section class="coming-soon__hero" aria-labelledby="coming-soon-title">
      <div class="coming-soon__grid" aria-hidden="true" />
      <div class="coming-soon__copy">
        <p class="coming-soon__eyebrow"><span class="coming-soon__mark" /> {{ eyebrow }}</p>
        <span class="coming-soon__status">Coming soon</span>
        <h1 id="coming-soon-title">{{ title }}</h1>
        <p class="coming-soon__description">{{ description }}</p>
        <NuxtLink to="/" class="coming-soon__back">Back to home <span aria-hidden="true">→</span></NuxtLink>
      </div>

      <aside class="coming-soon__panel" aria-label="Planned features">
        <span class="coming-soon__panel-label">On the board</span>
        <ul>
          <li v-for="item in items" :key="item">
            <span class="coming-soon__bullet" aria-hidden="true">+</span>
            {{ item }}
          </li>
        </ul>
      </aside>
    </section>
  </main>
</template>

<script setup lang="ts">
defineProps<{
  eyebrow: string
  title: string
  description: string
  items: string[]
  accent: 'orange' | 'blue'
}>()
</script>

<style scoped>
.coming-soon {
  padding: clamp(1rem, 3vw, 3rem) 0;
}

.coming-soon__hero {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(16rem, 0.8fr);
  align-items: center;
  gap: clamp(2rem, 7vw, 6rem);
  min-height: min(62vh, 38rem);
  padding: clamp(2rem, 6vw, 5.5rem);
  border: 1px solid var(--border);
  border-radius: 2rem;
  background: linear-gradient(135deg, rgba(27, 32, 48, 0.92), rgba(9, 11, 18, 0.98));
  box-shadow: var(--shadow-strong);
}

.coming-soon__hero::before {
  position: absolute;
  inset: 0;
  z-index: -1;
  background: radial-gradient(circle at 8% 10%, var(--coming-soon-accent), transparent 32%);
  content: '';
  opacity: 0.16;
}

.coming-soon--blue {
  --coming-soon-accent: var(--tf2-blu);
}

.coming-soon--orange {
  --coming-soon-accent: var(--tf2-orange);
}

.coming-soon__grid {
  position: absolute;
  inset: 0;
  z-index: -1;
  background-image: linear-gradient(rgba(255, 255, 255, 0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.025) 1px, transparent 1px);
  background-size: 3rem 3rem;
  mask-image: linear-gradient(to bottom, black, transparent);
}

.coming-soon__copy {
  max-width: 40rem;
}

.coming-soon__eyebrow {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  margin: 0 0 1.25rem;
  color: var(--accent-soft);
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.13em;
  text-transform: uppercase;
}

.coming-soon__mark {
  width: 0.55rem;
  height: 0.55rem;
  border-radius: 50%;
  background: var(--coming-soon-accent);
  box-shadow: 0 0 0 0.3rem color-mix(in srgb, var(--coming-soon-accent) 18%, transparent);
}

.coming-soon__status {
  display: inline-flex;
  padding: 0.4rem 0.65rem;
  border: 1px solid color-mix(in srgb, var(--coming-soon-accent) 38%, transparent);
  border-radius: 999px;
  color: var(--coming-soon-accent);
  background: color-mix(in srgb, var(--coming-soon-accent) 10%, transparent);
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.coming-soon h1 {
  max-width: 9ch;
  margin: 1.25rem 0 0;
  font-size: clamp(3rem, 7vw, 6.2rem);
  letter-spacing: -0.06em;
  line-height: 0.92;
}

.coming-soon__description {
  max-width: 35rem;
  margin: 1.5rem 0 0;
  color: var(--text-soft);
  font-size: clamp(1rem, 1.5vw, 1.2rem);
  line-height: 1.7;
}

.coming-soon__back {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  margin-top: 2rem;
  color: var(--text);
  font-weight: 800;
  transition: gap 0.2s ease, color 0.2s ease;
}

.coming-soon__back:hover {
  gap: 0.7rem;
  color: var(--coming-soon-accent);
}

.coming-soon__panel {
  padding: 1.5rem;
  border: 1px solid color-mix(in srgb, var(--coming-soon-accent) 25%, var(--border));
  border-radius: 1.25rem;
  background: linear-gradient(155deg, color-mix(in srgb, var(--coming-soon-accent) 10%, var(--surface)), rgba(10, 12, 18, 0.86));
  box-shadow: 0 30px 70px rgba(0, 0, 0, 0.3);
}

.coming-soon__panel-label {
  color: var(--text-muted);
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.coming-soon__panel ul {
  display: grid;
  gap: 1rem;
  margin: 1.5rem 0 0;
  padding: 0;
  list-style: none;
}

.coming-soon__panel li {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--text-soft);
  line-height: 1.45;
}

.coming-soon__bullet {
  display: grid;
  width: 1.75rem;
  height: 1.75rem;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 0.55rem;
  color: var(--coming-soon-accent);
  background: color-mix(in srgb, var(--coming-soon-accent) 13%, transparent);
  font-size: 1.1rem;
  font-weight: 700;
}

@media (max-width: 760px) {
  .coming-soon__hero {
    grid-template-columns: 1fr;
    min-height: auto;
    padding: 2.5rem 1.5rem;
  }

  .coming-soon__panel {
    width: 100%;
  }
}
</style>
