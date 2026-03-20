import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from './views/Dashboard.vue'
import Process from './views/Process.vue'
import Container from './views/Container.vue'

const routes = [
  { path: '/', component: Dashboard },
  { path: '/process', component: Process },
  { path: '/container', component: Container }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
