<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Ranking del Torneo</h1>
      <div class="text-xl">Partida {{ progreso.partidas_jugadas }}</div>
    </div>

    <div class="bg-white shadow-lg rounded-lg overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full">
          <thead class="bg-gray-50 border-b">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                POS.
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                PART.
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                GB
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                PG
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                PP
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                N°
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                NOMBRE
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                CLUB
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="(pareja, index) in parejasFiltradas" 
                :key="pareja.id" 
                :class="{'bg-yellow-50': index % 2 === 0}"
            >
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ index + 1 }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ pareja.partidos_jugados }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ pareja.grupo }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ pareja.pg_total }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ pareja.pp_total }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ pareja.numero }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ pareja.nombre }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ pareja.club_pertenencia }}
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

// Método para calcular los sumatorios de PG y PP de una pareja
const calcularSumatorios = (pareja) => {
  const resultados = pareja.resultados || [];
  return {
    pg_total: resultados.reduce((sum, resultado) => sum + (resultado.pg || 0), 0),
    pp_total: resultados.reduce((sum, resultado) => sum + (resultado.pp || 0), 0)
  };
};

const parejasFiltradas = computed(() => {
  return ranking.value
    .filter(pareja => {
      const coincideNombre = pareja.nombre.toLowerCase().includes(busqueda.value.toLowerCase());
      const coincideClub = !filtroClub.value || pareja.club_pertenencia === filtroClub.value;
      return coincideNombre && coincideClub;
    })
    .map(pareja => {
      const { pg_total, pp_total } = calcularSumatorios(pareja);
      return {
        ...pareja,
        pg_total,
        pp_total
      };
    })
    .sort((a, b) => {
      // Nivel 1: GB (grupo) ascendente
      if (a.grupo !== b.grupo) {
        return a.grupo.localeCompare(b.grupo);
      }

      // Nivel 2: Dentro de cada grupo, ordenar por sumatorio de PG descendente
      if (b.pg_total !== a.pg_total) {
        return b.pg_total - a.pg_total;
      }

      // Nivel 3: Para parejas con mismo PG, ordenar por sumatorio de PP descendente
      if (b.pp_total !== a.pp_total) {
        return b.pp_total - a.pp_total;
      }

      // Último nivel: Si todo lo anterior es igual, ordenar por número de pareja
      return a.numero - b.numero;
    });
});

// Método para cargar los datos
const cargarDatos = async () => {
  try {
    const [campeonatoActual, detalles] = await Promise.all([
      campeonatoService.obtenerActual(),
      campeonatoService.obtenerDetalles()
    ]);
    
    campeonato.value = campeonatoActual;
    progreso.value = detalles.progreso;
    
    // Obtener el ranking con los resultados incluidos
    const resultado = await resultadoStore.obtenerRankingConResultados(campeonatoActual.id);
    if (resultado) {
      ranking.value = resultado;
    }
  } catch (error) {
    console.error('Error al cargar los datos:', error);
  }
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

<style scoped>
.bg-yellow-50 {
  background-color: rgb(254, 252, 232);
}
</style> 