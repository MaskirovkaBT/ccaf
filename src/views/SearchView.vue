<script setup>
import { ref, computed, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useCatalogStore } from "../stores/catalog.js";
import UnitIcon from "../components/UnitIcon.vue";
import FilterModal from "../components/FilterModal.vue";

const store = useCatalogStore();
const {
  eras,
  factions,
  types,
  units,
  total,
  page,
  size,
  filters,
  sortBy,
  sortOrder,
  loading,
  error,
} = storeToRefs(store);

const totalPages = computed(() => Math.ceil(total.value / size.value) || 1);
const factionOpen = ref(false);
const filterModalOpen = ref(false);
const selectedFactionCount = computed(() => filters.value.faction_id.length);

const activeFilterCount = computed(() => {
  let c = 0;
  if (filters.value.era_id != null) c++;
  if (filters.value.faction_id.length > 0) c++;
  if (filters.value.unit_type) c++;
  if (filters.value.title) c++;
  if (filters.value.role) c++;
  if (filters.value.specials) c++;
  const numericKeys = [
    "pv",
    "sz",
    "short",
    "medium",
    "long",
    "extreme",
    "ov",
    "armor",
    "struc",
    "threshold",
    "mv",
  ];
  numericKeys.forEach((k) => {
    const v = filters.value[k];
    if (v !== "" && v != null) c++;
  });
  return c;
});

let debounceTimer = null;
function debouncedLoad() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    store.setPage(1);
    store.loadUnits();
  }, 300);
}

function applyFilters() {
  store.setPage(1);
  store.loadUnits();
}

function toggleFaction(id) {
  const arr = filters.value.faction_id;
  const idx = arr.indexOf(id);
  if (idx === -1) {
    arr.push(id);
  } else {
    arr.splice(idx, 1);
  }
  store.setPage(1);
  store.loadUnits();
}

function toggleSortOrder() {
  sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
  applyFilters();
}

function prevPage() {
  if (page.value > 1) {
    store.setPage(page.value - 1);
    store.loadUnits();
  }
}

function nextPage() {
  if (page.value < totalPages.value) {
    store.setPage(page.value + 1);
    store.loadUnits();
  }
}

function weightClassFromSz(sz) {
  if (sz >= 4) return "assault";
  if (sz === 3) return "heavy";
  if (sz === 2) return "medium";
  return "light";
}

function szLabel(sz) {
  const map = { 4: "ТЯЖ", 3: "СРД", 2: "ЛГК", 1: "ЛЕГ" };
  return map[sz] || "??";
}

function damagePips(u) {
  const pips = [];
  for (let i = 0; i < (u.short || 0); i++) pips.push("s");
  for (let i = 0; i < (u.medium || 0); i++) pips.push("m");
  for (let i = 0; i < (u.long || 0); i++) pips.push("l");
  return pips;
}

onMounted(() => {
  store.loadEras();
  store.loadFactions();
  store.loadRoles();
  store.loadTypes();
  store.loadUnits();
});
</script>

<template>
  <div class="page">
    <!-- ФИЛЬТРЫ -->
    <div class="filters-panel">
      <div class="filters-row">
        <select
          v-model="filters.era_id"
          @change="applyFilters"
          class="filter-select"
        >
          <option :value="null">Все эры</option>
          <option v-for="e in eras" :key="e.era_id" :value="e.era_id">
            {{ e.title }}
          </option>
        </select>
        <select
          v-model="filters.unit_type"
          @change="applyFilters"
          class="filter-select"
        >
          <option value="">Все типы</option>
          <option v-for="t in types" :key="t" :value="t">{{ t }}</option>
        </select>
      </div>

      <div class="filters-row">
        <div class="multi-select" :class="{ open: factionOpen }">
          <div class="multi-select-label" @click="factionOpen = !factionOpen">
            <span
              >Фракции
              {{
                selectedFactionCount > 0 ? `(${selectedFactionCount})` : ""
              }}</span
            >
            <span class="chevron">{{ factionOpen ? "▲" : "▼" }}</span>
          </div>
          <div class="multi-select-options" @click.stop>
            <label
              v-for="f in factions"
              :key="f.faction_id"
              class="multi-option"
            >
              <input
                type="checkbox"
                :checked="filters.faction_id.includes(f.faction_id)"
                @change="toggleFaction(f.faction_id)"
              />
              <span>{{ f.title }}</span>
            </label>
          </div>
        </div>
      </div>

      <input
        v-model="filters.title"
        @input="debouncedLoad"
        placeholder="Поиск по названию..."
        class="filter-input"
      />
    </div>

    <!-- ПАНЕЛЬ ИНСТРУМЕНТОВ -->
    <div class="toolbar">
      <button class="toolbar-filters" @click="filterModalOpen = true">
        <svg
          class="filters-icon"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
        </svg>
        <span class="filters-label">ФИЛЬТРЫ</span>
        <span v-if="activeFilterCount > 0" class="filters-badge">{{
          activeFilterCount
        }}</span>
      </button>

      <div class="toolbar-sort">
        <select v-model="sortBy" @change="applyFilters" class="sort-select">
          <option value="title">Название</option>
          <option value="pv">Очки</option>
          <option value="role">Роль</option>
          <option value="short">Урон ближний</option>
          <option value="medium">Урон средний</option>
          <option value="long">Урон дальний</option>
          <option value="armor">Броня</option>
          <option value="struc">Структура</option>
          <option value="mv">Скорость</option>
        </select>
        <button @click="toggleSortOrder" class="sort-dir-btn">
          {{ sortOrder === "asc" ? "▲" : "▼" }}
        </button>
      </div>
    </div>

    <FilterModal v-if="filterModalOpen" @close="filterModalOpen = false" />

    <!-- СПИСОК ЮНИТОВ -->
    <div class="units-list">
      <router-link
        v-for="u in units"
        :key="u.unit_id"
        :to="`/mech/${u.unit_id}`"
        class="unit-row"
      >
        <div class="unit-icon">
          <UnitIcon :type="u.unit_type" />
          <span v-if="store.isInHangar(u.unit_id)" class="hangar-mark">★</span>
          <span class="unit-weight-badge" :class="weightClassFromSz(u.sz)">{{
            szLabel(u.sz)
          }}</span>
        </div>
        <div class="unit-info">
          <div class="unit-name">{{ u.title }}</div>
          <div class="unit-variant">
            {{ u.unit_type }} · РЗ {{ u.sz }} · ДВ {{ u.mv }}
          </div>
          <div class="unit-damage-bar">
            <div
              v-for="(pip, idx) in damagePips(u)"
              :key="idx"
              class="dmg-pip"
              :class="pip"
            ></div>
          </div>
        </div>
        <div class="unit-stats">
          <div class="unit-mini-stat">
            <div class="label">Б</div>
            <div class="val">{{ u.short }}</div>
          </div>
          <div class="unit-mini-stat">
            <div class="label">С</div>
            <div class="val">{{ u.medium }}</div>
          </div>
          <div class="unit-mini-stat">
            <div class="label">Д</div>
            <div class="val" :class="{ dim: u.long === 0 }">{{ u.long }}</div>
          </div>
          <div class="unit-mini-stat">
            <div class="label">БР</div>
            <div class="val">{{ u.armor }}</div>
          </div>
          <div class="unit-mini-stat">
            <div class="label">СТР</div>
            <div class="val">{{ u.struc }}</div>
          </div>
        </div>
        <div class="unit-pv">{{ u.pv }}</div>
      </router-link>
    </div>

    <!-- ПАГИНАЦИЯ -->
    <div class="pagination" v-if="totalPages > 1">
      <button :disabled="page <= 1" @click="prevPage">←</button>
      <span>{{ page }} / {{ totalPages }}</span>
      <button :disabled="page >= totalPages" @click="nextPage">→</button>
    </div>

    <!-- СТАТУС -->
    <div v-if="loading" class="status-msg">Загрузка…</div>
    <div v-if="error" class="status-msg error">{{ error }}</div>
    <div v-if="!loading && units.length === 0" class="status-msg">
      Ничего не найдено
    </div>
  </div>
</template>

<style scoped>
.filters-panel {
  padding: 10px 12px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filters-row {
  display: flex;
  gap: 8px;
}

.filter-select,
.filter-input {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  padding: 6px 8px;
  font-family: var(--font-mono);
  font-size: 12px;
  flex: 1 1 0;
  min-width: 0;
  outline: none;
}

.filter-input {
  width: 100%;
}

/* Мультивыбор фракций */
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

/* Toolbar */
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--border-color);
  background: rgba(0, 0, 0, 0.15);
}

.toolbar-filters {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  padding: 5px 10px;
  font-family: var(--font-mono);
  font-size: 11px;
  cursor: pointer;
  letter-spacing: 0.5px;
}

.toolbar-filters:hover {
  border-color: var(--accent-green);
  color: var(--accent-green);
}

.filters-icon {
  font-size: 12px;
}

.filters-label {
  font-weight: 700;
}

.filters-badge {
  background: var(--accent-orange);
  color: #000;
  font-size: 9px;
  font-weight: 700;
  padding: 1px 5px;
  border-radius: 6px;
  font-family: var(--font-display);
}

.toolbar-sort {
  display: flex;
  align-items: center;
  gap: 4px;
}

.sort-select {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  padding: 5px 6px;
  font-family: var(--font-mono);
  font-size: 11px;
  outline: none;
}

.sort-dir-btn {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  color: var(--accent-green);
  padding: 5px 8px;
  font-family: var(--font-mono);
  font-size: 11px;
  cursor: pointer;
}

.units-list {
  padding: 4px 0;
}

.unit-row {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  gap: 8px;
  border-bottom: 1px solid #0f1a0f;
  text-decoration: none;
  color: inherit;
}

.unit-row:hover {
  background: rgba(0, 255, 65, 0.02);
}

.unit-icon {
  width: 36px;
  height: 36px;
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

.hangar-mark {
  position: absolute;
  top: -4px;
  right: -4px;
  font-size: 10px;
  color: var(--accent-orange);
  text-shadow: 0 0 4px rgba(255, 136, 0, 0.6);
  z-index: 2;
  line-height: 1;
}

.unit-info {
  flex: 1;
  min-width: 0;
}

.unit-name {
  font-size: 12px;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: var(--font-display);
  font-weight: 600;
}

.unit-variant {
  font-size: 10px;
  color: var(--text-dim);
}

.unit-stats {
  display: flex;
  gap: 6px;
  align-items: center;
  flex-shrink: 0;
}

.unit-mini-stat {
  text-align: center;
  min-width: 22px;
}

.unit-mini-stat .label {
  font-size: 7px;
  color: #3a5a3a;
  letter-spacing: 0.5px;
}

.unit-mini-stat .val {
  font-family: var(--font-display);
  font-size: 13px;
  font-weight: 700;
  color: var(--accent-green);
}

.unit-mini-stat .val.dim {
  color: var(--text-inactive);
}

.unit-damage-bar {
  display: flex;
  gap: 1px;
  margin-top: 2px;
}

.dmg-pip {
  width: 6px;
  height: 4px;
  background: var(--border-color);
}

.dmg-pip.s {
  background: var(--accent-red);
}

.dmg-pip.m {
  background: var(--accent-orange);
}

.dmg-pip.l {
  background: var(--accent-green-dim);
}

.unit-pv {
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 700;
  color: var(--accent-green);
  min-width: 24px;
  text-align: right;
  flex-shrink: 0;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  padding: 12px;
  font-size: 12px;
}

.pagination button {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  color: var(--accent-green);
  padding: 4px 12px;
  cursor: pointer;
  font-family: var(--font-mono);
}

.pagination button:disabled {
  color: var(--text-inactive);
  cursor: not-allowed;
}

.status-msg {
  text-align: center;
  padding: 20px;
  font-size: 12px;
  color: var(--text-dim);
}

.status-msg.error {
  color: var(--accent-red);
}
</style>
