import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import ParejasView from '../views/ParejasView.vue';
import MesasAsignacionView from '../views/MesasAsignacionView.vue';
import MesasRegistroView from '../views/MesasRegistroView.vue';
import RankingView from '../views/RankingView.vue';
import PodiumView from '../views/PodiumView.vue';
import CrearParejaView from '../views/CrearParejaView.vue'
import ModificarParejaView from '../views/ModificarParejaView.vue'
import ModificarResultadoView from '../views/ModificarResultadoView.vue'

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
      path: '/parejas/nueva',
      name: 'crear-pareja',
      component: CrearParejaView
    },
    {
      path: '/parejas/:id/editar',
      name: 'modificar-pareja',
      component: ModificarParejaView
    },
    {
      path: '/mesas/asignacion',
      name: 'mesas-asignacion',
      component: MesasAsignacionView
    },
    {
      path: '/mesas/registro',
      name: 'mesas-registro',
      component: MesasRegistroView
    },
    {
      path: '/ranking',
      name: 'ranking',
      component: RankingView
    },
    {
      path: '/podium',
      name: 'podium',
      component: PodiumView
    },
    {
      path: '/resultados/:id/editar',
      name: 'modificar-resultado',
      component: ModificarResultadoView
    }
  ]
});

export default router; 