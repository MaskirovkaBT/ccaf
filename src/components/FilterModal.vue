<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useCatalogStore } from '../stores/catalog.js'

const store = useCatalogStore()
const { eras, factions, roles, types, filters, filterModes, sortBy, sortOrder } = storeToRefs(store)

const props = defineProps({
  mode: { type: String, default: 'store' },
  initialFilters: { type: Object, default: null },
  initialFilterModes: { type: Object, default: null },
  initialSortBy: { type: String, default: null },
  initialSortOrder: { type: String, default: null },
})

const emit = defineEmits(['close', 'apply', 'reset'])

const factionOpen = ref(false)

// Локальные копии — изменения в модале не трогают store до нажатия "Применить"
const localFilters = ref({})
const localFilterModes = ref({})
const localSortBy = ref('title')
const localSortOrder = ref('asc')

function initLocals() {
  if (props.mode === 'local' && props.initialFilters) {
    localFilters.value = JSON.parse(JSON.stringify(props.initialFilters))
    localFilterModes.value = JSON.parse(JSON.stringify(props.initialFilterModes || {}))
    localSortBy.value = props.initialSortBy || 'title'
    localSortOrder.value = props.initialSortOrder || 'asc'
  } else {
    localFilters.value = JSON.parse(JSON.stringify(filters.value))
    localFilterModes.value = JSON.parse(JSON.stringify(filterModes.value))
    localSortBy.value = sortBy.value
    localSortOrder.value = sortOrder.value
  }
}
initLocals()
watch(
  () => [
    props.initialFilters,
    props.initialFilterModes,
    props.initialSortBy,
    props.initialSortOrder,
  ],
  initLocals,
  { deep: true }
)

onMounted(() => {
  document.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown)
})

const activeCount = computed(() => {
  let c = 0
  const f = localFilters.value
  if (f.era_id != null) c++
  if (f.faction_id && f.faction_id.length > 0) c++
  if (f.unit_type) c++
  if (f.title) c++
  if (f.role) c++
  if (f.specials) c++
  const numericKeys = [
    'pv',
    'sz',
    'short',
    'medium',
    'long',
    'extreme',
    'ov',
    'armor',
    'struc',
    'threshold',
    'mv',
  ]
  numericKeys.forEach(k => {
    const v = f[k]
    if (v !== '' && v != null) c++
  })
  return c
})

function close() {
  emit('close')
}

function apply() {
  if (props.mode === 'local') {
    emit('apply', {
      filters: JSON.parse(JSON.stringify(localFilters.value)),
      filterModes: JSON.parse(JSON.stringify(localFilterModes.value)),
      sortBy: localSortBy.value,
      sortOrder: localSortOrder.value,
    })
  } else {
    filters.value = JSON.parse(JSON.stringify(localFilters.value))
    filterModes.value = JSON.parse(JSON.stringify(localFilterModes.value))
    sortBy.value = localSortBy.value
    sortOrder.value = localSortOrder.value
    store.setPage(1)
    store.loadUnits()
    close()
  }
}

function reset() {
  if (props.mode === 'local') {
    emit('reset')
  } else {
    store.resetFilters()
    store.loadUnits()
    close()
  }
}

function toggleFaction(id) {
  const arr = localFilters.value.faction_id
  const idx = arr.indexOf(id)
  if (idx === -1) {
    arr.push(id)
  } else {
    arr.splice(idx, 1)
  }
}

function onKeydown(e) {
  if (e.key === 'Escape') close()
}

const numericFields = [
  { key: 'pv', label: 'Очки' },
  { key: 'sz', label: 'Размер' },
  { key: 'short', label: 'Урон ближний' },
  { key: 'medium', label: 'Урон средний' },
  { key: 'long', label: 'Урон дальний' },
  { key: 'extreme', label: 'Урон экстремальный' },
  { key: 'ov', label: 'Перегрев' },
  { key: 'armor', label: 'Броня' },
  { key: 'struc', label: 'Структура' },
  { key: 'threshold', label: 'Порог повреждений' },
  { key: 'mv', label: 'Движение' },
]

const modeOptions = [
  { value: 'eq', label: '=' },
  { value: 'gt', label: '>' },
  { value: 'gte', label: '≥' },
  { value: 'lt', label: '<' },
  { value: 'lte', label: '≤' },
]

const sortOptions = [
  { value: 'title', label: 'Название' },
  { value: 'pv', label: 'Очки' },
  { value: 'role', label: 'Роль' },
  { value: 'short', label: 'Урон ближний' },
  { value: 'medium', label: 'Урон средний' },
  { value: 'long', label: 'Урон дальний' },
  { value: 'armor', label: 'Броня' },
  { value: 'struc', label: 'Структура' },
  { value: 'mv', label: 'Скорость' },
]

function toggleSortOrder() {
  localSortOrder.value = localSortOrder.value === 'asc' ? 'desc' : 'asc'
}
</script>

<template>
  <div class="modal-overlay" @click.self="close">
    <div class="modal-panel">
      <div class="modal-header">
        <h2>ФИЛЬТРЫ</h2>
        <div class="header-actions">
          <span v-if="activeCount > 0" class="active-badge">{{ activeCount }}</span>
          <button class="close-btn" @click="close">×</button>
        </div>
      </div>

      <div class="modal-body">
        <!-- Сортировка (в модале для удобства) -->
        <div class="section-row sort-row">
          <span class="section-label">СОРТИРОВКА</span>
          <select v-model="localSortBy" class="sort-select">
            <option v-for="opt in sortOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
          <button class="sort-dir-btn" @click="toggleSortOrder">
            {{ localSortOrder === 'asc' ? '▲' : '▼' }}
          </button>
        </div>

        <!-- Основное -->
        <div class="section-title">Основное</div>
        <div class="field-row">
          <label>Эра</label>
          <select v-model="localFilters.era_id" class="field-select">
            <option :value="null">Все эры</option>
            <option v-for="e in eras" :key="e.era_id" :value="e.era_id">
              {{ e.title }}
            </option>
          </select>
        </div>
        <div class="field-row">
          <label>Тип</label>
          <select v-model="localFilters.unit_type" class="field-select">
            <option value="">Все типы</option>
            <option v-for="t in types" :key="t" :value="t">{{ t }}</option>
          </select>
        </div>
        <div class="field-row">
          <label>Фракции</label>
          <div class="multi-select" :class="{ open: factionOpen }">
            <div class="multi-select-label" @click="factionOpen = !factionOpen">
              <span>
                {{
                  localFilters.faction_id.length > 0
                    ? `Выбрано: ${localFilters.faction_id.length}`
                    : 'Все фракции'
                }}
              </span>
              <span class="chevron">{{ factionOpen ? '▲' : '▼' }}</span>
            </div>
            <div class="multi-select-options" @click.stop>
              <label v-for="f in factions" :key="f.faction_id" class="multi-option">
                <input
                  type="checkbox"
                  :checked="localFilters.faction_id.includes(f.faction_id)"
                  @change="toggleFaction(f.faction_id)"
                />
                <span>{{ f.title }}</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Поиск -->
        <div class="section-title">Поиск</div>
        <div class="field-row">
          <label>Название</label>
          <input v-model="localFilters.title" placeholder="Название юнита..." class="field-input" />
        </div>
        <div class="field-row">
          <label>Роль</label>
          <select v-model="localFilters.role" class="field-select">
            <option value="">Все роли</option>
            <option v-for="r in roles" :key="r" :value="r">{{ r }}</option>
          </select>
        </div>

        <!-- Числовые фильтры -->
        <div class="section-title">Параметры</div>
        <div class="numeric-grid">
          <div v-for="f in numericFields" :key="f.key" class="numeric-cell">
            <label class="num-label">{{ f.label }}</label>
            <div class="num-inputs">
              <input
                v-model="localFilters[f.key]"
                type="number"
                min="0"
                placeholder="—"
                class="num-input"
              />
              <select v-model="localFilterModes[f.key]" class="num-mode">
                <option v-for="m in modeOptions" :key="m.value" :value="m.value">
                  {{ m.label }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- Способности -->
        <div class="section-title">Особые способности</div>
        <div class="field-row">
          <label>Способности</label>
          <input
            v-model="localFilters.specials"
            placeholder="Через запятую..."
            class="field-input"
          />
        </div>
        <div class="field-row">
          <label>Режим</label>
          <div class="radio-group">
            <label class="radio-option" :class="{ active: localFilterModes.specials === 'or' }">
              <input v-model="localFilterModes.specials" type="radio" value="or" />
              <span>ИЛИ</span>
            </label>
            <label class="radio-option" :class="{ active: localFilterModes.specials === 'and' }">
              <input v-model="localFilterModes.specials" type="radio" value="and" />
              <span>И</span>
            </label>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-reset" @click="reset">СБРОСИТЬ</button>
        <button class="btn-apply" @click="apply">
          ПРИМЕНИТЬ
          <span v-if="activeCount > 0" class="footer-badge">{{ activeCount }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(2px);
  display: flex;
  justify-content: center;
  align-items: flex-end;
  z-index: 110;
}

.modal-panel {
  width: 100%;
  max-width: 480px;
  max-height: 92vh;
  background: linear-gradient(180deg, var(--bg-secondary) 0%, var(--bg-primary) 100%);
  border-top: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  animation: slideUp 0.2s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(40px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}

.modal-header h2 {
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 2px;
  color: var(--accent-green);
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.active-badge {
  background: var(--accent-orange);
  color: #000;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 8px;
  font-family: var(--font-display);
}

.close-btn {
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-dim);
  width: 28px;
  height: 28px;
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: var(--accent-red);
  border-color: var(--accent-red);
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.modal-footer {
  display: flex;
  gap: 10px;
  padding: 12px 14px;
  border-top: 1px solid var(--border-color);
  flex-shrink: 0;
}

.btn-reset,
.btn-apply {
  flex: 1;
  padding: 10px;
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 1px;
  cursor: pointer;
  border: 1px solid var(--border-color);
}

.btn-reset {
  background: var(--bg-secondary);
  color: var(--text-dim);
}

.btn-reset:hover {
  color: var(--accent-red);
  border-color: var(--accent-red);
}

.btn-apply {
  background: var(--accent-green);
  color: #000;
  border-color: var(--accent-green);
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.footer-badge {
  background: #000;
  color: var(--accent-green);
  font-size: 10px;
  padding: 1px 5px;
  border-radius: 6px;
}

/* Section title */
.section-title {
  font-size: 10px;
  color: var(--accent-green);
  letter-spacing: 3px;
  text-transform: uppercase;
  margin: 6px 0 2px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-title::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border-color);
}

/* Sort row inside modal */
.sort-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.section-label {
  font-size: 10px;
  color: var(--text-dim);
  letter-spacing: 1px;
  white-space: nowrap;
}

.sort-select {
  flex: 1;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  padding: 6px 8px;
  font-family: var(--font-mono);
  font-size: 12px;
  outline: none;
}

.sort-dir-btn {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  color: var(--accent-green);
  padding: 6px 10px;
  font-family: var(--font-mono);
  font-size: 12px;
  cursor: pointer;
}

/* Field row */
.field-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.field-row > label {
  font-size: 11px;
  color: var(--text-dim);
  width: 70px;
  flex-shrink: 0;
  text-align: right;
}

.field-select,
.field-input {
  flex: 1;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  padding: 6px 8px;
  font-family: var(--font-mono);
  font-size: 12px;
  outline: none;
  min-width: 0;
}

/* Multi-select inside modal */
.multi-select {
  position: relative;
  flex: 1;
}

.multi-select-label {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  padding: 6px 8px;
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--text-primary);
  cursor: pointer;
  user-select: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.multi-select-options {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-top: none;
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.2s ease;
  z-index: 20;
}

.multi-select.open .multi-select-options {
  max-height: 220px;
  overflow-y: auto;
}

.multi-option {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  font-size: 12px;
  cursor: pointer;
  color: var(--text-primary);
}

.multi-option:hover {
  background: rgba(0, 255, 65, 0.05);
}

.multi-option input {
  accent-color: var(--accent-green);
}

/* Numeric grid */
.numeric-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.numeric-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.num-label {
  font-size: 11px;
  color: var(--text-dim);
}

.num-inputs {
  display: flex;
  gap: 4px;
}

.num-input {
  flex: 1;
  min-width: 0;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  padding: 5px 4px;
  font-family: var(--font-mono);
  font-size: 12px;
  text-align: center;
  outline: none;
}

.num-mode {
  width: 42px;
  flex-shrink: 0;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  padding: 5px 2px;
  font-family: var(--font-mono);
  font-size: 11px;
  text-align: center;
  outline: none;
}

/* Radio group */
.radio-group {
  display: flex;
  gap: 6px;
  flex: 1;
}

.radio-option {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  padding: 6px;
  font-size: 11px;
  cursor: pointer;
  color: var(--text-dim);
  transition: all 0.15s;
}

.radio-option.active {
  border-color: var(--accent-green);
  color: var(--accent-green);
  background: rgba(0, 255, 65, 0.08);
}

.radio-option input {
  display: none;
}
</style>
