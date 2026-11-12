import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '@/pages/HomeView.vue'
import GameView from '@/pages/GameView.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/game', name: 'game', component: GameView },
    {
      path: '/records',
      name: 'records',
      component: () => import('@/pages/RecordsView.vue')
    }
  ],
  scrollBehavior: () => ({ top: 0 })
})

export default router
