import { createRouter, createWebHistory } from 'vue-router'
import HelloWorld from '../views/HelloWorld.vue'
import LjubimacView from '../views/LjubimacView.vue'
import ProfilView from '../views/ProfilView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HelloWorld,
    },
    {
      path: '/ljubimac/:id',
      name: 'ljubimac',
      component: LjubimacView,
    },
    {
      path: '/ljubimac/:id/activate',
      name: 'ljubimac-activate',
      component: LjubimacView,
    },
    {
      path: '/profil',
      name: 'profil',
      component: ProfilView,
    },
  ],
})

export default router
