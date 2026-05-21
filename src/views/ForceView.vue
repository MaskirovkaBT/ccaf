<template>
  <div class="page">
    <!-- FORCE HEADER -->
    <div class="force-header">
      <div class="force-title-row">
        <div>
          <div class="force-name">{{ force.name }}</div>
          <div class="force-faction">{{ force.faction }}</div>
        </div>
      </div>
      <div class="force-meta">
        <span class="meta-chip highlight">PV {{ totalPv }}</span>
        <span class="meta-chip">ERA: {{ force.era }}</span>
        <span class="meta-chip">SKILL: {{ force.skill }}</span>
        <span class="meta-chip">{{ force.lances }} LANCES</span>
        <span class="meta-chip">{{ totalUnits }} UNITS</span>
      </div>
    </div>

    <!-- FORCE SUMMARY BAR -->
    <div class="force-summary">
      <div class="summary-cell">
        <div class="summary-label">Total PV</div>
        <div class="summary-value">{{ totalPv }}</div>
      </div>
      <div class="summary-cell">
        <div class="summary-label">Units</div>
        <div class="summary-value">{{ totalUnits }}</div>
      </div>
      <div class="summary-cell">
        <div class="summary-label">Avg MV</div>
        <div class="summary-value warn">{{ force.avgMv }}</div>
      </div>
      <div class="summary-cell">
        <div class="summary-label">Avg DMG</div>
        <div class="summary-value">{{ force.avgDmg }}</div>
      </div>
    </div>

    <!-- COMPOSITION BAR -->
    <div class="composition-section">
      <div class="section-title">Force Composition</div>
      <div class="comp-bar">
        <div class="comp-segment assault" :style="{ width: compPct.assault + '%' }"></div>
        <div class="comp-segment heavy" :style="{ width: compPct.heavy + '%' }"></div>
        <div class="comp-segment medium" :style="{ width: compPct.medium + '%' }"></div>
        <div class="comp-segment light" :style="{ width: compPct.light + '%' }"></div>
      </div>
      <div class="comp-legend">
        <div class="legend-item"><div class="legend-dot assault"></div>ASL {{ force.composition.assault }}</div>
        <div class="legend-item"><div class="legend-dot heavy"></div>HVY {{ force.composition.heavy }}</div>
        <div class="legend-item"><div class="legend-dot medium"></div>MDM {{ force.composition.medium }}</div>
        <div class="legend-item"><div class="legend-dot light"></div>LGT {{ force.composition.light }}</div>
      </div>
    </div>

    <!-- FORMATIONS -->
    <div v-for="formation in formations" :key="formation.id" class="formation">
      <div class="formation-header" @click="toggleFormation(formation.id)">
        <div class="formation-left">
          <div class="formation-icon" :class="formation.iconClass">{{ formation.icon }}</div>
          <div class="formation-info">
            <div class="formation-name">{{ formation.name }}</div>
            <div class="formation-type">{{ formation.type }}</div>
          </div>
        </div>
        <div class="formation-right">
          <div class="formation-pv">{{ formation.pv }}</div>
          <div class="formation-count">{{ formation.count }} units</div>
          <div class="formation-chevron" :class="{ collapsed: !expanded[formation.id] }">▼</div>
        </div>
      </div>

      <div class="formation-body" :class="{ collapsed: !expanded[formation.id] }">
        <div
          class="formation-bonus"
          :class="formation.bonusColor"
        >
          ▸ FORMATION BONUS: {{ formation.bonus }}
        </div>

        <div class="unit-list">
          <router-link
            v-for="unit in formation.units"
            :key="unit.id"
            :to="`/mech/${unit.id}`"
            class="unit-row"
          >
            <div class="unit-status" :class="unit.status"></div>
            <div class="unit-icon">
              ⚙
              <span class="unit-weight-badge" :class="unit.weight">{{ weightLabel(unit.weight) }}</span>
            </div>
            <div class="unit-info">
              <div class="unit-name">{{ unit.name }}</div>
              <div class="unit-variant">{{ unit.variant }}</div>
              <div class="unit-damage-bar">
                <div
                  v-for="(pip, idx) in damagePips(unit.dmg)"
                  :key="idx"
                  class="dmg-pip"
                  :class="pip"
                ></div>
              </div>
            </div>
            <div class="unit-stats">
              <div class="unit-mini-stat">
                <div class="label">S</div>
                <div class="val">{{ unit.dmg.s }}</div>
              </div>
              <div class="unit-mini-stat">
                <div class="label">M</div>
                <div class="val">{{ unit.dmg.m }}</div>
              </div>
              <div class="unit-mini-stat">
                <div class="label">L</div>
                <div class="val" :class="{ dim: unit.dmg.l === 0 }">{{ unit.dmg.l }}</div>
              </div>
              <div class="unit-mini-stat">
                <div class="label">A</div>
                <div class="val">{{ unit.arm }}</div>
              </div>
            </div>
            <div class="unit-pv">{{ unit.pv }}</div>
          </router-link>
        </div>

        <div class="formation-stats">
          <div class="fstat">
            <div class="fstat-label">Dmg S/M/L</div>
            <div class="fstat-value">{{ formation.stats.dmgSml }}</div>
          </div>
          <div class="fstat">
            <div class="fstat-label">Avg ARM</div>
            <div class="fstat-value">{{ formation.stats.avgArm }}</div>
          </div>
          <div class="fstat">
            <div class="fstat-label">Speed</div>
            <div class="fstat-value">{{ formation.stats.speed }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- FORCE FOOTER -->
    <div class="force-footer">
      <div class="footer-title">Force Summary</div>
      <div class="footer-grid">
        <div class="footer-item"><span class="footer-key">Faction</span><span class="footer-val">{{ force.faction }}</span></div>
        <div class="footer-item"><span class="footer-key">Era</span><span class="footer-val">{{ force.era }}</span></div>
        <div class="footer-item"><span class="footer-key">Skill</span><span class="footer-val">{{ force.skill }}</span></div>
        <div class="footer-item"><span class="footer-key">Total PV</span><span class="footer-val green">{{ totalPv }}</span></div>
      </div>
      <div class="footer-rules">
        <span class="rule-tag active">Standard Rules</span>
        <span class="rule-tag">Alpha Strike</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRosterStore } from '../stores/roster.js'

const store = useRosterStore()
const force = computed(() => store.force)
const formations = computed(() => store.formations)
const totalUnits = computed(() => store.totalUnits)
const totalPv = computed(() => store.totalPv)

const expanded = ref({})
formations.value.forEach(f => {
  expanded.value[f.id] = true
})

function toggleFormation(id) {
  expanded.value[id] = !expanded.value[id]
}

function weightLabel(w) {
  const map = { assault: 'ASL', heavy: 'HVY', medium: 'MDM', light: 'LGT' }
  return map[w] || w.toUpperCase().slice(0, 3)
}

const compTotal = computed(() => {
  const c = force.value.composition
  return c.assault + c.heavy + c.medium + c.light
})

const compPct = computed(() => {
  const c = force.value.composition
  const t = compTotal.value || 1
  return {
    assault: Math.round((c.assault / t) * 100),
    heavy: Math.round((c.heavy / t) * 100),
    medium: Math.round((c.medium / t) * 100),
    light: Math.round((c.light / t) * 100)
  }
})

function damagePips(dmg) {
  const pips = []
  for (let i = 0; i < dmg.s; i++) pips.push('s')
  for (let i = 0; i < dmg.m; i++) pips.push('m')
  for (let i = 0; i < dmg.l; i++) pips.push('l')
  return pips
}
</script>

<style scoped>
/* ===== FORCE HEADER ===== */
.force-header {
  padding: 14px 16px 12px;
  border-bottom: 1px solid var(--border-color);
}

.force-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.force-name {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 700;
  color: var(--accent-green);
  letter-spacing: 1px;
  text-shadow: 0 0 15px rgba(0, 255, 65, 0.25);
}

.force-faction {
  font-size: 10px;
  color: var(--text-dim);
  letter-spacing: 2px;
  text-transform: uppercase;
}

.force-meta {
  display: flex;
  gap: 6px;
  margin-top: 8px;
  flex-wrap: wrap;
}

.meta-chip {
  font-size: 10px;
  padding: 3px 8px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  color: var(--text-dim);
  letter-spacing: 1px;
}

.meta-chip.highlight {
  border-color: var(--accent-green-dim);
  color: var(--accent-green);
}

/* ===== FORCE SUMMARY BAR ===== */
.force-summary {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  border-bottom: 1px solid var(--border-color);
}

.summary-cell {
  text-align: center;
  padding: 10px 4px;
  border-right: 1px solid var(--border-color);
}
.summary-cell:last-child {
  border-right: none;
}

.summary-label {
  font-size: 9px;
  color: var(--text-dim);
  letter-spacing: 1px;
  text-transform: uppercase;
  margin-bottom: 2px;
}

.summary-value {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 700;
  color: var(--accent-green);
}

.summary-value.warn {
  color: var(--accent-orange-dim);
}

/* ===== COMPOSITION BAR ===== */
.composition-section {
  padding: 10px 16px;
  border-bottom: 1px solid var(--border-color);
}

.comp-bar {
  display: flex;
  height: 10px;
  margin-bottom: 6px;
}

.comp-segment {
  height: 100%;
  position: relative;
}
.comp-segment.assault {
  background: var(--accent-red);
}
.comp-segment.heavy {
  background: var(--accent-orange);
}
.comp-segment.medium {
  background: var(--accent-green-dim);
}
.comp-segment.light {
  background: var(--accent-blue);
}

.comp-legend {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  color: var(--text-dim);
}

.legend-dot {
  width: 8px;
  height: 8px;
}
.legend-dot.assault {
  background: var(--accent-red);
}
.legend-dot.heavy {
  background: var(--accent-orange);
}
.legend-dot.medium {
  background: var(--accent-green-dim);
}
.legend-dot.light {
  background: var(--accent-blue);
}

/* ===== FORMATION CARD ===== */
.formation {
  margin: 10px 12px;
  background: #0d120d;
  border: 1px solid var(--border-color);
  border-radius: 2px;
}

.formation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  border-bottom: 1px solid var(--border-color);
  cursor: pointer;
  user-select: none;
}

.formation-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.formation-icon {
  width: 32px;
  height: 32px;
  border: 1px solid;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1px;
  flex-shrink: 0;
}

.formation-icon.assault {
  border-color: var(--accent-red);
  color: var(--accent-red);
  background: rgba(204, 51, 51, 0.08);
}

.formation-icon.recon {
  border-color: var(--accent-blue);
  color: var(--accent-blue);
  background: rgba(51, 136, 255, 0.08);
}

.formation-name {
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: 0.5px;
}

.formation-type {
  font-size: 10px;
  color: var(--text-dim);
  letter-spacing: 1px;
}

.formation-right {
  text-align: right;
}

.formation-pv {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 700;
  color: var(--accent-green);
}

.formation-count {
  font-size: 10px;
  color: var(--text-dim);
}

.formation-chevron {
  font-size: 10px;
  color: var(--text-dim);
  margin-top: 4px;
  transition: transform 0.3s ease, color 0.3s ease;
}

.formation-chevron.collapsed {
  transform: rotate(-90deg);
  color: var(--text-inactive);
}

/* ===== FORMATION BODY (collapsible) ===== */
.formation-body {
  max-height: 1200px;
  overflow: hidden;
  opacity: 1;
  transition: max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1),
              opacity 0.25s ease;
}

.formation-body.collapsed {
  max-height: 0;
  opacity: 0;
}

.formation-bonus {
  margin: 0 12px;
  padding: 6px 10px;
  background: rgba(0, 255, 65, 0.04);
  border-left: 2px solid var(--accent-green);
  font-size: 10px;
  color: var(--accent-green-dim);
  letter-spacing: 0.5px;
}

.formation-bonus.blue {
  background: rgba(51, 136, 255, 0.04);
  border-left-color: var(--accent-blue);
  color: var(--accent-blue-dim);
}

/* ===== UNIT ROW ===== */
.unit-list {
  padding: 4px 0;
}

.unit-row {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  gap: 8px;
  border-bottom: 1px solid #0f1a0f;
  position: relative;
  text-decoration: none;
  color: inherit;
}

.unit-row:last-child {
  border-bottom: none;
}

.unit-row:hover {
  background: rgba(0, 255, 65, 0.02);
}

.unit-status {
  width: 4px;
  height: 36px;
  border-radius: 1px;
  flex-shrink: 0;
}

.unit-status.ready {
  background: var(--accent-green-dim);
}

.unit-status.damaged {
  background: var(--accent-orange);
}

.unit-status.critical {
  background: var(--accent-red);
}

.unit-icon {
  width: 36px;
  height: 36px;
  background: #0a120a;
  border: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
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

/* ===== FORMATION STATS FOOTER ===== */
.formation-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  border-top: 1px solid var(--border-color);
  margin: 0 12px;
}

.fstat {
  text-align: center;
  padding: 6px 4px;
  border-right: 1px solid var(--border-color);
}

.fstat:last-child {
  border-right: none;
}

.fstat-label {
  font-size: 8px;
  color: var(--text-dim);
  letter-spacing: 1px;
  text-transform: uppercase;
}

.fstat-value {
  font-family: var(--font-display);
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
}

/* ===== FORCE FOOTER ===== */
.force-footer {
  margin: 12px 12px 0;
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  background: #0d120d;
}

.footer-title {
  font-size: 10px;
  color: var(--accent-green);
  letter-spacing: 3px;
  text-transform: uppercase;
  margin-bottom: 8px;
}

.footer-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px 16px;
  font-size: 11px;
}

.footer-item {
  display: flex;
  justify-content: space-between;
  padding: 2px 0;
}

.footer-key {
  color: var(--text-dim);
}

.footer-val {
  color: var(--text-primary);
}

.footer-val.green {
  color: var(--accent-green);
}

.footer-rules {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dotted var(--border-color);
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.rule-tag {
  font-size: 9px;
  padding: 2px 8px;
  border: 1px solid var(--border-color);
  color: var(--text-dim);
}

.rule-tag.active {
  border-color: var(--accent-green-dim);
  color: var(--accent-green);
  background: rgba(0, 255, 65, 0.05);
}
</style>
