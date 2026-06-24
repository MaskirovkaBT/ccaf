<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useCatalogStore } from '../stores/catalog.js'
import { getFormationType, formationTypes } from '../data/formations.js'
import { translateRole } from '../data/roleMap.js'
import { getApiBase } from '../stores/catalog.js'
import { DEFAULT_PILOT_SKILL, PILOT_SKILL_OPTIONS, adjustedUnitPv } from '../utils/pilotSkill.js'
import UnitIcon from './UnitIcon.vue'
import FilterModal from './FilterModal.vue'

const props = defineProps({
  formation: { type: Object, default: null },
})

const emit = defineEmits(['close', 'save', 'remove'])

const router = useRouter()
const store = useCatalogStore()
const { hangarUnits } = storeToRefs(store)

const isNew = computed(() => !props.formation)

const localName = ref('')
const localType = ref('')
const localUnitIds = ref([])
const resolvedUnits = ref([])
const localAbilities = ref({})
const localPilotSkills = ref({})

// UI state
const activeTab = ref('hangar') // 'hangar' | 'search'
const searchQuery = ref('')
const searchResults = ref([])
const searchLoading = ref(false)
const searchPage = ref(1)
const searchSize = ref(20)
const searchTotal = ref(0)
const searchPages = ref(1)
let searchDebounce = null

// Extended search filters (local to modal)
const showFilterModal = ref(false)
const searchFilters = ref({
  era_id: null,
  faction_id: [],
  unit_type: '',
  title: '',
  role: '',
  specials: '',
  pv: '',
  sz: '',
  short: '',
  medium: '',
  long: '',
  extreme: '',
  ov: '',
  armor: '',
  struc: '',
  threshold: '',
  mv: '',
})
const searchFilterModes = ref({
  specials: 'or',
  pv: 'eq',
  sz: 'eq',
  short: 'eq',
  medium: 'eq',
  long: 'eq',
  extreme: 'eq',
  ov: 'eq',
  armor: 'eq',
  struc: 'eq',
  threshold: 'eq',
  mv: 'eq',
})
const searchSortBy = ref('title')
const searchSortOrder = ref('asc')

const activeSearchFilterCount = computed(() => {
  let c = 0
  const f = searchFilters.value
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

watch(searchQuery, q => {
  searchFilters.value.title = q
})

function init() {
  const draftJson = sessionStorage.getItem('ccaf_formation_edit_draft')
  let draft = null
  if (draftJson) {
    try {
      draft = JSON.parse(draftJson)
    } catch {
      draft = null
    }
  }

  const matchesDraft =
    draft &&
    ((draft.isNew && !props.formation) ||
      (!draft.isNew && props.formation?.id === draft.formationId))

  if (matchesDraft) {
    localName.value = draft.name || ''
    localType.value = draft.type || ''
    localUnitIds.value = Array.isArray(draft.units) ? draft.units.map(Number) : []
    localAbilities.value = draft.abilities ? JSON.parse(JSON.stringify(draft.abilities)) : {}
    localPilotSkills.value = draft.pilotSkills ? JSON.parse(JSON.stringify(draft.pilotSkills)) : {}
    if (draft.activeTab) activeTab.value = draft.activeTab
    if (draft.searchQuery != null) searchQuery.value = draft.searchQuery
    if (draft.searchFilters) searchFilters.value = JSON.parse(JSON.stringify(draft.searchFilters))
    if (draft.searchFilterModes)
      searchFilterModes.value = JSON.parse(JSON.stringify(draft.searchFilterModes))
    if (draft.searchSortBy) searchSortBy.value = draft.searchSortBy
    if (draft.searchSortOrder) searchSortOrder.value = draft.searchSortOrder
    if (Array.isArray(draft.searchResults)) searchResults.value = draft.searchResults
    if (draft.searchPage) searchPage.value = draft.searchPage
    if (draft.searchSize) searchSize.value = draft.searchSize
    if (draft.searchTotal != null) searchTotal.value = draft.searchTotal
    if (draft.searchPages) searchPages.value = draft.searchPages
    sessionStorage.removeItem('ccaf_formation_edit_draft')
  } else {
    if (props.formation) {
      localName.value = props.formation.name || ''
      localType.value = props.formation.type || ''
      localUnitIds.value = Array.isArray(props.formation.units)
        ? props.formation.units.map(Number)
        : []
      localAbilities.value = props.formation.abilities
        ? JSON.parse(JSON.stringify(props.formation.abilities))
        : {}
      localPilotSkills.value = props.formation.pilotSkills
        ? JSON.parse(JSON.stringify(props.formation.pilotSkills))
        : {}
    } else {
      localName.value = ''
      localType.value = ''
      localUnitIds.value = []
      localAbilities.value = {}
      localPilotSkills.value = {}
    }
    searchQuery.value = ''
    searchResults.value = []
    searchPage.value = 1
    searchTotal.value = 0
    searchPages.value = 1
  }

  ensureUnitSkills()
  cleanOrphanSkills()

  // Предзаполняем юниты из кэша синхронно, чтобы избежать пустого кадра при анимации
  if (localUnitIds.value.length) {
    resolvedUnits.value = localUnitIds.value
      .map(id => store.formationUnitCache.get(Number(id)))
      .filter(Boolean)
  } else {
    resolvedUnits.value = []
  }

  resolveCurrentUnits()
}

init()
watch(() => props.formation, init)
watch(localUnitIds, resolveCurrentUnits, { deep: true })

async function resolveCurrentUnits() {
  if (localUnitIds.value.length) {
    resolvedUnits.value = await store.resolveUnits(localUnitIds.value)
  } else {
    resolvedUnits.value = []
  }
}

const selectedType = computed(() => getFormationType(localType.value))

const groundTypes = computed(() => formationTypes.filter(f => f.category === 'ground'))
const airTypes = computed(() => formationTypes.filter(f => f.category === 'air'))

const unitCount = computed(() => resolvedUnits.value.length)
const totalPv = computed(() =>
  resolvedUnits.value.reduce((sum, u) => sum + adjustedUnitPv(u.pv, getUnitSkill(u.unit_id)), 0)
)
const hasTooFewUnits = computed(() => unitCount.value > 0 && unitCount.value < 3)

function getUnitSkill(unitId) {
  return localPilotSkills.value[String(unitId)] ?? DEFAULT_PILOT_SKILL
}

function setUnitSkill(unitId, skill) {
  localPilotSkills.value[String(unitId)] = Number(skill)
}

function ensureUnitSkills() {
  localUnitIds.value.forEach(id => {
    const key = String(id)
    if (localPilotSkills.value[key] == null) {
      localPilotSkills.value[key] = DEFAULT_PILOT_SKILL
    }
  })
}

function cleanOrphanSkills() {
  const activeIds = new Set(localUnitIds.value.map(id => String(id)))
  Object.keys(localPilotSkills.value).forEach(key => {
    if (!activeIds.has(key)) {
      delete localPilotSkills.value[key]
    }
  })
}

const optimalRoleMatch = computed(() => {
  const role = selectedType.value?.optimalRole
  if (!role) return null
  const count = resolvedUnits.value.filter(u => translateRole(u.role) === role).length
  return { role, count }
})

// Ability helpers
const abilityConfig = computed(() => selectedType.value?.abilityConfig || null)

const abilityCountLimit = computed(() => {
  const cfg = abilityConfig.value
  if (!cfg) return 0
  if (cfg.countMode === 'half_up') return Math.ceil(unitCount.value / 2)
  if (cfg.countMode === 'half_down') return Math.floor(unitCount.value / 2)
  return unitCount.value
})

function ensureAbilityDefaults() {
  const cfg = abilityConfig.value
  if (!cfg) {
    localAbilities.value = {}
    return
  }
  if (cfg.mode === 'single') {
    if (!localAbilities.value.choice) localAbilities.value = { choice: '' }
  } else if (cfg.mode === 'multi') {
    if (!Array.isArray(localAbilities.value.choices)) localAbilities.value = { choices: [] }
  } else if (cfg.mode === 'command') {
    if (!localAbilities.value.commanderUnitId) {
      localAbilities.value = { commanderUnitId: null, unitAbilities: {} }
    }
  } else if (cfg.mode === 'per_unit') {
    if (!localAbilities.value.unitAbilities) localAbilities.value = { unitAbilities: {} }
  } else if (cfg.mode === 'per_pair') {
    if (!localAbilities.value.pair1) localAbilities.value = { pair1: '', pair2: '' }
  }
}

watch(selectedType, ensureAbilityDefaults)

function addUnit(id) {
  const numId = Number(id)
  localUnitIds.value.push(numId)
  const key = String(numId)
  if (localPilotSkills.value[key] == null) {
    localPilotSkills.value[key] = DEFAULT_PILOT_SKILL
  }
}

function openMech(unitId) {
  sessionStorage.setItem(
    'ccaf_formation_edit_draft',
    JSON.stringify({
      isNew: isNew.value,
      formationId: props.formation?.id || null,
      name: localName.value,
      type: localType.value,
      units: localUnitIds.value,
      abilities: localAbilities.value,
      pilotSkills: localPilotSkills.value,
      activeTab: activeTab.value,
      searchQuery: searchQuery.value,
      searchFilters: searchFilters.value,
      searchFilterModes: searchFilterModes.value,
      searchSortBy: searchSortBy.value,
      searchSortOrder: searchSortOrder.value,
      searchResults: searchResults.value,
      searchPage: searchPage.value,
      searchSize: searchSize.value,
      searchTotal: searchTotal.value,
      searchPages: searchPages.value,
    })
  )
  router.push({ name: 'mech', params: { id: unitId } })
}

function removeUnit(idx) {
  const id = Number(localUnitIds.value[idx])
  localUnitIds.value.splice(idx, 1)
  const uid = String(id)
  if (localAbilities.value.unitAbilities) {
    if (!localUnitIds.value.map(Number).includes(id)) {
      delete localAbilities.value.unitAbilities[uid]
    }
  }
  if (
    String(localAbilities.value.commanderUnitId) === uid &&
    !localUnitIds.value.map(Number).includes(id)
  ) {
    localAbilities.value.commanderUnitId = null
  }
  cleanOrphanSkills()
}

function unitCountInFormation(unitId) {
  const target = Number(unitId)
  return localUnitIds.value.filter(id => Number(id) === target).length
}

function onSearchInput() {
  clearTimeout(searchDebounce)
  searchDebounce = setTimeout(() => {
    searchPage.value = 1
    doSearch()
  }, 400)
}

function buildSearchQuery() {
  const params = new URLSearchParams()
  const f = searchFilters.value
  const fm = searchFilterModes.value

  if (f.era_id != null) params.append('era_id', f.era_id)
  f.faction_id.forEach(id => params.append('faction_id', id))
  if (f.unit_type) params.append('unit_type', f.unit_type)
  if (f.title) params.append('title', f.title)
  if (f.role) params.append('role', f.role)
  if (f.specials) params.append('specials', f.specials)

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
  const headers = {}

  numericKeys.forEach(key => {
    const val = f[key]
    if (val !== '' && val != null) {
      params.append(key, val)
    }
    const mode = fm[key]
    if (mode && mode !== 'eq') {
      const headerName = 'X-' + key.charAt(0).toUpperCase() + key.slice(1) + '-Mode'
      headers[headerName] = mode
    }
  })

  if (fm.specials && fm.specials !== 'or') {
    headers['X-Specials-Mode'] = fm.specials
  }

  params.append('sort_by', searchSortBy.value)
  params.append('sort_order', searchSortOrder.value)
  params.append('page', searchPage.value)
  params.append('size', searchSize.value)

  return { query: params.toString(), headers }
}

function parseSearchPageResponse(payload) {
  const items = Array.isArray(payload)
    ? payload
    : payload.items || payload.results || payload.data || payload.content || []
  const totalCount = payload.total ?? payload.count ?? payload.total_count ?? items.length
  const currentPage = payload.page ?? payload.page_number ?? 1
  const currentSize = payload.size ?? payload.page_size ?? payload.limit ?? searchSize.value
  const pages = payload.pages ?? (Math.ceil(totalCount / currentSize) || 1)
  return { items, total: totalCount, page: currentPage, size: currentSize, pages }
}

async function doSearch() {
  searchLoading.value = true
  try {
    const { query, headers } = buildSearchQuery()
    const res = await fetch(`${getApiBase()}/units?${query}`, { headers })
    const data = await res.json()
    const parsed = parseSearchPageResponse(data)
    searchResults.value = parsed.items
    searchTotal.value = parsed.total
    searchPage.value = parsed.page
    searchPages.value = parsed.pages
  } catch (e) {
    console.error(e)
  } finally {
    searchLoading.value = false
  }
}

function onFilterApply({ filters, filterModes, sortBy, sortOrder }) {
  searchFilters.value = JSON.parse(JSON.stringify(filters))
  searchFilterModes.value = JSON.parse(JSON.stringify(filterModes))
  searchSortBy.value = sortBy
  searchSortOrder.value = sortOrder
  searchQuery.value = searchFilters.value.title || ''
  searchPage.value = 1
  showFilterModal.value = false
  doSearch()
}

function onFilterReset() {
  searchFilters.value = {
    era_id: null,
    faction_id: [],
    unit_type: '',
    title: '',
    role: '',
    specials: '',
    pv: '',
    sz: '',
    short: '',
    medium: '',
    long: '',
    extreme: '',
    ov: '',
    armor: '',
    struc: '',
    threshold: '',
    mv: '',
  }
  searchFilterModes.value = {
    specials: 'or',
    pv: 'eq',
    sz: 'eq',
    short: 'eq',
    medium: 'eq',
    long: 'eq',
    extreme: 'eq',
    ov: 'eq',
    armor: 'eq',
    struc: 'eq',
    threshold: 'eq',
    mv: 'eq',
  }
  searchSortBy.value = 'title'
  searchSortOrder.value = 'asc'
  searchQuery.value = ''
  searchPage.value = 1
  showFilterModal.value = false
  doSearch()
}

const canPrevPage = computed(() => searchPage.value > 1)
const canNextPage = computed(() => searchPage.value < searchPages.value)

function goSearchPage(p) {
  const target = Number(p)
  if (target < 1 || target > searchPages.value) return
  searchPage.value = target
  doSearch()
}

function close() {
  emit('close')
}

function save() {
  cleanOrphanSkills()
  const payload = {
    name: localName.value.trim() || (selectedType.value?.name ?? 'Новая формация'),
    type: localType.value,
    units: localUnitIds.value.map(Number),
    abilities: JSON.parse(JSON.stringify(localAbilities.value)),
    pilotSkills: JSON.parse(JSON.stringify(localPilotSkills.value)),
  }
  emit('save', payload)
}

function remove() {
  if (props.formation) {
    emit('remove', props.formation.id)
  }
}

function onKeydown(e) {
  if (e.key === 'Escape') close()
}

onMounted(() => {
  document.addEventListener('keydown', onKeydown)
  ensureAbilityDefaults()
})

onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown)
})

function weightClassFromSz(sz) {
  if (sz >= 4) return 'assault'
  if (sz === 3) return 'heavy'
  if (sz === 2) return 'medium'
  return 'light'
}

function szLabel(sz) {
  const map = { 4: 'ТЯЖ', 3: 'СРД', 2: 'ЛГК', 1: 'ЛЕГ' }
  return map[sz] || '??'
}

function isAbilitySelected(optId) {
  if (abilityConfig.value?.mode === 'single') {
    return localAbilities.value.choice === optId
  }
  if (abilityConfig.value?.mode === 'multi') {
    return (localAbilities.value.choices || []).includes(optId)
  }
  return false
}

function toggleMultiAbility(optId) {
  const arr = localAbilities.value.choices || []
  const idx = arr.indexOf(optId)
  const max = abilityConfig.value.max || 1
  if (idx !== -1) {
    arr.splice(idx, 1)
  } else if (arr.length < max) {
    arr.push(optId)
  }
  localAbilities.value.choices = [...arr]
}

function selectedUnitAbility(unitId) {
  return localAbilities.value.unitAbilities?.[String(unitId)] || ''
}

function setUnitAbility(unitId, val) {
  if (!localAbilities.value.unitAbilities) localAbilities.value.unitAbilities = {}
  if (val) {
    localAbilities.value.unitAbilities[String(unitId)] = val
  } else {
    delete localAbilities.value.unitAbilities[String(unitId)]
  }
}

function commandSelectedCount() {
  const map = localAbilities.value.unitAbilities || {}
  return Object.values(map).filter(Boolean).length
}

function nonCommandUnits() {
  const cmdId = Number(localAbilities.value.commanderUnitId)
  return resolvedUnits.value.filter(u => u.unit_id !== cmdId)
}
</script>

<template>
  <div class="modal-overlay" @click.self="close">
    <div class="modal-panel">
      <div class="modal-header">
        <h2>{{ isNew ? 'НОВАЯ ФОРМАЦИЯ' : 'РЕДАКТИРОВАНИЕ' }}</h2>
        <button class="close-btn" @click="close">×</button>
      </div>

      <div class="modal-body">
        <!-- Название -->
        <div class="field-row">
          <label>Название</label>
          <input v-model="localName" placeholder="Название формации..." class="field-input" />
        </div>

        <!-- Тип -->
        <div class="field-row">
          <label>Тип</label>
          <select v-model="localType" class="field-select">
            <option value="">— Выберите тип —</option>
            <optgroup label="Наземные подразделения">
              <option v-for="t in groundTypes" :key="t.id" :value="t.id">
                {{ t.name }}
              </option>
            </optgroup>
            <optgroup label="Воздушно-космические">
              <option v-for="t in airTypes" :key="t.id" :value="t.id">
                {{ t.name }}
              </option>
            </optgroup>
          </select>
        </div>

        <!-- Инфо о типе -->
        <div v-if="selectedType" class="type-info">
          <div v-if="selectedType.optimalRole" class="info-line">
            <span class="info-label">Оптимальная роль:</span>
            <span class="info-value">{{ selectedType.optimalRole }}</span>
          </div>
          <div class="info-line">
            <span class="info-label">Эффект:</span>
          </div>
          <div class="effect-text">{{ selectedType.effect }}</div>
        </div>

        <!-- Требования -->
        <div v-if="selectedType" class="requirements-block">
          <div class="section-title">Требования</div>
          <ul class="req-list">
            <li v-for="(req, i) in selectedType.requirements" :key="i">
              {{ req }}
            </li>
          </ul>
        </div>

        <!-- Способности -->
        <div v-if="abilityConfig" class="abilities-block">
          <div class="section-title">{{ abilityConfig.label }}</div>

          <!-- single select -->
          <div v-if="abilityConfig.mode === 'single'" class="ability-row">
            <select v-model="localAbilities.choice" class="field-select">
              <option value="">— Не выбрано —</option>
              <option v-for="opt in abilityConfig.options" :key="opt.id" :value="opt.id">
                {{ opt.name }}
              </option>
            </select>
          </div>

          <!-- multi select -->
          <div v-else-if="abilityConfig.mode === 'multi'" class="ability-multi">
            <label
              v-for="opt in abilityConfig.options"
              :key="opt.id"
              class="ability-option"
              :class="{
                disabled:
                  !isAbilitySelected(opt.id) &&
                  (localAbilities.choices || []).length >= abilityConfig.max,
              }"
            >
              <input
                type="checkbox"
                :checked="isAbilitySelected(opt.id)"
                :disabled="
                  !isAbilitySelected(opt.id) &&
                  (localAbilities.choices || []).length >= abilityConfig.max
                "
                @change="toggleMultiAbility(opt.id)"
              />
              <span>{{ opt.name }}</span>
            </label>
            <div class="ability-hint">
              Выбрано: {{ (localAbilities.choices || []).length }} /
              {{ abilityConfig.max }}
            </div>
          </div>

          <!-- per_pair -->
          <div v-else-if="abilityConfig.mode === 'per_pair'" class="ability-pairs">
            <div class="pair-row">
              <span>Пара 1:</span>
              <select v-model="localAbilities.pair1" class="field-select">
                <option value="">— Не выбрано —</option>
                <option
                  v-for="opt in abilityConfig.options"
                  :key="opt.id"
                  :value="opt.id"
                  :disabled="localAbilities.pair2 === opt.id"
                >
                  {{ opt.name }}
                </option>
              </select>
            </div>
            <div class="pair-row">
              <span>Пара 2:</span>
              <select v-model="localAbilities.pair2" class="field-select">
                <option value="">— Не выбрано —</option>
                <option
                  v-for="opt in abilityConfig.options"
                  :key="opt.id"
                  :value="opt.id"
                  :disabled="localAbilities.pair1 === opt.id"
                >
                  {{ opt.name }}
                </option>
              </select>
            </div>
          </div>

          <!-- command -->
          <div v-else-if="abilityConfig.mode === 'command'" class="ability-command">
            <div class="cmd-row">
              <label>Командир:</label>
              <select v-model="localAbilities.commanderUnitId" class="field-select">
                <option :value="null">— Выберите командира —</option>
                <option v-for="u in resolvedUnits" :key="u.unit_id" :value="u.unit_id">
                  {{ u.title }}
                </option>
              </select>
            </div>
            <div v-if="localAbilities.commanderUnitId" class="cmd-ability">
              ОСП командира:
              <strong>{{ abilityConfig.commanderAbility.name }}</strong>
            </div>
            <div class="cmd-subtitle">
              Бонусные ОСП для остальных БЕ (макс.
              {{ abilityCountLimit }}):
            </div>
            <div v-for="u in nonCommandUnits()" :key="u.unit_id" class="unit-ability-row">
              <span class="ua-name">{{ u.title }}</span>
              <select
                :value="selectedUnitAbility(u.unit_id)"
                class="field-select"
                :disabled="
                  !selectedUnitAbility(u.unit_id) && commandSelectedCount() >= abilityCountLimit
                "
                @change="setUnitAbility(u.unit_id, $event.target.value)"
              >
                <option value="">— Не выбрано —</option>
                <option v-for="opt in abilityConfig.unitOptions" :key="opt.id" :value="opt.id">
                  {{ opt.name }}
                </option>
              </select>
            </div>
          </div>

          <!-- per_unit -->
          <div v-else-if="abilityConfig.mode === 'per_unit'" class="ability-per-unit">
            <div v-if="abilityConfig.countMode" class="ability-hint">
              Выберите не более {{ abilityCountLimit }} БЕ
            </div>
            <div v-for="u in resolvedUnits" :key="u.unit_id" class="unit-ability-row">
              <span class="ua-name">{{ u.title }}</span>
              <select
                :value="selectedUnitAbility(u.unit_id)"
                class="field-select"
                :disabled="
                  abilityConfig.countMode &&
                  !selectedUnitAbility(u.unit_id) &&
                  Object.values(localAbilities.unitAbilities || {}).filter(Boolean).length >=
                    abilityCountLimit
                "
                @change="setUnitAbility(u.unit_id, $event.target.value)"
              >
                <option value="">— Не выбрано —</option>
                <option v-for="opt in abilityConfig.options" :key="opt.id" :value="opt.id">
                  {{ opt.name }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- Статус -->
        <div v-if="selectedType" class="status-block">
          <div class="section-title">Состояние</div>
          <div class="status-line" :class="{ warning: hasTooFewUnits }">
            БЕ в составе: <strong>{{ unitCount }}</strong>
            <span v-if="hasTooFewUnits">
              — менее 3 действующих БЕ, эффект не действует (стр. 156)
            </span>
          </div>
          <div class="status-line">
            Стоимость: <strong>{{ totalPv }}</strong> БО
          </div>
          <div v-if="optimalRoleMatch" class="status-line">
            Оптимальная роль «{{ optimalRoleMatch.role }}»:
            <strong>{{ optimalRoleMatch.count }}</strong> / {{ unitCount }}
          </div>
        </div>

        <!-- Текущие юниты -->
        <div v-if="resolvedUnits.length > 0" class="section-title">
          Юниты в формации ({{ resolvedUnits.length }})
        </div>
        <div v-if="resolvedUnits.length > 0" class="current-units">
          <div
            v-for="(u, idx) in resolvedUnits"
            :key="idx"
            class="current-unit-row"
            @click="openMech(u.unit_id)"
          >
            <div class="pick-icon">
              <UnitIcon :type="u.unit_type" />
              <span class="unit-weight-badge" :class="weightClassFromSz(u.sz)">
                {{ szLabel(u.sz) }}
              </span>
            </div>
            <div class="pick-info">
              <div class="pick-name">{{ u.title }}</div>
              <div class="pick-meta">
                {{ u.unit_type }} · РЗ {{ u.sz }} · ДВ {{ u.mv }} · БО
                {{ adjustedUnitPv(u.pv, getUnitSkill(u.unit_id)) }}
                <span v-if="getUnitSkill(u.unit_id) !== DEFAULT_PILOT_SKILL" class="changed-stat">
                  (база {{ u.pv }})
                </span>
                · Роль: {{ translateRole(u.role) }}
              </div>
            </div>
            <label class="skill-label" title="Навык пилота/экипажа">
              <span>Навык</span>
              <select
                class="skill-select"
                :value="String(getUnitSkill(u.unit_id))"
                @click.stop
                @change="setUnitSkill(u.unit_id, $event.target.value)"
              >
                <option
                  v-for="opt in PILOT_SKILL_OPTIONS"
                  :key="opt.value"
                  :value="String(opt.value)"
                >
                  {{ opt.value }}
                </option>
              </select>
            </label>
            <button class="btn-remove-unit" @click.stop="removeUnit(idx)">×</button>
          </div>
        </div>

        <!-- Добавление юнитов -->
        <div class="section-title">Добавить юниты</div>
        <div class="tabs">
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'hangar' }"
            @click="activeTab = 'hangar'"
          >
            Ангар
          </button>
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'search' }"
            @click="activeTab = 'search'"
          >
            Поиск
          </button>
        </div>

        <!-- Ангар -->
        <div v-if="activeTab === 'hangar'" class="unit-pick-panel">
          <div v-if="hangarUnits.length === 0" class="empty-hangar">
            Ангар пуст. Добавьте юниты через каталог.
          </div>
          <div v-else class="unit-pick-list">
            <div v-for="u in hangarUnits" :key="u.unit_id" class="unit-pick-row">
              <div class="pick-icon">
                <UnitIcon :type="u.unit_type" />
                <span class="unit-weight-badge" :class="weightClassFromSz(u.sz)">
                  {{ szLabel(u.sz) }}
                </span>
              </div>
              <div class="pick-info">
                <div class="pick-name">{{ u.title }}</div>
                <div class="pick-meta">
                  {{ u.unit_type }} · РЗ {{ u.sz }} · ДВ {{ u.mv }} · БО {{ u.pv }} · Роль:
                  {{ translateRole(u.role) }}
                </div>
              </div>
              <div class="pick-actions">
                <span v-if="unitCountInFormation(u.unit_id)" class="count-badge">
                  {{ unitCountInFormation(u.unit_id) }}
                </span>
                <button class="btn-add-unit" @click="addUnit(u.unit_id)">+</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Поиск -->
        <div v-else class="unit-pick-panel">
          <div class="search-toolbar">
            <input
              v-model="searchQuery"
              placeholder="Поиск по названию..."
              class="field-input"
              @input="onSearchInput"
            />
            <button class="btn-filter" @click="showFilterModal = true">
              Фильтры
              <span v-if="activeSearchFilterCount" class="filter-badge">{{
                activeSearchFilterCount
              }}</span>
            </button>
          </div>
          <div v-if="searchLoading" class="empty-hangar">Поиск…</div>
          <div
            v-else-if="searchResults.length === 0 && (searchQuery || activeSearchFilterCount)"
            class="empty-hangar"
          >
            Ничего не найдено
          </div>
          <div v-else class="unit-pick-list">
            <div
              v-for="u in searchResults"
              :key="u.unit_id"
              class="unit-pick-row"
              @click="openMech(u.unit_id)"
            >
              <div class="pick-icon">
                <UnitIcon :type="u.unit_type" />
                <span class="unit-weight-badge" :class="weightClassFromSz(u.sz)">
                  {{ szLabel(u.sz) }}
                </span>
              </div>
              <div class="pick-info">
                <div class="pick-name">{{ u.title }}</div>
                <div class="pick-meta">
                  {{ u.unit_type }} · РЗ {{ u.sz }} · ДВ {{ u.mv }} · БО {{ u.pv }} · Роль:
                  {{ translateRole(u.role) }}
                </div>
              </div>
              <div class="pick-actions">
                <span v-if="unitCountInFormation(u.unit_id)" class="count-badge">
                  {{ unitCountInFormation(u.unit_id) }}
                </span>
                <button class="btn-add-unit" @click.stop="addUnit(u.unit_id)">+</button>
              </div>
            </div>
          </div>
          <div v-if="searchPages > 1" class="pagination">
            <button class="page-btn" :disabled="!canPrevPage" @click="goSearchPage(searchPage - 1)">
              ‹
            </button>
            <span class="page-info">{{ searchPage }} / {{ searchPages }}</span>
            <button class="page-btn" :disabled="!canNextPage" @click="goSearchPage(searchPage + 1)">
              ›
            </button>
          </div>
        </div>

        <!-- Расширенные фильтры -->
        <FilterModal
          v-if="showFilterModal"
          mode="local"
          :initial-filters="searchFilters"
          :initial-filter-modes="searchFilterModes"
          :initial-sort-by="searchSortBy"
          :initial-sort-order="searchSortOrder"
          @apply="onFilterApply"
          @close="showFilterModal = false"
          @reset="onFilterReset"
        />
      </div>

      <div class="modal-footer">
        <button v-if="!isNew" class="btn-remove" @click="remove">УДАЛИТЬ</button>
        <button class="btn-reset" @click="close">ОТМЕНА</button>
        <button class="btn-apply" :disabled="!localType" @click="save">СОХРАНИТЬ</button>
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

.btn-remove,
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

.btn-remove {
  background: var(--bg-secondary);
  color: var(--accent-red);
}

.btn-remove:hover {
  border-color: var(--accent-red);
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
}

.btn-apply:disabled {
  opacity: 0.4;
  cursor: not-allowed;
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

/* Type info */
.type-info {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid var(--border-color);
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-line {
  display: flex;
  gap: 6px;
  font-size: 11px;
}

.info-label {
  color: var(--text-dim);
}

.info-value {
  color: var(--accent-green);
}

.effect-text {
  font-size: 11px;
  color: var(--text-primary);
  line-height: 1.5;
}

/* Requirements */
.requirements-block,
.status-block,
.abilities-block {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.req-list {
  margin: 0;
  padding-left: 16px;
  font-size: 11px;
  color: var(--text-primary);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.req-list li::marker {
  color: var(--accent-green);
}

/* Status */
.status-line {
  font-size: 11px;
  color: var(--text-dim);
}

.status-line.warning {
  color: var(--accent-orange);
}

.status-line strong {
  color: var(--accent-green);
}

/* Abilities */
.ability-row {
  display: flex;
  gap: 8px;
}

.ability-multi {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.ability-option {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-primary);
  cursor: pointer;
}

.ability-option.disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.ability-hint {
  font-size: 10px;
  color: var(--text-dim);
}

.ability-pairs {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.pair-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.pair-row span {
  color: var(--text-dim);
  width: 50px;
  flex-shrink: 0;
}

.ability-command,
.ability-per-unit {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.cmd-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cmd-row label {
  font-size: 11px;
  color: var(--text-dim);
  width: 70px;
  flex-shrink: 0;
}

.cmd-ability {
  font-size: 12px;
  color: var(--accent-green);
  padding: 4px 0;
}

.cmd-subtitle {
  font-size: 11px;
  color: var(--text-dim);
  margin-top: 4px;
}

.unit-ability-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ua-name {
  flex: 1;
  font-size: 11px;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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

/* Tabs */
.tabs {
  display: flex;
  gap: 4px;
}

.tab-btn {
  flex: 1;
  padding: 6px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  color: var(--text-dim);
  font-family: var(--font-mono);
  font-size: 11px;
  cursor: pointer;
  letter-spacing: 0.5px;
}

.tab-btn.active {
  border-color: var(--accent-green);
  color: var(--accent-green);
}

/* Unit pick list */
.empty-hangar {
  font-size: 12px;
  color: var(--text-dim);
  text-align: center;
  padding: 12px;
}

.unit-pick-panel {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.unit-pick-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 240px;
  overflow-y: auto;
}

.unit-pick-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  cursor: pointer;
  transition: all 0.15s;
}

.unit-pick-row:hover {
  border-color: var(--accent-green-dim);
}

.unit-pick-row.selected {
  border-color: var(--accent-green);
  background: rgba(0, 255, 65, 0.05);
}

.unit-pick-row input {
  accent-color: var(--accent-green);
  flex-shrink: 0;
}

.pick-icon {
  width: 32px;
  height: 32px;
  background: #0a120a;
  border: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent-green);
  flex-shrink: 0;
  position: relative;
}

.unit-weight-badge {
  position: absolute;
  bottom: -2px;
  right: -2px;
  font-size: 7px;
  padding: 1px 3px;
  font-family: var(--font-display);
  font-weight: 700;
  letter-spacing: 0.5px;
}

.unit-weight-badge.assault {
  background: var(--accent-red);
  color: #fff;
}

.unit-weight-badge.heavy {
  background: var(--accent-orange);
  color: #000;
}

.unit-weight-badge.medium {
  background: var(--accent-green-dim);
  color: #000;
}

.unit-weight-badge.light {
  background: var(--accent-blue);
  color: #fff;
}

.pick-info {
  flex: 1;
  min-width: 0;
}

.pick-name {
  font-size: 12px;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: var(--font-display);
  font-weight: 600;
}

.pick-meta {
  font-size: 10px;
  color: var(--text-dim);
}

/* Current units */
.current-units {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.current-unit-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border: 1px solid var(--border-color);
  background: rgba(0, 0, 0, 0.15);
  cursor: pointer;
}

.current-unit-row:hover {
  border-color: var(--accent-green);
  background: rgba(0, 255, 65, 0.04);
}

.current-unit-row:hover .pick-name {
  color: var(--accent-green);
}

.btn-remove-unit {
  width: 24px;
  height: 24px;
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--accent-red);
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.btn-remove-unit:hover {
  border-color: var(--accent-red);
}

.skill-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  flex-shrink: 0;
  cursor: pointer;
}

.skill-label span {
  font-size: 8px;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.skill-select {
  width: 48px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  padding: 4px 2px;
  font-family: var(--font-mono);
  font-size: 11px;
  outline: none;
  cursor: pointer;
  text-align: center;
}

.skill-select:hover,
.skill-select:focus {
  border-color: var(--accent-green);
}

.changed-stat {
  color: var(--accent-orange);
}

/* Search */
.search-row {
  display: flex;
  gap: 8px;
}

.btn-search {
  padding: 6px 12px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  font-family: var(--font-mono);
  font-size: 11px;
  cursor: pointer;
}

.btn-search:hover {
  border-color: var(--accent-green);
  color: var(--accent-green);
}

.pick-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.count-badge {
  font-size: 10px;
  color: var(--accent-green);
  font-family: var(--font-display);
  min-width: 16px;
  text-align: center;
}

.btn-add-unit {
  width: 24px;
  height: 24px;
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--accent-green);
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.btn-add-unit:hover {
  border-color: var(--accent-green);
  background: rgba(0, 255, 65, 0.05);
}

.search-toolbar {
  display: flex;
  gap: 8px;
}

.search-toolbar .field-input {
  flex: 1;
}

.btn-filter {
  position: relative;
  padding: 6px 10px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  font-family: var(--font-mono);
  font-size: 11px;
  cursor: pointer;
  white-space: nowrap;
}

.btn-filter:hover {
  border-color: var(--accent-green);
  color: var(--accent-green);
}

.filter-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  background: var(--accent-orange);
  color: #000;
  font-size: 9px;
  font-weight: 700;
  padding: 1px 5px;
  border-radius: 8px;
}

/* Pagination */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 6px 0;
}

.page-btn {
  width: 28px;
  height: 28px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  font-family: var(--font-mono);
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.page-btn:hover:not(:disabled) {
  border-color: var(--accent-green);
  color: var(--accent-green);
}

.page-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.page-info {
  font-size: 11px;
  color: var(--text-dim);
  font-family: var(--font-mono);
  min-width: 50px;
  text-align: center;
}
</style>
