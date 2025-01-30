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

    <!-- Formato de impresión -->
    <div class="hidden print:block print:m-0 print-section">
      <div class="print-pages">
        <div class="flex flex-wrap">
          <template v-for="(mesa, index) in mesasParaImprimir" :key="index">
            <div class="mesa-container">
              <div class="border border-black h-full flex flex-col">
                <!-- Cabecera -->
                <div class="border-b border-black p-4">
                  <div class="text-left font-bold text-2xl">CAMPEONATO</div>
                  <div class="text-left text-xl">{{ campeonato?.nombre }}</div>
                  <div class="flex justify-end">
                    <span class="mr-4">Partida {{ campeonato?.partida_actual }}</span>
                    <span>Mesa {{ mesa.id }}</span>
                  </div>
                </div>

                <!-- Contenedor principal -->
                <div class="flex flex-1 relative">
                  <!-- Línea vertical divisoria -->
                  <div class="absolute left-1/2 top-0 bottom-0 w-[1px] bg-black"></div>

                  <!-- Columna izquierda -->
                  <div class="w-1/2 flex flex-col p-2">
                    <!-- Pareja 1 -->
                    <div class="border border-black p-2 mb-2">
                      <div class="nombre-pareja">{{ mesa.pareja1.nombre }}</div>
                      <div class="info-pareja">
                        <span class="mr-2">PG {{ mesa.pareja1.pg || 0 }}</span>
                        <span>PP {{ mesa.pareja1.pp || 0 }}</span>
                      </div>
                    </div>
                    
                    <!-- Líneas numeradas en un solo recuadro -->
                    <div class="border border-black flex-1 p-2">
                      <div v-for="i in 15" :key="i" class="flex items-center h-6">
                        <span class="w-6 text-sm">{{ i }}</span>
                        <div class="flex-1 border-b border-black ml-2"></div>
                      </div>
                    </div>
                    
                    <!-- Total y Firma -->
                    <div class="mt-2">
                      <div class="border border-black p-2 mb-2">
                        <span class="font-bold">Total</span>
                      </div>
                      <div class="border border-black p-2">
                        <span class="font-bold">Firma</span>
                      </div>
                    </div>
                  </div>

                  <!-- Columna derecha -->
                  <div class="w-1/2 flex flex-col p-2">
                    <!-- Pareja 2 -->
                    <div class="border border-black p-2 mb-2">
                      <div class="nombre-pareja">{{ mesa.pareja2.nombre }}</div>
                      <div class="info-pareja">
                        <span class="mr-2">PG {{ mesa.pareja2.pg || 0 }}</span>
                        <span>PP {{ mesa.pareja2.pp || 0 }}</span>
                      </div>
                    </div>
                    
                    <!-- Líneas numeradas en un solo recuadro -->
                    <div class="border border-black flex-1 p-2">
                      <div v-for="i in 15" :key="i" class="flex items-center h-6">
                        <span class="w-6 text-sm">{{ i }}</span>
                        <div class="flex-1 border-b border-black ml-2"></div>
                      </div>
                    </div>
                    
                    <!-- Total y Firma -->
                    <div class="mt-2">
                      <div class="border border-black p-2 mb-2">
                        <span class="font-bold">Total</span>
                      </div>
                      <div class="border border-black p-2">
                        <span class="font-bold">Firma</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <!-- Forzar dos mesas por página -->
            <div v-if="(index + 1) % 2 === 0" class="w-full page-break"></div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { campeonatoService, mesaService, parejaService, resultadoService } from '../services/api';
import { useResultadoStore } from '../stores/resultado';

const campeonato = ref(null);
const parejasMesas = ref([]);
const error = ref(null);
const paginaActual = ref(0);
const intervalId = ref(null);
const PAREJAS_POR_PAGINA = 15;
const INTERVALO_CAMBIO = 10000; // 10 segundos en milisegundos

const resultadoStore = useResultadoStore();
const resultados = ref([]);

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
      
      // Obtener los sumatorios de PG y PP de la base de datos
      const resultadosPareja = resultados.value.filter(r => r.pareja_id === pareja.id);
      const pg = resultadosPareja.reduce((sum, r) => sum + (r.pg || 0), 0);
      const pp = resultadosPareja.reduce((sum, r) => sum + (r.pp || 0), 0);
      
      mesas.get(pareja.mesa).parejas.push({
        nombre: pareja.nombre,
        pg: pg,
        pp: pp
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

    // Cargar los resultados del campeonato usando el servicio directamente
    const resultadosData = await resultadoService.obtenerResultadosCampeonato(campeonato.value.id);
    resultados.value = resultadosData;

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
    width: 100%;
  }

  .mesa-container {
    width: 50%;
    height: auto;
    padding: 0.5cm;
    box-sizing: border-box;
    float: left;
    page-break-inside: avoid;
  }

  .mesa-container > div {
    height: auto;
    border: 1px solid #000;
    display: flex;
    flex-direction: column;
  }

  /* Estilos de la cabecera */
  .mesa-container .text-2xl {
    font-size: 20px;
    font-weight: bold;
  }

  .mesa-container .text-xl {
    font-size: 16px;
  }

  /* Estilos para las parejas */
  .nombre-pareja {
    font-size: 13px;
    line-height: 1.2;
  }

  .info-pareja {
    font-size: 12px;
    line-height: 1.2;
  }

  /* Estilos para las líneas numeradas */
  .flex-1 {
    flex: none;
  }

  .h-6 {
    height: 1.5rem;
  }

  /* Contenedor de líneas numeradas */
  .border.border-black.flex-1.p-2 {
    flex: none;
    padding: 0.3rem;
  }

  /* Ajustes de espaciado */
  .p-2 {
    padding: 0.3rem;
  }

  .mb-2 {
    margin-bottom: 0.3rem;
  }

  .mt-2 {
    margin-top: 0.3rem;
  }

  .ml-2 {
    margin-left: 0.3rem;
  }

  /* Bordes */
  .border {
    border: 1px solid #000;
  }

  .border-black {
    border-color: #000;
  }

  /* Línea vertical */
  .absolute {
    position: absolute;
  }

  .w-[1px] {
    width: 1px;
    background-color: #000;
  }

  /* Contenedores */
  .w-1/2 {
    width: 50%;
  }

  .flex {
    display: flex;
  }

  .flex-col {
    flex-direction: column;
  }

  .items-center {
    align-items: center;
  }

  /* Ajustes específicos para asegurar que todo quepa en una página */
  .flex-1 {
    min-height: 0;
  }

  .font-bold {
    font-weight: bold;
  }

  /* Ajuste del contenedor principal para distribución vertical */
  .flex.flex-1.relative {
    flex: none;
    display: flex;
    position: relative;
  }

  /* Columnas */
  .w-1/2 {
    width: 50%;
    display: flex;
    flex-direction: column;
  }

  /* Contenedor de líneas numeradas */
  .border.border-black.flex-1.p-2 {
    flex: none;
    padding: 0.3rem;
  }

  /* Ajustes de espaciado */
  .p-2 {
    padding: 0.3rem;
  }

  .mb-2 {
    margin-bottom: 0.3rem;
  }

  .mt-2 {
    margin-top: 0.3rem;
  }

  /* Asegurar que dos mesas quepan en una página */
  .print-pages {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
  }

  /* Estilos para Total y Firma */
  .border.border-black.p-2.mb-2 {
    padding: 0.3rem;
    height: 3rem; /* Altura para el Total */
    display: flex;
    align-items: center;
  }

  /* Estilo específico para el recuadro de firma */
  .border.border-black.p-2:last-child {
    height: 6.75rem; /* 3 veces la altura actual de 2.25rem */
    display: flex;
    align-items: center;
  }

  /* Ajustes de espaciado para compensar la nueva altura */
  .mt-2 {
    margin-top: 0.25rem;
  }

  .mb-2 {
    margin-bottom: 0.25rem;
  }

  /* Asegurar que el texto esté centrado verticalmente */
  .font-bold {
    font-weight: bold;
    margin: 0;
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