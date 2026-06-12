<script setup>
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useCatalogStore } from '../stores/catalog.js'
import { getFormationType } from '../data/formations.js'
import { translateRole } from '../data/roleMap.js'
import FormationEditModal from '../components/FormationEditModal.vue'
import UnitIcon from '../components/UnitIcon.vue'

const store = useCatalogStore()
const { formations } = storeToRefs(store)

const editModalOpen = ref(false)
const editingFormation = ref(null)
const formationUnitsMap = ref(new Map())

onMounted(async () => {
  await store.loadEras()
  await store.loadFactions()
  await store.loadRoles()
  await store.loadTypes()
  await store.loadHangarUnits()
  await loadAllFormationUnits()
})

async function loadAllFormationUnits() {
  const allIds = formations.value.flatMap(f => f.units || [])
  const uniqueIds = [...new Set(allIds.map(Number))]
  if (uniqueIds.length === 0) return
  const units = await store.resolveUnits(uniqueIds)
  const map = new Map()
  units.forEach(u => map.set(u.unit_id, u))
  formationUnitsMap.value = map
}

const formationsWithMeta = computed(() => {
  return formations.value.map(f => {
    const type = getFormationType(f.type)
    const units = (f.units || []).map(id => formationUnitsMap.value.get(Number(id))).filter(Boolean)
    const isValid = units.length >= 3
    return { ...f, typeMeta: type, units, isValid }
  })
})

const totalUnitsInFormations = computed(() =>
  formationsWithMeta.value.reduce((sum, f) => sum + f.units.length, 0)
)

function openNew() {
  editingFormation.value = null
  editModalOpen.value = true
}

function openEdit(f) {
  editingFormation.value = formations.value.find(fm => fm.id === f.id) ?? null
  editModalOpen.value = true
}

function onSave(payload) {
  if (editingFormation.value) {
    store.updateFormation(editingFormation.value.id, payload)
  } else {
    store.addFormation(payload)
  }
  editModalOpen.value = false
  loadAllFormationUnits()
}

function onRemove(id) {
  store.removeFormation(id)
  editModalOpen.value = false
  loadAllFormationUnits()
}

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

function formatEffect(text) {
  if (!text) return ''
  return text
}
</script>

<template>
  <div class="page">
    <!-- Шапка -->
    <div class="header">
      <div class="header-top">
        <h1>ФОРМАЦИИ</h1>
        <button class="add-btn" @click="openNew">+ НОВАЯ</button>
      </div>
      <div class="header-meta">
        <span>Формаций: {{ formations.length }}</span>
        <span>БЕ в составе: {{ totalUnitsInFormations }}</span>
      </div>
    </div>

    <!-- Список формаций -->
    <div v-if="formations.length === 0" class="empty-state">
      <p>Нет созданных формаций.</p>
      <p class="hint">
        Создавайте малые подразделения (копья, звёзды, уровни II) из любых юнитов каталога.<br />
        Правила формирования: «Battletech: Альфа удар книга командира», стр. 145–156.
      </p>
    </div>

    <div v-else class="formations-list">
      <div
        v-for="f in formationsWithMeta"
        :key="f.id"
        class="formation-card"
        :class="{ invalid: !f.isValid }"
        @click="openEdit(f)"
      >
        <div class="card-header">
          <div class="card-title">{{ f.name }}</div>
          <div class="card-type">
            {{ f.typeMeta?.name ?? 'Неизвестный тип' }}
          </div>
        </div>

        <div class="card-meta">
          <span class="valid-badge" :class="f.isValid ? 'ok' : 'bad'">
            {{ f.isValid ? 'Действует' : 'Эффект не действует' }}
          </span>
        </div>

        <div v-if="f.typeMeta?.effect" class="effect-block">
          {{ formatEffect(f.typeMeta.effect) }}
        </div>

        <div class="unit-chips">
          <div v-for="(u, i) in f.units.slice(0, 6)" :key="i" class="unit-chip">
            <UnitIcon :type="u.unit_type" />
            <span class="chip-badge" :class="weightClassFromSz(u.sz)">
              {{ szLabel(u.sz) }}
            </span>
          </div>
          <div v-if="f.units.length > 6" class="chip-more">+{{ f.units.length - 6 }}</div>
        </div>

        <div v-if="f.units.length" class="unit-roles">
          <span v-for="(u, i) in f.units" :key="i" class="role-tag">
            {{ translateRole(u.role) }}
          </span>
        </div>

        <div class="card-footer">
          <span>БЕ: {{ f.units.length }}</span>
          <span v-if="f.typeMeta?.optimalRole"> Опт. роль: {{ f.typeMeta.optimalRole }} </span>
        </div>
      </div>
    </div>

    <FormationEditModal
      v-if="editModalOpen"
      :formation="editingFormation"
      @close="editModalOpen = false"
      @save="onSave"
      @remove="onRemove"
    />
  </div>
</template>

<style scoped>
.page {
  padding-bottom: 60px;
}

.header {
  padding: 12px 14px;
  border-bottom: 1px solid var(--border-color);
  background: rgba(0, 0, 0, 0.15);
}

.header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.header h1 {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 2px;
  color: var(--accent-green);
  margin: 0;
}

.add-btn {
  background: var(--accent-green);
  color: #000;
  border: 1px solid var(--accent-green);
  padding: 6px 12px;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.5px;
  cursor: pointer;
}

.add-btn:hover {
  background: #00e63c;
}

.header-meta {
  display: flex;
  gap: 12px;
  font-size: 11px;
  color: var(--text-dim);
}

/* Empty state */
.empty-state {
  padding: 24px 14px;
  text-align: center;
  color: var(--text-dim);
  font-size: 13px;
}

.empty-state .hint {
  margin-top: 8px;
  font-size: 11px;
  color: #4a6a4a;
  line-height: 1.5;
}

/* Formations list */
.formations-list {
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.formation-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  padding: 10px 12px;
  cursor: pointer;
  transition: all 0.15s;
}

.formation-card:hover {
  border-color: var(--accent-green-dim);
}

.formation-card.invalid {
  border-left: 3px solid var(--accent-orange);
}

.card-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 6px;
}

.card-title {
  font-family: var(--font-display);
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-type {
  font-size: 10px;
  color: var(--text-dim);
  white-space: nowrap;
  flex-shrink: 0;
}

.card-meta {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
}

.valid-badge {
  font-size: 9px;
  padding: 2px 6px;
  font-family: var(--font-display);
  font-weight: 700;
  letter-spacing: 0.5px;
}

.valid-badge.ok {
  background: rgba(0, 255, 65, 0.1);
  color: var(--accent-green);
  border: 1px solid var(--accent-green-dim);
}

.valid-badge.bad {
  background: rgba(255, 136, 0, 0.1);
  color: var(--accent-orange);
  border: 1px solid var(--accent-orange);
}

.effect-block {
  font-size: 11px;
  color: var(--text-primary);
  line-height: 1.5;
  margin-bottom: 8px;
  padding: 6px 8px;
  background: rgba(0, 0, 0, 0.2);
  border-left: 2px solid var(--accent-green-dim);
}

/* Unit chips */
.unit-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
}

.unit-chip {
  width: 28px;
  height: 28px;
  background: #0a120a;
  border: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent-green);
  position: relative;
}

.chip-badge {
  position: absolute;
  bottom: -2px;
  right: -2px;
  font-size: 6px;
  padding: 1px 2px;
  font-family: var(--font-display);
  font-weight: 700;
}

.chip-badge.assault {
  background: var(--accent-red);
  color: #fff;
}

.chip-badge.heavy {
  background: var(--accent-orange);
  color: #000;
}

.chip-badge.medium {
  background: var(--accent-green-dim);
  color: #000;
}

.chip-badge.light {
  background: var(--accent-blue);
  color: #fff;
}

.chip-more {
  font-size: 11px;
  color: var(--text-dim);
  align-self: center;
  padding-left: 4px;
}

.unit-roles {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 8px;
}

.role-tag {
  font-size: 9px;
  padding: 1px 4px;
  background: rgba(0, 255, 65, 0.06);
  border: 1px solid rgba(0, 255, 65, 0.2);
  color: var(--accent-green-dim);
  font-family: var(--font-mono);
}

.card-footer {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: var(--text-dim);
  border-top: 1px solid var(--border-color);
  padding-top: 6px;
}
</style>
