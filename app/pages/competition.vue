<template>
  <main class="competition-page">
    <section class="competition-hero" aria-labelledby="competition-title">
      <div class="hero-grid" aria-hidden="true" />
      <div class="hero-copy">
        <p class="eyebrow"><span class="eyebrow-mark" aria-hidden="true">VS</span> TF2Lab Competition</p>
        <h1 id="competition-title">Ligas, times e partidas em um só lugar.</h1>
        <p class="hero-description">
          Encontre onde jogar, acompanhe a cena e prepare cada partida com contexto competitivo, do primeiro PUG à próxima temporada.
        </p>
        <div class="hero-actions">
          <a href="#cena" class="primary-link">Explorar a cena <span aria-hidden="true">-&gt;</span></a>
          <NuxtLink to="/search" class="secondary-link">Analisar um jogador</NuxtLink>
        </div>
      </div>

      <aside class="match-board" aria-label="Visão do módulo Competition">
        <div class="board-header"><span class="live-dot" /> Match board <span>TF2Lab</span></div>
        <div class="board-row"><strong>LEAGUES</strong><span>BR + INTL</span></div>
        <div class="board-row"><strong>TEAMS</strong><span>SCOUT / ORGANIZE</span></div>
        <div class="board-row"><strong>MATCHES</strong><span>PREPARE / REVIEW</span></div>
        <div class="board-footer">Dados públicos. Contexto competitivo.</div>
      </aside>
    </section>

    <section id="cena" class="competition-section" aria-labelledby="scene-title">
      <header class="section-heading">
        <div>
          <p class="section-kicker">Onde a comunidade joga</p>
          <h2 id="scene-title">Cena competitiva</h2>
        </div>
        <p class="section-intro">Comece por uma liga ou plataforma, encontre seu próximo jogo e acompanhe as referências da cena.</p>
      </header>

      <div class="scene-group">
        <div class="group-label"><span class="group-dot group-dot--red" /> Brasil</div>
        <div class="scene-grid">
          <a v-for="card in brazilScene" :key="card.name" :href="card.url" target="_blank" rel="noopener noreferrer" class="scene-card scene-card--red">
            <div class="scene-card-top"><span class="scene-mark">{{ card.mark }}</span><span class="external-mark" aria-hidden="true">↗</span></div>
            <h3>{{ card.name }}</h3>
            <p>{{ card.description }}</p>
            <span class="visit-link">Visitar site</span>
          </a>
        </div>
      </div>

      <div class="scene-group scene-group--international">
        <div class="group-label"><span class="group-dot group-dot--blue" /> Internacional</div>
        <div class="scene-grid">
          <a v-for="card in internationalScene" :key="card.name" :href="card.url" target="_blank" rel="noopener noreferrer" class="scene-card scene-card--blue">
            <div class="scene-card-top"><span class="scene-mark">{{ card.mark }}</span><span class="external-mark" aria-hidden="true">↗</span></div>
            <h3>{{ card.name }}</h3>
            <p>{{ card.description }}</p>
            <span class="visit-link">Visitar site</span>
          </a>
        </div>
      </div>
    </section>

    <section class="competition-section roadmap-section" aria-labelledby="roadmap-title">
      <div class="roadmap-panel">
        <div class="roadmap-copy">
          <p class="section-kicker">Próximos passos</p>
          <h2 id="roadmap-title">O que vem no TF2Lab Competition</h2>
          <p>Uma camada simples para acompanhar a competição sem substituir as plataformas que já sustentam a comunidade.</p>
        </div>
        <div class="roadmap-list">
          <article v-for="(item, index) in roadmap" :key="item.title" class="roadmap-item">
            <span class="roadmap-number">0{{ index + 1 }}</span>
            <div><h3>{{ item.title }}</h3><p>{{ item.description }}</p></div>
          </article>
        </div>
      </div>
    </section>

    <section class="competition-section api-note" aria-labelledby="api-title">
      <div class="api-icon" aria-hidden="true">API</div>
      <div>
        <p class="section-kicker">Integração no horizonte</p>
        <h2 id="api-title">Mais contexto para cada partida</h2>
        <p>No futuro, o TF2Lab poderá integrar a API do tf2pickup para trazer jogos de jogadores e links de <code>logsUrl</code> e <code>demoUrl</code>. Por enquanto, esta página é um mapa da cena e dos próximos módulos.</p>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
const brazilScene = [
  { name: 'TFCL', mark: 'BR', description: 'Ligas, temporadas e competição organizada para a comunidade brasileira.', url: 'https://alpha.tfcleague.com' },
  { name: 'br.tf2pickup.org', mark: 'PUG', description: 'Encontre partidas e pratique em um ambiente aberto para jogadores.', url: 'https://br.tf2pickup.org' }
]

const internationalScene = [
  { name: 'ETF2L', mark: 'EU', description: 'Uma das principais ligas de Team Fortress 2 da Europa.', url: 'https://etf2l.org' },
  { name: 'RGL', mark: 'NA', description: 'Ligas, mixes e eventos para a cena norte-americana.', url: 'https://rgl.gg' }
]

const roadmap = [
  { title: 'Times', description: 'Perfis de equipes, lineups e um lugar claro para reunir identidade e histórico.' },
  { title: 'Matches', description: 'Calendário, resultados, adversários e links úteis para revisar cada confronto.' },
  { title: 'Integração com logs', description: 'Conecte o contexto competitivo às estatísticas da partida e à evolução dos jogadores.' }
]
</script>

<style scoped>
.competition-page { padding: clamp(1rem, 3vw, 3rem) 0 2rem; }
.competition-hero { position: relative; isolation: isolate; overflow: hidden; display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(17rem, .8fr); align-items: center; gap: clamp(2rem, 6vw, 6rem); min-height: 25rem; padding: clamp(2rem, 6vw, 4.5rem); border: 1px solid var(--border); border-radius: 1.5rem; background: linear-gradient(135deg, rgba(25, 32, 45, .98), rgba(9, 11, 18, .98)); box-shadow: var(--shadow-strong); }
.competition-hero::before { position: absolute; inset: 0; z-index: -1; background: radial-gradient(circle at 8% 10%, rgba(58, 128, 255, .3), transparent 38%), radial-gradient(circle at 92% 88%, rgba(255, 59, 48, .17), transparent 34%); content: ''; }
.hero-grid { position: absolute; inset: 0; z-index: -1; background-image: linear-gradient(rgba(255, 255, 255, .025) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, .025) 1px, transparent 1px); background-size: 3rem 3rem; mask-image: linear-gradient(to bottom, black, transparent); }
.hero-copy { max-width: 43rem; }.eyebrow, .section-kicker { margin: 0 0 .85rem; color: #8fb8ff; font-size: .75rem; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; }.eyebrow { display: flex; align-items: center; gap: .5rem; }.eyebrow-mark { display: grid; width: 1.7rem; height: 1.35rem; place-items: center; border-radius: .35rem; color: #07101f; background: var(--tf2-blu); font-size: .58rem; font-weight: 900; }.competition-hero h1 { max-width: 12ch; margin: 0; font-size: clamp(2.8rem, 6.5vw, 5.7rem); letter-spacing: -.06em; line-height: .92; }.hero-description { max-width: 37rem; margin: 1.5rem 0 0; color: var(--text-soft); font-size: 1.05rem; line-height: 1.7; }.hero-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 1rem; margin-top: 2rem; }.primary-link, .secondary-link { display: inline-flex; align-items: center; gap: .45rem; border-radius: .7rem; font-weight: 800; text-decoration: none; }.primary-link { padding: .8rem 1rem; color: #07101f; background: var(--tf2-blu); transition: transform .2s ease, background .2s ease; }.primary-link:hover { background: #78aaff; transform: translateY(-2px); }.secondary-link { padding: .75rem .25rem; color: var(--text-soft); }.secondary-link:hover { color: var(--text); }
.match-board { padding: 1.35rem; border: 1px solid rgba(58, 128, 255, .3); border-radius: 1rem; background: rgba(7, 8, 13, .54); box-shadow: 0 24px 60px rgba(0, 0, 0, .24); }.board-header { display: flex; align-items: center; gap: .5rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border); color: var(--text-soft); font-size: .78rem; font-weight: 800; text-transform: uppercase; }.board-header > span:last-child { margin-left: auto; color: var(--text-muted); font-size: .65rem; font-weight: 600; }.live-dot { width: .45rem; height: .45rem; border-radius: 50%; background: var(--success); box-shadow: 0 0 0 .25rem rgba(75, 211, 127, .12); }.board-row { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 1rem 0; border-bottom: 1px solid rgba(255, 255, 255, .06); }.board-row strong { color: var(--text); font-family: var(--font-family-mono); font-size: .8rem; }.board-row span { color: var(--tf2-blu); font-family: var(--font-family-mono); font-size: .66rem; font-weight: 700; }.board-footer { padding-top: 1rem; color: var(--text-muted); font-size: .75rem; }
.competition-section { margin-top: clamp(3.5rem, 7vw, 6rem); }.section-heading { display: flex; align-items: end; justify-content: space-between; gap: 2rem; margin-bottom: 1.75rem; }.section-heading h2, .roadmap-copy h2, .api-note h2 { margin: 0; font-size: clamp(1.75rem, 3.5vw, 2.6rem); letter-spacing: -.04em; }.section-kicker { margin-bottom: .45rem; color: var(--accent-soft); }.section-intro { max-width: 27rem; margin: 0; color: var(--text-soft); font-size: .92rem; line-height: 1.6; text-align: right; }.scene-group + .scene-group { margin-top: 2rem; }.group-label { display: flex; align-items: center; gap: .55rem; margin-bottom: .85rem; color: var(--text-soft); font-size: .76rem; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; }.group-dot { width: .5rem; height: .5rem; border-radius: 50%; }.group-dot--red { background: var(--tf2-red); box-shadow: 0 0 0 .25rem rgba(255, 59, 48, .12); }.group-dot--blue { background: var(--tf2-blu); box-shadow: 0 0 0 .25rem rgba(58, 128, 255, .12); }.scene-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: .85rem; }.scene-card { display: block; min-height: 13rem; padding: 1.3rem; border: 1px solid var(--border); border-radius: 1rem; color: var(--text); text-decoration: none; transition: transform .2s ease, border-color .2s ease, background .2s ease; }.scene-card:hover { transform: translateY(-3px); }.scene-card--red { background: linear-gradient(145deg, rgba(255, 59, 48, .1), rgba(18, 20, 32, .92) 55%); }.scene-card--red:hover { border-color: rgba(255, 59, 48, .45); }.scene-card--blue { background: linear-gradient(145deg, rgba(58, 128, 255, .1), rgba(18, 20, 32, .92) 55%); }.scene-card--blue:hover { border-color: rgba(58, 128, 255, .45); }.scene-card-top { display: flex; align-items: center; justify-content: space-between; }.scene-mark { display: grid; width: 2.5rem; height: 2.5rem; place-items: center; border-radius: .65rem; background: rgba(255, 255, 255, .08); color: var(--text-soft); font-family: var(--font-family-mono); font-size: .65rem; font-weight: 800; }.external-mark { color: var(--text-muted); font-size: 1.15rem; }.scene-card h3 { margin: 1.7rem 0 .45rem; font-size: 1.25rem; }.scene-card p { max-width: 30rem; margin: 0; color: var(--text-soft); font-size: .88rem; line-height: 1.6; }.visit-link { display: inline-flex; margin-top: 1.4rem; color: var(--accent-soft); font-size: .8rem; font-weight: 800; }
.roadmap-panel { display: grid; grid-template-columns: minmax(0, .85fr) minmax(0, 1.15fr); gap: 2.5rem; padding: clamp(1.5rem, 4vw, 2.6rem); border: 1px solid rgba(255, 155, 51, .24); border-radius: 1.25rem; background: linear-gradient(135deg, rgba(255, 155, 51, .1), rgba(18, 20, 32, .94) 55%); }.roadmap-copy h2 { max-width: 12ch; }.roadmap-copy > p:last-child { max-width: 27rem; margin: 1rem 0 0; color: var(--text-soft); font-size: .9rem; line-height: 1.6; }.roadmap-list { display: grid; gap: .75rem; }.roadmap-item { display: flex; gap: 1rem; padding: 1rem; border: 1px solid rgba(255, 255, 255, .08); border-radius: .75rem; background: rgba(7, 8, 13, .34); }.roadmap-number { padding-top: .1rem; color: var(--tf2-orange); font-family: var(--font-family-mono); font-size: .78rem; font-weight: 800; }.roadmap-item h3 { margin: 0 0 .3rem; font-size: .98rem; }.roadmap-item p { margin: 0; color: var(--text-soft); font-size: .82rem; line-height: 1.5; }
.api-note { display: flex; align-items: flex-start; gap: 1.25rem; padding: 1.4rem 1.5rem; border-left: 3px solid var(--tf2-blu); background: rgba(58, 128, 255, .07); }.api-icon { display: grid; width: 3rem; height: 3rem; flex: 0 0 auto; place-items: center; border: 1px solid rgba(58, 128, 255, .35); border-radius: .65rem; color: #8fb8ff; font-family: var(--font-family-mono); font-size: .65rem; font-weight: 800; }.api-note h2 { font-size: 1.35rem; }.api-note p:last-child { max-width: 54rem; margin: .65rem 0 0; color: var(--text-soft); font-size: .88rem; line-height: 1.65; }.api-note code { padding: .12rem .3rem; border-radius: .3rem; background: rgba(58, 128, 255, .16); color: #b3ccff; font-family: var(--font-family-mono); font-size: .8em; }
@media (max-width: 820px) { .competition-hero, .roadmap-panel { grid-template-columns: 1fr; }.match-board { max-width: 28rem; }.section-heading { align-items: start; flex-direction: column; gap: .75rem; }.section-intro { text-align: left; } }
@media (max-width: 560px) { .competition-hero { padding: 2rem 1.25rem; }.competition-hero h1 { font-size: clamp(2.7rem, 14vw, 4.3rem); }.scene-grid { grid-template-columns: 1fr; }.api-note { flex-direction: column; gap: .85rem; } }
</style>
