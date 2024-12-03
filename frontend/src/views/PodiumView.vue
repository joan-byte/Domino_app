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
      <div class="w-[32rem] flex flex-col items-center">
        <div class="text-3xl mb-2">🥈</div>
        <div class="bg-gray-100 p-8 rounded-t-lg w-full text-center h-40">
          <div class="font-bold text-2xl mb-2">Pareja {{ segundoLugar?.numero }}</div>
          <div class="text-xl mb-4">{{ segundoLugar?.nombre }}</div>
          <div class="flex justify-between items-center text-lg">
            <div class="text-gray-600">{{ segundoLugar?.club }}</div>
            <div>PG: {{ segundoLugar?.pg }} | PP: {{ segundoLugar?.pp }}</div>
          </div>
        </div>
      </div>

      <!-- Primer lugar -->
      <div class="w-[32rem] flex flex-col items-center">
        <div class="text-3xl mb-2">🏆</div>
        <div class="bg-yellow-100 p-8 rounded-t-lg w-full text-center h-48">
          <div class="font-bold text-2xl mb-2">Pareja {{ primerLugar?.numero }}</div>
          <div class="text-xl mb-4">{{ primerLugar?.nombre }}</div>
          <div class="flex justify-between items-center text-lg">
            <div class="text-gray-600">{{ primerLugar?.club }}</div>
            <div>PG: {{ primerLugar?.pg }} | PP: {{ primerLugar?.pp }}</div>
          </div>
        </div>
      </div>

      <!-- Tercer lugar -->
      <div class="w-[32rem] flex flex-col items-center">
        <div class="text-3xl mb-2">🥉</div>
        <div class="bg-orange-100 p-8 rounded-t-lg w-full text-center h-36">
          <div class="font-bold text-2xl mb-2">Pareja {{ tercerLugar?.numero }}</div>
          <div class="text-xl mb-4">{{ tercerLugar?.nombre }}</div>
          <div class="flex justify-between items-center text-lg">
            <div class="text-gray-600">{{ tercerLugar?.club }}</div>
            <div>PG: {{ tercerLugar?.pg }} | PP: {{ tercerLugar?.pp }}</div>
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
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Posición
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
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="(pareja, index) in parejasVisibles" :key="pareja.id"
                :class="{'bg-yellow-50': index + paginaActual * PAREJAS_POR_PAGINA === 0, 
                        'bg-gray-50': index + paginaActual * PAREJAS_POR_PAGINA === 1, 
                        'bg-orange-50': index + paginaActual * PAREJAS_POR_PAGINA === 2}">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <span class="text-sm font-medium text-gray-900">{{ index + 1 + paginaActual * PAREJAS_POR_PAGINA }}</span>
                  <span v-if="index + paginaActual * PAREJAS_POR_PAGINA < 3" class="ml-2">
                    {{ index + paginaActual * PAREJAS_POR_PAGINA === 0 ? '🏆' : 
                       index + paginaActual * PAREJAS_POR_PAGINA === 1 ? '🥈' : '🥉' }}
                  </span>
                </div>
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

const primerLugar = computed(() => ranking.value[0]);
const segundoLugar = computed(() => ranking.value[1]);
const tercerLugar = computed(() => ranking.value[2]);

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
    const rankingData = await resultadoService.obtenerRanking(campeonato.value.id);
    ranking.value = rankingData;
    iniciarRotacionPaginas();
  } catch (e) {
    console.error('Error al cargar los datos:', e);
    error.value = e.message || 'Error al cargar los datos';
  }
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