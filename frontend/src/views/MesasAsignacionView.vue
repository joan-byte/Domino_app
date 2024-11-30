INSERT INTO resultados (
    id,
    pareja_id,
    gb,
    rp,
    pg,
    pp,
    mesa_id,
    partida,
    campeonato_id
  )
VALUES (
    id:integer,
    pareja_id:integer,
    gb:boolean,
    rp:integer,
    pg:integer,
    pp:integer,
    mesa_id:integer,
    partida:integer,
    campeonato_id:integer
  );<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Asignación de Mesas</h1>
        <h2 class="text-lg text-gray-600">{{ campeonato?.nombre || 'Cargando...' }}</h2>
      </div>
      <div class="text-xl font-semibold text-gray-800">
        Partida {{ campeonato?.partida_actual || 1 }}
      </div>
    </div>

    <!-- Tabla de asignación -->
    <div class="bg-white shadow-lg rounded-lg overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Número
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nombre
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Club
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Mesa
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="(pareja, index) in parejasVisibles" :key="pareja.id" :class="index % 2 === 0 ? 'bg-white' : 'bg-gray-50'">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ pareja.numero }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ pareja.nombre }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ pareja.club_pertenencia }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ pareja.mesa }}
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
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { campeonatoService, mesaService, parejaService } from '../services/api';

const campeonato = ref(null);
const parejasMesas = ref([]);
const error = ref(null);
const paginaActual = ref(0);
const intervalId = ref(null);
const PAREJAS_POR_PAGINA = 15;
const INTERVALO_CAMBIO = 10000; // 10 segundos en milisegundos

const totalPaginas = computed(() => 
  Math.ceil(parejasMesas.value.length / PAREJAS_POR_PAGINA)
);

const parejasVisibles = computed(() => {
  const inicio = paginaActual.value * PAREJAS_POR_PAGINA;
  const fin = inicio + PAREJAS_POR_PAGINA;
  return parejasMesas.value.slice(inicio, fin);
});

const cambiarPagina = () => {
  paginaActual.value = (paginaActual.value + 1) % totalPaginas.value;
};

const iniciarRotacionPaginas = () => {
  if (parejasMesas.value.length > PAREJAS_POR_PAGINA) {
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
    // Cargar el campeonato actual
    campeonato.value = await campeonatoService.obtenerActual();
    if (!campeonato.value) {
      error.value = 'No hay campeonato activo';
      return;
    }

    // Cargar todas las parejas del campeonato
    const parejas = await parejaService.obtenerParejas(campeonato.value.id);
    
    // Cargar las mesas de la partida actual
    const mesas = await mesaService.obtenerMesas(
      campeonato.value.id,
      campeonato.value.partida_actual
    );

    // Crear un mapa de mesa por pareja
    const mesaPorPareja = new Map();
    mesas.forEach(mesa => {
      if (mesa.pareja1_id) mesaPorPareja.set(mesa.pareja1_id, mesa.id);
      if (mesa.pareja2_id) mesaPorPareja.set(mesa.pareja2_id, mesa.id);
    });

    // Transformar los datos para la tabla
    parejasMesas.value = parejas
      .filter(pareja => pareja.activa)
      .map(pareja => ({
        id: pareja.id,
        numero: pareja.id,
        nombre: pareja.nombre,
        club_pertenencia: pareja.club_pertenencia,
        mesa: mesaPorPareja.get(pareja.id) || '-'
      }))
      .sort((a, b) => a.id - b.id);

    // Iniciar la rotación de páginas si hay más de PAREJAS_POR_PAGINA parejas
    iniciarRotacionPaginas();

  } catch (e) {
    console.error('Error al cargar los datos:', e);
    error.value = 'Error al cargar los datos';
  }
};

// Lifecycle hooks
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