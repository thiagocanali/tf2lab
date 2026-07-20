<template>
  <div class="layout-shell">
    <header class="site-header">
      <div class="brand">
        <span class="brand-logo">TF2</span>
        <span class="brand-name">TF2Lab</span>
      </div>
      <nav>
        <a href="https://github.com/thiagocanali/tf2lab" target="_blank" rel="noopener noreferrer">GitHub</a>
      </nav>
    </header>

    <div class="layout-body">
      <aside class="sidebar-placeholder">
        <!-- Sidebar placeholder for future dashboard -->
      </aside>

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
  background: rgba(10, 12, 18, 0.9);
  backdrop-filter: blur(12px);
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.brand-logo {
  width: 2.4rem;
  height: 2.4rem;
  display: grid;
  place-items: center;
  border-radius: 0.75rem;
  background: var(--accent);
  color: #121212;
  font-weight: 700;
}

.brand-name {
  font-weight: 700;
  letter-spacing: 0.08em;
}

.site-header a {
  color: var(--text);
  text-decoration: none;
  font-weight: 500;
}

.layout-body {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  flex: 1;
}

.sidebar-placeholder {
  display: none;
}

.content-area {
  width: min(100%, 1200px);
  margin: 0 auto;
  padding: 2rem;
}

@media (min-width: 1024px) {
  .layout-body {
    grid-template-columns: 240px minmax(0, 1fr);
  }

  .sidebar-placeholder {
    display: block;
    padding: 2rem 0;
    color: rgba(255, 255, 255, 0.4);
    font-size: 0.95rem;
  }
}
</style>
