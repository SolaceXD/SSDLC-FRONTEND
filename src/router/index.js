import { createRouter, createWebHistory } from 'vue-router'
import Login from '@/components/Login.vue'
import Incidences from '@/views/Incidences.vue'
import Ingresos from '@/components/Ingresos.vue'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  { path: '/incidences', component: Incidences },
  { path: '/ingresos', component: Ingresos }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
