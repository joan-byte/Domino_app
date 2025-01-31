<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Título -->
    <div class="text-center mb-12">
      <h1 class="text-3xl font-bold flex items-center justify-center gap-2">
        <span class="text-2xl">🏆</span>
        Podium del Campeonato
        <span class="text-2xl">🏆</span>
      </h1>
      <p class="text-gray-600 mt-2">{{ campeonato?.nombre }}</p>
    </div>

    <!-- Podium -->
    <div class="flex justify-center items-end gap-12 mb-16 h-72">
      <!-- Segundo lugar -->
      <div v-if="ranking.length >= 2" class="w-[40rem] flex flex-col items-center">
        <div class="text-3xl mb-2">🥈</div>
        <div class="bg-slate-100 p-6 rounded-t-lg w-full text-center h-40">
          <div class="font-bold text-xl mb-1">Pareja {{ ranking[1]?.numero }}</div>
          <div class="text-lg mb-2 truncate">{{ ranking[1]?.nombre }}</div>
          <div class="flex justify-between items-center text-base">
            <div class="text-gray-600 truncate max-w-[200px]">{{ ranking[1]?.club }}</div>
            <div class="flex gap-4">
              <span>GB: {{ ranking[1]?.gb ? 'B' : 'A' }}</span>
              <span>PG: {{ ranking[1]?.pg }} | PP: {{ ranking[1]?.pp }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Primer lugar -->
      <div v-if="ranking.length >= 1" class="w-[40rem] flex flex-col items-center">
        <div class="text-3xl mb-2">🏆</div>
        <div class="bg-yellow-100 p-6 rounded-t-lg w-full text-center h-48">
          <div class="font-bold text-xl mb-1">Pareja {{ ranking[0]?.numero }}</div>
          <div class="text-lg mb-2 truncate">{{ ranking[0]?.nombre }}</div>
          <div class="flex justify-between items-center text-base">
            <div class="text-gray-600 truncate max-w-[200px]">{{ ranking[0]?.club }}</div>
            <div class="flex gap-4">
              <span>GB: {{ ranking[0]?.gb ? 'B' : 'A' }}</span>
              <span>PG: {{ ranking[0]?.pg }} | PP: {{ ranking[0]?.pp }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Tercer lugar -->
      <div v-if="ranking.length >= 3" class="w-[40rem] flex flex-col items-center">
        <div class="text-3xl mb-2">🥉</div>
        <div class="bg-orange-100 p-6 rounded-t-lg w-full text-center h-36">
          <div class="font-bold text-xl mb-1">Pareja {{ ranking[2]?.numero }}</div>
          <div class="text-lg mb-2 truncate">{{ ranking[2]?.nombre }}</div>
          <div class="flex justify-between items-center text-base">
            <div class="text-gray-600 truncate max-w-[200px]">{{ ranking[2]?.club }}</div>
            <div class="flex gap-4">
              <span>GB: {{ ranking[2]?.gb ? 'B' : 'A' }}</span>
              <span>PG: {{ ranking[2]?.pg }} | PP: {{ ranking[2]?.pp }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Ranking Final -->
    <div class="bg-white rounded-lg shadow-sm overflow-hidden">
      <div class="p-6 border-b border-gray-200">
        <h2 class="text-xl font-semibold">Ranking Final</h2>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 ranking-table">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Posición
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                GB
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
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                PG
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                PP
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="(pareja, index) in parejasVisibles" :key="pareja.id"
                :class="[
                  index + paginaActual * PAREJAS_POR_PAGINA === 0 || 
                  obtenerPosicionPrimerGrupoB() === index + paginaActual * PAREJAS_POR_PAGINA
                    ? 'bg-yellow-100'
                    : index + paginaActual * PAREJAS_POR_PAGINA === 1 || 
                      obtenerPosicionPrimerGrupoB() + 1 === index + paginaActual * PAREJAS_POR_PAGINA
                        ? 'bg-slate-100'
                        : index + paginaActual * PAREJAS_POR_PAGINA === 2 || 
                          obtenerPosicionPrimerGrupoB() + 2 === index + paginaActual * PAREJAS_POR_PAGINA
                            ? 'bg-orange-50'
                            : ''
                ]">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <span class="text-sm font-medium text-gray-900">{{ index + 1 + paginaActual * PAREJAS_POR_PAGINA }}</span>
                  <span v-if="index + paginaActual * PAREJAS_POR_PAGINA < 3 || 
                            (index + paginaActual * PAREJAS_POR_PAGINA >= obtenerPosicionPrimerGrupoB() && 
                             index + paginaActual * PAREJAS_POR_PAGINA < obtenerPosicionPrimerGrupoB() + 3)" 
                        class="ml-2">
                    {{ 
                      index + paginaActual * PAREJAS_POR_PAGINA === 0 || 
                      index + paginaActual * PAREJAS_POR_PAGINA === obtenerPosicionPrimerGrupoB() ? '🏆' : 
                      index + paginaActual * PAREJAS_POR_PAGINA === 1 || 
                      index + paginaActual * PAREJAS_POR_PAGINA === obtenerPosicionPrimerGrupoB() + 1 ? '🥈' : '🥉' 
                    }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ pareja.gb ? 'B' : 'A' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ pareja.numero }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ pareja.nombre }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ pareja.club }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ pareja.pg }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ pareja.pp }}
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
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { resultadoService, campeonatoService } from '../services/api';

const router = useRouter();
const campeonato = ref(null);
const ranking = ref([]);
const error = ref(null);
const paginaActual = ref(0);
const PAREJAS_POR_PAGINA = 10;
const INTERVALO_CAMBIO = 7000; // 7 segundos
const intervalId = ref(null);

const totalPaginas = computed(() => Math.ceil(ranking.value.length / PAREJAS_POR_PAGINA));

const parejasVisibles = computed(() => {
  const inicio = paginaActual.value * PAREJAS_POR_PAGINA;
  const fin = inicio + PAREJAS_POR_PAGINA;
  return ranking.value.slice(inicio, fin);
});

const cambiarPagina = () => {
  paginaActual.value = (paginaActual.value + 1) % totalPaginas.value;
};

const iniciarRotacionPaginas = () => {
  if (ranking.value.length > PAREJAS_POR_PAGINA) {
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
    // Cargar el campeonato
    campeonato.value = await campeonatoService.obtenerActual();
    if (!campeonato.value) {
      error.value = 'No hay campeonato activo';
      return;
    }

    // Cargar el ranking final
    ranking.value = await resultadoService.obtenerRanking(campeonato.value.id);
    iniciarRotacionPaginas();
  } catch (e) {
    console.error('Error al cargar los datos:', e);
    error.value = e.message || 'Error al cargar los datos';
  }
};

// Función para obtener la posición de la primera pareja del grupo B
const obtenerPosicionPrimerGrupoB = () => {
  return ranking.value.findIndex(p => p.gb === true);
};

onMounted(() => {
  cargarDatos();
  // Reiniciar la rotación cuando la pestaña vuelve a estar visible
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
.ranking-table tr.bg-yellow-100 {
  background-color: rgb(254, 249, 195) !important;
}
.ranking-table tr.bg-slate-100 {
  background-color: rgb(241, 245, 249) !important;
}
.ranking-table tr.bg-orange-50 {
  background-color: rgb(255, 247, 237) !important;
}
</style> 