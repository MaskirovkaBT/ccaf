import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useRosterStore = defineStore('roster', () => {
  const force = ref({
    name: '1ST DAVION GUARDS',
    faction: 'Federated Suns · AFFC',
    pv: 228,
    era: '3025',
    skill: '4/5',
    lances: 2,
    units: 8,
    avgMv: '6"',
    avgDmg: 2.5,
    composition: { assault: 2, heavy: 2, medium: 2, light: 2 }
  })

  const formations = ref([
    {
      id: 'iron-fist',
      name: 'IRON FIST',
      type: 'Assault Lance · BM',
      icon: 'ASN',
      iconClass: 'assault',
      pv: 161,
      count: 4,
      bonus: '+1 Initiative (All Assault role)',
      bonusColor: 'green',
      stats: { dmgSml: '12/12/7', avgArm: '7.5', speed: '4"-8"' },
      units: [
        { id: 'atlas-as7d', name: 'Atlas AS7-D', variant: 'BM · 100t · MV 4"', weight: 'assault', status: 'ready', pv: 51, dmg: { s: 4, m: 3, l: 2 }, arm: 9 },
        { id: 'stalker-stk3f', name: 'Stalker STK-3F', variant: 'BM · 85t · MV 4"', weight: 'assault', status: 'ready', pv: 46, dmg: { s: 4, m: 4, l: 2 }, arm: 9 },
        { id: 'zeus-zeu6s', name: 'Zeus ZEU-6S', variant: 'BM · 80t · MV 6"', weight: 'heavy', status: 'ready', pv: 37, dmg: { s: 2, m: 3, l: 2 }, arm: 7 },
        { id: 'quickdraw-qkd4g', name: 'Quickdraw QKD-4G', variant: 'BM · 60t · MV 8" · JMP 6"', weight: 'heavy', status: 'damaged', pv: 27, dmg: { s: 2, m: 2, l: 1 }, arm: 5 }
      ]
    },
    {
      id: 'ghost-walkers',
      name: 'GHOST WALKERS',
      type: 'Recon Lance · BM',
      icon: 'SCT',
      iconClass: 'recon',
      pv: 67,
      count: 4,
      bonus: '+2 TMM vs indirect fire (All Scout role)',
      bonusColor: 'blue',
      stats: { dmgSml: '6/5/1', avgArm: '2.0', speed: '10"-14"' },
      units: [
        { id: 'phoenixhawk-pxh1', name: 'Phoenix Hawk PXH-1', variant: 'BM · 45t · MV 10" · JMP 6"', weight: 'medium', status: 'ready', pv: 27, dmg: { s: 2, m: 2, l: 1 }, arm: 4 },
        { id: 'spider-sdr5v', name: 'Spider SDR-5V', variant: 'BM · 30t · MV 14" · JMP 10"', weight: 'light', status: 'ready', pv: 16, dmg: { s: 2, m: 1, l: 0 }, arm: 2 },
        { id: 'wasp-wsp1a', name: 'Wasp WSP-1A', variant: 'BM · 20t · MV 10" · JMP 6"', weight: 'light', status: 'critical', pv: 12, dmg: { s: 1, m: 1, l: 0 }, arm: 1 },
        { id: 'stinger-stg3r', name: 'Stinger STG-3R', variant: 'BM · 20t · MV 10" · JMP 6"', weight: 'light', status: 'ready', pv: 12, dmg: { s: 1, m: 1, l: 0 }, arm: 1 }
      ]
    }
  ])

  const mechs = ref({
    'atlas-as7d': {
      name: 'ATLAS',
      variant: 'AS7-D',
      type: 'BM',
      weight: '100t',
      weightClass: 'Assault',
      techBase: 'Inner Sphere',
      era: 'SL / SW Era',
      pv: 51,
      tmm: '1"',
      move: '4"',
      moveKmh: '54 km/h',
      jump: null,
      role: 'ASN',
      roleName: 'Assault',
      damage: { s: 4, m: 3, l: 2, e: 0 },
      ov: 0,
      armor: 9,
      structure: 5,
      threshold: 2,
      specials: [
        { text: 'AC2/2/2', type: 'offensive' },
        { text: 'IF2', type: 'ability' },
        { text: 'MEL', type: 'ability' },
        { text: 'REAR1/1/-', type: 'defensive' }
      ],
      weapons: [
        { name: 'Autocannon/20', range: 'Short', rear: false },
        { name: 'LRM-20', range: 'Long · Indirect', rear: false },
        { name: 'SRM-6', range: 'Short', rear: false },
        { name: '4× Medium Laser', range: 'Medium', rear: false },
        { name: '2× Medium Laser', range: 'Medium', rear: true }
      ],
      tech: [
        { key: 'Engine', val: 'Vlar 300' },
        { key: 'Heat Sinks', val: '20 SHS' },
        { key: 'Armor', val: '19t Durallex' },
        { key: 'Gyro', val: 'Standard' },
        { key: 'BV 2.0', val: '1,893' },
        { key: 'Cost', val: '9.63M C-bills' }
      ],
      flavor: '"A \'Mech as powerful as possible, as impenetrable as possible, and as ugly and foreboding as conceivable, so that fear itself will be our ally."<br>— Gen. Aleksandr Kerensky'
    },
    'stalker-stk3f': {
      name: 'STALKER',
      variant: 'STK-3F',
      type: 'BM',
      weight: '85t',
      weightClass: 'Assault',
      techBase: 'Inner Sphere',
      era: 'SL / SW Era',
      pv: 46,
      tmm: '1"',
      move: '4"',
      moveKmh: '43 km/h',
      jump: null,
      role: 'ASN',
      roleName: 'Assault',
      damage: { s: 4, m: 4, l: 2, e: 0 },
      ov: 0,
      armor: 9,
      structure: 4,
      threshold: 2,
      specials: [
        { text: 'LRM2/2/2', type: 'offensive' },
        { text: 'IF1', type: 'ability' },
        { text: 'HT1/1/1', type: 'ability' }
      ],
      weapons: [
        { name: 'LRM-10', range: 'Long · Indirect', rear: false },
        { name: 'SRM-6', range: 'Short', rear: false },
        { name: '4× Medium Laser', range: 'Medium', rear: false }
      ],
      tech: [
        { key: 'Engine', val: 'Pitban 320' },
        { key: 'Heat Sinks', val: '20 SHS' },
        { key: 'Armor', val: '16t Durallex' },
        { key: 'Gyro', val: 'Standard' },
        { key: 'BV 2.0', val: '1,556' },
        { key: 'Cost', val: '7.12M C-bills' }
      ],
      flavor: 'The Stalker is a fire support platform designed to saturate targets at medium to long range.'
    },
    'zeus-zeu6s': {
      name: 'ZEUS',
      variant: 'ZEU-6S',
      type: 'BM',
      weight: '80t',
      weightClass: 'Heavy',
      techBase: 'Inner Sphere',
      era: 'SL / SW Era',
      pv: 37,
      tmm: '1"',
      move: '6"',
      moveKmh: '64 km/h',
      jump: null,
      role: 'SNP',
      roleName: 'Sniper',
      damage: { s: 2, m: 3, l: 2, e: 0 },
      ov: 0,
      armor: 7,
      structure: 4,
      threshold: 2,
      specials: [
        { text: 'AC1/1/1', type: 'offensive' }
      ],
      weapons: [
        { name: 'Autocannon/5', range: 'Long', rear: false },
        { name: 'LRM-15', range: 'Long · Indirect', rear: false },
        { name: '2× Medium Laser', range: 'Medium', rear: false }
      ],
      tech: [
        { key: 'Engine', val: 'Vlar 300' },
        { key: 'Heat Sinks', val: '16 SHS' },
        { key: 'Armor', val: '13t Durallex' },
        { key: 'Gyro', val: 'Standard' },
        { key: 'BV 2.0', val: '1,210' },
        { key: 'Cost', val: '5.89M C-bills' }
      ],
      flavor: 'The Zeus was designed as a fast heavy \'Mech capable of outpacing most opponents in its weight class.'
    },
    'quickdraw-qkd4g': {
      name: 'QUICKDRAW',
      variant: 'QKD-4G',
      type: 'BM',
      weight: '60t',
      weightClass: 'Heavy',
      techBase: 'Inner Sphere',
      era: 'SL / SW Era',
      pv: 27,
      tmm: '2"',
      move: '8"',
      moveKmh: '86 km/h',
      jump: '6"',
      role: 'SKR',
      roleName: 'Striker',
      damage: { s: 2, m: 2, l: 1, e: 0 },
      ov: 0,
      armor: 5,
      structure: 4,
      threshold: 2,
      specials: [
        { text: 'JMP', type: 'ability' }
      ],
      weapons: [
        { name: 'LRM-10', range: 'Long · Indirect', rear: false },
        { name: 'SRM-4', range: 'Short', rear: false },
        { name: '4× Medium Laser', range: 'Medium', rear: false }
      ],
      tech: [
        { key: 'Engine', val: 'VOX 360' },
        { key: 'Heat Sinks', val: '16 SHS' },
        { key: 'Armor', val: '9t Durallex' },
        { key: 'Gyro', val: 'Standard' },
        { key: 'BV 2.0', val: '1,077' },
        { key: 'Cost', val: '5.39M C-bills' }
      ],
      flavor: 'The Quickdraw is a heavy skirmisher built around jump capability and medium-range firepower.'
    },
    'phoenixhawk-pxh1': {
      name: 'PHOENIX HAWK',
      variant: 'PXH-1',
      type: 'BM',
      weight: '45t',
      weightClass: 'Medium',
      techBase: 'Inner Sphere',
      era: 'SL / SW Era',
      pv: 27,
      tmm: '2"',
      move: '10"',
      moveKmh: '108 km/h',
      jump: '6"',
      role: 'SKR',
      roleName: 'Striker',
      damage: { s: 2, m: 2, l: 1, e: 0 },
      ov: 0,
      armor: 4,
      structure: 3,
      threshold: 1,
      specials: [
        { text: 'JMP', type: 'ability' }
      ],
      weapons: [
        { name: 'Large Laser', range: 'Long', rear: false },
        { name: '2× Medium Laser', range: 'Medium', rear: false },
        { name: '2× Machine Gun', range: 'Short', rear: false }
      ],
      tech: [
        { key: 'Engine', val: 'Magna 270' },
        { key: 'Heat Sinks', val: '10 SHS' },
        { key: 'Armor', val: '8t Durallex' },
        { key: 'Gyro', val: 'Standard' },
        { key: 'BV 2.0', val: '1,048' },
        { key: 'Cost', val: '4.25M C-bills' }
      ],
      flavor: 'The Phoenix Hawk is a legendary medium \'Mech known for its speed and firepower.'
    },
    'spider-sdr5v': {
      name: 'SPIDER',
      variant: 'SDR-5V',
      type: 'BM',
      weight: '30t',
      weightClass: 'Light',
      techBase: 'Inner Sphere',
      era: 'SL / SW Era',
      pv: 16,
      tmm: '3"',
      move: '14"',
      moveKmh: '151 km/h',
      jump: '10"',
      role: 'SCN',
      roleName: 'Scout',
      damage: { s: 2, m: 1, l: 0, e: 0 },
      ov: 0,
      armor: 2,
      structure: 2,
      threshold: 1,
      specials: [
        { text: 'JMP', type: 'ability' }
      ],
      weapons: [
        { name: '2× Medium Laser', range: 'Medium', rear: false }
      ],
      tech: [
        { key: 'Engine', val: 'VOX 240' },
        { key: 'Heat Sinks', val: '10 SHS' },
        { key: 'Armor', val: '5t Durallex' },
        { key: 'Gyro', val: 'Standard' },
        { key: 'BV 2.0', val: '598' },
        { key: 'Cost', val: '2.89M C-bills' }
      ],
      flavor: 'The Spider is one of the fastest and most maneuverable \'Mechs ever built.'
    },
    'wasp-wsp1a': {
      name: 'WASP',
      variant: 'WSP-1A',
      type: 'BM',
      weight: '20t',
      weightClass: 'Light',
      techBase: 'Inner Sphere',
      era: 'SL / SW Era',
      pv: 12,
      tmm: '2"',
      move: '10"',
      moveKmh: '108 km/h',
      jump: '6"',
      role: 'SCN',
      roleName: 'Scout',
      damage: { s: 1, m: 1, l: 0, e: 0 },
      ov: 0,
      armor: 1,
      structure: 2,
      threshold: 1,
      specials: [
        { text: 'JMP', type: 'ability' }
      ],
      weapons: [
        { name: 'SRM-2', range: 'Short', rear: false },
        { name: 'Medium Laser', range: 'Medium', rear: false }
      ],
      tech: [
        { key: 'Engine', val: 'GM 120' },
        { key: 'Heat Sinks', val: '10 SHS' },
        { key: 'Armor', val: '4t Durallex' },
        { key: 'Gyro', val: 'Standard' },
        { key: 'BV 2.0', val: '456' },
        { key: 'Cost', val: '1.65M C-bills' }
      ],
      flavor: 'The Wasp is the most numerous \'Mech in existence, serving as a scout and light harasser.'
    },
    'stinger-stg3r': {
      name: 'STINGER',
      variant: 'STG-3R',
      type: 'BM',
      weight: '20t',
      weightClass: 'Light',
      techBase: 'Inner Sphere',
      era: 'SL / SW Era',
      pv: 12,
      tmm: '2"',
      move: '10"',
      moveKmh: '108 km/h',
      jump: '6"',
      role: 'SCN',
      roleName: 'Scout',
      damage: { s: 1, m: 1, l: 0, e: 0 },
      ov: 0,
      armor: 1,
      structure: 2,
      threshold: 1,
      specials: [
        { text: 'JMP', type: 'ability' }
      ],
      weapons: [
        { name: 'Medium Laser', range: 'Medium', rear: false },
        { name: 'Machine Gun', range: 'Short', rear: false }
      ],
      tech: [
        { key: 'Engine', val: 'GM 120' },
        { key: 'Heat Sinks', val: '10 SHS' },
        { key: 'Armor', val: '4t Durallex' },
        { key: 'Gyro', val: 'Standard' },
        { key: 'BV 2.0', val: '436' },
        { key: 'Cost', val: '1.57M C-bills' }
      ],
      flavor: 'The Stinger is a fast, jump-capable scout that formed the backbone of light lances for centuries.'
    }
  })

  const activeTab = ref('roster')

  function setActiveTab(tab) {
    activeTab.value = tab
  }

  function getMech(id) {
    return mechs.value[id] || null
  }

  const totalUnits = computed(() => {
    return formations.value.reduce((sum, f) => sum + f.units.length, 0)
  })

  const totalPv = computed(() => {
    return formations.value.reduce((sum, f) => sum + f.units.reduce((uSum, u) => uSum + u.pv, 0), 0)
  })

  return {
    force,
    formations,
    mechs,
    activeTab,
    setActiveTab,
    getMech,
    totalUnits,
    totalPv
  }
})
