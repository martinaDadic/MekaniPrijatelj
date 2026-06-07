<script setup>
import { RouterView, useRouter } from 'vue-router'
const router = useRouter()
</script>

<template>
  <div id="app-shell">
    <header class="topbar">
      <span class="logo" @click="router.push('/')">mekani prijatelj</span>
      <nav class="nav">
        <RouterLink to="/" class="nav-link">scan</RouterLink>
        <RouterLink to="/qr" class="nav-link">gen QR</RouterLink>
      </nav>
    </header>
    <main class="main-content">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.topbar {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  border-bottom: 1px solid var(--border);
  background: var(--surface);
  position: sticky;
  top: 0;
  z-index: 10;
}
.logo {
  font-family: 'DM Mono', monospace;
  font-size: 0.78rem;
  letter-spacing: 0.06em;
  color: var(--text-muted);
  cursor: pointer;
  transition: color 0.15s;
}
.logo:hover { color: var(--text); }

.nav { display: flex; gap: 4px; }
.nav-link {
  font-size: 0.78rem;
  padding: 5px 10px;
  border-radius: 6px;
  color: var(--text-muted);
  transition: color 0.15s, background 0.15s;
}
.nav-link:hover { color: var(--text); background: var(--surface-2); }
.nav-link.router-link-active { color: var(--accent); background: var(--accent-light); }

.main-content {
  max-width: 440px;
  margin: 0 auto;
  padding: 24px 16px 48px;
  width: 100%;
}
</style>
