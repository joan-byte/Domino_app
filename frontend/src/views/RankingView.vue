<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Ranking</h1>
        <h2 class="text-lg text-gray-600">{{ campeonato?.nombre || 'Cargando...' }}</h2>
      </div>
      <div class="text-xl font-semibold text-gray-800">
        Partida {{ campeonato?.partida_actual ?? 0 }}
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
    <div v-else-if="!rankingConUltimaPartida?.length" class="text-center py-8 text-gray-600">
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
              ID
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
          <tr v-for="(pareja, index) in rankingConUltimaPartida" :key="pareja?.id">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ index + 1 }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm" 
                :class="{'text-red-600': pareja?.atrasada, 
                        'text-gray-900': !pareja?.atrasada}">
              {{ pareja?.ultima_partida ?? 0 }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ pareja?.gb ? 'Sí' : 'No' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ pareja?.total_pg ?? 0 }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ pareja?.total_pp ?? 0 }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ pareja?.id }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ pareja?.nombre || '-' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ pareja?.club_pertenencia || '-' }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useCampeonatoStore } from '../stores/campeonato';
import { useResultadoStore } from '../stores/resultado';

const campeonatoStore = useCampeonatoStore();
const resultadoStore = useResultadoStore();

const { campeonato } = storeToRefs(campeonatoStore);
const { ranking } = storeToRefs(resultadoStore);
const isLoading = ref(true);
const error = ref(null);

// Computed property para procesar los resultados por pareja
const rankingConUltimaPartida = computed(() => {
  if (!ranking?.value || !campeonato?.value) return [];
  
  try {
    // Agrupar resultados por pareja_id y encontrar la última partida
    const resultadosPorPareja = {};
    
    // Primera pasada: inicializar las parejas
    ranking.value.forEach(resultado => {
      const parejaId = resultado.pareja_id;
      if (!resultadosPorPareja[parejaId]) {
        resultadosPorPareja[parejaId] = {
          id: parejaId,
          nombre: resultado.nombre || `Pareja ${parejaId}`,
          club_pertenencia: resultado.club || '-',
          total_pg: resultado.pg || 0,
          total_pp: resultado.pp || 0,
          ultima_partida: resultado.ultima_partida || 0,
          gb: resultado.gb || false
        };
      }
    });

    // Convertir a array y ordenar según los criterios
    return Object.values(resultadosPorPareja)
      .sort((a, b) => {
        // 1. GB ascendente (false antes que true)
        if (a.gb !== b.gb) {
          return a.gb ? 1 : -1;
        }
        // 2. PG descendente
        if (b.total_pg !== a.total_pg) {
          return b.total_pg - a.total_pg;
        }
        // 3. PP descendente
        return b.total_pp - a.total_pp;
      })
      .map(pareja => ({
        ...pareja,
        atrasada: pareja.ultima_partida < (campeonato.value?.partida_actual || 0)
      }));
  } catch (e) {
    console.error('Error procesando ranking:', e);
    return [];
  }
});

const cargarDatos = async () => {
  try {
    isLoading.value = true;
    error.value = null;
    
    // Cargar el campeonato actual
    const campeonatoActual = await campeonatoStore.obtenerActual();
    
    if (campeonatoActual?.id) {
      console.log('Cargando ranking para campeonato:', campeonatoActual.id);
      const datos = await resultadoStore.obtenerRanking(campeonatoActual.id);
      console.log('Datos del ranking:', datos);
      
      if (!datos || datos.length === 0) {
        error.value = 'No hay resultados registrados para este campeonato';
      }
    } else {
      error.value = 'No se pudo cargar el campeonato';
    }
  } catch (err) {
    console.error('Error al cargar los datos:', err);
    error.value = 'Error al cargar los datos del ranking';
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  cargarDatos();
});
</script>

<style scoped>
.bg-yellow-50 {
  background-color: rgb(254, 252, 232);
}
</style> 