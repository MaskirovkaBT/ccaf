<template>
  <nav class="bottom-nav">
    <router-link
      to="/"
      class="nav-item"
      :class="{ active: $route.name === 'search' }"
    >
      <svg
        class="nav-icon"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
      <span>Поиск</span>
    </router-link>
    <div class="nav-item">
      <span class="nav-icon">⚙</span>
      <span>FORCE</span>
    </div>
    <div class="nav-item">
      <span class="nav-icon">✦</span>
      <span>DATA</span>
    </div>
  </nav>
</template>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  max-width: 480px;
  margin: 0 auto;
  height: 48px;
  background: var(--bg-primary);
  border-top: 1px solid var(--border-color);
  display: flex;
  z-index: 50;
}

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  color: #3a5a3a;
  letter-spacing: 1px;
  gap: 2px;
  text-decoration: none;
  cursor: pointer;
}

.nav-item.active {
  color: var(--accent-green);
}

.nav-icon {
  font-size: 18px;
}
</style>
