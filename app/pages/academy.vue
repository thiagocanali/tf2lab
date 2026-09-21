<template>
  <main class="academy-page">
    <section class="academy-hero" aria-labelledby="academy-title">
      <div class="hero-grid" aria-hidden="true" />
      <div class="hero-copy">
        <p class="eyebrow"><span class="eyebrow-mark" aria-hidden="true">+</span> TF2Lab Academy</p>
        <h1 id="academy-title">Melhore com dados e pratica.</h1>
        <p class="hero-description">
          Use suas partidas para escolher o proximo treino, entender seus padroes e construir habitos que aparecem no placar.
        </p>
        <div class="hero-actions">
          <NuxtLink to="/search" class="primary-link">Ver meu perfil <span aria-hidden="true">-&gt;</span></NuxtLink>
          <a href="#como-usar" class="secondary-link">Comecar pelo basico</a>
        </div>
      </div>

      <aside class="hero-note" aria-label="Ciclo de treino">
        <span class="note-label">Ciclo de treino</span>
        <strong>Jogar. Medir. Ajustar.</strong>
        <div class="cycle-line" aria-hidden="true">
          <span>01</span><i /><span>02</span><i /><span>03</span>
        </div>
        <p>Uma meta pequena e uma revisão honesta valem mais que uma sessão aleatória.</p>
      </aside>
    </section>

    <section id="como-usar" class="academy-section" aria-labelledby="how-title">
      <header class="section-heading">
        <div>
          <p class="section-kicker">Um ponto de partida</p>
          <h2 id="how-title">Como usar o TF2Lab</h2>
        </div>
        <p class="section-intro">Transforme uma lista de logs em uma pergunta objetiva para o próximo treino.</p>
      </header>

      <div class="steps-grid">
        <article v-for="(step, index) in steps" :key="step.title" class="step-card">
          <span class="step-number">0{{ index + 1 }}</span>
          <h3>{{ step.title }}</h3>
          <p>{{ step.description }}</p>
        </article>
      </div>
    </section>

    <section class="academy-section class-section" aria-labelledby="classes-title">
      <header class="section-heading">
        <div>
          <p class="section-kicker">Escolha seu foco</p>
          <h2 id="classes-title">Trilhas por classe</h2>
        </div>
        <span class="section-count">{{ classes.length }} classes no radar</span>
      </header>

      <div class="class-grid">
        <article v-for="item in classes" :key="item.name" class="class-card">
          <div class="class-icon" :class="`class-icon--${item.tone}`" aria-hidden="true">{{ item.short }}</div>
          <div class="class-copy">
            <h3>{{ item.name }}</h3>
            <p>{{ item.focus }}</p>
          </div>
          <span class="status">Em breve</span>
        </article>
      </div>
    </section>

    <section class="academy-section resources-section" aria-labelledby="resources-title">
      <div class="resource-panel">
        <div>
          <p class="section-kicker">Ferramentas da comunidade</p>
          <h2 id="resources-title">Dados bons começam na fonte certa.</h2>
          <p>O TF2Lab organiza o caminho. Estas ferramentas continuam sendo parte essencial da cena.</p>
        </div>
        <div class="resource-links">
          <a v-for="resource in resources" :key="resource.name" :href="resource.url" target="_blank" rel="noopener noreferrer" class="resource-link" :class="{ 'resource-link--featured': resource.featured }">
            <span><strong>{{ resource.name }}</strong><small>{{ resource.description }}</small></span>
            <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
    </section>

    <section class="academy-section tips-section" aria-labelledby="tips-title">
      <header class="section-heading">
        <div>
          <p class="section-kicker">Para a próxima sessão</p>
          <h2 id="tips-title">Dicas rápidas de treino</h2>
        </div>
      </header>
      <div class="tips-grid">
        <article v-for="(tip, index) in tips" :key="tip.title" class="tip-card">
          <span class="tip-index">{{ String(index + 1).padStart(2, '0') }}</span>
          <div>
            <h3>{{ tip.title }}</h3>
            <p>{{ tip.description }}</p>
          </div>
        </article>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
const steps = [
  { title: 'Abra seu perfil', description: 'Pesquise sua SteamID e veja médias, tendências e as partidas que formam sua amostra.' },
  { title: 'Encontre um padrão', description: 'Compare K/D, dano, cura e classes. Procure uma situação recorrente, não um jogo isolado.' },
  { title: 'Treine uma coisa', description: 'Escolha um objetivo observável para a próxima sessão e volte aos dados depois de jogar.' }
]

const classes = [
  { name: 'Scout', short: 'SC', tone: 'red', focus: 'Movimento, mira e pressão' },
  { name: 'Soldier', short: 'SO', tone: 'orange', focus: 'Aberturas, dano e controle' },
  { name: 'Pyro', short: 'PY', tone: 'red', focus: 'Proteção e espaço' },
  { name: 'Demoman', short: 'DE', tone: 'blue', focus: 'Spam, traps e ritmo' },
  { name: 'Heavy', short: 'HE', tone: 'orange', focus: 'Sobrevivência e presença' },
  { name: 'Engineer', short: 'EN', tone: 'blue', focus: 'Posicionamento e suporte' },
  { name: 'Medic', short: 'ME', tone: 'blue', focus: 'Über, rotas e leitura' },
  { name: 'Sniper', short: 'SN', tone: 'orange', focus: 'Ângulos e impacto' },
  { name: 'Spy', short: 'SP', tone: 'red', focus: 'Informação e timing' }
]

const resources = [
  { name: 'logs.tf', description: 'Estatísticas detalhadas de partidas', url: 'https://logs.tf' },
  { name: 'demos.tf', description: 'Demos e histórico de partidas', url: 'https://demos.tf' },
  { name: 'trends.tf', description: 'Tendências e histórico ampliado', url: 'https://trends.tf' },
  { name: 'MGE.tf', description: 'Treino de aim e duelo 1v1 na South America', url: 'https://mge.tf/', featured: true }
]

const tips = [
  { title: 'Defina uma métrica', description: 'Escolha dano, DPM, mortes ou cura. Uma métrica clara ajuda a separar progresso de variância.' },
  { title: 'Revise suas mortes', description: 'Anote as duas primeiras decisões que levaram à morte, não apenas o momento final.' },
  { title: 'Treine antes de jogar', description: 'Faça 10 minutos de mira, movimento ou surf antes de entrar em uma partida competitiva.' },
  { title: 'Compare blocos', description: 'Use pelo menos cinco logs para observar uma tendência. Um destaque não é ainda um padrão.' }
]
</script>

<style scoped>
.academy-page { padding: clamp(1rem, 3vw, 3rem) 0 2rem; }
.academy-hero { position: relative; isolation: isolate; overflow: hidden; display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(17rem, .8fr); align-items: center; gap: clamp(2rem, 6vw, 6rem); min-height: 25rem; padding: clamp(2rem, 6vw, 4.5rem); border: 1px solid var(--border); border-radius: 1.5rem; background: linear-gradient(135deg, rgba(38, 31, 29, .96), rgba(11, 13, 20, .98)); box-shadow: var(--shadow-strong); }
.academy-hero::before { position: absolute; inset: 0; z-index: -1; background: radial-gradient(circle at 8% 12%, rgba(255, 155, 51, .3), transparent 38%), radial-gradient(circle at 90% 90%, rgba(255, 59, 48, .16), transparent 32%); content: ''; }
.hero-grid { position: absolute; inset: 0; z-index: -1; background-image: linear-gradient(rgba(255, 255, 255, .025) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, .025) 1px, transparent 1px); background-size: 3rem 3rem; mask-image: linear-gradient(to bottom, black, transparent); }
.hero-copy { max-width: 42rem; }
.eyebrow, .section-kicker { margin: 0 0 .85rem; color: var(--tf2-orange); font-size: .75rem; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; }
.eyebrow { display: flex; align-items: center; gap: .5rem; }
.eyebrow-mark { display: grid; width: 1.35rem; height: 1.35rem; place-items: center; border-radius: .35rem; color: #1a1008; background: var(--tf2-orange); font-size: 1rem; }
.academy-hero h1 { max-width: 10ch; margin: 0; font-size: clamp(3rem, 7vw, 6rem); letter-spacing: -.06em; line-height: .9; }
.hero-description { max-width: 36rem; margin: 1.5rem 0 0; color: var(--text-soft); font-size: 1.05rem; line-height: 1.7; }
.hero-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 1rem; margin-top: 2rem; }
.primary-link, .secondary-link { display: inline-flex; align-items: center; gap: .45rem; border-radius: .7rem; font-weight: 800; text-decoration: none; }
.primary-link { padding: .8rem 1rem; color: #1a1008; background: var(--tf2-orange); transition: transform .2s ease, background .2s ease; }
.primary-link:hover { background: #ffb85f; transform: translateY(-2px); }
.secondary-link { padding: .75rem .25rem; color: var(--text-soft); }
.secondary-link:hover { color: var(--text); }
.hero-note { padding: 1.35rem; border: 1px solid rgba(255, 155, 51, .28); border-radius: 1rem; background: rgba(7, 8, 13, .5); box-shadow: 0 24px 60px rgba(0, 0, 0, .24); }
.note-label, .section-count { color: var(--text-muted); font-size: .72rem; font-weight: 800; letter-spacing: .11em; text-transform: uppercase; }
.hero-note strong { display: block; margin-top: .6rem; font-size: 1.4rem; }
.hero-note p { margin: 1rem 0 0; color: var(--text-soft); font-size: .88rem; line-height: 1.55; }
.cycle-line { display: flex; align-items: center; gap: .55rem; margin-top: 1.5rem; color: var(--tf2-orange); font-family: var(--font-family-mono); font-size: .75rem; font-weight: 700; }
.cycle-line i { width: 2rem; height: 1px; background: rgba(255, 155, 51, .45); }
.academy-section { margin-top: clamp(3.5rem, 7vw, 6rem); }
.section-heading { display: flex; align-items: end; justify-content: space-between; gap: 2rem; margin-bottom: 1.75rem; }
.section-heading h2, .resource-panel h2 { margin: 0; font-size: clamp(1.75rem, 3.5vw, 2.6rem); letter-spacing: -.04em; }
.section-kicker { margin-bottom: .45rem; color: var(--accent-soft); }
.section-intro { max-width: 25rem; margin: 0; color: var(--text-soft); font-size: .92rem; line-height: 1.6; text-align: right; }
.steps-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; overflow: hidden; border: 1px solid var(--border); border-radius: 1rem; background: var(--border); }
.step-card { min-height: 12rem; padding: 1.4rem; background: rgba(18, 20, 32, .92); }
.step-number, .tip-index { color: var(--tf2-orange); font-family: var(--font-family-mono); font-size: .78rem; font-weight: 700; }
.step-card h3, .tip-card h3 { margin: 1.75rem 0 .5rem; font-size: 1.05rem; }
.step-card p, .tip-card p { margin: 0; color: var(--text-soft); font-size: .88rem; line-height: 1.6; }
.class-section { padding-top: .25rem; }
.class-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: .8rem; }
.class-card { display: flex; align-items: center; gap: .8rem; min-width: 0; padding: .85rem; border: 1px solid var(--border); border-radius: .85rem; background: linear-gradient(145deg, rgba(255, 255, 255, .035), transparent), var(--surface); transition: transform .2s ease, border-color .2s ease; }
.class-card:hover { border-color: var(--border-strong); transform: translateY(-2px); }
.class-icon { display: grid; width: 2.6rem; height: 2.6rem; flex: 0 0 auto; place-items: center; border-radius: .65rem; color: var(--text); font-family: var(--font-family-mono); font-size: .7rem; font-weight: 800; }
.class-icon--red { background: rgba(255, 59, 48, .18); color: #ff8f86; }.class-icon--orange { background: rgba(255, 155, 51, .18); color: #ffc477; }.class-icon--blue { background: rgba(58, 128, 255, .18); color: #8fb8ff; }
.class-copy { min-width: 0; flex: 1; }.class-copy h3 { margin: 0; font-size: .96rem; }.class-copy p { overflow: hidden; margin: .2rem 0 0; color: var(--text-muted); font-size: .75rem; text-overflow: ellipsis; white-space: nowrap; }
.status { flex: 0 0 auto; padding: .28rem .45rem; border: 1px solid rgba(255, 255, 255, .1); border-radius: .4rem; color: var(--text-muted); font-size: .65rem; font-weight: 800; text-transform: uppercase; }
.resources-section { margin-top: clamp(3rem, 6vw, 5rem); }
.resource-panel { display: grid; grid-template-columns: minmax(0, .9fr) minmax(0, 1.1fr); gap: 2rem; padding: clamp(1.5rem, 4vw, 2.5rem); border: 1px solid rgba(58, 128, 255, .2); border-radius: 1.25rem; background: linear-gradient(135deg, rgba(58, 128, 255, .1), rgba(18, 20, 32, .92) 52%); }
.resource-panel h2 { max-width: 12ch; }.resource-panel > div > p:last-child { max-width: 28rem; margin: 1rem 0 0; color: var(--text-soft); font-size: .9rem; line-height: 1.6; }
.resource-links { display: grid; grid-template-columns: repeat(2, 1fr); gap: .7rem; align-items: stretch; }
.resource-link { display: flex; min-height: 8rem; flex-direction: column; justify-content: space-between; padding: .9rem; border: 1px solid var(--border); border-radius: .75rem; background: rgba(7, 8, 13, .4); color: var(--text); text-decoration: none; transition: background .2s ease, border-color .2s ease; }.resource-link:hover { border-color: rgba(58, 128, 255, .5); background: rgba(58, 128, 255, .12); }.resource-link > span:last-child { align-self: end; color: var(--tf2-blu); font-size: 1.1rem; }.resource-link strong, .resource-link small { display: block; }.resource-link strong { font-size: .9rem; }.resource-link small { margin-top: .35rem; color: var(--text-muted); font-size: .72rem; line-height: 1.4; }
.resource-link--featured { border-color: rgba(255, 155, 51, .42); background: linear-gradient(145deg, rgba(255, 155, 51, .16), rgba(7, 8, 13, .48)); }.resource-link--featured:hover { border-color: rgba(255, 155, 51, .72); background: rgba(255, 155, 51, .2); }.resource-link--featured > span:last-child { color: var(--tf2-orange); }
.tips-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: .8rem; }.tip-card { display: flex; gap: 1rem; padding: 1.15rem; border-left: 2px solid var(--tf2-red); background: rgba(255, 255, 255, .035); }.tip-card h3 { margin: 0 0 .35rem; }.tip-index { padding-top: .1rem; color: var(--accent-soft); }
@media (max-width: 820px) { .academy-hero, .resource-panel { grid-template-columns: 1fr; }.hero-note { max-width: 28rem; }.section-intro { text-align: left; }.section-heading { align-items: start; flex-direction: column; gap: .75rem; }.class-grid { grid-template-columns: repeat(2, 1fr); }.resource-links { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 560px) { .academy-hero { padding: 2rem 1.25rem; }.academy-hero h1 { font-size: clamp(2.8rem, 15vw, 4.4rem); }.steps-grid, .class-grid, .resource-links, .tips-grid { grid-template-columns: 1fr; }.step-card { min-height: auto; }.resource-link { min-height: auto; flex-direction: row; align-items: center; }.resource-link > span:last-child { align-self: auto; }.section-count { margin-top: -.35rem; } }
</style>
