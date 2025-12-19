import { createRouter, createWebHistory } from 'vue-router'
import GradeSimulator from '../pages/GradeSimulator.vue'
import FluxoSimulator from '../pages/FluxoSimulator.vue'

const routes = [
  {
    path: '/',
    name: 'Grade',
    component: GradeSimulator
  },
  {
    path: '/fluxo',
    name: 'Fluxo',
    component: FluxoSimulator
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
