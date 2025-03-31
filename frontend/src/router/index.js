import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import ParejasView from '../views/ParejasView.vue';
import MesasAsignacionView from '../views/MesasAsignacionView.vue';
import MesasRegistroView from '../views/MesasRegistroView.vue';
import RankingView from '../views/RankingView.vue';
import PodiumView from '../views/PodiumView.vue';
import ResultadosView from '../views/ResultadosView.vue';
import CrearParejaView from '../views/CrearParejaView.vue'
import ModificarParejaView from '../views/ModificarParejaView.vue'
import ModificarResultadoView from '../views/ModificarResultadoView.vue'
import LogoPosicionamiento from '../components/posicionamiento/LogoPosicionamiento.vue'

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
      path: '/resultados',
      name: 'resultados',
      component: ResultadosView,
      meta: {
        requiresAuth: false,
        title: 'Ranking Actual'
      }
    },
    {
      path: '/ranking',
      name: 'ranking',
      component: RankingView,
      meta: {
        requiresAuth: false,
        title: 'Ranking Completo'
      }
    },
    {
      path: '/podium',
      name: 'podium',
      component: PodiumView,
      meta: {
        requiresAuth: false,
        title: 'Podium del Campeonato'
      }
    },
    {
      path: '/resultados/:id/editar',
      name: 'modificar-resultado',
      component: ModificarResultadoView
    },
    {
      path: '/posicionamiento',
      name: 'posicionamiento',
      component: LogoPosicionamiento,
      meta: {
        requiresAuth: false,
        title: 'Posicionamiento de Información'
      }
    }
  ]
});

// Configurar títulos de página
router.beforeEach((to, from, next) => {
  document.title = to.meta.title || 'Domino App';
  next();
});

export default router; 