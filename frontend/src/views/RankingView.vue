<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Encabezado con información del torneo -->
    <div class="bg-white rounded-lg shadow-lg p-6 mb-8">
      <div class="flex justify-between items-start">
        <div>
          <h1 class="text-3xl font-bold text-gray-800">{{ campeonato?.nombre || 'Ranking del Torneo' }}</h1>
          <p class="text-gray-600 mt-2">
            Fecha de inicio: {{ formatearFecha(campeonato?.fecha_inicio) }}
          </p>
        </div>
        <button 
          @click="cargarDatos" 
          class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
          </svg>
          Actualizar
        </button>
      </div>

      <!-- Barra de progreso del torneo -->
      <div class="mt-6">
        <div class="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progreso del Torneo</span>
          <span>{{ Math.round(progreso.porcentaje) }}%</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            class="bg-blue-600 h-2.5 rounded-full transition-all duration-500" 
            :style="{ width: `${progreso.porcentaje}%` }"
          ></div>
        </div>
        <div class="flex justify-between text-sm text-gray-500 mt-2">
          <span>Partida {{ progreso.partidas_jugadas }} de {{ campeonato?.numero_partidas }}</span>
          <span>{{ progreso.partidas_restantes }} partidas restantes</span>
        </div>
      </div>
    </div>

    <!-- Estadísticas Generales -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold text-gray-600 mb-2">Total Parejas</h3>
        <p class="text-3xl font-bold text-blue-600">{{ ranking.length }}</p>
      </div>
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold text-gray-600 mb-2">Partidos Jugados</h3>
        <p class="text-3xl font-bold text-green-600">{{ totalPartidosJugados }}</p>
      </div>
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold text-gray-600 mb-2">Puntos Totales</h3>
        <p class="text-3xl font-bold text-purple-600">{{ totalPuntos }}</p>
      </div>
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold text-gray-600 mb-2">Promedio Puntos</h3>
        <p class="text-3xl font-bold text-orange-600">{{ promedioPuntos }}</p>
      </div>
    </div>
    
    <div v-if="loading" class="text-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
    </div>

    <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
      <strong class="font-bold">Error!</strong>
      <span class="block sm:inline"> {{ error }}</span>
    </div>

    <div v-else class="bg-white shadow-lg rounded-lg overflow-hidden">
      <!-- Filtros y Búsqueda -->
      <div class="p-4 border-b border-gray-200">
        <div class="flex flex-col md:flex-row gap-4">
          <div class="flex-1">
            <input
              v-model="busqueda"
              type="text"
              placeholder="Buscar pareja..."
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div class="flex gap-2">
            <select
              v-model="filtroClub"
              class="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos los clubes</option>
              <option v-for="club in clubesUnicos" :key="club" :value="club">
                {{ club }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full">
          <thead class="bg-gray-100">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Posición
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pareja
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Club
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  @click="ordenarPor('puntos')">
                Puntos
                <span v-if="ordenActual === 'puntos'" class="ml-1">
                  {{ ordenAscendente ? '↑' : '↓' }}
                </span>
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Partidos
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Victorias
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Derrotas
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                % Victoria
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="(pareja, index) in parejasFiltradas" 
                :key="pareja.id" 
                class="hover:bg-gray-50 transition-colors"
                :class="{'bg-yellow-50': index === 0, 'bg-gray-50': index === 1, 'bg-orange-50': index === 2}"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <span v-if="index < 3" class="mr-2">
                    <span v-if="index === 0">🥇</span>
                    <span v-else-if="index === 1">🥈</span>
                    <span v-else>🥉</span>
                  </span>
                  <span class="font-semibold">{{ index + 1 }}</span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ pareja.nombre }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-500">{{ pareja.club_pertenencia }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-bold text-blue-600">{{ pareja.puntos }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ pareja.partidos_jugados }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-green-600">{{ pareja.victorias }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-red-600">{{ pareja.derrotas }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium" :class="getPorcentajeVictoriasColor(pareja)">
                  {{ calcularPorcentajeVictorias(pareja) }}%
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useResultadoStore } from '../stores/resultado';
import { storeToRefs } from 'pinia';
import { campeonatoService } from '../services/api';

const resultadoStore = useResultadoStore();
const { loading, error } = storeToRefs(resultadoStore);
const ranking = ref([]);
const busqueda = ref('');
const filtroClub = ref('');
const ordenActual = ref('puntos');
const ordenAscendente = ref(false);
const campeonato = ref(null);
const progreso = ref({
  porcentaje: 0,
  partidas_jugadas: 0,
  partidas_restantes: 0
});

// Computed properties para estadísticas
const totalPartidosJugados = computed(() => {
  return ranking.value.reduce((total, pareja) => total + pareja.partidos_jugados, 0) / 2;
});

const totalPuntos = computed(() => {
  return ranking.value.reduce((total, pareja) => total + pareja.puntos, 0);
});

const promedioPuntos = computed(() => {
  if (ranking.value.length === 0) return 0;
  return Math.round(totalPuntos.value / ranking.value.length);
});

const clubesUnicos = computed(() => {
  const clubes = new Set(ranking.value.map(p => p.club_pertenencia));
  return Array.from(clubes).sort();
});

const parejasFiltradas = computed(() => {
  return ranking.value
    .filter(pareja => {
      const coincideNombre = pareja.nombre.toLowerCase().includes(busqueda.value.toLowerCase());
      const coincideClub = !filtroClub.value || pareja.club_pertenencia === filtroClub.value;
      return coincideNombre && coincideClub;
    })
    .sort((a, b) => {
      const factor = ordenAscendente.value ? 1 : -1;
      return (a[ordenActual.value] - b[ordenActual.value]) * factor;
    });
});

// Métodos
const cargarDatos = async () => {
  try {
    const [campeonatoActual, detalles] = await Promise.all([
      campeonatoService.obtenerActual(),
      campeonatoService.obtenerDetalles()
    ]);
    
    campeonato.value = campeonatoActual;
    progreso.value = detalles.progreso;
    
    const resultado = await resultadoStore.obtenerRanking(campeonatoActual.id);
    if (resultado) {
      ranking.value = resultado;
    }
  } catch (error) {
    console.error('Error al cargar los datos:', error);
  }
};

const ordenarPor = (campo) => {
  if (ordenActual.value === campo) {
    ordenAscendente.value = !ordenAscendente.value;
  } else {
    ordenActual.value = campo;
    ordenAscendente.value = false;
  }
};

const calcularPorcentajeVictorias = (pareja) => {
  if (pareja.partidos_jugados === 0) return 0;
  return Math.round((pareja.victorias / pareja.partidos_jugados) * 100);
};

const getPorcentajeVictoriasColor = (pareja) => {
  const porcentaje = calcularPorcentajeVictorias(pareja);
  if (porcentaje >= 70) return 'text-green-600';
  if (porcentaje >= 50) return 'text-blue-600';
  if (porcentaje >= 30) return 'text-yellow-600';
  return 'text-red-600';
};

const formatearFecha = (fecha) => {
  if (!fecha) return '';
  return new Date(fecha).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

onMounted(() => {
  cargarDatos();
});
</script> 