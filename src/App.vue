<template>
  <div class="scanlines"></div>
  <div class="app-wrapper">
    <router-view v-slot="{ Component }">
      <Transition name="slide-fade" mode="out-in">
        <component :is="Component" />
      </Transition>
    </router-view>
    <BottomNav v-if="$route.name !== 'setup'" />
  </div>
</template>

<script setup>
import BottomNav from './components/BottomNav.vue'
</script>

<style scoped>
.app-wrapper {
  position: relative;
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(180deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
  overflow-x: hidden;
}

.app-wrapper::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, transparent, var(--accent-green), transparent);
}

/* Route transition */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: opacity 0.25s ease, transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>
