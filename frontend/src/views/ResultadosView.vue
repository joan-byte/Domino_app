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
    <div v-if="loading" class="flex justify-center items-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
    </div>

    <!-- Mensaje de error -->
    <div v-else-if="error" class="text-center py-8">
      <div class="text-red-600">{{ error }}</div>
      <button @click="cargarRanking" class="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
        Reintentar
      </button>
    </div>

    <!-- Mensaje cuando no hay datos -->
    <div v-else-if="!ranking?.length" class="text-center py-8 text-gray-600">
      No hay datos de ranking disponibles
    </div>

    <!-- Tabla de Ranking -->
    <div v-else class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Posición
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Part.
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              GB
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              PG
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              PP
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Pareja
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nombre
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Club
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="(pareja, index) in ranking" :key="pareja.numero">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ index + 1 }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm"
                :class="{
                  'text-gray-900': pareja.ultima_partida === campeonato?.partida_actual,
                  'text-red-600': pareja.ultima_partida < campeonato?.partida_actual
                }">
              {{ pareja.ultima_partida }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ pareja.gb ? 'B' : 'A' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ pareja.pg || 0 }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ pareja.pp }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ pareja.numero }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ pareja.nombre }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ pareja.club || '-' }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useCampeonatoStore } from '../stores/campeonato';
import { useResultadoStore } from '../stores/resultado';

const campeonatoStore = useCampeonatoStore();
const resultadoStore = useResultadoStore();

const { campeonato } = storeToRefs(campeonatoStore);
const { ranking } = storeToRefs(resultadoStore);

const loading = ref(false);
const error = ref(null);

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
});
</script> 