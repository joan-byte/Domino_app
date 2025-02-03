<template>
  <div class="min-h-screen flex flex-col">
    <div class="container mx-auto px-4 py-6 flex-grow flex flex-col">
      <div class="flex justify-between items-center mb-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Ranking Completo</h1>
          <h2 class="text-lg text-gray-600">{{ campeonato?.nombre || 'Cargando...' }}</h2>
        </div>
        <div class="text-xl font-semibold text-gray-800">
          Partida {{ campeonato?.partida_actual ?? 0 }} de {{ campeonato?.numero_partidas }}
        </div>
      </div>

      <!-- Estado de carga -->
      <div v-if="loading" class="flex-grow flex justify-center items-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>

      <!-- Mensaje de error -->
      <div v-else-if="error" class="flex-grow flex flex-col justify-center items-center">
        <div class="text-red-600">{{ error }}</div>
        <button @click="cargarRanking" class="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Reintentar
        </button>
      </div>

      <!-- Mensaje cuando no hay datos -->
      <div v-else-if="!ranking?.length" class="flex-grow flex justify-center items-center text-gray-600">
        No hay datos de ranking disponibles
      </div>

      <!-- Tabla de Ranking -->
      <div v-else class="flex-grow flex flex-col">
        <div class="h-[calc(15*2.5rem+3.5rem)] overflow-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50 sticky top-0">
              <tr>
                <th class="px-0.5 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Posi
                </th>
                <th class="px-0.5 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Part.
                </th>
                <th class="px-0.5 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  GB
                </th>
                <th class="px-0.5 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PG
                </th>
                <th class="px-0.5 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PP
                </th>
                <th v-if="isRankingCompleto" class="px-0.5 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  RT
                </th>
                <th v-if="isRankingCompleto" class="px-0.5 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  MG
                </th>
                <th class="px-0.5 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pareja
                </th>
                <th class="px-0.5 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th class="px-0.5 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider flex-grow">
                  Club
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="(pareja, index) in parejasVisibles" :key="pareja.numero" 
                  :class="{'bg-gray-50': index % 2 === 0}">
                <td class="px-0.5 py-2 whitespace-nowrap text-sm text-gray-900">
                  {{ index + 1 + (paginaActual * PAREJAS_POR_PAGINA) }}
                </td>
                <td class="px-0.5 py-2 whitespace-nowrap text-sm" :class="{
                  'text-gray-900': pareja.ultima_partida === campeonato?.partida_actual,
                  'text-red-600': pareja.ultima_partida < campeonato?.partida_actual
                }">
                  {{ pareja.ultima_partida }}
                </td>
                <td class="px-0.5 py-2 whitespace-nowrap text-sm">
                  <span class="text-sm font-medium">
                    {{ pareja.gb ? 'B' : 'A' }}
                  </span>
                </td>
                <td class="px-0.5 py-2 whitespace-nowrap text-sm text-gray-900">
                  {{ pareja.pg || 0 }}
                </td>
                <td class="px-0.5 py-2 whitespace-nowrap text-sm text-gray-900">
                  {{ pareja.pp }}
                </td>
                <td v-if="isRankingCompleto" class="px-0.5 py-2 whitespace-nowrap text-sm text-gray-900">
                  {{ getRT(pareja) }}
                </td>
                <td v-if="isRankingCompleto" class="px-0.5 py-2 whitespace-nowrap text-sm text-gray-900">
                  {{ pareja.mg || 0 }}
                </td>
                <td class="px-0.5 py-2 whitespace-nowrap text-sm text-gray-900">
                  {{ pareja.numero }}
                </td>
                <td class="px-0.5 py-2 text-sm text-gray-900">
                  {{ pareja.nombre }}
                </td>
                <td class="px-0.5 py-2 text-sm text-gray-500">
                  {{ pareja.club || '-' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <!-- Indicador de página -->
        <div class="px-6 py-3 bg-gray-50 text-center text-sm text-gray-600 border-t">
          Página {{ paginaActual + 1 }} de {{ totalPaginas }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useCampeonatoStore } from '../stores/campeonato';
import { useResultadoStore } from '../stores/resultado';
import { resultadoService } from '../services/api';
import { useRoute } from 'vue-router';

const campeonatoStore = useCampeonatoStore();
const resultadoStore = useResultadoStore();
const route = useRoute();

const { campeonato } = storeToRefs(campeonatoStore);
const { ranking } = storeToRefs(resultadoStore);

const getRT = (pareja) => {
  if (pareja.resultados && Array.isArray(pareja.resultados)) {
    return pareja.resultados.reduce((sum, r) => sum + (r.rt || 0), 0);
  }
  return pareja.rt || 0;
};

const loading = ref(false);
const error = ref(null);

const PAREJAS_POR_PAGINA = 15;
const INTERVALO_CAMBIO = 10000; // 10 segundos

const paginaActual = ref(0);
const intervalId = ref(null);

const isRankingCompleto = computed(() => route.path === '/ranking');

const sortedRanking = computed(() => {
  if (!ranking.value) return [];
  return [...ranking.value].sort((a, b) => {
    // GB ascendente: convertimos boolean a número (false=0, true=1)
    const aGB = a.gb ? 1 : 0;
    const bGB = b.gb ? 1 : 0;
    if (aGB !== bGB) return aGB - bGB;
    // PG descendente
    const aPG = a.pg || 0;
    const bPG = b.pg || 0;
    if (aPG !== bPG) return bPG - aPG;
    // PP descendente
    const aPP = a.pp || 0;
    const bPP = b.pp || 0;
    if (aPP !== bPP) return bPP - aPP;
    // Si es Ranking Completo, incluir RT y MG en la ordenación
    if (isRankingCompleto.value) {
      // RT descendente
      const aRT = getRT(a);
      const bRT = getRT(b);
      if (aRT !== bRT) return bRT - aRT;
      // MG ascendente
      const aMG = a.mg || 0;
      const bMG = b.mg || 0;
      return aMG - bMG;
    }
    return 0;
  });
});

const parejasVisibles = computed(() => {
  const data = sortedRanking.value || [];
  const inicio = paginaActual.value * PAREJAS_POR_PAGINA;
  return data.slice(inicio, inicio + PAREJAS_POR_PAGINA);
});

// Funciones para la paginación
const cambiarPagina = () => {
  if (totalPaginas.value > 0) {
    // Si estamos en la última página, volver a la primera
    if (paginaActual.value >= totalPaginas.value - 1) {
      paginaActual.value = 0;
    } else {
      paginaActual.value++;
    }
  }
};

const iniciarRotacionPaginas = () => {
  // Detener el intervalo existente si hay uno
  detenerRotacionPaginas();
  
  // Solo iniciar si hay más de una página
  if (totalPaginas.value > 1) {
    intervalId.value = setInterval(cambiarPagina, INTERVALO_CAMBIO);
  }
};

const detenerRotacionPaginas = () => {
  if (intervalId.value) {
    clearInterval(intervalId.value);
    intervalId.value = null;
  }
};

const totalPaginas = computed(() => 
  Math.ceil((ranking.value?.length || 0) / PAREJAS_POR_PAGINA)
);

const cargarRanking = async () => {
  if (!campeonato.value?.id) {
    error.value = 'No hay campeonato activo';
    return;
  }
  
  loading.value = true;
  try {
    await resultadoStore.obtenerRanking(campeonato.value.id);
  } catch (e) {
    error.value = 'Error al cargar el ranking';
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  if (!campeonato.value) {
    try {
      await campeonatoStore.obtenerActual();
    } catch (e) {
      error.value = 'Error al cargar el campeonato';
      return;
    }
  }
  
  await cargarRanking();
  iniciarRotacionPaginas();
  
  // Manejar visibilidad de la página
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      cargarRanking();
      iniciarRotacionPaginas();
    } else {
      detenerRotacionPaginas();
    }
  });
});

watch(route, (to, from) => {
  if (to.name === 'ranking') {
    cargarRanking();
  }
}, { deep: true });

onUnmounted(() => {
  detenerRotacionPaginas();
  document.removeEventListener('visibilitychange', () => {});
});
</script>

<style scoped>
.bg-yellow-50 {
  background-color: rgb(254, 252, 232);
}
</style> 