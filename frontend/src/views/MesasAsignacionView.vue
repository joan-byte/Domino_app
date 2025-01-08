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
    
    <!-- Botón de imprimir -->
    <div class="flex justify-end mt-4">
      <button @click="imprimir" class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg">
        Imprimir
      </button>
    </div>

    <!-- Formato de impresión (oculto normalmente) -->
    <div class="hidden print:block print:m-0 print-section">
      <div class="print-pages">
        <template v-for="(mesa, index) in mesasParaImprimir" :key="index">
          <div :class="{'page-break': index % 2 === 0 && index !== 0}" class="mesa-container">
            <div class="border border-gray-300 h-full flex flex-col">
              <!-- Contenido de la mesa igual que antes -->
              <div class="border-b border-gray-300 p-4">
                <div class="text-left font-bold text-2xl mb-1">CAMPEONATO</div>
                <div class="text-left font-semibold text-xl mb-2">{{ campeonato?.nombre }}</div>
                <div class="flex justify-end">
                  <div class="text-right">
                    <span class="mr-4">Partida {{ campeonato?.partida_actual }}</span>
                    <span>Mesa {{ mesa.id }}</span>
                  </div>
                </div>
              </div>
              
              <!-- Parejas de la mesa -->
              <div class="divide-y divide-gray-300">
                <div class="p-3">
                  <div class="grid grid-cols-12">
                    <div class="col-span-6">{{ mesa.pareja1.nombre }}</div>
                    <div class="col-span-6">
                      <span class="mr-4">PG {{ mesa.pareja1.pg || 0 }}</span>
                      <span>PP {{ mesa.pareja1.pp || 0 }}</span>
                    </div>
                  </div>
                </div>
                <div class="p-3">
                  <div class="grid grid-cols-12">
                    <div class="col-span-6">{{ mesa.pareja2.nombre }}</div>
                    <div class="col-span-6">
                      <span class="mr-4">PG {{ mesa.pareja2.pg || 0 }}</span>
                      <span>PP {{ mesa.pareja2.pp || 0 }}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Espacio para resultados -->
              <div class="flex-grow px-3">
                <div class="grid grid-cols-1">
                  <div v-for="i in 15" :key="i" class="border-b border-gray-300 h-6"></div>
                </div>
              </div>
              
              <!-- Total -->
              <div class="border-t border-gray-300 p-3">
                <div>Total</div>
              </div>
            </div>
          </div>
        </template>
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

const mesasParaImprimir = computed(() => {
  const mesasCompletas = [];
  const mesas = new Map();
  
  // Agrupar parejas por mesa
  parejasMesas.value.forEach(pareja => {
    if (pareja.mesa !== '-') {
      if (!mesas.has(pareja.mesa)) {
        mesas.set(pareja.mesa, {
          id: pareja.mesa,
          parejas: []
        });
      }
      mesas.get(pareja.mesa).parejas.push({
        nombre: pareja.nombre,
        pg: 0,
        pp: 0
      });
    }
  });

  // Filtrar solo mesas con dos parejas
  mesas.forEach(mesa => {
    if (mesa.parejas.length === 2) {
      mesasCompletas.push({
        id: mesa.id,
        pareja1: mesa.parejas[0],
        pareja2: mesa.parejas[1]
      });
    }
  });

  return mesasCompletas.sort((a, b) => a.id - b.id);
});

const imprimir = () => {
  window.print();
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

<style>
@media print {
  @page {
    size: A4 landscape;
    margin: 0;
  }
  
  body * {
    visibility: hidden;
  }
  
  .print-section,
  .print-section * {
    visibility: visible;
  }
  
  .print-section {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
  }

  .print-pages {
    display: flex;
    flex-wrap: wrap;
    width: 100%;
  }

  .mesa-container {
    width: 50%;
    height: 21cm;
    padding: 1.5%;
    box-sizing: border-box;
  }

  .mesa-container > div {
    height: 97%;
    display: flex;
    flex-direction: column;
    border: 1px solid #ccc;
  }

  .page-break {
    break-before: always;
    page-break-before: always;
  }

  /* Ajustes de contenido interno */
  .mesa-container .border-b {
    border-bottom-width: 1px;
  }

  .mesa-container .p-4 {
    padding: 0.8rem;
  }

  .mesa-container .p-3 {
    padding: 0.6rem;
  }

  .mesa-container .flex-grow {
    flex: 1;
    overflow: hidden;
  }

  .mesa-container .grid > div {
    height: 0.8cm;
  }
}

@page {
  size: A4 landscape;
  margin: 0;
}

/* Estilos específicos para la vista previa de impresión */
@media print {
  html, body {
    width: 100%;
    margin: 0;
    padding: 0;
  }
}
</style> 