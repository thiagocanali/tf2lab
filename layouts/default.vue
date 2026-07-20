<template>
  <div class="layout-shell">
    <header class="site-header">
      <div class="brand">
        <NuxtLink to="/" class="brand-link">
          <span class="brand-logo">TF2</span>
          <div>
            <span class="brand-name">TF2Lab</span>
            <span class="brand-tag">logs.tf analytics</span>
          </div>
        </NuxtLink>
      </div>

      <nav class="main-nav">
        <NuxtLink to="/" exact-active-class="active">Home</NuxtLink>
        <NuxtLink to="/search" active-class="active">Search</NuxtLink>
        <a href="https://github.com/thiagocanali/tf2lab" target="_blank" rel="noopener noreferrer">GitHub</a>
      </nav>
    </header>

    <div class="layout-body">
      <main class="content-area">
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>
.layout-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.site-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  background: linear-gradient(180deg, rgba(12, 13, 19, 0.98), rgba(10, 12, 18, 0.96));
  backdrop-filter: blur(16px);
}

.brand-link {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  text-decoration: none;
  color: inherit;
}

.brand-logo {
  width: 2.6rem;
  height: 2.6rem;
  display: grid;
  place-items: center;
  border-radius: 1rem;
  background: var(--tf2-red);
  color: #121212;
  font-weight: 700;
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.08);
}

.brand-name {
  display: block;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.brand-tag {
  display: block;
  color: var(--text-soft);
  font-size: 0.8rem;
  margin-top: 0.25rem;
}

.main-nav {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.main-nav a {
  color: var(--text);
  text-decoration: none;
  font-weight: 600;
  padding: 0.65rem 0.75rem;
  border-radius: 999px;
  transition: background 0.2s ease, color 0.2s ease;
}

.main-nav a:hover,
.main-nav a.active {
  background: rgba(255, 79, 60, 0.16);
  color: white;
}

.layout-body {
  min-height: calc(100vh - 84px);
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  flex: 1;
}

.content-area {
  width: min(100%, 1200px);
  margin: 0 auto;
  padding: 2rem;
}
</style>
