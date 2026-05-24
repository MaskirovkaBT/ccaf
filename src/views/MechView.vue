<script setup>
import { computed, onMounted, watch } from 'vue'
import { useCatalogStore } from '../stores/catalog.js'

const props = defineProps({ id: String })
const store = useCatalogStore()

const unit = computed(() => store.unit)
const loading = computed(() => store.loading)

const parsedSpecials = computed(() => {
  if (!unit.value?.specials) return []
  return unit.value.specials.split(',').map(s => s.trim()).filter(Boolean)
})

function barPct(val, max) {
  return Math.min(100, Math.round((val / max) * 100))
}

onMounted(() => {
  store.loadUnit(props.id)
})

watch(() => props.id, (newId) => {
  store.loadUnit(newId)
})
</script>

<template>
  <div class="page">
    <div v-if="unit" class="card">
      <div class="header">
        <div class="back-btn" @click="$router.push('/')">← CATALOG</div>
        <div class="header-top">
          <div>
            <div class="mech-name">{{ unit.title }}</div>
            <div class="mech-variant">{{ unit.unit_type }} · SZ {{ unit.sz }}</div>
          </div>
          <div class="type-badge">{{ unit.unit_type }}</div>
        </div>
        <div class="mech-meta">
          <span>Role: {{ unit.role || '—' }}</span>
          <span>PV {{ unit.pv }}</span>
          <span>MV {{ unit.mv }}</span>
        </div>
      </div>

      <div class="skull-icon">☠ ☠ ☠</div>

      <div class="section">
        <div class="section-title">Point Value</div>
        <div class="pv-row">
          <div class="pv-box">
            <div class="pv-label">PV</div>
            <div class="pv-value">{{ unit.pv }}</div>
          </div>
          <div class="tmm-box">
            <div class="pv-label">SZ</div>
            <div class="pv-value sz">{{ unit.sz }}</div>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Movement</div>
        <div class="stats-grid">
          <div class="stat-box">
            <div class="stat-label">Move</div>
            <div class="stat-value small">{{ unit.mv }}</div>
          </div>
          <div class="stat-box">
            <div class="stat-label">Role</div>
            <div class="stat-value small role">{{ unit.role }}</div>
          </div>
          <div class="stat-box">
            <div class="stat-label">Type</div>
            <div class="stat-value small">{{ unit.unit_type }}</div>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Damage</div>
        <div class="damage-grid">
          <div class="damage-cell" :class="{ active: unit.short > 0 }">
            <div class="damage-range">S</div>
            <div class="damage-value" :class="{ zero: unit.short === 0 }">{{ unit.short }}</div>
          </div>
          <div class="damage-cell" :class="{ active: unit.medium > 0 }">
            <div class="damage-range">M</div>
            <div class="damage-value" :class="{ zero: unit.medium === 0 }">{{ unit.medium }}</div>
          </div>
          <div class="damage-cell" :class="{ active: unit.long > 0 }">
            <div class="damage-range">L</div>
            <div class="damage-value" :class="{ zero: unit.long === 0 }">{{ unit.long }}</div>
          </div>
          <div class="damage-cell" :class="{ active: unit.extreme > 0 }">
            <div class="damage-range">E</div>
            <div class="damage-value" :class="{ zero: unit.extreme === 0 }">{{ unit.extreme }}</div>
          </div>
        </div>
        <div class="ov-row">
          <span>OV:</span>
          <span class="ov-value">{{ unit.ov }}</span>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Armor &amp; Structure</div>
        <div class="armor-bar-section">
          <div class="bar-container">
            <div class="bar-label">ARM</div>
            <div class="bar-track">
              <div class="bar-fill" :style="{ width: barPct(unit.armor, 12) + '%' }"></div>
            </div>
            <div class="bar-num">{{ unit.armor }}</div>
          </div>
          <div class="bar-container">
            <div class="bar-label">STR</div>
            <div class="bar-track">
              <div class="bar-fill struct" :style="{ width: barPct(unit.struc, 8) + '%' }"></div>
            </div>
            <div class="bar-num">{{ unit.struc }}</div>
          </div>
          <div class="bar-container">
            <div class="bar-label">THR</div>
            <div class="bar-track">
              <div class="bar-fill thr" :style="{ width: barPct(unit.threshold, 6) + '%' }"></div>
            </div>
            <div class="bar-num">{{ unit.threshold }}</div>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Special Abilities</div>
        <div class="specials-list">
          <span
            v-for="(s, i) in parsedSpecials"
            :key="i"
            class="special-tag"
          >{{ s }}</span>
        </div>
      </div>

      <div class="footer">
        <span>BATTLETECH: ALPHA STRIKE</span>
        <span>PV {{ unit.pv }} · SZ {{ unit.sz }} · {{ unit.unit_type }}</span>
      </div>
    </div>

    <div v-else-if="loading" class="not-found">
      <p>Loading…</p>
    </div>

    <div v-else class="not-found">
      <div class="back-btn" @click="$router.push('/')">← CATALOG</div>
      <p>Unit not found</p>
    </div>
  </div>
</template>

<style scoped>
.card {
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(180deg, var(--bg-primary) 0%, var(--bg-secondary) 50%, var(--bg-primary) 100%);
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

.skull-icon {
  text-align: center;
  font-size: 36px;
  color: var(--border-color);
  padding: 4px 0;
  letter-spacing: 8px;
  user-select: none;
}

.section {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
}

.pv-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0;
}

.pv-box {
  background: var(--bg-secondary);
  border: 1px solid var(--accent-green);
  padding: 8px 16px;
  text-align: center;
  flex: 1;
  margin-right: 8px;
}

.pv-label {
  font-size: 10px;
  color: var(--text-dim);
  letter-spacing: 1px;
}

.pv-value {
  font-size: 28px;
  color: var(--accent-green);
  font-weight: bold;
  text-shadow: 0 0 15px rgba(0, 255, 65, 0.4);
}

.pv-value.sz {
  font-size: 22px;
  color: var(--accent-green-dim);
}

.tmm-box {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  padding: 8px 16px;
  text-align: center;
  flex: 1;
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
</style>
