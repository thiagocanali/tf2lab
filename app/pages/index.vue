<template>
  <main class="home-page">
    <section class="hero" aria-labelledby="hero-title">
      <div class="hero-glow hero-glow-red" aria-hidden="true" />
      <div class="hero-glow hero-glow-blue" aria-hidden="true" />

      <div class="hero-copy">
        <p class="eyebrow"><span aria-hidden="true">✦</span> Competitive TF2 analytics</p>
        <h1 id="hero-title">Play smarter.<br><span>Improve faster.</span></h1>
        <p class="hero-description">
          Turn your logs.tf matches into the next training session. Track performance,
          find patterns, and focus on what moves your game forward.
        </p>

        <form class="hero-search" @submit.prevent="onSubmit">
          <label class="sr-only" for="player-search">SteamID, player name, or logs.tf URL</label>
          <span class="search-icon" aria-hidden="true">⌕</span>
          <input
            id="player-search"
            v-model="query"
            type="search"
            placeholder="Search SteamID, player, or log URL"
            autocomplete="off"
          >
          <button type="submit" :disabled="!query.trim()">Analyze player</button>
        </form>
        <p class="search-hint">Try a SteamID64, logs.tf log ID, or player name.</p>
      </div>

      <aside class="hero-panel" aria-label="TF2Lab analytics preview">
        <div class="panel-topline">
          <span class="live-dot" /> Live match insights
          <span class="panel-period">Last 30 days</span>
        </div>
        <div class="metric-row">
          <div>
            <span class="metric-label">Performance score</span>
            <strong>87<span>/100</span></strong>
          </div>
          <span class="score-badge">+12%</span>
        </div>
        <div class="chart" aria-hidden="true">
          <span v-for="height in chartBars" :key="height" :style="{ height }" />
        </div>
        <div class="panel-footer">
          <span>Recent matches</span>
          <strong>14 analyzed</strong>
        </div>
      </aside>
    </section>

    <section class="proof" aria-label="TF2Lab features">
      <article>
        <span class="proof-icon">↗</span>
        <div><strong>Find your edge</strong><p>See what wins more rounds.</p></div>
      </article>
      <article>
        <span class="proof-icon">◌</span>
        <div><strong>Learn from every match</strong><p>Turn trends into training goals.</p></div>
      </article>
      <article>
        <span class="proof-icon">⌁</span>
        <div><strong>Built for competitive TF2</strong><p>Focused, useful, and free.</p></div>
      </article>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const query = ref('')
const chartBars = ['38%', '54%', '47%', '66%', '58%', '76%', '69%', '88%', '80%', '100%']

const onSubmit = () => {
  const term = query.value.trim()

  if (term) {
    navigateTo({ path: '/search', query: { q: term } })
  }
}
</script>

<style scoped>
.home-page { padding: clamp(1rem, 3vw, 3rem) 0 1rem; }
.hero { position: relative; overflow: hidden; min-height: 550px; isolation: isolate; display: grid; grid-template-columns: minmax(0, 1.25fr) minmax(300px, .75fr); align-items: center; gap: clamp(2rem, 7vw, 7rem); padding: clamp(2.5rem, 7vw, 6rem); border: 1px solid var(--border); border-radius: 2rem; background: linear-gradient(135deg, rgba(27, 32, 48, .88), rgba(9, 11, 18, .97)); box-shadow: var(--shadow-strong); }
.hero::before { content: ''; position: absolute; inset: 0; z-index: -1; opacity: .45; background-image: linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px); background-size: 42px 42px; mask-image: linear-gradient(to bottom, black, transparent); }
.hero-glow { position: absolute; z-index: -2; width: 30rem; height: 30rem; filter: blur(12px); border-radius: 999px; opacity: .24; }
.hero-glow-red { background: var(--tf2-red); top: -16rem; left: -12rem; }.hero-glow-blue { background: var(--tf2-blu); right: -17rem; bottom: -17rem; }
.hero-copy { max-width: 42rem; }.eyebrow { display: flex; gap: .45rem; align-items: center; margin: 0 0 1.25rem; color: var(--accent-soft); font-size: .8rem; font-weight: 800; letter-spacing: .13em; text-transform: uppercase; }.eyebrow span { font-size: 1rem; }
h1 { margin: 0; max-width: 10ch; font-size: clamp(3.1rem, 6.5vw, 6.3rem); letter-spacing: -.065em; line-height: .9; }.hero h1 span { color: var(--accent); }
.hero-description { max-width: 35rem; margin: 1.8rem 0 0; color: var(--text-soft); font-size: clamp(1rem, 1.5vw, 1.2rem); line-height: 1.7; }
.hero-search { display: flex; align-items: center; gap: .75rem; width: 100%; margin-top: 2.4rem; padding: .55rem .55rem .55rem 1.1rem; border: 1px solid rgba(255,255,255,.14); border-radius: 1.1rem; background: rgba(7, 8, 13, .68); box-shadow: 0 16px 50px rgba(0,0,0,.24); }.search-icon { color: var(--accent-soft); font-size: 1.85rem; line-height: 1; transform: rotate(-18deg); }.hero-search input { min-width: 0; flex: 1; border: 0; outline: 0; background: transparent; color: var(--text); font-size: 1rem; }.hero-search input::placeholder { color: var(--text-muted); }.hero-search button { border: 0; border-radius: .78rem; padding: .95rem 1.2rem; background: var(--accent); color: #160807; font-weight: 800; cursor: pointer; transition: transform .2s ease, background .2s ease; }.hero-search button:hover:not(:disabled) { background: #ff765d; transform: translateY(-1px); }.hero-search button:disabled { cursor: not-allowed; opacity: .45; }.search-hint { margin: .8rem 0 0 1.1rem; color: var(--text-muted); font-size: .84rem; }
.hero-panel { width: min(100%, 25rem); justify-self: end; padding: 1.45rem; border: 1px solid rgba(255,255,255,.12); border-radius: 1.25rem; background: linear-gradient(150deg, rgba(33, 40, 59, .88), rgba(11, 13, 21, .9)); box-shadow: 0 30px 70px rgba(0,0,0,.32); transform: rotate(3deg); }.panel-topline, .panel-footer { display: flex; align-items: center; gap: .5rem; color: var(--text-soft); font-size: .78rem; font-weight: 650; }.panel-period { margin-left: auto; color: var(--text-muted); font-weight: 500; }.live-dot { width: .45rem; height: .45rem; border-radius: 50%; background: var(--success); box-shadow: 0 0 0 .25rem rgba(75,211,127,.12); }.metric-row { display: flex; align-items: end; justify-content: space-between; margin: 2rem 0 1.3rem; }.metric-label { display: block; margin-bottom: .4rem; color: var(--text-muted); font-size: .8rem; }.metric-row strong { font-size: 2.5rem; letter-spacing: -.07em; }.metric-row strong span { color: var(--text-muted); font-size: 1rem; letter-spacing: 0; }.score-badge { padding: .38rem .55rem; border-radius: .5rem; background: rgba(75,211,127,.13); color: var(--success); font-size: .8rem; font-weight: 800; }.chart { height: 9rem; display: flex; align-items: end; gap: .45rem; padding: .9rem .2rem; border-bottom: 1px solid var(--border); background: linear-gradient(to top, rgba(58,128,255,.08), transparent); }.chart span { flex: 1; min-width: .3rem; border-radius: .3rem .3rem 0 0; background: linear-gradient(to top, var(--tf2-blu), #89b9ff); }.panel-footer { justify-content: space-between; padding-top: 1rem; }.panel-footer strong { color: var(--text); }
.proof { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; margin-top: 1px; overflow: hidden; border: 1px solid var(--border); border-radius: 0 0 1.25rem 1.25rem; background: var(--border); }.proof article { display: flex; gap: .9rem; align-items: center; padding: 1.4rem 1.5rem; background: rgba(17, 20, 31, .84); }.proof-icon { display: grid; width: 2.3rem; height: 2.3rem; flex: 0 0 auto; place-items: center; border-radius: .7rem; background: rgba(255,79,60,.12); color: var(--accent-soft); font-size: 1.25rem; }.proof strong { font-size: .92rem; }.proof p { margin: .25rem 0 0; color: var(--text-muted); font-size: .8rem; }.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
@media (max-width: 840px) { .hero { grid-template-columns: 1fr; padding: 3rem 1.5rem; }.hero-panel { justify-self: start; transform: none; }.proof { grid-template-columns: 1fr; border-radius: 0 0 1rem 1rem; } }
@media (max-width: 520px) { .hero { min-height: auto; }.hero-search { flex-wrap: wrap; padding: .7rem; }.hero-search input { min-height: 2.8rem; }.hero-search button { width: 100%; }.search-icon { margin-left: .35rem; }.content-area { padding: 1rem; } }
</style>
