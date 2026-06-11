import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getCritCategory } from '../data/critTables.js'

const STORAGE_KEY = 'ccaf_active_game'

function loadGame() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return null
}

function saveGame(game) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(game))
}

function parseMv(mvStr) {
  const m = String(mvStr).match(/(\d+)/)
  return m ? parseInt(m[1], 10) : 0
}

function generateInstanceId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

export function createGameUnit(unit) {
  const baseMv = parseMv(unit.mv)
  const category = getCritCategory(unit.unit_type)
  return {
    instanceId: generateInstanceId(),
    unitId: unit.unit_id,
    title: unit.title,
    unitType: unit.unit_type,
    role: unit.role,
    pv: unit.pv || 0,
    sz: unit.sz || 1,
    baseMv,
    maxArmor: unit.armor || 0,
    maxStruc: unit.struc || 0,
    maxThreshold: unit.threshold || 0,
    baseShort: unit.short || 0,
    baseMedium: unit.medium || 0,
    baseLong: unit.long || 0,
    baseExtreme: unit.extreme || 0,
    ov: unit.ov || 0,
    specials: unit.specials || '',
    critCategory: category,

    currentArmor: unit.armor || 0,
    currentStruc: unit.struc || 0,
    heat: 0,

    crits: [],
    pendingCrits: [],
    destroyed: false
  }
}

export function recalcUnit(u) {
  let toHitMod = 0
  let damagePenalty = 0
  let moveFactor = 1
  let damageFactor = 1
  let engineHits = 0
  let mpHits = 0
  let heatPerShot = 0
  let stunned = false
  let destroyed = false

  const allCrits = [...u.crits, ...u.pendingCrits]

  // Immediate destruction/ammo logic when active
  const activeOrImmediate = allCrits.filter(
    (c) =>
      c.active ||
      c.type === 'destroyed' ||
      c.type === 'crewKilled' ||
      c.type === 'fuel'
  )

  const ammoCrit = activeOrImmediate.find((c) => c.type === 'ammo')
  if (ammoCrit && ammoCrit.active) {
    const specs = (u.specials || '').toUpperCase()
    const hasCase = specs.includes('CASE')
    const hasCase2 = specs.includes('CASEII')
    const hasEne = specs.includes('ENE')
    if (!hasCase && !hasCase2 && !hasEne) {
      destroyed = true
    }
  }

  allCrits.forEach((c) => {
    if (!c.active && c.type !== 'destroyed' && c.type !== 'crewKilled' && c.type !== 'fuel') return

    switch (c.type) {
      case 'engine':
        engineHits++
        if (u.critCategory === 'vehicle') {
          moveFactor *= 0.5
          damageFactor *= 0.5
        } else if (u.critCategory === 'aerospace' || u.critCategory === 'dropship') {
          // thrust tracked descriptively
        } else {
          heatPerShot += 1
        }
        break
      case 'fireControl':
        toHitMod += 2
        break
      case 'weapon':
        damagePenalty += 1
        break
      case 'mp':
        mpHits++
        break
      case 'crewStunned':
      case 'gunnersStunned':
        stunned = true
        break
      case 'destroyed':
      case 'crewKilled':
      case 'fuel':
        destroyed = true
        break
    }
  })

  if (u.critCategory === 'dropship' && engineHits >= 3) destroyed = true
  else if (u.critCategory !== 'dropship' && engineHits >= 2) destroyed = true

  u.toHitMod = toHitMod
  u.damagePenalty = damagePenalty
  u.damageFactor = damageFactor
  u.heatPerShot = heatPerShot
  u.stunned = stunned
  u.destroyed = destroyed

  // Recalc move
  let currentMv = u.baseMv
  if (u.critCategory === 'vehicle') {
    currentMv = Math.round(currentMv * moveFactor)
  }
  for (let i = 0; i < mpHits; i++) {
    const loss = Math.max(2, Math.round(currentMv / 2))
    currentMv = Math.max(0, currentMv - loss)
  }
  u.currentMv = currentMv

  // Recalc damage values
  u.currentShort = Math.max(0, Math.floor(u.baseShort * damageFactor) - damagePenalty)
  u.currentMedium = Math.max(0, Math.floor(u.baseMedium * damageFactor) - damagePenalty)
  u.currentLong = Math.max(0, Math.floor(u.baseLong * damageFactor) - damagePenalty)
  u.currentExtreme = Math.max(0, Math.floor(u.baseExtreme * damageFactor) - damagePenalty)
}

export const useGameStore = defineStore('game', () => {
  const activeGame = ref(loadGame() || { rosters: [], turn: 1 })

  const totalPv = computed(() => {
    return activeGame.value.rosters.reduce((sum, roster) => {
      return sum + roster.units.reduce((uSum, u) => uSum + (u.pv || 0), 0)
    }, 0)
  })

  const activeRosterCount = computed(() => activeGame.value.rosters.length)

  function persist() {
    saveGame(activeGame.value)
  }

  function startNewGame() {
    activeGame.value = { rosters: [], turn: 1 }
    persist()
  }

  function nextTurn() {
    activeGame.value.turn++
    activeGame.value.rosters.forEach((roster) => {
      roster.units.forEach((u) => {
        // Activate pending crits
        u.pendingCrits.forEach((c) => {
          c.pending = false
          c.active = true
          c.appliedAtTurn = activeGame.value.turn
          if (c.durationTurns) {
            c.expiresTurn = activeGame.value.turn + c.durationTurns
          }
        })
        u.crits.push(...u.pendingCrits)
        u.pendingCrits = []

        // Remove expired temporary crits
        u.crits = u.crits.filter((c) => {
          if (c.expiresTurn && c.expiresTurn <= activeGame.value.turn) {
            return false
          }
          return true
        })

        recalcUnit(u)

        if (u.currentStruc <= 0 && !u.destroyed) {
          u.destroyed = true
        }
      })
    })
    persist()
  }

  function addRoster(formation, resolvedUnits) {
    const units = (resolvedUnits || []).map((u) => createGameUnit(u))
    units.forEach((u) => recalcUnit(u))
    activeGame.value.rosters.push({
      formationId: formation.id,
      name: formation.name || 'Без названия',
      type: formation.type || '',
      units
    })
    persist()
  }

  function removeRoster(formationId) {
    const idx = activeGame.value.rosters.findIndex((r) => r.formationId === formationId)
    if (idx !== -1) {
      activeGame.value.rosters.splice(idx, 1)
      persist()
    }
  }

  function applyArmorDamage(formationId, instanceId, delta) {
    const roster = activeGame.value.rosters.find((r) => r.formationId === formationId)
    const unit = roster?.units.find((u) => u.instanceId === instanceId)
    if (!unit || unit.destroyed) return
    unit.currentArmor = Math.max(0, Math.min(unit.maxArmor, unit.currentArmor + delta))
    if (unit.currentStruc <= 0) unit.destroyed = true
    persist()
  }

  function applyStrucDamage(formationId, instanceId, delta) {
    const roster = activeGame.value.rosters.find((r) => r.formationId === formationId)
    const unit = roster?.units.find((u) => u.instanceId === instanceId)
    if (!unit || unit.destroyed) return
    unit.currentStruc = Math.max(0, Math.min(unit.maxStruc, unit.currentStruc + delta))
    if (unit.currentStruc <= 0) unit.destroyed = true
    persist()
  }

  function setHeat(formationId, instanceId, heat) {
    const roster = activeGame.value.rosters.find((r) => r.formationId === formationId)
    const unit = roster?.units.find((u) => u.instanceId === instanceId)
    if (!unit) return
    unit.heat = Math.max(0, heat)
    persist()
  }

  function addCrit(formationId, instanceId, critData) {
    const roster = activeGame.value.rosters.find((r) => r.formationId === formationId)
    const unit = roster?.units.find((u) => u.instanceId === instanceId)
    if (!unit || unit.destroyed) return

    const crit = {
      id: Date.now() + Math.random().toString(36).slice(2),
      roll: critData.roll,
      type: critData.type,
      name: critData.name,
      desc: critData.desc,
      pending: true,
      active: false,
      appliedAtTurn: null,
      expiresTurn: null
    }

    if (crit.type === 'crewStunned' || crit.type === 'gunnersStunned') {
      crit.durationTurns = 1
    }

    if (crit.type === 'destroyed' || crit.type === 'crewKilled' || crit.type === 'fuel') {
      crit.pending = false
      crit.active = true
      unit.destroyed = true
    }

    if (crit.pending) {
      unit.pendingCrits.push(crit)
    } else {
      unit.crits.push(crit)
    }

    recalcUnit(unit)
    persist()
  }

  function removeCrit(formationId, instanceId, critId) {
    const roster = activeGame.value.rosters.find((r) => r.formationId === formationId)
    const unit = roster?.units.find((u) => u.instanceId === instanceId)
    if (!unit) return
    unit.crits = unit.crits.filter((c) => c.id !== critId)
    unit.pendingCrits = unit.pendingCrits.filter((c) => c.id !== critId)
    recalcUnit(unit)
    persist()
  }

  return {
    activeGame,
    totalPv,
    activeRosterCount,
    startNewGame,
    nextTurn,
    addRoster,
    removeRoster,
    applyArmorDamage,
    applyStrucDamage,
    setHeat,
    addCrit,
    removeCrit
  }
})
