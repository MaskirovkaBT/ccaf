<script setup>
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useCatalogStore } from '../stores/catalog.js'
import { useGameStore } from '../stores/game.js'
import { getCritTable, getCritCategory } from '../data/critTables.js'
import UnitIcon from '../components/UnitIcon.vue'

const catalog = useCatalogStore()
const game = useGameStore()
const { formations } = storeToRefs(catalog)
const { activeGame, totalPv } = storeToRefs(game)

const showAddModal = ref(false)
const expandedRosters = ref(new Set())

onMounted(() => {
  // expand rosters by default if few
  if (activeGame.value.rosters.length <= 2) {
    activeGame.value.rosters.forEach((r) => expandedRosters.value.add(r.formationId))
  }
})

function toggleRoster(id) {
  if (expandedRosters.value.has(id)) expandedRosters.value.delete(id)
  else expandedRosters.value.add(id)
}

function isExpanded(id) {
  return expandedRosters.value.has(id)
}

async function addRoster(formation) {
  const resolved = await catalog.resolveUnits(formation.units || [])
  game.addRoster(formation, resolved)
  showAddModal.value = false
  expandedRosters.value.add(formation.id)
}

function removeRoster(id) {
  if (confirm('Удалить ростер из партии?')) {
    game.removeRoster(id)
    expandedRosters.value.delete(id)
  }
}

function nextTurn() {
  game.nextTurn()
}

function resetGame() {
  if (confirm('Сбросить текущую партию? Все повреждения и криты будут потеряны.')) {
    game.startNewGame()
    expandedRosters.value.clear()
  }
}

function damageArmor(fid, instanceId, delta) {
  game.applyArmorDamage(fid, instanceId, delta)
}

function damageStruc(fid, instanceId, delta) {
  game.applyStrucDamage(fid, instanceId, delta)
}

function changeHeat(fid, instanceId, delta) {
  const roster = activeGame.value.rosters.find((r) => r.formationId === fid)
  const unit = roster?.units.find((u) => u.instanceId === instanceId)
  if (unit) game.setHeat(fid, instanceId, unit.heat + delta)
}

function rosterPv(units) {
  return units.reduce((s, u) => s + (u.pv || 0), 0)
}

function aliveCount(units) {
  return units.filter((u) => !u.destroyed).length
}

function damageChanged(unit) {
  return (
    unit.currentShort !== unit.baseShort ||
    unit.currentMedium !== unit.baseMedium ||
    unit.currentLong !== unit.baseLong ||
    unit.currentExtreme !== unit.baseExtreme
  )
}

// Crit helpers
const critRolls = ref({})

function getCritKey(fid, instanceId) {
  return `${fid}_${instanceId}`
}

function getAvailableCrits(unit) {
  const cat = getCritCategory(unit.unitType)
  return getCritTable(cat)
}

function applySelectedCrit(fid, instanceId) {
  const key = getCritKey(fid, instanceId)
  const roll = critRolls.value[key]
  if (!roll) return
  const cat = getCritCategory(unitById(fid, instanceId).unitType)
  const table = getCritTable(cat)
  const critData = table[roll]
  if (critData) {
    game.addCrit(fid, instanceId, { roll: Number(roll), ...critData })
    critRolls.value[key] = null
  }
}

function rollRandomCrit(fid, instanceId) {
  const unit = unitById(fid, instanceId)
  if (!unit) return
  const roll = Math.floor(Math.random() * 11) + 2
  const cat = getCritCategory(unit.unitType)
  const table = getCritTable(cat)
  const critData = table[roll]
  if (critData) {
    game.addCrit(fid, instanceId, { roll, ...critData })
  }
}

function unitById(fid, instanceId) {
  const roster = activeGame.value.rosters.find((r) => r.formationId === fid)
  return roster?.units.find((u) => u.instanceId === instanceId)
}

function removeCrit(fid, instanceId, critId) {
  game.removeCrit(fid, instanceId, critId)
}

function barColor(current, max) {
  const ratio = max ? current / max : 1
  if (ratio <= 0.25) return 'var(--accent-red)'
  if (ratio <= 0.5) return 'var(--accent-orange)'
  return 'var(--accent-green)'
}
</script>

<template>
  <div class="data-view">
    <div class="game-header">
      <div class="game-title">ТЕКУЩАЯ ПАРТИЯ</div>
      <div class="game-stats">
        <span>Ход: <strong>{{ activeGame.turn }}</strong></span>
        <span>PV: <strong>{{ totalPv }}</strong></span>
        <span>Ростеров: <strong>{{ activeGame.rosters.length }}</strong></span>
      </div>
      <div class="game-actions">
        <button class="btn-turn" @click="nextTurn">Следующий ход</button>
        <button class="btn-reset" @click="resetGame">Сбросить</button>
      </div>
    </div>

    <div v-if="activeGame.rosters.length === 0" class="empty-state">
      Нет активных ростеров.<br />Добавьте сохранённую формацию в партию.
    </div>

    <div class="roster-list">
      <div
        v-for="roster in activeGame.rosters"
        :key="roster.formationId"
        class="roster-card"
        :class="{ destroyed: roster.units.every((u) => u.destroyed) }"
      >
        <div class="roster-header" @click="toggleRoster(roster.formationId)">
          <div class="roster-name">
            <span class="expand-icon">{{ isExpanded(roster.formationId) ? '▼' : '▶' }}</span>
            {{ roster.name }}
          </div>
          <div class="roster-meta">
            <span class="roster-pv">{{ rosterPv(roster.units) }} PV</span>
            <span class="roster-count">{{ aliveCount(roster.units) }}/{{ roster.units.length }} БЕ</span>
          </div>
          <button class="btn-remove-roster" @click.stop="removeRoster(roster.formationId)">×</button>
        </div>

        <div v-if="isExpanded(roster.formationId)" class="roster-body">
          <div
            v-for="unit in roster.units"
            :key="unit.instanceId"
            class="unit-tracker"
            :class="{ destroyed: unit.destroyed, stunned: unit.stunned }"
          >
            <div class="unit-header">
              <div class="unit-icon-wrap">
                <UnitIcon :type="unit.unitType" />
              </div>
              <div class="unit-info">
                <div class="unit-title" :class="{ destroyed: unit.destroyed }">
                  {{ unit.title }}
                  <span v-if="unit.destroyed" class="destroyed-badge">УНИЧТОЖЕН</span>
                  <span v-else-if="unit.stunned" class="stunned-badge">ОГЛУШЁН</span>
                </div>
                <div class="unit-sub">
                  {{ unit.unitType }} · РЗ {{ unit.sz }} · ДВ {{ unit.currentMv }} · TMM {{ unit.currentTmm }}
                  <span v-if="unit.baseMv !== unit.currentMv" class="changed-stat">(было {{ unit.baseMv }})</span>
                  <span v-if="unit.toHitMod" class="mod-badge">Попадание +{{ unit.toHitMod }}</span>
                  <span v-if="unit.toHitModMelee" class="mod-badge">Ближний бой +{{ unit.toHitModMelee }}</span>
                  <span v-if="unit.heatPerShot" class="mod-badge">+{{ unit.heatPerShot }} нагрев</span>
                </div>
              </div>
            </div>

            <!-- Bars -->
            <div class="bars">
              <div class="bar-row">
                <span class="bar-label">БР</span>
                <div class="bar-track">
                  <div
                    class="bar-fill armor"
                    :style="{
                      width: (unit.maxArmor ? (unit.currentArmor / unit.maxArmor * 100) : 0) + '%',
                      background: barColor(unit.currentArmor, unit.maxArmor)
                    }"
                  ></div>
                </div>
                <span class="bar-value">{{ unit.currentArmor }}/{{ unit.maxArmor }}</span>
                <div class="bar-btns">
                  <button @click="damageArmor(roster.formationId, unit.instanceId, -1)">−</button>
                  <button @click="damageArmor(roster.formationId, unit.instanceId, 1)">+</button>
                </div>
              </div>
              <div class="bar-row">
                <span class="bar-label">СТР</span>
                <div class="bar-track">
                  <div
                    class="bar-fill struc"
                    :style="{
                      width: (unit.maxStruc ? (unit.currentStruc / unit.maxStruc * 100) : 0) + '%',
                      background: barColor(unit.currentStruc, unit.maxStruc)
                    }"
                  ></div>
                </div>
                <span class="bar-value">{{ unit.currentStruc }}/{{ unit.maxStruc }}</span>
                <div class="bar-btns">
                  <button @click="damageStruc(roster.formationId, unit.instanceId, -1)">−</button>
                  <button @click="damageStruc(roster.formationId, unit.instanceId, 1)">+</button>
                </div>
              </div>
            </div>

            <!-- Heat -->
            <div class="heat-row">
              <span class="heat-label">Нагрев</span>
              <button class="heat-btn" @click="changeHeat(roster.formationId, unit.instanceId, -1)">−</button>
              <span class="heat-value" :class="{ hot: unit.heat > 0 }">{{ unit.heat }}</span>
              <button class="heat-btn" @click="changeHeat(roster.formationId, unit.instanceId, 1)">+</button>
            </div>

            <!-- Damage summary -->
            <div v-if="!unit.destroyed && activeGame.turn > 1 && damageChanged(unit)" class="damage-summary">
              <span>
                Урон: {{ unit.currentShort }}/{{ unit.currentMedium }}/{{ unit.currentLong }}/{{ unit.currentExtreme }}
                <span class="changed-stat" v-if="unit.baseShort || unit.baseMedium || unit.baseLong">
                  (было {{ unit.baseShort }}/{{ unit.baseMedium }}/{{ unit.baseLong }}/{{ unit.baseExtreme }})
                </span>
              </span>
            </div>

            <!-- Crits -->
            <div v-if="!unit.destroyed" class="crit-section">
              <div class="crit-add">
                <select v-model="critRolls[getCritKey(roster.formationId, unit.instanceId)]" class="crit-select">
                  <option v-for="(c, roll) in getAvailableCrits(unit)" :key="roll" :value="Number(roll)">
                    {{ roll }} — {{ c.name }}
                  </option>
                </select>
                <button class="btn-crit-add" @click="applySelectedCrit(roster.formationId, unit.instanceId)">Добавить</button>
                <button class="btn-crit-rand" @click="rollRandomCrit(roster.formationId, unit.instanceId)" title="Случайный бросок">🎲</button>
              </div>

              <!-- Pending crits -->
              <div v-if="unit.pendingCrits.length" class="crit-list pending">
                <div
                  v-for="c in unit.pendingCrits"
                  :key="c.id"
                  class="crit-tag pending"
                >
                  <span>{{ c.roll }} — {{ c.name }} (след. ход)</span>
                  <button class="crit-remove" @click="removeCrit(roster.formationId, unit.instanceId, c.id)">×</button>
                </div>
              </div>

              <!-- Active crits -->
              <div v-if="unit.crits.length" class="crit-list active">
                <div
                  v-for="c in unit.crits"
                  :key="c.id"
                  class="crit-tag"
                  :class="c.type"
                >
                  <span>{{ c.roll }} — {{ c.name }}</span>
                  <span v-if="c.desc" class="crit-desc">{{ c.desc }}</span>
                  <button class="crit-remove" @click="removeCrit(roster.formationId, unit.instanceId, c.id)">×</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <button class="btn-add-roster" @click="showAddModal = true">+ Добавить ростер</button>

    <!-- Modal for adding roster -->
    <div v-if="showAddModal" class="modal-overlay" @click.self="showAddModal = false">
      <div class="modal-panel">
        <div class="modal-header">
          <h3>ВЫБОР РОСТЕРА</h3>
          <button class="close-btn" @click="showAddModal = false">×</button>
        </div>
        <div class="modal-body">
          <div v-if="formations.length === 0" class="empty-state">Нет сохранённых формаций.</div>
          <div v-else class="formation-list">
            <div
              v-for="f in formations"
              :key="f.id"
              class="formation-row"
              @click="addRoster(f)"
            >
              <div class="formation-name">{{ f.name }}</div>
              <div class="formation-meta">{{ f.type }} · {{ f.units?.length || 0 }} БЕ</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.data-view {
  padding: 14px;
  padding-bottom: 80px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.game-header {
  background: linear-gradient(180deg, rgba(0,255,65,0.06) 0%, rgba(0,0,0,0) 100%);
  border: 1px solid var(--border-color);
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.game-title {
  font-family: var(--font-display);
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 2px;
  color: var(--accent-green);
}

.game-stats {
  display: flex;
  gap: 14px;
  font-size: 12px;
  color: var(--text-dim);
  font-family: var(--font-mono);
}

.game-stats strong {
  color: var(--accent-green);
}

.game-actions {
  display: flex;
  gap: 8px;
}

.btn-turn {
  flex: 1;
  padding: 8px;
  background: var(--accent-green);
  color: #000;
  border: 1px solid var(--accent-green);
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1px;
  cursor: pointer;
}

.btn-turn:hover {
  background: #00cc33;
}

.btn-reset {
  flex: 1;
  padding: 8px;
  background: var(--bg-secondary);
  color: var(--accent-red);
  border: 1px solid var(--border-color);
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 1px;
  cursor: pointer;
}

.btn-reset:hover {
  border-color: var(--accent-red);
}

.empty-state {
  text-align: center;
  color: var(--text-dim);
  font-size: 12px;
  padding: 24px 12px;
  border: 1px dashed var(--border-color);
}

/* Roster card */
.roster-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.roster-card {
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
}

.roster-card.destroyed {
  opacity: 0.6;
}

.roster-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  cursor: pointer;
  user-select: none;
}

.roster-header:hover {
  background: rgba(0, 255, 65, 0.04);
}

.roster-name {
  flex: 1;
  font-family: var(--font-display);
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 6px;
}

.expand-icon {
  font-size: 10px;
  color: var(--text-dim);
}

.roster-meta {
  display: flex;
  gap: 10px;
  font-size: 11px;
  color: var(--text-dim);
  font-family: var(--font-mono);
}

.roster-pv {
  color: var(--accent-orange);
}

.btn-remove-roster {
  width: 22px;
  height: 22px;
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--accent-red);
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-remove-roster:hover {
  border-color: var(--accent-red);
}

/* Unit tracker */
.roster-body {
  border-top: 1px solid var(--border-color);
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.unit-tracker {
  border: 1px solid var(--border-color);
  background: rgba(0, 0, 0, 0.15);
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.unit-tracker.destroyed {
  opacity: 0.5;
  border-color: var(--accent-red);
}

.unit-tracker.stunned {
  border-color: var(--accent-orange);
}

.unit-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.unit-icon-wrap {
  width: 28px;
  height: 28px;
  background: #0a120a;
  border: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent-green);
  flex-shrink: 0;
}

.unit-info {
  flex: 1;
  min-width: 0;
}

.unit-title {
  font-size: 12px;
  font-family: var(--font-display);
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
  gap: 6px;
}

.unit-title.destroyed {
  text-decoration: line-through;
  color: var(--text-dim);
}

.destroyed-badge {
  font-size: 9px;
  background: var(--accent-red);
  color: #fff;
  padding: 1px 5px;
  letter-spacing: 1px;
}

.stunned-badge {
  font-size: 9px;
  background: var(--accent-orange);
  color: #000;
  padding: 1px 5px;
  letter-spacing: 1px;
}

.unit-sub {
  font-size: 10px;
  color: var(--text-dim);
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

.changed-stat {
  color: var(--accent-orange);
  font-size: 10px;
}

.mod-badge {
  font-size: 9px;
  color: var(--accent-red);
  border: 1px solid var(--accent-red);
  padding: 0 4px;
}

/* Bars */
.bars {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.bar-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.bar-label {
  font-size: 10px;
  color: var(--text-dim);
  width: 22px;
  text-align: right;
  font-family: var(--font-mono);
}

.bar-track {
  flex: 1;
  height: 10px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border-color);
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  transition: width 0.2s;
}

.bar-value {
  font-size: 10px;
  color: var(--text-dim);
  font-family: var(--font-mono);
  width: 36px;
  text-align: right;
}

.bar-btns {
  display: flex;
  gap: 2px;
}

.bar-btns button {
  width: 20px;
  height: 20px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.bar-btns button:hover {
  border-color: var(--accent-green);
  color: var(--accent-green);
}

/* Heat */
.heat-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.heat-label {
  font-size: 10px;
  color: var(--text-dim);
  width: 44px;
  text-align: right;
  font-family: var(--font-mono);
}

.heat-btn {
  width: 24px;
  height: 24px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.heat-btn:hover {
  border-color: var(--accent-green);
  color: var(--accent-green);
}

.heat-value {
  font-size: 12px;
  color: var(--text-primary);
  font-family: var(--font-mono);
  min-width: 20px;
  text-align: center;
}

.heat-value.hot {
  color: var(--accent-orange);
}

/* Damage summary */
.damage-summary {
  font-size: 10px;
  color: var(--text-dim);
}

/* Crit section */
.crit-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.crit-add {
  display: flex;
  gap: 6px;
  align-items: center;
}

.crit-select {
  flex: 1;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  padding: 5px 6px;
  font-size: 11px;
  font-family: var(--font-mono);
  outline: none;
  min-width: 0;
}

.btn-crit-add {
  padding: 5px 8px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  font-family: var(--font-mono);
  font-size: 10px;
  cursor: pointer;
  white-space: nowrap;
}

.btn-crit-add:hover {
  border-color: var(--accent-green);
  color: var(--accent-green);
}

.btn-crit-rand {
  width: 28px;
  height: 28px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.btn-crit-rand:hover {
  border-color: var(--accent-green);
}

.crit-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.crit-tag {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  padding: 3px 6px;
  border: 1px solid var(--border-color);
  background: rgba(0, 0, 0, 0.2);
}

.crit-tag.pending {
  border-color: var(--accent-orange);
  color: var(--accent-orange);
}

.crit-tag.active {
  color: var(--accent-red);
  border-color: var(--accent-red);
}

.crit-desc {
  color: var(--text-dim);
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.crit-remove {
  width: 16px;
  height: 16px;
  background: transparent;
  border: none;
  color: var(--text-dim);
  cursor: pointer;
  font-size: 12px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.crit-remove:hover {
  color: var(--accent-red);
}

/* Add roster button */
.btn-add-roster {
  width: 100%;
  padding: 10px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  color: var(--accent-green);
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 1px;
  cursor: pointer;
}

.btn-add-roster:hover {
  border-color: var(--accent-green);
  background: rgba(0, 255, 65, 0.05);
}

/* Modal */
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
  max-height: 70vh;
  background: linear-gradient(180deg, var(--bg-secondary) 0%, var(--bg-primary) 100%);
  border-top: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  animation: slideUp 0.2s ease-out;
}

@keyframes slideUp {
  from { transform: translateY(40px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}

.modal-header h3 {
  font-family: var(--font-display);
  font-size: 14px;
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
  padding: 10px 14px;
}

.formation-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.formation-row {
  padding: 8px 10px;
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.formation-row:hover {
  border-color: var(--accent-green);
}

.formation-name {
  font-size: 12px;
  font-family: var(--font-display);
  font-weight: 600;
  color: var(--text-primary);
}

.formation-meta {
  font-size: 10px;
  color: var(--text-dim);
}
</style>
