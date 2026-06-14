<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const visibleSections = ref(new Set())
let observer = null

function launchApp() {
  const hasServer = !!localStorage.getItem('ccaf_api_url')
  if (hasServer) {
    router.push({ name: 'search' })
  } else {
    router.push({ name: 'setup' })
  }
}

onMounted(() => {
  observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          visibleSections.value.add(entry.target.dataset.section)
        }
      })
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  )

  document.querySelectorAll('[data-section]').forEach(el => observer.observe(el))
})

onUnmounted(() => {
  if (observer) observer.disconnect()
})

function isVisible(id) {
  return visibleSections.value.has(id)
}
</script>

<template>
  <div class="landing-page">
    <!-- Hero -->
    <section class="hero" data-section="hero">
      <div class="hero-glow"></div>
      <div class="hero-content">
        <div class="logo-wrap">
          <img src="/icon-192x192.png" alt="ВС КК" class="logo" />
          <div class="corner tl"></div>
          <div class="corner tr"></div>
          <div class="corner bl"></div>
          <div class="corner br"></div>
        </div>

        <h1 class="title">
          <span class="title-accent">ВС</span>
          <span class="title-main"> КК</span>
        </h1>
        <p class="subtitle">Помощник для новобранца</p>

        <div class="status-line">
          <span class="status-dot"></span>
          <span class="status-text">ТЕРМИНАЛ ГОТОВ К ПОДКЛЮЧЕНИЮ</span>
        </div>

        <p class="hero-desc">
          Мобильный справочник и трекер для BattleTech Alpha Strike. Каталог юнитов, ангар, формации
          и ведение боя — всё в одном терминале.
        </p>

        <button class="cta" @click="launchApp">
          <span class="cta-icon">▶</span>
          <span>Запустить терминал</span>
        </button>

        <div class="hint">
          <span class="hint-prompt">$</span>
          <span class="hint-text">PWA-приложение: установи на главный экран</span>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section class="features" data-section="features" :class="{ visible: isVisible('features') }">
      <h2 class="section-label">Модули системы</h2>
      <div class="feature-grid">
        <article class="feature-card">
          <div class="feature-icon">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2" />
              <path
                d="M20 20l-3.5-3.5"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
          </div>
          <h3>Каталог юнитов</h3>
          <p>
            Поиск по эрам, фракциям и ролям. Детальные карточки с характеристиками и изображениями.
          </p>
        </article>

        <article class="feature-card">
          <div class="feature-icon">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6-4.8-6 4.8 2.4-7.2-6-4.8h7.6z"
                fill="currentColor"
              />
            </svg>
          </div>
          <h3>Ангар</h3>
          <p>
            Сохраняй понравившиеся мехи и машины. Быстрый доступ к любимым юнитам из любого раздела.
          </p>
        </article>

        <article class="feature-card">
          <div class="feature-icon">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 16l6-10 6 10H4z" fill="none" stroke="currentColor" stroke-width="2" />
              <rect x="7.1" y="16" width="6" height="6" fill="currentColor" />
            </svg>
          </div>
          <h3>Формации</h3>
          <p>
            Создавай боевые подразделения по правилам командирской книги с автопроверкой состава.
          </p>
        </article>

        <article class="feature-card">
          <div class="feature-icon">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <rect x="3" y="8" width="7" height="7" rx="1" fill="currentColor" />
              <rect x="14" y="8" width="7" height="7" rx="1" fill="currentColor" />
              <circle cx="6.5" cy="11.5" r="1" fill="#000" />
              <circle cx="17.5" cy="11.5" r="1" fill="#000" />
              <circle cx="6.5" cy="11.5" r="1" fill="currentColor" class="dot" />
              <circle cx="17.5" cy="11.5" r="1" fill="currentColor" class="dot" />
            </svg>
          </div>
          <h3>Трекер партии</h3>
          <p>
            Веди ростеры, урон, криты и нагрев прямо во время боя. Отложенные криты и автопересчёт.
          </p>
        </article>
      </div>
    </section>

    <!-- Terminal preview -->
    <section class="preview" data-section="preview" :class="{ visible: isVisible('preview') }">
      <h2 class="section-label">Интерфейс терминала</h2>
      <div class="terminal-window">
        <div class="terminal-header">
          <span class="terminal-btn"></span>
          <span class="terminal-btn"></span>
          <span class="terminal-title">UNIT_CARD_DAT</span>
        </div>
        <div class="terminal-body">
          <div class="terminal-line">
            <span class="term-prompt">></span>
            <span class="term-cmd">load unit --id=3025 --name="Wolverine WVR-6R"</span>
          </div>
          <div class="hud-preview">
            <div class="hud-header">
              <span class="hud-name">Wolverine WVR-6R</span>
              <span class="hud-type">BATTLEMECH</span>
            </div>
            <div class="hud-grid">
              <div class="hud-cell">
                <span class="hud-label">БО</span><span class="hud-val">40</span>
              </div>
              <div class="hud-cell">
                <span class="hud-label">РЗ</span><span class="hud-val">2</span>
              </div>
              <div class="hud-cell">
                <span class="hud-label">TMM</span><span class="hud-val">+2</span>
              </div>
              <div class="hud-cell">
                <span class="hud-label">ДВ</span><span class="hud-val">8"j"</span>
              </div>
              <div class="hud-cell">
                <span class="hud-label">Роль</span><span class="hud-val">Боец</span>
              </div>
              <div class="hud-cell">
                <span class="hud-label">Тип</span><span class="hud-val">Мех</span>
              </div>
            </div>
            <div class="hud-damage">
              <div class="hud-dmg-row">
                <span>Б</span><span class="hud-bar"><i style="width: 80%"></i></span>
              </div>
              <div class="hud-dmg-row">
                <span>С</span><span class="hud-bar"><i style="width: 60%"></i></span>
              </div>
            </div>
          </div>
          <div class="terminal-line mt">
            <span class="term-prompt">></span>
            <span class="term-cmd term-blink">_</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Steps -->
    <section class="steps" data-section="steps" :class="{ visible: isVisible('steps') }">
      <h2 class="section-label">Как начать</h2>
      <div class="steps-list">
        <div class="step-item">
          <div class="step-num">01</div>
          <div class="step-body">
            <h3>Подключи сервер</h3>
            <p>Укажи адрес сервера полученный в Лиге Альфастрайка.</p>
          </div>
        </div>
        <div class="step-item">
          <div class="step-num">02</div>
          <div class="step-body">
            <h3>Собери ангар и формации</h3>
            <p>Найди юниты в каталоге, сохрани в ангар и сформируй боевые подразделения.</p>
          </div>
        </div>
        <div class="step-item">
          <div class="step-num">03</div>
          <div class="step-body">
            <h3>Веди бой</h3>
            <p>Добавь формации в ростер, отслеживай броню, структуру, криты и нагрев.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Install / CTA -->
    <section class="install" data-section="install" :class="{ visible: isVisible('install') }">
      <div class="install-card">
        <h2>Готов к развёртыванию</h2>
        <p>Установи приложение на главный экран через меню браузера — работает офлайн как PWA.</p>
        <button class="cta cta-secondary" @click="launchApp">Перейти к терминалу</button>
      </div>
    </section>

    <!-- Disclaimer -->
    <section
      class="disclaimer"
      data-section="disclaimer"
      :class="{ visible: isVisible('disclaimer') }"
    >
      <p>
        BattleTech, Alpha Strike и все связанные товарные знаки принадлежат Catalyst Game Labs. Это
        фанатский инструмент, не одобренный и не связанный с Catalyst Game Labs.
      </p>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <span class="footer-logo">ВС КК</span>
      <span class="footer-copy">© {{ new Date().getFullYear() }} · Fan-made helper</span>
    </footer>
  </div>
</template>

<style scoped>
.landing-page {
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(180deg, var(--bg-primary) 0%, var(--bg-secondary) 60%, #071107 100%);
  color: var(--text-primary);
  font-family: var(--font-mono);
  overflow-x: hidden;
  padding-bottom: 32px;
}

.section-label {
  font-size: 10px;
  color: var(--accent-green);
  letter-spacing: 3px;
  text-transform: uppercase;
  margin-bottom: 18px;
  display: flex;
  align-items: center;
  gap: 10px;
  opacity: 0.9;
}

.section-label::after {
  content: '';
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, var(--border-color), transparent);
}

/* Hero */
.hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  text-align: center;
  overflow: hidden;
}

.hero-glow {
  position: absolute;
  top: 10%;
  left: 50%;
  width: 300px;
  height: 300px;
  transform: translateX(-50%);
  background: radial-gradient(circle, rgba(0, 255, 65, 0.12) 0%, transparent 70%);
  pointer-events: none;
  animation: pulse-glow 4s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%,
  100% {
    opacity: 0.6;
    transform: translateX(-50%) scale(1);
  }
  50% {
    opacity: 1;
    transform: translateX(-50%) scale(1.1);
  }
}

.hero-content {
  position: relative;
  z-index: 1;
  max-width: 360px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.logo-wrap {
  position: relative;
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.logo {
  width: 88px;
  height: auto;
  object-fit: contain;
  filter: drop-shadow(0 0 14px rgba(0, 255, 65, 0.35));
}

.corner {
  position: absolute;
  width: 16px;
  height: 16px;
  border-color: var(--accent-green);
  opacity: 0.5;
}

.corner.tl {
  top: 0;
  left: 0;
  border-top: 2px solid;
  border-left: 2px solid;
}
.corner.tr {
  top: 0;
  right: 0;
  border-top: 2px solid;
  border-right: 2px solid;
}
.corner.bl {
  bottom: 0;
  left: 0;
  border-bottom: 2px solid;
  border-left: 2px solid;
}
.corner.br {
  bottom: 0;
  right: 0;
  border-bottom: 2px solid;
  border-right: 2px solid;
}

.title {
  font-family: var(--font-display);
  font-size: 42px;
  font-weight: 800;
  letter-spacing: 8px;
  line-height: 1;
  margin-bottom: 8px;
}

.title-accent {
  color: var(--text-primary);
}

.title-main {
  background: linear-gradient(180deg, var(--accent-green) 0%, var(--accent-green-dim) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: 0 0 24px rgba(0, 255, 65, 0.35);
}

.subtitle {
  font-size: 11px;
  color: var(--text-dim);
  letter-spacing: 3px;
  text-transform: uppercase;
  margin-bottom: 24px;
}

.status-line {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(0, 255, 65, 0.08);
  border: 1px solid rgba(0, 255, 65, 0.25);
  padding: 6px 12px;
  font-size: 9px;
  letter-spacing: 2px;
  color: var(--accent-green);
  margin-bottom: 20px;
}

.status-dot {
  width: 6px;
  height: 6px;
  background: var(--accent-green);
  border-radius: 50%;
  box-shadow: 0 0 8px var(--accent-green);
  animation: blink 1.5s infinite;
}

@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
}

.hero-desc {
  font-size: 13px;
  line-height: 1.7;
  color: var(--text-dim);
  margin-bottom: 28px;
  max-width: 300px;
}

.cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: var(--accent-green);
  border: none;
  color: #000;
  padding: 14px 28px;
  font-family: var(--font-display);
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  cursor: pointer;
  transition:
    transform 0.15s ease,
    box-shadow 0.2s ease,
    opacity 0.2s ease;
  box-shadow: 0 0 20px rgba(0, 255, 65, 0.25);
  margin-bottom: 16px;
}

.cta:hover {
  opacity: 0.95;
  transform: translateY(-1px);
  box-shadow: 0 0 28px rgba(0, 255, 65, 0.4);
}

.cta:active {
  transform: translateY(1px);
}

.cta-icon {
  font-size: 12px;
}

.cta-secondary {
  background: transparent;
  color: var(--accent-green);
  border: 1px solid var(--accent-green);
  box-shadow: none;
  margin-bottom: 0;
}

.cta-secondary:hover {
  background: rgba(0, 255, 65, 0.08);
  box-shadow: 0 0 20px rgba(0, 255, 65, 0.2);
}

.hint {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  color: var(--text-dim);
}

.hint-prompt {
  color: var(--accent-orange);
  font-weight: 700;
}

/* Sections reveal */
.features,
.preview,
.steps,
.install,
.disclaimer {
  padding: 28px 20px;
  opacity: 0;
  transform: translateY(24px);
  transition:
    opacity 0.6s ease,
    transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.features.visible,
.preview.visible,
.steps.visible,
.install.visible,
.disclaimer.visible {
  opacity: 1;
  transform: translateY(0);
}

/* Features */
.feature-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.feature-card {
  background: rgba(0, 20, 0, 0.4);
  border: 1px solid var(--border-color);
  padding: 16px 12px;
  text-align: center;
  transition:
    border-color 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.feature-card:hover {
  border-color: rgba(0, 255, 65, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.feature-icon {
  width: 36px;
  height: 36px;
  margin: 0 auto 10px;
  color: var(--accent-green);
}

.feature-icon svg {
  width: 100%;
  height: 100%;
}

.feature-card h3 {
  font-family: var(--font-display);
  font-size: 13px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 6px;
  letter-spacing: 1px;
}

.feature-card p {
  font-size: 10px;
  line-height: 1.5;
  color: var(--text-dim);
}

/* Terminal preview */
.terminal-window {
  background: rgba(5, 10, 5, 0.9);
  border: 1px solid var(--border-color);
  border-radius: 4px 4px 0 0;
  overflow: hidden;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
}

.terminal-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: rgba(0, 255, 65, 0.06);
  border-bottom: 1px solid var(--border-color);
}

.terminal-btn {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent-green);
  opacity: 0.5;
}

.terminal-btn:nth-child(2) {
  background: var(--accent-orange);
}

.terminal-btn:nth-child(3) {
  background: var(--accent-blue);
}

.terminal-title {
  margin-left: auto;
  font-size: 9px;
  color: var(--text-dim);
  letter-spacing: 2px;
}

.terminal-body {
  padding: 14px;
  font-size: 11px;
}

.terminal-line {
  display: flex;
  gap: 8px;
  color: var(--text-dim);
  margin-bottom: 12px;
}

.terminal-line.mt {
  margin-top: 12px;
  margin-bottom: 0;
}

.term-prompt {
  color: var(--accent-green);
  font-weight: 700;
}

.term-cmd {
  color: var(--text-primary);
}

.term-blink {
  animation: blink-cursor 1s step-end infinite;
}

@keyframes blink-cursor {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}

.hud-preview {
  border: 1px solid var(--border-color);
  background: linear-gradient(135deg, rgba(0, 255, 65, 0.04), transparent 60%);
  padding: 14px;
  position: relative;
}

.hud-preview::before {
  content: '';
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 3px,
    rgba(0, 0, 0, 0.08) 3px,
    rgba(0, 0, 0, 0.08) 6px
  );
  pointer-events: none;
}

.hud-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 12px;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 8px;
}

.hud-name {
  font-family: var(--font-display);
  font-size: 14px;
  font-weight: 700;
  color: var(--accent-green);
}

.hud-type {
  font-size: 9px;
  color: var(--text-dim);
  letter-spacing: 1px;
}

.hud-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 14px;
}

.hud-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
  background: rgba(0, 0, 0, 0.25);
  padding: 8px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.hud-label {
  font-size: 8px;
  color: var(--text-dim);
  letter-spacing: 1px;
}

.hud-val {
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
}

.hud-damage {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.hud-dmg-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 10px;
  color: var(--text-dim);
}

.hud-dmg-row span:first-child {
  width: 16px;
  text-align: center;
}

.hud-bar {
  flex: 1;
  height: 6px;
  background: rgba(255, 255, 255, 0.08);
  position: relative;
}

.hud-bar i {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background: var(--accent-green);
  opacity: 0.7;
}

/* Steps */
.steps-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.step-item {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  background: rgba(0, 20, 0, 0.3);
  border: 1px solid var(--border-color);
  padding: 16px;
  transition: border-color 0.2s ease;
}

.step-item:hover {
  border-color: rgba(0, 255, 65, 0.3);
}

.step-num {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 800;
  color: var(--accent-green);
  opacity: 0.6;
  line-height: 1;
  min-width: 34px;
}

.step-body h3 {
  font-family: var(--font-display);
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 4px;
  color: var(--text-primary);
}

.step-body p {
  font-size: 11px;
  line-height: 1.6;
  color: var(--text-dim);
}

/* Install */
.install-card {
  text-align: center;
  background: linear-gradient(180deg, rgba(0, 255, 65, 0.08), rgba(0, 255, 65, 0.02));
  border: 1px solid rgba(0, 255, 65, 0.25);
  padding: 28px 20px;
}

.install-card h2 {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 700;
  color: var(--accent-green);
  margin-bottom: 10px;
  letter-spacing: 1px;
}

.install-card p {
  font-size: 12px;
  line-height: 1.6;
  color: var(--text-dim);
  margin-bottom: 20px;
}

/* Disclaimer */
.disclaimer p {
  font-size: 9px;
  line-height: 1.6;
  color: var(--text-dim);
  text-align: center;
  opacity: 0.7;
}

/* Footer */
.footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 24px 20px 0;
}

.footer-logo {
  font-family: var(--font-display);
  font-size: 14px;
  font-weight: 700;
  color: var(--accent-green);
  letter-spacing: 3px;
}

.footer-copy {
  font-size: 9px;
  color: var(--text-dim);
}

/* Responsive tweaks */
@media (max-width: 360px) {
  .feature-grid {
    grid-template-columns: 1fr;
  }

  .hud-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
