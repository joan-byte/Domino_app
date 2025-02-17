<template>
  <div class="min-h-screen flex flex-col">
    <div class="container mx-auto px-4 py-6 flex-grow flex flex-col">
      <div class="flex justify-between items-center mb-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Ranking</h1>
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
                  Dif.
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
import { mesaService } from '../services/api';

const campeonatoStore = useCampeonatoStore();
const resultadoStore = useResultadoStore();
const route = useRoute();

const { campeonato } = storeToRefs(campeonatoStore);
const { ranking } = storeToRefs(resultadoStore);

const loading = ref(false);
const error = ref(null);

const PAREJAS_POR_PAGINA = 15;
const INTERVALO_CAMBIO = 10000; // 10 segundos
const INTERVALO_RECARGA = 10000; // 10 segundos para recargar datos

const paginaActual = ref(0);
const intervalId = ref(null);
const intervalRecargaId = ref(null);

const sortedRanking = computed(() => {
  if (!ranking.value) return [];
  
  return [...ranking.value].sort((a, b) => {
    // Si es la primera partida, mantener el orden exacto del sorteo inicial
    if (campeonato.value?.partida_actual === 1) {
      return (a.ordenSorteo || 0) - (b.ordenSorteo || 0);
    }

    // Para el resto de partidas:
    // 1. GB ascendente (grupo A antes que B)
    const aGB = a.gb ? 1 : 0;
    const bGB = b.gb ? 1 : 0;
    if (aGB !== bGB) return aGB - bGB;

    // 2. PG total descendente
    const aPG = a.pg || 0;
    const bPG = b.pg || 0;
    if (aPG !== bPG) return bPG - aPG;

    // 3. PP/Dif total descendente
    const aPP = a.pp || 0;
    const bPP = b.pp || 0;
    if (aPP !== bPP) return bPP - aPP;

    // 4. PT/RT total descendente
    const aRT = a.rt || 0;
    const bRT = b.rt || 0;
    if (aRT !== bRT) return bRT - aRT;

    // 5. MG total ascendente
    const aMG = a.mg || 0;
    const bMG = b.mg || 0;
    if (aMG !== bMG) return aMG - bMG;

    // Si todo es igual, mantener el orden del sorteo inicial
    return (a.ordenSorteo || 0) - (b.ordenSorteo || 0);
  });
});

const parejasVisibles = computed(() => {
  const data = sortedRanking.value || [];
  const inicio = paginaActual.value * PAREJAS_POR_PAGINA;
  return data.slice(inicio, inicio + PAREJAS_POR_PAGINA);
});

// Funciones para la paginación
const cambiarPagina = () => {
  if (totalPaginas.value > 1) {
    // Si estamos en la última página, volver a la primera
    if (paginaActual.value >= totalPaginas.value - 1) {
      paginaActual.value = 0;
    } else {
      paginaActual.value++;
    }
    console.log('Cambiando a página:', paginaActual.value + 1);
  }
};

const iniciarRotacionPaginas = () => {
  // Detener el intervalo existente si hay uno
  detenerRotacionPaginas();
  
  // Solo iniciar la rotación si hay más de una página
  if (totalPaginas.value > 1) {
    console.log('Iniciando rotación de páginas, total páginas:', totalPaginas.value);
    intervalId.value = setInterval(cambiarPagina, INTERVALO_CAMBIO);
  }
};

const detenerRotacionPaginas = () => {
  if (intervalId.value) {
    console.log('Deteniendo rotación de páginas');
    clearInterval(intervalId.value);
    intervalId.value = null;
  }
};

const totalPaginas = computed(() => 
  Math.ceil((ranking.value?.length || 0) / PAREJAS_POR_PAGINA)
);

const iniciarRecargaAutomatica = async () => {
  try {
    // Detener cualquier intervalo existente
    detenerRecargaAutomatica();
    
    // Realizar la primera carga inmediatamente
    await cargarRanking();
    
    // Configurar el nuevo intervalo usando una función async
    intervalRecargaId.value = setInterval(async () => {
      if (document.visibilityState === 'visible') {
        try {
          // Obtener el campeonato actualizado
          const campeonatoActualizado = await campeonatoStore.obtenerActual();
          await campeonatoStore.$patch({ campeonato: campeonatoActualizado });

          // Obtener y actualizar el ranking
          await resultadoStore.obtenerRanking(campeonatoActualizado.id);

          console.log('Actualización automática completada:', new Date().toLocaleTimeString());
        } catch (error) {
          console.error('Error en la actualización automática:', error);
        }
      }
    }, INTERVALO_RECARGA);
    
    console.log('Recarga automática iniciada');
  } catch (e) {
    console.error('Error al iniciar la recarga automática:', e);
  }
};

const detenerRecargaAutomatica = () => {
  if (intervalRecargaId.value) {
    console.log('Deteniendo intervalo de recarga');
    clearInterval(intervalRecargaId.value);
    intervalRecargaId.value = null;
  }
};

const cargarRanking = async () => {
  if (!campeonato.value?.id) {
    error.value = 'No hay campeonato activo';
    return;
  }
  
  loading.value = true;
  error.value = null;
  
  try {
    console.log('Iniciando carga de datos:', new Date().toLocaleTimeString());
    
    // 1. Obtener el campeonato actualizado y esperar a que se complete
    const campeonatoActualizado = await campeonatoStore.obtenerActual();
    if (!campeonatoActualizado) {
      throw new Error('No se pudo obtener el campeonato actualizado');
    }
    
    // 2. Actualizar el store con el campeonato
    await campeonatoStore.$patch({ campeonato: campeonatoActualizado });

    // 3. Si es la primera partida, necesitamos el orden del sorteo
    if (campeonatoActualizado.partida_actual === 1) {
      // Obtener las mesas y esperar a que se complete
      const mesasData = await mesaService.obtenerMesas(
        campeonatoActualizado.id, 
        campeonatoActualizado.partida_actual
      );
      
      if (!mesasData || !mesasData.length) {
        throw new Error('No se encontraron mesas para la primera partida');
      }

      // Ordenar las mesas por número
      const mesasOrdenadas = [...mesasData].sort((a, b) => Number(a.id) - Number(b.id));

      // Crear mapa de orden por pareja
      const ordenPorPareja = new Map();
      let posicion = 1;
      
      // Asignar posiciones a parejas1
      mesasOrdenadas.forEach(mesa => {
        if (mesa.pareja1_id) {
          ordenPorPareja.set(mesa.pareja1_id, posicion++);
        }
      });
      
      // Asignar posiciones a parejas2
      mesasOrdenadas.forEach(mesa => {
        if (mesa.pareja2_id) {
          ordenPorPareja.set(mesa.pareja2_id, posicion++);
        }
      });

      // 4. Obtener el ranking y esperar a que se complete
      const rankingData = await resultadoStore.obtenerRanking(campeonatoActualizado.id);
      if (!rankingData) {
        throw new Error('No se pudo obtener el ranking');
      }

      // 5. Actualizar el ranking con el orden del sorteo
      ranking.value = rankingData.map(pareja => ({
        ...pareja,
        mesa: mesasData.find(m => m.pareja1_id === pareja.id || m.pareja2_id === pareja.id)?.id || '-',
        ordenSorteo: ordenPorPareja.get(pareja.id) || 0
      }));
    } else {
      // Para el resto de partidas, obtener el ranking directamente
      const rankingData = await resultadoStore.obtenerRanking(campeonatoActualizado.id);
      if (!rankingData) {
        throw new Error('No se pudo obtener el ranking');
      }
      
      ranking.value = rankingData;
    }

    console.log('Carga de datos completada:', new Date().toLocaleTimeString());
  } catch (e) {
    console.error('Error al cargar los datos:', e);
    error.value = e.message || 'Error al cargar los datos';
  } finally {
    loading.value = false;
  }
};

// Añadir watches para asegurar la reactividad
watch(() => campeonato.value, (newCampeonato) => {
  console.log('Campeonato actualizado:', newCampeonato?.partida_actual);
}, { deep: true });

watch(() => ranking.value, (newRanking) => {
  console.log('Ranking actualizado:', new Date().toLocaleTimeString());
  
  // Verificar si necesitamos iniciar/detener la rotación de páginas
  if (totalPaginas.value > 1 && !intervalId.value) {
    console.log('Iniciando rotación de páginas después de actualización');
    iniciarRotacionPaginas();
  } else if (totalPaginas.value <= 1 && intervalId.value) {
    console.log('Deteniendo rotación de páginas después de actualización');
    detenerRotacionPaginas();
  }
}, { deep: true });

onMounted(async () => {
  try {
    console.log('Componente montado, iniciando carga de datos');
    
    // Obtener el campeonato inicial
    const campeonatoInicial = await campeonatoStore.obtenerActual();
    await campeonatoStore.$patch({ campeonato: campeonatoInicial });
    
    // Iniciar la recarga automática
    await iniciarRecargaAutomatica();
    
    // Verificar si necesitamos iniciar la rotación de páginas
    if (totalPaginas.value > 1) {
      console.log('Iniciando rotación de páginas inicial');
      iniciarRotacionPaginas();
    }
    
    // Configurar el evento de visibilidad
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        console.log('Página visible, reiniciando actualizaciones');
        await iniciarRecargaAutomatica();
        if (totalPaginas.value > 1) {
          iniciarRotacionPaginas();
        }
      } else {
        console.log('Página oculta, deteniendo actualizaciones');
        detenerRotacionPaginas();
        detenerRecargaAutomatica();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Limpiar al desmontar
    onUnmounted(() => {
      console.log('Componente desmontado, limpiando intervalos y eventos');
      detenerRotacionPaginas();
      detenerRecargaAutomatica();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    });
    
  } catch (e) {
    console.error('Error en la inicialización:', e);
    error.value = 'Error al inicializar el ranking';
  }
});

watch(route, async (to, from) => {
  if (to.name === 'resultados') {
    await iniciarRecargaAutomatica();
    iniciarRotacionPaginas();
  } else {
    detenerRotacionPaginas();
    detenerRecargaAutomatica();
  }
}, { deep: true });
</script>

<style scoped>
.border-primary-500 {
  border-color: #3B82F6;
}
</style> 