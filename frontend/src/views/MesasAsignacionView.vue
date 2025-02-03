<template>
  <!-- Contenido normal -->
  <div class="screen-only container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Asignación de Mesas</h1>
        <h2 class="text-lg text-gray-600">{{ campeonato?.nombre || 'Cargando...' }}</h2>
      </div>
      <div class="flex items-center gap-4">
        <div class="text-xl font-semibold text-gray-800">
          Partida {{ campeonato?.partida_actual || 1 }}
        </div>
        <button @click="imprimir" class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg">
          Imprimir
        </button>
      </div>
    </div>

    <!-- Tabla de asignación -->
    <div class="flex-grow flex flex-col">
      <div class="h-[calc(15*2.5rem)] overflow-auto bg-white shadow-lg rounded-lg">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50 sticky top-0">
            <tr>
              <th class="px-0.5 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Número</th>
              <th class="px-0.5 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th class="px-0.5 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Club</th>
              <th class="px-0.5 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mesa</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="(pareja, index) in parejasVisibles" :key="pareja.id" :class="index % 2 === 0 ? 'bg-white' : 'bg-gray-50'">
              <td class="px-0.5 py-2 whitespace-nowrap text-sm text-gray-900">{{ pareja.numero }}</td>
              <td class="px-0.5 py-2 whitespace-nowrap text-sm text-gray-900">{{ pareja.nombre }}</td>
              <td class="px-0.5 py-2 whitespace-nowrap text-sm text-gray-900">{{ pareja.club_pertenencia }}</td>
              <td class="px-0.5 py-2 whitespace-nowrap text-sm text-gray-900">{{ pareja.mesa }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="px-6 py-3 bg-gray-50 text-center text-sm text-gray-600 border-t">
        Página {{ paginaActual + 1 }} de {{ totalPaginas }}
      </div>
    </div>
  </div>

  <!-- Contenido de impresión -->
  <div class="print-only">
    <template v-for="(mesa, index) in mesasParaImprimir" :key="mesa.id">
      <!-- Crear una nueva página cada dos mesas -->
      <div v-if="index % 2 === 0" class="print-page">
        <!-- Primera mesa de la página (siempre a la izquierda) -->
        <div class="mesa-wrapper">
          <div class="mesa-container">
            <!-- Contenido de la mesa actual -->
            <div class="border border-black h-full flex flex-col">
              <!-- Cabecera -->
              <div class="border-b border-black p-4">
                <div class="flex flex-col h-full">
                  <div class="text-left font-bold text-2xl">CAMPEONATO</div>
                  <div class="flex justify-between items-center mt-1">
                    <div class="text-xl">{{ campeonato?.nombre || '' }}</div>
                    <div class="flex gap-8 text-md">
                      <span>Partida {{ campeonato?.partida_actual || '' }}</span>
                      <span>Mesa {{ mesa.id }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Contenedor principal -->
              <div class="flex flex-1 relative">
                <!-- Línea vertical divisoria -->
                <div class="absolute left-1\/2 top-0 bottom-0 w-[1px] bg-black"></div>

                <!-- Columna izquierda -->
                <div class="w-1\/2">
                  <!-- Pareja 1 -->
                  <div class="border border-black p-2">
                    <div class="nombre-pareja">
                      <div class="jugador-linea">
                        <span class="jugador-nombre">{{ mesa.pareja1?.nombre?.split('Y')[0]?.trim() || '' }}</span>
                        <span class="stats">
                          <span>PG</span>
                          <span>{{ mesa.pareja1?.pg || 0 }}</span>
                        </span>
                      </div>
                      <div class="jugador-linea">
                        <span class="jugador-nombre">{{ mesa.pareja1?.nombre?.split('Y')[1]?.trim() || '' }}</span>
                        <span class="stats">
                          <span>PP</span>
                          <span>{{ mesa.pareja1?.pp || 0 }}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Líneas numeradas -->
                  <div class="border border-black flex-1 p-2">
                    <div v-for="i in 15" :key="i" class="flex items-center h-6">
                      <span class="w-4 text-sm">{{ i }}</span>
                      <div class="flex-1 border-b border-black ml-2"></div>
                    </div>
                  </div>
                  
                  <!-- Total y espacio dividido -->
                  <div class="mt-2">
                    <div class="border border-black p-2">
                      <span class="font-bold">Total</span>
                    </div>
                    <div class="espacio-final">
                      <div class="recuadro-firma">Firma</div>
                    </div>
                  </div>
                </div>

                <!-- Columna derecha -->
                <div class="w-1\/2">
                  <!-- Pareja 2 -->
                  <div class="border border-black p-2">
                    <div class="nombre-pareja">
                      <div class="jugador-linea">
                        <span class="jugador-nombre">{{ mesa.pareja2?.nombre?.split('Y')[0]?.trim() || '' }}</span>
                        <span class="stats">
                          <span>PG</span>
                          <span>{{ mesa.pareja2?.pg || 0 }}</span>
                        </span>
                      </div>
                      <div class="jugador-linea">
                        <span class="jugador-nombre">{{ mesa.pareja2?.nombre?.split('Y')[1]?.trim() || '' }}</span>
                        <span class="stats">
                          <span>PP</span>
                          <span>{{ mesa.pareja2?.pp || 0 }}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Líneas numeradas -->
                  <div class="border border-black flex-1 p-2">
                    <div v-for="i in 15" :key="i" class="flex items-center h-6">
                      <span class="w-4 text-sm">{{ i }}</span>
                      <div class="flex-1 border-b border-black ml-2"></div>
                    </div>
                  </div>
                  
                  <!-- Total y espacio dividido -->
                  <div class="mt-2">
                    <div class="border border-black p-2">
                      <span class="font-bold">Total</span>
                    </div>
                    <div class="espacio-final">
                      <div class="recuadro-firma">Firma</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Segunda mesa de la página (si existe) -->
        <div v-if="index + 1 < mesasParaImprimir.length" class="mesa-wrapper">
          <div class="mesa-container">
            <!-- Contenido de la siguiente mesa -->
            <div class="border border-black h-full flex flex-col">
              <!-- Cabecera -->
              <div class="border-b border-black p-4">
                <div class="flex flex-col h-full">
                  <div class="text-left font-bold text-2xl">CAMPEONATO</div>
                  <div class="flex justify-between items-center mt-1">
                    <div class="text-xl">{{ campeonato?.nombre || '' }}</div>
                    <div class="flex gap-8 text-md">
                      <span>Partida {{ campeonato?.partida_actual || '' }}</span>
                      <span>Mesa {{ mesasParaImprimir[index + 1].id }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Contenedor principal -->
              <div class="flex flex-1 relative">
                <!-- Línea vertical divisoria -->
                <div class="absolute left-1\/2 top-0 bottom-0 w-[1px] bg-black"></div>

                <!-- Columna izquierda -->
                <div class="w-1\/2">
                  <!-- Pareja 1 -->
                  <div class="border border-black p-2">
                    <div class="nombre-pareja">
                      <div class="jugador-linea">
                        <span class="jugador-nombre">{{ mesasParaImprimir[index + 1].pareja1?.nombre?.split('Y')[0]?.trim() || '' }}</span>
                        <span class="stats">
                          <span>PG</span>
                          <span>{{ mesasParaImprimir[index + 1].pareja1?.pg || 0 }}</span>
                        </span>
                      </div>
                      <div class="jugador-linea">
                        <span class="jugador-nombre">{{ mesasParaImprimir[index + 1].pareja1?.nombre?.split('Y')[1]?.trim() || '' }}</span>
                        <span class="stats">
                          <span>PP</span>
                          <span>{{ mesasParaImprimir[index + 1].pareja1?.pp || 0 }}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Líneas numeradas -->
                  <div class="border border-black flex-1 p-2">
                    <div v-for="i in 15" :key="i" class="flex items-center h-6">
                      <span class="w-4 text-sm">{{ i }}</span>
                      <div class="flex-1 border-b border-black ml-2"></div>
                    </div>
                  </div>
                  
                  <!-- Total y espacio dividido -->
                  <div class="mt-2">
                    <div class="border border-black p-2">
                      <span class="font-bold">Total</span>
                    </div>
                    <div class="espacio-final">
                      <div class="recuadro-firma">Firma</div>
                    </div>
                  </div>
                </div>

                <!-- Columna derecha -->
                <div class="w-1\/2">
                  <!-- Pareja 2 -->
                  <div class="border border-black p-2">
                    <div class="nombre-pareja">
                      <div class="jugador-linea">
                        <span class="jugador-nombre">{{ mesasParaImprimir[index + 1].pareja2?.nombre?.split('Y')[0]?.trim() || '' }}</span>
                        <span class="stats">
                          <span>PG</span>
                          <span>{{ mesasParaImprimir[index + 1].pareja2?.pg || 0 }}</span>
                        </span>
                      </div>
                      <div class="jugador-linea">
                        <span class="jugador-nombre">{{ mesasParaImprimir[index + 1].pareja2?.nombre?.split('Y')[1]?.trim() || '' }}</span>
                        <span class="stats">
                          <span>PP</span>
                          <span>{{ mesasParaImprimir[index + 1].pareja2?.pp || 0 }}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Líneas numeradas -->
                  <div class="border border-black flex-1 p-2">
                    <div v-for="i in 15" :key="i" class="flex items-center h-6">
                      <span class="w-4 text-sm">{{ i }}</span>
                      <div class="flex-1 border-b border-black ml-2"></div>
                    </div>
                  </div>
                  
                  <!-- Total y espacio dividido -->
                  <div class="mt-2">
                    <div class="border border-black p-2">
                      <span class="font-bold">Total</span>
                    </div>
                    <div class="espacio-final">
                      <div class="recuadro-firma">Firma</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
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

const totalPaginas = computed(() => {
  return Math.ceil(parejasMesas.value.length / PAREJAS_POR_PAGINA);
});

const parejasVisibles = computed(() => {
  const inicio = paginaActual.value * PAREJAS_POR_PAGINA;
  const fin = inicio + PAREJAS_POR_PAGINA;
  return parejasMesas.value.slice(inicio, fin);
});

const cambiarPagina = () => {
  const maxPagina = totalPaginas.value - 1;
  if (paginaActual.value >= maxPagina) {
    paginaActual.value = 0;
  } else {
    paginaActual.value++;
  }
};

const iniciarRotacionPaginas = () => {
  detenerRotacionPaginas();
  if (totalPaginas.value > 1) {
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
  if (!parejasMesas.value?.length || !campeonato.value) return [];
  
  const mesasCompletas = [];
  const mesas = new Map();
  
  // Primero, agrupar las parejas por mesa
  parejasMesas.value.forEach(pareja => {
    if (pareja?.mesa && pareja.mesa !== '-') {
      if (!mesas.has(pareja.mesa)) {
        mesas.set(pareja.mesa, {
          id: pareja.mesa,
          parejas: []
        });
      }
      
      const resultadosPareja = resultados.value?.filter(r => r.pareja_id === pareja.id) || [];
      const pg = resultadosPareja.reduce((sum, r) => sum + (r.pg || 0), 0);
      const pp = resultadosPareja.reduce((sum, r) => sum + (r.pp || 0), 0);
      
      mesas.get(pareja.mesa).parejas.push({
        nombre: pareja.nombre || '',
        pg: pg,
        pp: pp
      });
    }
  });

  // Filtrar solo las mesas con exactamente 2 parejas
  mesas.forEach((mesa, id) => {
    if (mesa.parejas.length === 2) {
      mesasCompletas.push({
        id: id,
        pareja1: mesa.parejas[0],
        pareja2: mesa.parejas[1]
      });
    }
  });

  // Ordenar por número de mesa
  return mesasCompletas.sort((a, b) => Number(a.id) - Number(b.id));
});

const cargarDatos = async () => {
  try {
    campeonato.value = await campeonatoService.obtenerActual();
    if (!campeonato.value) {
      error.value = 'No hay campeonato activo';
      return;
    }

    const parejas = await parejaService.obtenerParejas(campeonato.value.id);
    const mesas = await mesaService.obtenerMesas(
      campeonato.value.id,
      campeonato.value.partida_actual
    );
    const resultadosData = await resultadoService.obtenerResultadosCampeonato(campeonato.value.id);
    resultados.value = resultadosData;

    const mesaPorPareja = new Map();
    mesas.forEach(mesa => {
      if (mesa.pareja1_id) mesaPorPareja.set(mesa.pareja1_id, mesa.id);
      if (mesa.pareja2_id) mesaPorPareja.set(mesa.pareja2_id, mesa.id);
    });

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

    paginaActual.value = 0;
    iniciarRotacionPaginas();

  } catch (e) {
    console.error('Error al cargar los datos:', e);
    error.value = 'Error al cargar los datos';
  }
};

const imprimir = () => {
  window.print();
};

onMounted(() => {
  cargarDatos();
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

  /* Ocultar contenido de pantalla */
  .screen-only {
    display: none !important;
  }

  /* Contenedor principal de impresión */
  .print-only {
    display: block !important;
  }

  /* Página de impresión */
  .print-page {
    width: 297mm;
    height: 210mm;
    display: flex;
    justify-content: space-between;
    padding: 15mm 15mm;
    box-sizing: border-box;
    background: white;
    page-break-after: always;
  }

  /* Contenedor de mesa */
  .mesa-wrapper {
    width: 128.5mm;
    height: 180mm;
    background: white;
  }

  /* Contenedor interno de mesa */
  .mesa-container {
    height: 100%;
    width: 128.5mm;
    border: 1px solid #000;
    display: flex;
    flex-direction: column;
  }

  /* Cabecera */
  .border-b.border-black.p-4 {
    border-bottom: 1px solid #000;
    padding: 4mm;
    height: 25mm;
  }

  /* Contenedor principal de las parejas */
  .flex.flex-1.relative {
    display: flex;
    height: calc(100% - 25mm);
    width: 128.5mm;
  }

  /* Mitades izquierda y derecha */
  .w-1\/2 {
    width: 64.25mm;
    min-width: 64.25mm;
    max-width: 64.25mm;
    display: flex;
    flex-direction: column;
  }

  /* Información de pareja */
  .border.border-black.p-2 {
    width: 64.25mm;
    min-width: 64.25mm;
    max-width: 64.25mm;
    border: 1px solid #000;
    padding: 2mm;
    box-sizing: border-box;
  }

  /* Líneas numeradas */
  .border.border-black.flex-1.p-2 {
    width: 64.25mm;
    min-width: 64.25mm;
    max-width: 64.25mm;
    flex: 1;
    border: 1px solid #000;
    padding: 2mm;
    box-sizing: border-box;
  }

  /* Total y espacio final */
  .mt-2 {
    width: 64.25mm;
    min-width: 64.25mm;
    max-width: 64.25mm;
    display: flex;
    flex-direction: column;
    flex: 1;
  }

  .border.border-black.p-2 {
    width: 64.25mm;
    min-width: 64.25mm;
    max-width: 64.25mm;
    border: 1px solid #000;
    padding: 2mm;
    box-sizing: border-box;
  }

  .espacio-final {
    flex: 1;
    display: flex;
    border: 1px solid #000;
    border-top: none;
    min-height: 25mm;
  }

  .recuadro-firma {
    width: 100%;
    height: 100%;
    padding: 2mm;
    font-weight: bold;
  }

  /* Ajustes para PG/PP */
  .jugador-linea {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-right: 4mm;
  }

  .stats {
    flex: 0 0 auto;
    display: flex;
    gap: 3mm;
    margin-left: auto;
  }

  /* Ajustes para nombres largos */
  .jugador-nombre {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: calc(64.25mm - 50pt); /* Ancho total menos espacio para PG/PP */
    display: inline-block;
  }

  .jugador-linea {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-right: 4mm;
    min-height: 16pt;
    max-height: 16pt;
    overflow: hidden;
  }

  .stats {
    flex: 0 0 40pt; /* Ancho fijo para PG/PP */
    display: flex;
    gap: 3mm;
    margin-left: 4mm;
  }

  .nombre-pareja {
    display: flex;
    flex-direction: column;
    gap: 2mm;
  }
}

/* Estilos normales */
.print-only {
  display: none;
}

.screen-only {
  display: block;
}
</style> 