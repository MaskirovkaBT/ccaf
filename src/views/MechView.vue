<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useCatalogStore, getApiBase } from '../stores/catalog.js'
import { getCachedImageBlobUrl } from '../utils/imageCache.js'

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
})
const store = useCatalogStore()

const unit = computed(() => store.unit)
const loading = computed(() => store.loading)

const imageModalOpen = ref(false)
const imageError = ref(false)
const displayImageUrl = ref(null)
const objectUrlToRevoke = ref(null)
let currentImageRequestUrl = null

const resolvedImageUrl = computed(() => {
  if (!unit.value?.image_url) return null
  const url = unit.value.image_url
  if (/^https?:\/\//i.test(url)) return url
  const base = getApiBase().replace(/\/$/, '')
  return `${base}/${url.replace(/^\//, '')}`
})

const hasImage = computed(() => !!resolvedImageUrl.value && !imageError.value)

function openImageModal() {
  if (hasImage.value) imageModalOpen.value = true
}

function closeImageModal() {
  imageModalOpen.value = false
}

function onImageError() {
  imageError.value = true
}

async function updateDisplayImage(url) {
  currentImageRequestUrl = url

  if (objectUrlToRevoke.value) {
    URL.revokeObjectURL(objectUrlToRevoke.value)
    objectUrlToRevoke.value = null
  }
  displayImageUrl.value = null

  if (!url) return

  const blobUrl = await getCachedImageBlobUrl(url)

  if (currentImageRequestUrl !== url) return

  if (blobUrl && blobUrl.startsWith('blob:')) {
    objectUrlToRevoke.value = blobUrl
  }
  displayImageUrl.value = blobUrl || url
}

function onKeydown(e) {
  if (e.key === 'Escape') closeImageModal()
}

watch(imageModalOpen, open => {
  if (open) document.addEventListener('keydown', onKeydown)
  else document.removeEventListener('keydown', onKeydown)
})

watch(
  () => unit.value?.image_url,
  () => {
    imageError.value = false
    imageModalOpen.value = false
  }
)

watch(
  resolvedImageUrl,
  url => {
    updateDisplayImage(url)
  },
  { immediate: true }
)

const parsedSpecials = computed(() => {
  if (!unit.value?.specials) return []
  return unit.value.specials
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
})

const tmm = computed(() => {
  if (!unit.value?.mv) return 0
  const match = String(unit.value.mv).match(/\d+/)
  if (!match) return 0
  const move = parseInt(match[0], 10)
  if (move <= 4) return 0
  if (move <= 8) return 1
  if (move <= 12) return 2
  if (move <= 18) return 3
  if (move <= 34) return 4
  return 5
})

const inHangar = computed(() => store.isInHangar(props.id))

function toggleHangar() {
  store.toggleHangar(props.id)
}

function barPct(val, max) {
  return Math.min(100, Math.round((val / max) * 100))
}

onMounted(() => {
  store.loadUnit(props.id)
})

onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown)
  if (objectUrlToRevoke.value) {
    URL.revokeObjectURL(objectUrlToRevoke.value)
    objectUrlToRevoke.value = null
  }
})

watch(
  () => props.id,
  newId => {
    store.loadUnit(newId)
  }
)
</script>

<template>
  <div class="page">
    <div v-if="unit" class="card">
      <div class="header">
        <div class="back-btn" @click="$router.back()">←</div>
        <div class="header-top">
          <div>
            <div class="mech-name">{{ unit.title }}</div>
            <div class="mech-variant">{{ unit.unit_type }} · РЗ {{ unit.sz }}</div>
            <div class="hangar-toggle" :class="{ active: inHangar }" @click="toggleHangar">
              {{ inHangar ? '★ В ангаре' : '☆ В ангар' }}
            </div>
          </div>
          <div class="type-badge">{{ unit.unit_type }}</div>
        </div>
        <div class="mech-meta">
          <span>Роль: {{ unit.role || '—' }}</span>
          <span>БО {{ unit.pv }}</span>
          <span>ДВ {{ unit.mv }}</span>
        </div>
      </div>

      <div v-if="hasImage" class="image-section" @click="openImageModal">
        <div class="image-frame">
          <img
            :src="displayImageUrl"
            :alt="unit.title"
            class="unit-thumb"
            loading="lazy"
            @error="onImageError"
          />
        </div>
        <div class="image-hint">Нажмите для увеличения</div>
      </div>

      <div class="section">
        <div class="section-title">Инфо</div>
        <div class="stats-grid">
          <div class="stat-box">
            <div class="stat-label">БО</div>
            <div class="stat-value small">{{ unit.pv }}</div>
          </div>
          <div class="stat-box">
            <div class="stat-label">РЗ</div>
            <div class="stat-value small">{{ unit.sz }}</div>
          </div>
          <div class="stat-box">
            <div class="stat-label">TMM</div>
            <div class="stat-value small">+{{ tmm }}</div>
          </div>
        </div>

        <div class="stats-grid">
          <div class="stat-box">
            <div class="stat-label">Движение</div>
            <div class="stat-value small">{{ unit.mv }}</div>
          </div>
          <div class="stat-box">
            <div class="stat-label">Роль</div>
            <div class="stat-value small role">{{ unit.role }}</div>
          </div>
          <div class="stat-box">
            <div class="stat-label">Тип</div>
            <div class="stat-value small">{{ unit.unit_type }}</div>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Урон</div>
        <div class="damage-grid">
          <div class="damage-cell" :class="{ active: unit.short > 0 }">
            <div class="damage-range">Б</div>
            <div class="damage-value" :class="{ zero: unit.short === 0 }">
              {{ unit.short }}
            </div>
          </div>
          <div class="damage-cell" :class="{ active: unit.medium > 0 }">
            <div class="damage-range">С</div>
            <div class="damage-value" :class="{ zero: unit.medium === 0 }">
              {{ unit.medium }}
            </div>
          </div>
          <div class="damage-cell" :class="{ active: unit.long > 0 }">
            <div class="damage-range">Д</div>
            <div class="damage-value" :class="{ zero: unit.long === 0 }">
              {{ unit.long }}
            </div>
          </div>
          <div class="damage-cell" :class="{ active: unit.extreme > 0 }">
            <div class="damage-range">Э</div>
            <div class="damage-value" :class="{ zero: unit.extreme === 0 }">
              {{ unit.extreme }}
            </div>
          </div>
        </div>
        <div class="ov-row">
          <span>Перегрев:</span>
          <span class="ov-value">{{ unit.ov }}</span>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Броня и структура</div>
        <div class="armor-bar-section">
          <div class="bar-container">
            <div class="bar-label">БР</div>
            <div class="bar-track">
              <div class="bar-fill" :style="{ width: barPct(unit.armor, 12) + '%' }"></div>
            </div>
            <div class="bar-num">{{ unit.armor }}</div>
          </div>
          <div class="bar-container">
            <div class="bar-label">СТР</div>
            <div class="bar-track">
              <div class="bar-fill struct" :style="{ width: barPct(unit.struc, 8) + '%' }"></div>
            </div>
            <div class="bar-num">{{ unit.struc }}</div>
          </div>
          <div class="bar-container">
            <div class="bar-label">ТЯГ</div>
            <div class="bar-track">
              <div class="bar-fill thr" :style="{ width: barPct(unit.threshold, 6) + '%' }"></div>
            </div>
            <div class="bar-num">{{ unit.threshold }}</div>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Особые способности</div>
        <div class="specials-list">
          <span v-for="(s, i) in parsedSpecials" :key="i" class="special-tag">{{ s }}</span>
        </div>
      </div>

      <div class="footer">
        <span>BATTLETECH: ALPHA STRIKE</span>
        <span>БО {{ unit.pv }} · РЗ {{ unit.sz }} · {{ unit.unit_type }}</span>
      </div>

      <div v-if="imageModalOpen" class="image-modal" @click="closeImageModal">
        <div class="image-modal-backdrop"></div>
        <div class="image-modal-close" @click="closeImageModal">×</div>
        <div class="image-modal-content" @click.stop>
          <img :src="displayImageUrl" :alt="unit.title" class="image-modal-img" />
        </div>
      </div>
    </div>

    <div v-else-if="loading" class="not-found">
      <p>Загрузка…</p>
    </div>

    <div v-else class="not-found">
      <div class="back-btn" @click="$router.back()">←</div>
      <p>Юнит не найден</p>
    </div>
  </div>
</template>

<style scoped>
.card {
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(
    180deg,
    var(--bg-primary) 0%,
    var(--bg-secondary) 50%,
    var(--bg-primary) 100%
  );
  position: relative;
}

.back-btn {
  font-size: 11px;
  color: var(--text-dim);
  letter-spacing: 1px;
  margin-bottom: 8px;
  cursor: pointer;
  display: inline-block;
}

.back-btn:hover {
  color: var(--accent-green);
}

.hangar-toggle {
  font-size: 11px;
  letter-spacing: 1px;
  margin-top: 4px;
  margin-bottom: 8px;
  cursor: pointer;
  display: inline-block;
  padding: 2px 8px;
  border: 1px solid var(--border-color);
  color: var(--text-dim);
  user-select: none;
}

.hangar-toggle.active {
  border-color: var(--accent-orange);
  color: var(--accent-orange);
  background: rgba(255, 136, 0, 0.05);
}

.hangar-toggle:hover {
  border-color: var(--accent-green);
  color: var(--accent-green);
}

.hangar-toggle.active:hover {
  border-color: var(--accent-red);
  color: var(--accent-red);
  background: rgba(204, 51, 51, 0.05);
}

.header {
  padding: 12px 16px 12px;
  border-bottom: 1px solid var(--border-color);
  position: relative;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.mech-name {
  font-size: 24px;
  font-weight: bold;
  color: var(--accent-green);
  letter-spacing: 1px;
  line-height: 1.1;
  text-shadow: 0 0 20px rgba(0, 255, 65, 0.3);
}

.mech-variant {
  font-size: 14px;
  color: var(--accent-green-dim);
  margin-top: 2px;
}

.type-badge {
  background: var(--border-color);
  border: 1px solid var(--accent-green);
  color: var(--accent-green);
  padding: 4px 10px;
  font-size: 14px;
  font-weight: bold;
  letter-spacing: 1px;
  flex-shrink: 0;
}

.mech-meta {
  display: flex;
  gap: 8px;
  margin-top: 8px;
  font-size: 12px;
  color: var(--text-dim);
}

.mech-meta span {
  border-right: 1px solid var(--border-color);
  padding-right: 8px;
}

.mech-meta span:last-child {
  border-right: none;
}

.section {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
}

.stat-box {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  padding: 8px;
  text-align: center;
}

.stat-label {
  font-size: 10px;
  color: var(--text-dim);
  letter-spacing: 1px;
  text-transform: uppercase;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 24px;
  color: var(--accent-green);
  font-weight: bold;
}

.stat-value.small {
  font-size: 18px;
}

.stat-value.inactive {
  color: var(--text-inactive);
}

.stat-value.role {
  font-size: 14px;
}

.damage-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  gap: 6px;
}

.damage-cell {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  padding: 10px 4px;
  text-align: center;
}

.damage-cell.active {
  border-color: var(--accent-green-dim);
  background: #0f1f0f;
}

.damage-range {
  font-size: 10px;
  color: var(--text-dim);
  letter-spacing: 1px;
  margin-bottom: 4px;
}

.damage-value {
  font-size: 28px;
  font-weight: bold;
  color: var(--accent-green);
}

.damage-value.zero {
  color: var(--text-inactive);
}

.ov-row {
  margin-top: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text-dim);
}

.ov-value {
  color: var(--accent-green);
  font-weight: bold;
  font-size: 16px;
}

.armor-bar-section {
  margin-top: 0;
}

.bar-container {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.bar-label {
  font-size: 11px;
  color: var(--text-dim);
  width: 35px;
  text-align: right;
}

.bar-track {
  flex: 1;
  height: 8px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  position: relative;
}

.bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-green-dim), var(--accent-green));
}

.bar-fill.struct {
  background: linear-gradient(90deg, #cc6600, var(--accent-orange));
}

.bar-fill.thr {
  background: linear-gradient(90deg, var(--accent-red), #ff4444);
}

.bar-num {
  font-size: 12px;
  color: var(--text-primary);
  width: 20px;
}

.specials-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.special-tag {
  background: #1a2a1a;
  border: 1px solid var(--accent-green-dim);
  color: var(--accent-green);
  padding: 4px 10px;
  font-size: 13px;
  font-family: var(--font-mono);
}

.footer {
  padding: 10px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 10px;
  color: #3a5a3a;
  border-top: 1px solid var(--border-color);
}

.not-found {
  padding: 20px;
  text-align: center;
  color: var(--text-dim);
}

.image-section {
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
  text-align: center;
  position: relative;
  background:
    linear-gradient(90deg, rgba(0, 255, 65, 0.04) 1px, transparent 1px),
    linear-gradient(rgba(0, 255, 65, 0.04) 1px, transparent 1px),
    radial-gradient(ellipse at center, rgba(0, 255, 65, 0.05) 0%, transparent 70%),
    var(--bg-secondary);
  background-size:
    18px 18px,
    18px 18px,
    100% 100%,
    100% 100%;
  cursor: pointer;
}

.image-section::before {
  content: '';
  position: absolute;
  inset: 8px;
  border: 1px solid rgba(0, 255, 65, 0.12);
  pointer-events: none;
}

.image-frame {
  position: relative;
  padding: 4px;
  border: 1px solid var(--border-color);
  background: rgba(10, 15, 10, 0.6);
}

.image-frame::before,
.image-frame::after {
  content: '';
  position: absolute;
  width: 22px;
  height: 22px;
  border: 2px solid var(--accent-green-dim);
  pointer-events: none;
}

.image-frame::before {
  top: -2px;
  left: -2px;
  border-right: none;
  border-bottom: none;
}

.image-frame::after {
  bottom: -2px;
  right: -2px;
  border-left: none;
  border-top: none;
}

.unit-thumb {
  width: 100%;
  max-height: 180px;
  object-fit: contain;
  object-position: center;
  display: block;
  position: relative;
  z-index: 1;
}

.image-hint {
  margin-top: 10px;
  font-size: 11px;
  color: var(--text-dim);
  letter-spacing: 1px;
  position: relative;
  z-index: 1;
}

.image-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 120;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.image-modal-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.92);
}

.image-modal-content {
  position: relative;
  z-index: 1;
  max-width: 100%;
  max-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-modal-close {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 2;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-primary);
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  user-select: none;
}

.image-modal-img {
  max-width: 100%;
  max-height: calc(100vh - 64px);
  object-fit: contain;
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
}

@media (min-width: 480px) {
  .unit-thumb {
    max-height: 220px;
  }
}
</style>
