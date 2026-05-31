import { createRouter, createWebHistory } from 'vue-router'
import HelloWorld from '../views/HelloWorld.vue'
import LjubimacView from '../views/LjubimacView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HelloWorld,
    },
    {
      path: '/ljubimac',
      name: 'ljubimac',
      component: LjubimacView,
    },
  ],
})

export default router
