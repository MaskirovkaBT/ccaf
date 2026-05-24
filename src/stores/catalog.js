import { defineStore } from 'pinia'
import { ref } from 'vue'

function getApiBase() {
  if (import.meta.env.DEV) {
    return '/api'
  }
  return localStorage.getItem('ccaf_api_url') || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
}

export const useCatalogStore = defineStore('catalog', () => {
  // ---------- справочники ----------
  const eras = ref([])
  const factions = ref([])
  const roles = ref([])
  const types = ref([])

  // ---------- список юнитов ----------
  const units = ref([])
  const total = ref(0)
  const page = ref(1)
  const size = ref(20)

  // ---------- детали юнита ----------
  const unit = ref(null)

  // ---------- фильтры ----------
  const filters = ref({
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
    mv: ''
  })

  const filterModes = ref({
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
    mv: 'eq'
  })

  // ---------- сортировка ----------
  const sortBy = ref('title')
  const sortOrder = ref('asc')

  // ---------- состояние ----------
  const loading = ref(false)
  const error = ref(null)

  // ---------- private helpers ----------
  async function apiGet(path) {
    const url = `${getApiBase()}${path}`
    console.log('[API] GET', url)
    const res = await fetch(url)
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
    return res.json()
  }

  function parsePageResponse(payload) {
    // fastapi-pagination обычно возвращает { items, total, page, size, pages }
    // но на всякий случай поддерживаем несколько вариантов
    const items = Array.isArray(payload)
      ? payload
      : (payload.items || payload.results || payload.data || payload.content || [])
    const totalCount = payload.total ?? payload.count ?? payload.total_count ?? items.length
    const currentPage = payload.page ?? payload.page_number ?? page.value
    const currentSize = payload.size ?? payload.page_size ?? payload.limit ?? size.value
    return { items, total: totalCount, page: currentPage, size: currentSize }
  }

  function buildUnitsQuery() {
    const params = new URLSearchParams()

    if (filters.value.era_id != null) {
      params.append('era_id', filters.value.era_id)
    }
    filters.value.faction_id.forEach(id => params.append('faction_id', id))
    if (filters.value.unit_type) params.append('unit_type', filters.value.unit_type)
    if (filters.value.title) params.append('title', filters.value.title)
    if (filters.value.role) params.append('role', filters.value.role)
    if (filters.value.specials) params.append('specials', filters.value.specials)

    const numericKeys = ['pv', 'sz', 'short', 'medium', 'long', 'extreme', 'ov', 'armor', 'struc', 'threshold', 'mv']
    const headers = {}

    numericKeys.forEach(key => {
      const val = filters.value[key]
      if (val !== '' && val != null) {
        params.append(key, val)
      }
      const mode = filterModes.value[key]
      if (mode && mode !== 'eq') {
        const headerName = 'X-' + key.charAt(0).toUpperCase() + key.slice(1) + '-Mode'
        headers[headerName] = mode
      }
    })

    if (filterModes.value.specials && filterModes.value.specials !== 'or') {
      headers['X-Specials-Mode'] = filterModes.value.specials
    }

    if (sortBy.value) {
      params.append('sort_by', sortBy.value)
      params.append('sort_order', sortOrder.value)
    }

    params.append('page', page.value)
    params.append('size', size.value)

    return { query: params.toString(), headers }
  }

  // ---------- actions ----------
  async function loadEras() {
    try {
      eras.value = await apiGet('/eras')
      console.log('[API] eras loaded:', eras.value.length)
    } catch (err) {
      console.error('Failed to load eras:', err)
    }
  }

  async function loadFactions() {
    try {
      factions.value = await apiGet('/factions')
      console.log('[API] factions loaded:', factions.value.length)
    } catch (err) {
      console.error('Failed to load factions:', err)
    }
  }

  async function loadRoles() {
    try {
      roles.value = await apiGet('/roles')
      console.log('[API] roles loaded:', roles.value.length)
    } catch (err) {
      console.error('Failed to load roles:', err)
    }
  }

  async function loadTypes() {
    try {
      types.value = await apiGet('/types')
      console.log('[API] types loaded:', types.value.length)
    } catch (err) {
      console.error('Failed to load types:', err)
    }
  }

  async function loadUnits() {
    loading.value = true
    error.value = null
    try {
      const { query, headers } = buildUnitsQuery()
      const url = `${getApiBase()}/units?${query}`
      console.log('[API] GET', url)
      const res = await fetch(url, { headers })
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
      const payload = await res.json()
      console.log('[API] units payload:', payload)
      const parsed = parsePageResponse(payload)
      units.value = parsed.items
      total.value = parsed.total
      page.value = parsed.page
      size.value = parsed.size
      console.log('[API] units parsed:', parsed.items.length, 'of', parsed.total)
    } catch (err) {
      error.value = err.message
      units.value = []
      total.value = 0
      console.error('Failed to load units:', err)
    } finally {
      loading.value = false
    }
  }

  async function loadUnit(id) {
    loading.value = true
    error.value = null
    try {
      unit.value = await apiGet(`/units/${id}`)
      console.log('[API] unit loaded:', unit.value?.title)
    } catch (err) {
      error.value = err.message
      unit.value = null
      console.error('Failed to load unit:', err)
    } finally {
      loading.value = false
    }
  }

  function resetFilters() {
    filters.value = {
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
      mv: ''
    }
    filterModes.value = {
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
      mv: 'eq'
    }
    page.value = 1
  }

  function setPage(p) {
    page.value = p
  }

  return {
    eras,
    factions,
    roles,
    types,
    units,
    total,
    page,
    size,
    unit,
    filters,
    filterModes,
    sortBy,
    sortOrder,
    loading,
    error,
    loadEras,
    loadFactions,
    loadRoles,
    loadTypes,
    loadUnits,
    loadUnit,
    resetFilters,
    setPage
  }
})
