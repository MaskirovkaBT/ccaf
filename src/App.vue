<template>
  <div class="scanlines"></div>
  <div class="app-wrapper">
    <router-view v-slot="{ Component }">
      <Transition name="slide-fade" mode="out-in">
        <component :is="Component" />
      </Transition>
    </router-view>
    <BottomNav v-if="!['setup', 'landing'].includes($route.name)" />
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import BottomNav from './components/BottomNav.vue'

function updateVh() {
  document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`)
}

let resizeObserver = null

onMounted(() => {
  updateVh()
  window.addEventListener('resize', updateVh)
  // Также обновляем при появлении/скрытии панелей браузера на мобильных
  if ('ResizeObserver' in window) {
    resizeObserver = new ResizeObserver(updateVh)
    resizeObserver.observe(document.documentElement)
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', updateVh)
  if (resizeObserver) resizeObserver.disconnect()
})
</script>

<style scoped>
.app-wrapper {
  position: relative;
  width: 100%;
  min-height: 100vh;
  min-height: calc(var(--vh, 1vh) * 100);
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
  transition:
    opacity 0.25s ease,
    transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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
