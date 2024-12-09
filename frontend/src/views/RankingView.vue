<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Ranking</h1>
        <h2 class="text-lg text-gray-600">{{ campeonato?.nombre || 'Cargando...' }}</h2>
      </div>
      <div class="text-xl font-semibold text-gray-800">
        Partida {{ campeonato?.partida_actual ?? 0 }} de {{ campeonato?.numero_partidas }}
      </div>
    </div>

    <!-- Estado de carga -->
    <div v-if="isLoading" class="flex justify-center items-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
    </div>

    <!-- Mensaje de error -->
    <div v-else-if="error" class="text-center py-8">
      <div class="text-red-600">{{ error }}</div>
      <button @click="cargarDatos" class="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
        Reintentar
      </button>
    </div>

    <!-- Mensaje cuando no hay datos -->
    <div v-else-if="!ranking?.length" class="text-center py-8 text-gray-600">
      No hay datos de ranking disponibles
    </div>

    <!-- Tabla de Ranking -->
    <div v-else class="bg-white shadow-lg rounded-lg overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Pos.
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Part.
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              GB
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              PG
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              PP
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Número
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nombre
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Club
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="(pareja, index) in parejasVisibles" :key="pareja.id" :class="index % 2 === 0 ? 'bg-white' : 'bg-gray-50'">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ index + 1 + (paginaActual * PAREJAS_POR_PAGINA) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm" 
                :class="{'text-red-600': pareja.ultima_partida < campeonato?.partida_actual, 
                        'text-gray-900': pareja.ultima_partida >= campeonato?.partida_actual}">
              {{ pareja.ultima_partida }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ pareja.gb ? 'B' : 'A' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ pareja.pg }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ pareja.pp }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ pareja.pareja_id }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ pareja.nombre || '-' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ pareja.club || '-' }}
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Indicador de página -->
      <div class="px-6 py-4 bg-gray-50 text-center text-sm text-gray-600">
        Página {{ paginaActual + 1 }} de {{ totalPaginas }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useCampeonatoStore } from '../stores/campeonato';
import { useResultadoStore } from '../stores/resultado';

const campeonatoStore = useCampeonatoStore();
const resultadoStore = useResultadoStore();

const { campeonato } = storeToRefs(campeonatoStore);
const { ranking } = storeToRefs(resultadoStore);
const isLoading = ref(true);
const error = ref(null);

const PAREJAS_POR_PAGINA = 15;
const INTERVALO_CAMBIO = 10000; // 10 segundos

const paginaActual = ref(0);
const intervalId = ref(null);

// Computed properties para la paginación
const totalPaginas = computed(() => 
  Math.ceil((ranking.value?.length || 0) / PAREJAS_POR_PAGINA)
);

const parejasVisibles = computed(() => {
  if (!ranking.value) return [];
  const inicio = paginaActual.value * PAREJAS_POR_PAGINA;
  const fin = inicio + PAREJAS_POR_PAGINA;
  return ranking.value.slice(inicio, fin);
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

const cargarDatos = async () => {
  try {
    isLoading.value = true;
    error.value = null;

    await campeonatoStore.obtenerActual();

    if (campeonato.value) {
      await resultadoStore.obtenerRanking(campeonato.value.id);
      // Solo iniciar la rotación si la página está visible
      if (document.visibilityState === 'visible') {
        iniciarRotacionPaginas();
      }
    }
  } catch (e) {
    console.error('Error al cargar los datos:', e);
    error.value = e.message || 'Error al cargar los datos';
  } finally {
    isLoading.value = false;
  }
};

// Lifecycle hooks
onMounted(() => {
  cargarDatos();
  
  // Manejar visibilidad de la página
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      iniciarRotacionPaginas();
    } else {
      detenerRotacionPaginas();
    }
  });
});

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