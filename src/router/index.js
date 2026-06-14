import { createRouter, createWebHashHistory } from 'vue-router'
import SetupView from '../views/SetupView.vue'
import LandingView from '../views/LandingView.vue'
import SearchView from '../views/SearchView.vue'
import MechView from '../views/MechView.vue'
import FormationView from '../views/FormationView.vue'
import DataView from '../views/DataView.vue'

const routes = [
  { path: '/setup', name: 'setup', component: SetupView },
  { path: '/', name: 'landing', component: LandingView },
  { path: '/search', name: 'search', component: SearchView },
  { path: '/mech/:id', name: 'mech', component: MechView, props: true },
  { path: '/force', name: 'force', component: FormationView },
  { path: '/data', name: 'data', component: DataView },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

router.beforeEach(to => {
  const hasServer = !!localStorage.getItem('ccaf_api_url')
  const appRoutes = ['search', 'mech', 'force', 'data']
  if (!hasServer && appRoutes.includes(to.name)) {
    return { name: 'setup', replace: true }
  }
  if (hasServer && to.name === 'setup') {
    return { name: 'search', replace: true }
  }
  return true
})

export default router
