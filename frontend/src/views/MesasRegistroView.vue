<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Registro de Resultados</h1>
        <h2 class="text-lg text-gray-600">{{ campeonato?.nombre }}</h2>
      </div>
      <div class="flex items-center gap-4">
        <div class="flex items-center space-x-4">
          <!-- Control de segunda pantalla -->
          <div class="flex items-center space-x-2">
            <button
              @click="toggleSecondScreen('ranking')"
              class="px-4 py-2 text-sm font-medium rounded-md"
              :class="secondScreenView === 'ranking' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'"
            >
              Ranking
            </button>
            <button
              @click="toggleSecondScreen('mesas')"
              class="px-4 py-2 text-sm font-medium rounded-md"
              :class="secondScreenView === 'mesas' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'"
            >
              Mesas
            </button>
          </div>
        </div>
        <div class="text-xl font-semibold text-gray-800">
          Partida {{ campeonato?.partida_actual || 1 }}
        </div>
        <button
          v-if="todasMesasTienenResultado"
          @click="cerrarPartida"
          class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 font-medium"
        >
          {{ esUltimaPartida ? 'Finalizar Campeonato' : 'Cerrar Partida' }}
        </button>
      </div>
    </div>

    <!-- Lista de Mesas -->
    <div class="space-y-8">
      <!-- Grupo A -->
      <div class="space-y-4">
        <h3 class="text-xl font-semibold text-gray-800 mb-4">Grupo A</h3>
        <div v-for="mesa in mesasGrupoA" :key="mesa.id" 
             class="bg-white shadow rounded-lg p-4">
          <div class="grid grid-cols-12 items-center gap-4">
            <!-- Número de Mesa -->
            <div class="col-span-1">
              <span class="text-lg font-medium">Mesa {{ mesa.id }}</span>
            </div>

            <!-- Pareja 1 -->
            <div class="col-span-4">
              <div class="flex justify-end">
                <div class="w-[300px]">
                  <div v-if="mesa.pareja1" class="text-gray-700">
                    {{ mesa.pareja1.id }} - {{ mesa.pareja1.nombre }}
                  </div>
                  <div v-else class="text-gray-400">Descansa</div>
                </div>
              </div>
            </div>

            <!-- VS -->
            <div class="col-span-2 text-center">
              <span class="text-gray-500 font-medium">vs</span>
            </div>

            <!-- Pareja 2 -->
            <div class="col-span-4">
              <div class="flex justify-start">
                <div class="w-[300px]">
                  <div v-if="mesa.pareja2" class="text-gray-700">
                    {{ mesa.pareja2.id }} - {{ mesa.pareja2.nombre }}
                  </div>
                  <div v-else class="text-gray-400">Descansa</div>
                </div>
              </div>
            </div>

            <!-- Botón -->
            <div class="col-span-1 text-right">
              <button 
                v-if="mesa.pareja1 || mesa.pareja2"
                @click="abrirFormularioResultado(mesa)"
                class="px-4 py-2 rounded text-white font-medium min-w-[100px]"
                :class="mesa.tiene_resultado ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-500 hover:bg-blue-600'"
              >
                {{ mesa.tiene_resultado ? 'Modificar' : 'Registrar' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Grupo B -->
      <div v-if="mesasGrupoB.length > 0" class="space-y-4">
        <h3 class="text-xl font-semibold text-gray-800 mb-4">
          Grupo B
          <span class="ml-2 px-2 py-1 text-sm bg-yellow-100 text-yellow-800 rounded">GB</span>
        </h3>
        <div v-for="mesa in mesasGrupoB" :key="mesa.id" 
             class="bg-white shadow rounded-lg p-4 border-l-4 border-yellow-400">
          <div class="grid grid-cols-12 items-center gap-4">
            <!-- Número de Mesa -->
            <div class="col-span-1">
              <span class="text-lg font-medium">Mesa {{ mesa.id }}</span>
            </div>

            <!-- Pareja 1 -->
            <div class="col-span-4">
              <div class="flex justify-end">
                <div class="w-[300px]">
                  <div v-if="mesa.pareja1" class="text-gray-700 flex items-center justify-end">
                    <span>{{ mesa.pareja1.id }} - {{ mesa.pareja1.nombre }}</span>
                    <span v-if="mesa.pareja1.gb" class="ml-2 px-1.5 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded">GB</span>
                  </div>
                  <div v-else class="text-gray-400">Descansa</div>
                </div>
              </div>
            </div>

            <!-- VS -->
            <div class="col-span-2 text-center">
              <span class="text-gray-500 font-medium">vs</span>
            </div>

            <!-- Pareja 2 -->
            <div class="col-span-4">
              <div class="flex justify-start">
                <div class="w-[300px]">
                  <div v-if="mesa.pareja2" class="text-gray-700 flex items-center">
                    <span>{{ mesa.pareja2.id }} - {{ mesa.pareja2.nombre }}</span>
                    <span v-if="mesa.pareja2.gb" class="ml-2 px-1.5 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded">GB</span>
                  </div>
                  <div v-else class="text-gray-400">Descansa</div>
                </div>
              </div>
            </div>

            <!-- Botón -->
            <div class="col-span-1 text-right">
              <button 
                v-if="mesa.pareja1 || mesa.pareja2"
                @click="abrirFormularioResultado(mesa)"
                class="px-4 py-2 rounded text-white font-medium min-w-[100px]"
                :class="mesa.tiene_resultado ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-500 hover:bg-blue-600'"
              >
                {{ mesa.tiene_resultado ? 'Modificar' : 'Registrar' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Registro de Resultado -->
    <div v-if="mostrarModal && mesaSeleccionada" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div class="relative top-20 mx-auto p-5 border w-[800px] shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-xl font-semibold text-gray-900 mb-6">
            Registro de Resultado - Mesa {{ mesaSeleccionada.id }} - Partida {{ campeonato?.partida_actual }}
          </h3>

          <form @submit.prevent="guardarResultado" class="space-y-6" id="formResultado">
            <!-- Mensaje de error -->
            <div v-if="error" class="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
              <div class="flex">
                <div class="flex-shrink-0">
                  <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div class="ml-3">
                  <p class="text-sm text-red-700">
                    {{ error }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Alerta de RT superiores a PM -->
            <div v-if="ambosRTSuperanPM" class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
              <div class="flex">
                <div class="flex-shrink-0">
                  <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div class="ml-3">
                  <p class="text-sm text-yellow-700">
                    ¡Atención! Los resultados totales (RT) de ambas parejas no pueden ser superiores a {{ campeonato?.pm || 350 }} puntos.
                  </p>
                </div>
              </div>
            </div>

            <!-- Pareja 1 -->
            <div v-if="mesaSeleccionada.pareja1" class="space-y-2">
              <div class="text-lg mb-4">
                {{ mesaSeleccionada.pareja1.id }} - {{ mesaSeleccionada.pareja1.nombre }}
              </div>
              
              <div class="grid grid-cols-5 gap-4">
                <!-- Resultado Total (RT) -->
                <div class="flex flex-col">
                  <label 
                    :for="!mesaSeleccionada.pareja2 ? 'rt_pareja1_display' : 'rt_pareja1'" 
                    class="block text-sm text-gray-600 h-6"
                  >
                    Resultado Total (RT)
                  </label>
                  <div v-if="!mesaSeleccionada.pareja2" id="rt_pareja1_display" aria-labelledby="rt_label_pareja1" class="px-3 py-2 bg-gray-100 rounded-md">
                    150
                  </div>
                  <input
                    v-else
                    id="rt_pareja1"
                    name="rt_pareja1"
                    :value="resultadoMostrado.rt_pareja1"
                    @input="e => resultado.rt_pareja1 = Number(e.target.value)"
                    type="number"
                    required
                    min="0"
                    :readonly="!mesaSeleccionada?.pareja2"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <!-- Manos Ganadas (MG) -->
                <div class="flex flex-col">
                  <label 
                    :for="!mesaSeleccionada.pareja2 ? 'mg_pareja1_display' : 'mg_pareja1'" 
                    class="block text-sm text-gray-600 h-6"
                  >
                    Manos Ganadas (MG)
                  </label>
                  <div v-if="!mesaSeleccionada.pareja2" id="mg_pareja1_display" aria-labelledby="mg_label_pareja1" class="px-3 py-2 bg-gray-100 rounded-md">
                    5
                  </div>
                  <input
                    v-else
                    id="mg_pareja1"
                    name="mg_pareja1"
                    v-model.number="resultado.mg_pareja1"
                    type="number"
                    required
                    min="0"
                    :readonly="!mesaSeleccionada?.pareja2"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <!-- Resultado Partida (RP) -->
                <div class="flex flex-col">
                  <span 
                    id="rp_label_pareja1"
                    class="block text-sm text-gray-600 h-6"
                  >
                    Resultado Partida (RP)
                  </span>
                  <div 
                    id="rp_display_pareja1" 
                    aria-labelledby="rp_label_pareja1"
                    class="px-3 py-2 bg-gray-100 rounded-md"
                  >
                    {{ calculos.rp1 }}
                  </div>
                </div>
                
                <!-- Partidas Ganadas (PG) -->
                <div class="flex flex-col">
                  <span 
                    id="pg_label_pareja1"
                    class="block text-sm text-gray-600 h-6"
                  >
                    Partidas Ganadas (PG)
                  </span>
                  <div 
                    id="pg_display_pareja1" 
                    aria-labelledby="pg_label_pareja1"
                    class="px-3 py-2 bg-gray-100 rounded-md"
                  >
                    {{ !mesaSeleccionada.pareja2 ? 1 : calculos.pg1 }}
                  </div>
                </div>
                
                <!-- Puntos Partida (PP) -->
                <div class="flex flex-col">
                  <span 
                    id="pp_label_pareja1"
                    class="block text-sm text-gray-600 h-6"
                  >
                    Diferencia (Dif.)
                  </span>
                  <div 
                    id="pp_display_pareja1" 
                    aria-labelledby="pp_label_pareja1"
                    class="px-3 py-2 bg-gray-100 rounded-md"
                  >
                    {{ !mesaSeleccionada.pareja2 ? 150 : calculos.pp1 }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Pareja 2 (solo se muestra si existe) -->
            <div v-if="mesaSeleccionada.pareja2" class="space-y-2">
              <div class="text-lg mb-4">
                {{ mesaSeleccionada.pareja2.id }} - {{ mesaSeleccionada.pareja2.nombre }}
              </div>
              
              <div class="grid grid-cols-5 gap-4">
                <!-- Resultado Total (RT) -->
                <div class="flex flex-col">
                  <label 
                    for="rt_pareja2" 
                    class="block text-sm text-gray-600 h-6"
                  >
                    Resultado Total (RT)
                  </label>
                  <input
                    id="rt_pareja2"
                    name="rt_pareja2"
                    v-model.number="resultado.rt_pareja2"
                    type="number"
                    required
                    min="0"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <!-- Manos Ganadas (MG) -->
                <div class="flex flex-col">
                  <label 
                    for="mg_pareja2" 
                    class="block text-sm text-gray-600 h-6"
                  >
                    Manos Ganadas (MG)
                  </label>
                  <input
                    id="mg_pareja2"
                    name="mg_pareja2"
                    v-model.number="resultado.mg_pareja2"
                    type="number"
                    required
                    min="0"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <!-- Resultado Partida (RP) -->
                <div class="flex flex-col">
                  <span 
                    id="rp_label_pareja2"
                    class="block text-sm text-gray-600 h-6"
                  >
                    Resultado Partida (RP)
                  </span>
                  <div 
                    id="rp_display_pareja2" 
                    aria-labelledby="rp_label_pareja2"
                    class="px-3 py-2 bg-gray-100 rounded-md"
                  >
                    {{ calculos.rp2 }}
                  </div>
                </div>
                
                <!-- Partidas Ganadas (PG) -->
                <div class="flex flex-col">
                  <span 
                    id="pg_label_pareja2"
                    class="block text-sm text-gray-600 h-6"
                  >
                    Partidas Ganadas (PG)
                  </span>
                  <div 
                    id="pg_display_pareja2" 
                    aria-labelledby="pg_label_pareja2"
                    class="px-3 py-2 bg-gray-100 rounded-md"
                  >
                    {{ calculos.pg2 }}
                  </div>
                </div>
                
                <!-- Puntos Partida (PP) -->
                <div class="flex flex-col">
                  <span 
                    id="pp_label_pareja2"
                    class="block text-sm text-gray-600 h-6"
                  >
                    Diferencia (Dif.)
                  </span>
                  <div 
                    id="pp_display_pareja2" 
                    aria-labelledby="pp_label_pareja2"
                    class="px-3 py-2 bg-gray-100 rounded-md"
                  >
                    {{ calculos.pp2 }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Botones -->
            <div class="flex justify-end space-x-3 pt-6">
              <button
                type="button"
                @click="cerrarModal"
                class="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                class="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                :disabled="!!error || !esValido"
              >
                Guardar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useCampeonatoStore } from '../stores/campeonato';
import { useMesaStore } from '../stores/mesa';
import { useResultadoStore } from '../stores/resultado';
import { resultadoService } from '../services/api';
import { windowManager } from '../services/windowManager';

const router = useRouter();

// Stores
const campeonatoStore = useCampeonatoStore();
const mesaStore = useMesaStore();
const resultadoStore = useResultadoStore();

// Store refs
const { campeonato } = storeToRefs(campeonatoStore);
const { mesas } = storeToRefs(mesaStore);

// Estado local
const error = ref('');
const mostrarModal = ref(false);
const mesaSeleccionada = ref(null);
const resultado = ref({
  rt_pareja1: 0,
  rt_pareja2: 0,
  mg_pareja1: 0,
  mg_pareja2: 0
});
const secondScreenView = ref('ranking');

// Funciones
const cargarDatos = async () => {
  try {
    // Obtener campeonato actual actualizado
    const campeonatoActual = await campeonatoStore.obtenerActual();
    campeonato.value = campeonatoActual;
    
    if (!campeonato.value) {
      error.value = 'No hay campeonato activo';
      return;
    }

    console.log(`Cargando mesas para campeonato ID: ${campeonato.value.id}, partida: ${campeonato.value.partida_actual}`);
    
    // Cargar las mesas según la partida actual
    const mesasCargadas = await mesaStore.obtenerMesas(campeonato.value.id, campeonato.value.partida_actual);
    console.log(`Mesas cargadas: ${mesasCargadas.length}`);
    
    if (mesasCargadas.length === 0) {
      console.warn('No se encontraron mesas directamente, verificando si hay resultados para reconstruirlas');
      
      // Si no hay mesas, esperar un segundo y volver a intentar
      // Esto es necesario para dar tiempo al backend para reconstruir las mesas desde los resultados
      setTimeout(async () => {
        const mesasRecargadas = await mesaStore.obtenerMesas(campeonato.value.id, campeonato.value.partida_actual);
        console.log(`Mesas recargadas después de espera: ${mesasRecargadas.length}`);
        
        if (mesasRecargadas.length === 0) {
          console.warn('No se pudieron cargar mesas ni siquiera después de reintento');
        }
        
        // Actualizar el ranking siempre, independientemente de si se encontraron mesas o no
        await resultadoStore.obtenerRanking(campeonato.value.id);
      }, 1000);
    } else {
      // Actualizar también el ranking
      await resultadoStore.obtenerRanking(campeonato.value.id);
    }
  } catch (e) {
    console.error('Error al cargar los datos:', e);
    error.value = 'Error al cargar los datos';
  }
};

// Computed properties
const mesasGrupoA = computed(() => {
  console.log('Mesas totales:', mesas.value);
  const mesasA = mesas.value.filter(mesa => {
    console.log('Mesa:', mesa.id, 'Pareja1 GB:', mesa.pareja1?.gb, 'Pareja2 GB:', mesa.pareja2?.gb);
    return mesa.pareja1 && !mesa.pareja1.gb && (!mesa.pareja2 || !mesa.pareja2.gb);
  });
  console.log('Mesas Grupo A:', mesasA);
  return mesasA;
});

const mesasGrupoB = computed(() => {
  const mesasB = mesas.value.filter(mesa => {
    return mesa.pareja1 && mesa.pareja1.gb || (mesa.pareja2 && mesa.pareja2.gb);
  });
  console.log('Mesas Grupo B:', mesasB);
  return mesasB;
});

const todasMesasTienenResultado = computed(() => {
  return mesaStore.todasMesasConResultados();
});

const esUltimaPartida = computed(() => {
  return campeonato.value?.partida_actual === campeonato.value?.numero_partidas;
});

const calculos = computed(() => {
  const rt1 = resultado.value.rt_pareja1;
  const rt2 = resultado.value.rt_pareja2;
  const pm = campeonato.value?.pm || 350;

  // Calcular RP basado en RT y PM
  // RP está limitado por PM
  const rp1 = rt1 > pm ? pm : rt1;
  const rp2 = rt2 > pm ? pm : rt2;

  // Calcular PG basado en RP (no en RT)
  // La pareja que gana es la que tiene mayor RP
  const pg1 = rp1 > rp2 ? 1 : 0;
  const pg2 = rp2 > rp1 ? 1 : 0;

  // Calcular PP basado en RP
  const pp1 = rp1 - rp2;
  const pp2 = rp2 - rp1;

  return {
    rp1,
    rp2,
    pg1,
    pg2,
    pp1,
    pp2
  };
});

const validarResultado = () => {
  // Reiniciar mensaje de error
  error.value = '';

  const rt1 = resultado.value.rt_pareja1;
  const rt2 = resultado.value.rt_pareja2;
  const pm = campeonato.value?.pm ?? 300; // Usar 300 como valor por defecto

  // Verificar que los valores son números
  if (isNaN(rt1) || isNaN(rt2)) {
    error.value = 'Los resultados deben ser números válidos';
    return false;
  }

  // Verificar que los valores son positivos
  if (rt1 < 0 || rt2 < 0) {
    error.value = 'Los resultados no pueden ser negativos';
    return false;
  }

  // Verificar que los valores son diferentes (no hay empate), excepto cuando ambos son 0
  if (rt1 === rt2 && (rt1 !== 0 || rt2 !== 0)) {
    error.value = 'Los resultados no pueden ser iguales';
    return false;
  }

  // Verificar que no ambos RT sean superiores al PM
  if (rt1 > pm && rt2 > pm) {
    error.value = `Los resultados totales (RT) no pueden ser ambos superiores a ${pm} puntos`;
    return false;
  }

  return true;
};

const abrirFormularioResultado = async (mesa) => {
  mesaSeleccionada.value = mesa;
  
  // Caso especial: Mesa con una sola pareja
  if (!mesa.pareja2) {
    resultado.value = {
      rt_pareja1: 150,
      rt_pareja2: 0,
      mg_pareja1: 5,
      mg_pareja2: 0
    };
    mostrarModal.value = true;
    return;
  }

  if (mesa.tiene_resultado) {
    try {
      const resultados = await resultadoStore.obtenerResultadosPorMesa(mesa.id, campeonato.value.partida_actual);
      if (resultados && resultados.length > 0) {
        const res1 = resultados.find(r => r.pareja_id === mesa.pareja1.id);
        const res2 = resultados.find(r => r.pareja_id === mesa.pareja2.id);

        resultado.value = {
          rt_pareja1: res1?.rt || 0,
          rt_pareja2: res2?.rt || 0,
          mg_pareja1: res1?.mg || 0,
          mg_pareja2: res2?.mg || 0
        };
      }
    } catch (e) {
      console.error('Error al cargar resultados:', e);
      error.value = 'Error al cargar los resultados existentes';
    }
  } else {
    resultado.value = {
      rt_pareja1: 0,
      rt_pareja2: 0,
      mg_pareja1: 0,
      mg_pareja2: 0
    };
  }
  mostrarModal.value = true;
  
  // Dar foco al primer campo de entrada después de que el modal se muestre
  setTimeout(() => {
    const primerInput = document.getElementById('rt_pareja1');
    if (primerInput && mesa.pareja2) {
      primerInput.focus();
    }
  }, 100);
};

const cerrarModal = () => {
  mostrarModal.value = false;
  mesaSeleccionada.value = null;
  resultado.value = {
    rt_pareja1: 0,
    rt_pareja2: 0,
    mg_pareja1: 0,
    mg_pareja2: 0
  };
  error.value = null;
};

const calcularResultados = () => {
  if (!mesaSeleccionada.value?.pareja2) {
    resultado.value = {
      rt_pareja1: 150,
      rt_pareja2: 0,
      mg_pareja1: 5,
      mg_pareja2: 0
    };
    return;
  }
};

const guardarResultado = async () => {
  if (!esValido.value) return;

  try {
    const rt1 = resultado.value.rt_pareja1;
    const rt2 = resultado.value.rt_pareja2;
    const pm = campeonato.value?.pm || 350;

    // Límite para RT (MP+129)
    const limitRT = pm + 129;
    
    // RT debe conservar el valor introducido por el usuario, pero con un máximo de MP+129
    const rtFinal1 = rt1 > limitRT ? limitRT : rt1;
    const rtFinal2 = rt2 > limitRT ? limitRT : rt2;
    
    // RP (resultado de la partida) limitado por PM
    const rp1 = rt1 > pm ? pm : rt1;
    const rp2 = rt2 > pm ? pm : rt2;

    // En la primera partida, usamos el orden del sorteo inicial
    const pareja1 = mesaSeleccionada.value.pareja1;
    const pareja2 = mesaSeleccionada.value.pareja2;

    // Determinar qué pareja va primero basado en el orden del sorteo en la primera partida
    let resultado1, resultado2;
    if (campeonato.value?.partida_actual === 1) {
      // La pareja con menor número va primero
      if (pareja1.id < pareja2.id) {
        resultado1 = {
          pareja_id: pareja1.id,
          mesa_id: mesaSeleccionada.value.id,
          partida: campeonato.value.partida_actual,
          campeonato_id: campeonato.value.id,
          rt: rtFinal1, // Usar RT con límite de MP+129
          mg: resultado.value.mg_pareja1,
          rp: rp1,      // RP limitado a MP
          pg: rp1 > rp2 ? 1 : 0,  // PG basado en RP
          pp: rp1 - rp2,
          gb: pareja1.gb || false
        };
        resultado2 = {
          pareja_id: pareja2.id,
          mesa_id: mesaSeleccionada.value.id,
          partida: campeonato.value.partida_actual,
          campeonato_id: campeonato.value.id,
          rt: rtFinal2, // Usar RT con límite de MP+129
          mg: resultado.value.mg_pareja2,
          rp: rp2,      // RP limitado a MP
          pg: rp2 > rp1 ? 1 : 0,  // PG basado en RP
          pp: rp2 - rp1,
          gb: pareja2.gb || false
        };
      } else {
        resultado1 = {
          pareja_id: pareja2.id,
          mesa_id: mesaSeleccionada.value.id,
          partida: campeonato.value.partida_actual,
          campeonato_id: campeonato.value.id,
          rt: rtFinal2, // Usar RT con límite de MP+129
          mg: resultado.value.mg_pareja2,
          rp: rp2,      // RP limitado a MP
          pg: rp2 > rp1 ? 1 : 0,  // PG basado en RP
          pp: rp2 - rp1,
          gb: pareja2.gb || false
        };
        resultado2 = {
          pareja_id: pareja1.id,
          mesa_id: mesaSeleccionada.value.id,
          partida: campeonato.value.partida_actual,
          campeonato_id: campeonato.value.id,
          rt: rtFinal1, // Usar RT con límite de MP+129
          mg: resultado.value.mg_pareja1,
          rp: rp1,      // RP limitado a MP
          pg: rp1 > rp2 ? 1 : 0,  // PG basado en RP
          pp: rp1 - rp2,
          gb: pareja1.gb || false
        };
      }
    } else {
      // Para el resto de partidas, mantener el orden actual
      resultado1 = {
        pareja_id: pareja1.id,
        mesa_id: mesaSeleccionada.value.id,
        partida: campeonato.value.partida_actual,
        campeonato_id: campeonato.value.id,
        rt: rtFinal1, // Usar RT con límite de MP+129
        mg: resultado.value.mg_pareja1,
        rp: rp1,      // RP limitado a MP
        pg: rp1 > rp2 ? 1 : 0,  // PG basado en RP
        pp: rp1 - rp2,
        gb: pareja1.gb || false
      };
      resultado2 = {
        pareja_id: pareja2.id,
        mesa_id: mesaSeleccionada.value.id,
        partida: campeonato.value.partida_actual,
        campeonato_id: campeonato.value.id,
        rt: rtFinal2, // Usar RT con límite de MP+129
        mg: resultado.value.mg_pareja2,
        rp: rp2,      // RP limitado a MP
        pg: rp2 > rp1 ? 1 : 0,  // PG basado en RP
        pp: rp2 - rp1,
        gb: pareja2.gb || false
      };
    }

    if (mesaSeleccionada.value.tiene_resultado) {
      await resultadoService.actualizarPorMesa(mesaSeleccionada.value.id, resultado1, resultado2);
    } else {
      await resultadoStore.crear(resultado1, resultado2);
    }

    await mesaStore.obtenerMesas(campeonato.value.id, campeonato.value.partida_actual);
    await resultadoStore.obtenerRanking(campeonato.value.id);
    cerrarModal();
  } catch (e) {
    console.error('Error al guardar el resultado:', e);
    if (e.response?.data?.detail) {
      error.value = Array.isArray(e.response.data.detail) 
        ? e.response.data.detail[0].msg 
        : e.response.data.detail;
    } else {
      error.value = 'Error al guardar el resultado';
    }
  }
};

const esValido = computed(() => {
  const rt1 = resultado.value.rt_pareja1;
  const rt2 = resultado.value.rt_pareja2;
  const mg1 = resultado.value.mg_pareja1;
  const mg2 = resultado.value.mg_pareja2;
  const pm = campeonato.value?.pm ?? 300; // Usar 300 como valor por defecto

  return (
    rt1 >= 0 && rt2 >= 0 &&
    mg1 >= 0 && mg2 >= 0 &&
    rt1 !== rt2 && // No pueden empatar
    !(rt1 > pm && rt2 > pm) // No pueden ser ambos superiores al PM
  );
});

// Computed property para controlar los valores por defecto
const resultadoMostrado = computed(() => {
  if (mesaSeleccionada.value && !mesaSeleccionada.value.pareja2) {
    return {
      rt_pareja1: 150,
      rt_pareja2: 0,
      mg_pareja1: 5,
      mg_pareja2: 0
    };
  }
  return resultado.value;
});

// Agregar la computed property para la alerta
const ambosRTSuperanPM = computed(() => {
  if (!mesaSeleccionada.value?.pareja2) return false;
  
  const rt1 = resultado.value.rt_pareja1;
  const rt2 = resultado.value.rt_pareja2;
  const pm = campeonato.value?.pm || 350;

  return rt1 > pm && rt2 > pm;
});

// Función para alternar la vista de la segunda pantalla
const toggleSecondScreen = (view) => {
  secondScreenView.value = view;
  const baseUrl = window.location.origin;
  
  if (view === 'ranking') {
    windowManager.openSecondWindow(`${baseUrl}/resultados`, 'Clasificación');
  } else if (view === 'mesas') {
    windowManager.openSecondWindow(`${baseUrl}/mesas/asignacion`, 'Asignación de Mesas');
  } else if (view === 'podium') {
    windowManager.openSecondWindow(`${baseUrl}/podium`, 'Podium del Campeonato');
  }
};

// Cerrar la ventana secundaria cuando se desmonte el componente
onUnmounted(() => {
  // Solo cerrar la ventana si no estamos finalizando el campeonato
  if (!esUltimaPartida.value) {
    windowManager.closeSecondWindow();
  }
});

// Modificar la función cerrarPartida para actualizar la segunda pantalla
const cerrarPartida = async () => {
  try {
    if (esUltimaPartida.value) {
      // Si es la última partida, mostrar el podium en la segunda pantalla
      toggleSecondScreen('podium');
      
      // Guardar en localStorage que estamos mostrando el podium
      localStorage.setItem('showPodium', 'true');
      
      // Redirigir la pantalla principal al home
      router.push('/');
    } else {
      // Crear mesas para la siguiente partida basadas en el ranking
      const success = await mesaStore.crearMesasPorRanking(campeonato.value.id);
      if (success) {
        // Si la segunda pantalla está mostrando el ranking, cambiar a mesas
        if (secondScreenView.value === 'ranking') {
          toggleSecondScreen('mesas');
        }
        
        // Emitir evento personalizado para notificar que se ha cerrado la partida
        console.log('Emitiendo evento partida-cerrada');
        window.dispatchEvent(new CustomEvent('partida-cerrada'));
        
        // Recargar la página automáticamente al pasar a la siguiente partida
        // para asegurar que todos los componentes se actualicen correctamente
        console.log('Recargando página para actualizar el estado de la aplicación...');
        setTimeout(() => {
          window.location.reload();
        }, 500);
      }
    }
  } catch (e) {
    console.error('Error al cerrar la partida:', e);
    error.value = 'Error al cerrar la partida';
  }
};

// Abrir la segunda pantalla con el ranking al montar el componente
onMounted(async () => {
  // Limpiar cualquier estado previo
  mesas.value = [];
  mesaSeleccionada.value = null;
  error.value = null;
  
  // Cargar los datos frescos
  await cargarDatos();
  
  // Iniciar con la vista de ranking en la segunda pantalla
  toggleSecondScreen('ranking');
});
</script> 