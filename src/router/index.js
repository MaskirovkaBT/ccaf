import { createRouter, createWebHashHistory } from 'vue-router'
import ForceView from '../views/ForceView.vue'
import MechView from '../views/MechView.vue'

const routes = [
  { path: '/', name: 'roster', component: ForceView },
  { path: '/mech/:id', name: 'mech', component: MechView, props: true }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
