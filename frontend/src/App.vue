<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { campeonatoService, mesaService, parejaService, resultadoService } from './services/api'

const route = useRoute()
const showMesasMenu = ref(false)
const showResultadosMenu = ref(false)
let closeTimeout = null

// Referencias para los datos
const campeonato = ref(null)
const parejasMesas = ref([])
const resultados = ref([])
const ranking = ref([])

// Computed property para las mesas que se van a imprimir
const mesasParaImprimir = ref([])

// Función para cargar los datos necesarios para la impresión
const cargarDatosImpresion = async () => {
  try {
    // Obtener el campeonato actual
    campeonato.value = await campeonatoService.obtenerActual();
    if (!campeonato.value) {
      console.error('No hay campeonato activo');
      return;
    }

    // 1. Obtener las mesas y el ranking
    const [mesas, rankingData] = await Promise.all([
      mesaService.obtenerMesas(campeonato.value.id, campeonato.value.partida_actual),
      resultadoService.obtenerRanking(campeonato.value.id)
    ]);

    console.log('Mesas asignadas:', mesas);
    console.log('Datos del ranking:', rankingData);

    // 2. Crear un mapa del ranking para búsqueda rápida por id de pareja
    // El ranking ya viene ordenado del backend según los criterios:
    // 1. GB (grupo A o B)
    // 2. PG (partidas ganadas)
    // 3. PP (puntos parciales)
    // 4. RT (resultado total)
    // 5. MG (manos ganadas)
    const rankingMap = new Map();
    rankingData.forEach((r, index) => {
      rankingMap.set(r.pareja_id, {
        ...r,
        posicion: index + 1 // Guardamos la posición basada en el orden del ranking
      });
    });

    // 3. Crear las mesas para imprimir
    mesasParaImprimir.value = mesas.map(mesa => {
      // Obtener datos del ranking para cada pareja
      const rankingPareja1 = rankingMap.get(mesa.pareja1_id);
      const rankingPareja2 = rankingMap.get(mesa.pareja2_id);

      console.log(`Mesa ${mesa.id}:`, {
        pareja1: { id: mesa.pareja1_id, ranking: rankingPareja1 },
        pareja2: { id: mesa.pareja2_id, ranking: rankingPareja2 }
      });

      return {
        id: mesa.id,
        pareja1: {
          id: mesa.pareja1_id,
          nombre: rankingPareja1?.nombre || '',
          ranking_posicion: rankingPareja1?.posicion || '-',
          partidas_ganadas: rankingPareja1?.pg || 0,
          diferencia: rankingPareja1?.pp || 0
        },
        pareja2: {
          id: mesa.pareja2_id,
          nombre: rankingPareja2?.nombre || '',
          ranking_posicion: rankingPareja2?.posicion || '-',
          partidas_ganadas: rankingPareja2?.pg || 0,
          diferencia: rankingPareja2?.pp || 0
        }
      };
    }).sort((a, b) => Number(a.id) - Number(b.id));

    console.log('Mesas preparadas para imprimir:', mesasParaImprimir.value);

  } catch (error) {
    console.error('Error al cargar datos para impresión:', error);
  }
};

// Función para imprimir las mesas
const imprimir = async () => {
  await cargarDatosImpresion();
  window.print();
};

const closeMenus = (e) => {
  const mesasButton = document.getElementById('mesas-menu-button')
  const mesasDropdown = document.getElementById('mesas-dropdown')
  const resultadosButton = document.getElementById('resultados-menu-button')
  const resultadosDropdown = document.getElementById('resultados-dropdown')

  if (mesasButton && mesasDropdown) {
    if (!mesasButton.contains(e.target) && !mesasDropdown.contains(e.target)) {
      // Cerrar con retraso
      closeTimeout = setTimeout(() => {
        showMesasMenu.value = false
      }, 200)
    }
  }

  if (resultadosButton && resultadosDropdown) {
    if (!resultadosButton.contains(e.target) && !resultadosDropdown.contains(e.target)) {
      // Cerrar con retraso
      closeTimeout = setTimeout(() => {
        showResultadosMenu.value = false
      }, 200)
    }
  }
}

const clearCloseTimeout = () => {
  if (closeTimeout) {
    clearTimeout(closeTimeout)
    closeTimeout = null
  }
}

onMounted(() => {
  document.addEventListener('click', closeMenus)
})

onUnmounted(() => {
  document.removeEventListener('click', closeMenus)
  clearCloseTimeout()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navegación Horizontal -->
    <nav class="bg-white shadow-sm fixed w-full z-10">
      <div class="max-w-7xl mx-auto px-4">
        <div class="flex justify-between h-16">
          <!-- Logo y enlaces izquierdos -->
          <div class="flex">
            <div class="flex-shrink-0 flex items-center">
              <h1 class="text-xl font-bold text-gray-900">Domino App</h1>
            </div>
            <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
              <router-link 
                to="/" 
                class="inline-flex items-center px-1 pt-1 text-gray-700 hover:text-gray-900"
                :class="{ 'border-b-2 border-gray-900': $route.path === '/' }"
              >
                Inicio
              </router-link>
            </div>
          </div>

          <!-- Enlaces derechos -->
          <div class="hidden sm:ml-6 sm:flex sm:items-center">
            <router-link 
              to="/parejas" 
              class="inline-flex items-center px-1 pt-1 text-gray-700 hover:text-gray-900 mr-16"
              :class="{ 'border-b-2 border-gray-900': $route.path.startsWith('/parejas') }"
            >
              Parejas
            </router-link>

            <!-- Menú desplegable de Mesas -->
            <div class="relative mr-16">
              <button 
                id="mesas-menu-button"
                @click="showMesasMenu = !showMesasMenu"
                @mouseenter="showMesasMenu = true"
                class="inline-flex items-center px-1 pt-1 text-gray-700 hover:text-gray-900"
              >
                <span>Mesas</span>
                <svg 
                  class="ml-2 w-5 h-5 transition-transform duration-200"
                  :class="{ 'transform rotate-180': showMesasMenu }"
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div 
                id="mesas-dropdown"
                v-show="showMesasMenu" 
                @mouseenter="clearCloseTimeout"
                @mouseleave="closeMenus"
                class="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5"
              >
                <div class="py-1">
                  <router-link 
                    to="/mesas/asignacion" 
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    :class="{ 'bg-gray-100': $route.path === '/mesas/asignacion' }"
                    @click="showMesasMenu = false"
                  >
                    Asignación
                  </router-link>
                  <router-link 
                    to="/mesas/registro" 
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    :class="{ 'bg-gray-100': $route.path === '/mesas/registro' }"
                    @click="showMesasMenu = false"
                  >
                    Registro
                  </router-link>
                  <router-link 
                    to="/mesas/asignacion" 
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    :class="{ 'bg-gray-100': $route.path === '/mesas/asignacion' }"
                    @click="showMesasMenu = false; imprimir()"
                  >
                    Imprimir
                  </router-link>
                </div>
              </div>
            </div>

            <!-- Menú desplegable de Resultados -->
            <div class="relative">
              <button 
                id="resultados-menu-button"
                @click="showResultadosMenu = !showResultadosMenu"
                @mouseenter="showResultadosMenu = true"
                class="inline-flex items-center px-1 pt-1 text-gray-700 hover:text-gray-900"
              >
                <span>Resultados</span>
                <svg 
                  class="ml-2 w-5 h-5 transition-transform duration-200"
                  :class="{ 'transform rotate-180': showResultadosMenu }"
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div 
                id="resultados-dropdown"
                v-show="showResultadosMenu" 
                @mouseenter="clearCloseTimeout"
                @mouseleave="closeMenus"
                class="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5"
              >
                <div class="py-1">
                  <router-link 
                    to="/resultados" 
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    :class="{ 'bg-gray-100': $route.path === '/resultados' }"
                    @click="showResultadosMenu = false"
                  >
                    Ranking
                  </router-link>
                  <router-link 
                    to="/podium" 
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    :class="{ 'bg-gray-100': $route.path === '/podium' }"
                    @click="showResultadosMenu = false"
                  >
                    Podium
                  </router-link>
                  <router-link 
                    to="/ranking" 
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    :class="{ 'bg-gray-100': $route.path === '/ranking' }"
                    @click="showResultadosMenu = false"
                  >
                    Ranking Completo
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Contenido Principal -->
    <div class="pt-16">
      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <router-view></router-view>
      </main>
    </div>

    <!-- Contenido de impresión -->
    <div class="print-only">
      <template v-for="(mesa, index) in mesasParaImprimir" :key="mesa.id">
        <!-- Crear una nueva página cada dos mesas -->
        <div v-if="index % 2 === 0" class="print-page">
          <div class="mesas-container">
            <!-- Primera mesa -->
            <div class="mesa-wrapper">
              <div class="mesa-container">
                <!-- Contenido de la mesa -->
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
                    <div class="absolute left-1/2 top-0 bottom-0 w-[1px] bg-black"></div>

                    <!-- Columna izquierda -->
                    <div class="w-1/2">
                      <!-- Pareja 1 -->
                      <div class="border border-black p-2">
                        <div class="nombre-pareja">
                          <div class="jugador-linea">
                            <span class="jugador-nombre">{{ mesa.pareja1?.nombre?.split('Y')[0]?.trim() || '' }}</span>
                          </div>
                          <div class="jugador-linea">
                            <span class="jugador-nombre">{{ mesa.pareja1?.nombre?.split('Y')[1]?.trim() || '' }}</span>
                          </div>
                          <div class="jugador-linea">
                            <div class="stats-container">
                              <span>Pos {{ mesa.pareja1?.ranking_posicion || '-' }}</span>
                              <span>PG {{ mesa.pareja1?.partidas_ganadas || 0 }}</span>
                              <span>Dif {{ mesa.pareja1?.diferencia || 0 }}</span>
                            </div>
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
                      <div class="mt-2 flex flex-col" style="flex: 1; min-height: 60px;">
                        <div class="border border-black flex justify-between items-center" style="height: 30px; padding: 0 8px;">
                          <span class="font-bold">Total</span>
                          <span></span>
                        </div>
                        <div class="border border-black border-t-0 flex items-start" style="flex: 1;">
                          <div class="px-2 pt-1">Firma</div>
                        </div>
                      </div>
                    </div>

                    <!-- Columna derecha -->
                    <div class="w-1/2">
                      <!-- Pareja 2 -->
                      <div class="border border-black p-2">
                        <div class="nombre-pareja">
                          <div class="jugador-linea">
                            <span class="jugador-nombre">{{ mesa.pareja2?.nombre?.split('Y')[0]?.trim() || '' }}</span>
                          </div>
                          <div class="jugador-linea">
                            <span class="jugador-nombre">{{ mesa.pareja2?.nombre?.split('Y')[1]?.trim() || '' }}</span>
                          </div>
                          <div class="jugador-linea">
                            <div class="stats-container">
                              <span>Pos {{ mesa.pareja2?.ranking_posicion || '-' }}</span>
                              <span>PG {{ mesa.pareja2?.partidas_ganadas || 0 }}</span>
                              <span>Dif {{ mesa.pareja2?.diferencia || 0 }}</span>
                            </div>
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
                      <div class="mt-2 flex flex-col" style="flex: 1; min-height: 60px;">
                        <div class="border border-black flex justify-between items-center" style="height: 30px; padding: 0 8px;">
                          <span class="font-bold">Total</span>
                          <span></span>
                        </div>
                        <div class="border border-black border-t-0 flex items-start" style="flex: 1;">
                          <div class="px-2 pt-1">Firma</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Segunda mesa (si existe) -->
            <div v-if="index + 1 < mesasParaImprimir.length" class="mesa-wrapper">
              <div class="mesa-container">
                <!-- Contenido de la segunda mesa -->
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
                    <div class="absolute left-1/2 top-0 bottom-0 w-[1px] bg-black"></div>

                    <!-- Columna izquierda -->
                    <div class="w-1/2">
                      <!-- Pareja 1 -->
                      <div class="border border-black p-2">
                        <div class="nombre-pareja">
                          <div class="jugador-linea">
                            <span class="jugador-nombre">{{ mesasParaImprimir[index + 1].pareja1?.nombre?.split('Y')[0]?.trim() || '' }}</span>
                          </div>
                          <div class="jugador-linea">
                            <span class="jugador-nombre">{{ mesasParaImprimir[index + 1].pareja1?.nombre?.split('Y')[1]?.trim() || '' }}</span>
                          </div>
                          <div class="jugador-linea">
                            <div class="stats-container">
                              <span>Pos {{ mesasParaImprimir[index + 1].pareja1?.ranking_posicion || '-' }}</span>
                              <span>PG {{ mesasParaImprimir[index + 1].pareja1?.partidas_ganadas || 0 }}</span>
                              <span>Dif {{ mesasParaImprimir[index + 1].pareja1?.diferencia || 0 }}</span>
                            </div>
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
                      <div class="mt-2 flex flex-col" style="flex: 1; min-height: 60px;">
                        <div class="border border-black flex justify-between items-center" style="height: 30px; padding: 0 8px;">
                          <span class="font-bold">Total</span>
                          <span></span>
                        </div>
                        <div class="border border-black border-t-0 flex items-start" style="flex: 1;">
                          <div class="px-2 pt-1">Firma</div>
                        </div>
                      </div>
                    </div>

                    <!-- Columna derecha -->
                    <div class="w-1/2">
                      <!-- Pareja 2 -->
                      <div class="border border-black p-2">
                        <div class="nombre-pareja">
                          <div class="jugador-linea">
                            <span class="jugador-nombre">{{ mesasParaImprimir[index + 1].pareja2?.nombre?.split('Y')[0]?.trim() || '' }}</span>
                          </div>
                          <div class="jugador-linea">
                            <span class="jugador-nombre">{{ mesasParaImprimir[index + 1].pareja2?.nombre?.split('Y')[1]?.trim() || '' }}</span>
                          </div>
                          <div class="jugador-linea">
                            <div class="stats-container">
                              <span>Pos {{ mesasParaImprimir[index + 1].pareja2?.ranking_posicion || '-' }}</span>
                              <span>PG {{ mesasParaImprimir[index + 1].pareja2?.partidas_ganadas || 0 }}</span>
                              <span>Dif {{ mesasParaImprimir[index + 1].pareja2?.diferencia || 0 }}</span>
                            </div>
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
                      <div class="mt-2 flex flex-col" style="flex: 1; min-height: 60px;">
                        <div class="border border-black flex justify-between items-center" style="height: 30px; padding: 0 8px;">
                          <span class="font-bold">Total</span>
                          <span></span>
                        </div>
                        <div class="border border-black border-t-0 flex items-start" style="flex: 1;">
                          <div class="px-2 pt-1">Firma</div>
                        </div>
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
  </div>
</template>

<style scoped>
.transform {
  transition: transform 0.2s ease-in-out;
}
</style>

<style>
/* Estilos globales para impresión */
@media print {
  /* Ocultar elementos de navegación */
  nav, 
  header, 
  footer, 
  .navbar, 
  .nav-menu,
  .screen-only {
    display: none !important;
  }

  /* Ajustes básicos */
  body {
    margin: 0;
    padding: 0;
    background: white;
  }

  main {
    padding: 0 !important;
    margin: 0 !important;
  }

  .pt-16 {
    padding-top: 0 !important;
  }

  .max-w-7xl {
    max-width: none !important;
  }

  /* Estilos específicos para la impresión de mesas */
  .print-only {
    display: block !important;
  }

  .print-page {
    width: 210mm;
    height: 297mm;
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    page-break-after: always;
    page-break-inside: avoid;
  }

  .mesas-container {
    display: flex;
    justify-content: space-between;
    width: 100%;
    height: 100%;
  }

  .mesa-wrapper {
    flex: 1;
    height: 100%;
    max-width: 50%;
  }

  .mesa-container {
    height: 100%;
    border: 1px solid black;
    display: flex;
    flex-direction: column;
  }

  .border.border-black.h-full.flex.flex-col {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .flex.flex-1.relative {
    flex: 1;
    display: flex;
    position: relative;
  }

  .w-1\/2 {
    width: 50%;
    display: flex;
    flex-direction: column;
  }

  .mt-2.flex.flex-col {
    margin-top: 8px;
    display: flex;
    flex-direction: column;
  }

  .border.border-black.flex.justify-between.items-center,
  .border.border-black.border-t-0.flex.items-center {
    height: 30px;
    display: flex;
    align-items: center;
  }

  .px-2 {
    padding-left: 8px;
    padding-right: 8px;
  }

  .nombre-pareja {
    font-size: 14px;
  }

  .jugador-linea {
    margin-bottom: 4px;
  }

  .stats-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    font-size: 12px;
  }

  .jugador-linea {
    margin-bottom: 4px;
    min-height: 20px;
    display: flex;
    align-items: center;
  }

  .jugador-nombre {
    font-size: 14px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }

  @page {
    size: A4 portrait;
    margin: 0;
  }
}

/* Ocultar contenido de impresión en pantalla */
@media screen {
  .print-only {
    display: none;
  }
}
</style>
