<script setup>
import IconSearch from "./IconSearch.vue";
import IconForce from "./IconForce.vue";
import IconData from "./IconData.vue";
</script>

<template>
  <nav class="bottom-nav">
    <router-link
      to="/"
      class="nav-item"
      :class="{ active: $route.name === 'search' }"
    >
      <IconSearch class="nav-icon" />
      <span>Поиск</span>
    </router-link>
    <router-link
      to="/force"
      class="nav-item"
      :class="{ active: $route.name === 'force' }"
    >
      <IconForce class="nav-icon" />
      <span>Формации</span>
    </router-link>
    <div class="nav-item">
      <IconData class="nav-icon" />
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
