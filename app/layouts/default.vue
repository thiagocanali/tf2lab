<template>
  <div class="layout-shell">
    <header class="site-header">
      <div class="header-inner">
        <div class="brand">
          <NuxtLink to="/" class="brand-link" aria-label="TF2Lab Home">
            <span class="brand-logo" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </span>
            <div>
              <span class="brand-name">TF2Lab</span>
              <span class="brand-tag">logs.tf analytics</span>
            </div>
          </NuxtLink>
        </div>

        <nav class="main-nav" aria-label="Main navigation">
          <NuxtLink to="/" exact-active-class="active">
            <span>Home</span>
          </NuxtLink>
          <NuxtLink to="/search" active-class="active">
            <span>Search</span>
          </NuxtLink>
          <a href="https://github.com/thiagocanali/tf2lab" target="_blank" rel="noopener noreferrer" class="nav-github" aria-label="TF2Lab on GitHub">
            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden="true">
              <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
            </svg>
          </a>
        </nav>
      </div>
    </header>

    <div class="layout-body">
      <main class="content-area">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">

</script>

<style scoped>
.layout-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.site-header {
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid var(--border);
  background: linear-gradient(180deg, rgba(12, 13, 19, 0.98), rgba(10, 12, 18, 0.96));
  backdrop-filter: blur(16px);
}

.header-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0.85rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
}

.brand-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  color: inherit;
  flex-shrink: 0;
}

.brand-logo {
  display: grid;
  place-items: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.85rem;
  background: linear-gradient(135deg, var(--tf2-red), #cc2a2a);
  color: #0d0d0d;
  font-weight: 800;
  font-size: 0.9rem;
  letter-spacing: -0.02em;
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.06),
    0 4px 16px rgba(255, 59, 48, 0.25);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.brand-link:hover .brand-logo {
  transform: scale(1.05);
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.1),
    0 6px 24px rgba(255, 59, 48, 0.35);
}

.brand-name {
  display: block;
  font-weight: 700;
  font-size: 1.05rem;
  letter-spacing: 0.02em;
  color: var(--text);
}

.brand-tag {
  display: block;
  color: var(--text-muted);
  font-size: 0.7rem;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-top: 0.15rem;
}

.main-nav {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.main-nav > * {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.55rem 0.9rem;
  border-radius: 999px;
  color: var(--text-soft);
  text-decoration: none;
  font-weight: 600;
  font-size: 0.875rem;
  transition: color 0.15s ease, background 0.15s ease;
}

.main-nav > *:hover {
  color: var(--text);
  background: rgba(255, 255, 255, 0.06);
}

.main-nav > *.active,
.main-nav > *.nuxt-link-exact-active {
  color: var(--text);
  background: rgba(255, 79, 60, 0.14);
}

.nav-github {
  padding: 0.55rem;
}

.nav-github:hover {
  background: rgba(255, 255, 255, 0.08);
  color: var(--text);
}

.nav-github svg {
  transition: transform 0.2s ease;
}

.nav-github:hover svg {
  transform: scale(1.1);
}

.layout-body {
  min-height: calc(100vh - 68px);
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  flex: 1;
}

.content-area {
  width: min(100%, 1200px);
  margin: 0 auto;
  padding: clamp(1.5rem, 3vw, 2.5rem) 1.5rem;
}

@media (max-width: 640px) {
  .header-inner {
    padding: 0.75rem 1rem;
  }
  .brand-name {
    display: none;
  }
  .brand-tag {
    display: none;
  }
  .main-nav {
    gap: 0.2rem;
  }
  .main-nav > * {
    padding: 0.5rem 0.7rem;
  }
  .main-nav span {
    display: none;
  }
  .content-area {
    padding: 1rem;
  }
}
</style>