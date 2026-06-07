import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LjubimacView from '../views/LjubimacView.vue'
import QRGeneratorView from '../views/QRGeneratorView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/ljubimac/:id',name: 'ljubimac', component: LjubimacView, props: true },
    { path: '/qr', name: 'qr', component: QRGeneratorView },
  ],
})

export default router
