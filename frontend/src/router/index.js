import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import ParejasView from '../views/ParejasView.vue';
import MesasView from '../views/MesasView.vue';
import RankingView from '../views/RankingView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/parejas',
      name: 'parejas',
      component: ParejasView
    },
    {
      path: '/mesas',
      name: 'mesas',
      component: MesasView
    },
    {
      path: '/ranking',
      name: 'ranking',
      component: RankingView
    }
  ]
});

export default router; 