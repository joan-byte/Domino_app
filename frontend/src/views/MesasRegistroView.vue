<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Registro de Resultados</h1>
        <h2 class="text-lg text-gray-600">{{ campeonato?.nombre }}</h2>
      </div>
      <div class="flex items-center gap-4">
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
    <div class="space-y-4">
      <div v-for="mesa in mesasVisibles" :key="mesa.id" 
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

    <!-- Indicador de página -->
    <div class="mt-4 px-6 py-4 bg-gray-50 rounded-lg text-center text-sm text-gray-600">
      Página {{ paginaActual + 1 }} de {{ totalPaginas }}
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
                    ¡Atención! Los resultados totales (RT) de ambas parejas no pueden ser superiores a {{ campeonato?.pm || 300 }} puntos.
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
                    for="rt_pareja1" 
                    class="block text-sm text-gray-600 h-6"
                  >
                    Resultado Total (RT)
                  </label>
                  <div v-if="!mesaSeleccionada.pareja2" class="px-3 py-2 bg-gray-100 rounded-md">
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
                    for="mg_pareja1" 
                    class="block text-sm text-gray-600 h-6"
                  >
                    Manos Ganadas (MG)
                  </label>
                  <div v-if="!mesaSeleccionada.pareja2" class="px-3 py-2 bg-gray-100 rounded-md">
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
                  <span class="block text-sm text-gray-600 h-6">
                    Resultado Partida (RP)
                  </span>
                  <div class="px-3 py-2 bg-gray-100 rounded-md">
                    {{ calculos.rp1 }}
                  </div>
                </div>
                
                <!-- Partidas Ganadas (PG) -->
                <div class="flex flex-col">
                  <span class="block text-sm text-gray-600 h-6">
                    Partidas Ganadas (PG)
                  </span>
                  <div class="px-3 py-2 bg-gray-100 rounded-md">
                    {{ !mesaSeleccionada.pareja2 ? 1 : calculos.pg1 }}
                  </div>
                </div>
                
                <!-- Puntos Partida (PP) -->
                <div class="flex flex-col">
                  <span class="block text-sm text-gray-600 h-6">
                    Puntos Partida (PP)
                  </span>
                  <div class="px-3 py-2 bg-gray-100 rounded-md">
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
                    :readonly="!mesaSeleccionada?.pareja2"
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
                    :readonly="!mesaSeleccionada?.pareja2"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <!-- Resultado Partida (RP) -->
                <div class="flex flex-col">
                  <span class="block text-sm text-gray-600 h-6">
                    Resultado Partida (RP)
                  </span>
                  <div class="px-3 py-2 bg-gray-100 rounded-md">
                    {{ calculos.rp2 }}
                  </div>
                </div>
                
                <!-- Partidas Ganadas (PG) -->
                <div class="flex flex-col">
                  <span class="block text-sm text-gray-600 h-6">
                    Partidas Ganadas (PG)
                  </span>
                  <div class="px-3 py-2 bg-gray-100 rounded-md">
                    {{ calculos.pg2 }}
                  </div>
                </div>
                
                <!-- Puntos Partida (PP) -->
                <div class="flex flex-col">
                  <span class="block text-sm text-gray-600 h-6">
                    Puntos Partida (PP)
                  </span>
                  <div class="px-3 py-2 bg-gray-100 rounded-md">
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

// Constantes
const MESAS_POR_PAGINA = 10;
const INTERVALO_CAMBIO = 10000; // 10 segundos
const paginaActual = ref(0);
const intervalId = ref(null);

// Computed properties para los cálculos
const calculos = computed(() => {
  const rt1 = resultado.value.rt_pareja1;
  const rt2 = resultado.value.rt_pareja2;
  const pm = campeonato.value?.pm || 300;

  // Calcular RP basado en RT y PM
  const rp1 = rt1 > pm ? pm : rt1;
  const rp2 = rt2 > pm ? pm : rt2;

  // Calcular PG
  const pg1 = rt1 > rt2 ? 1 : 0;
  const pg2 = rt2 > rt1 ? 1 : 0;

  // Calcular PP basado en RP (no en RT)
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

// Computed property para verificar si todas las mesas tienen resultados
const todasMesasTienenResultado = computed(() => {
  return mesas.value.length > 0 && mesas.value.every(mesa => mesa.tiene_resultado);
});

// Computed properties para la paginación
const totalPaginas = computed(() => 
  Math.ceil(mesas.value.length / MESAS_POR_PAGINA)
);

const mesasVisibles = computed(() => {
  const inicio = paginaActual.value * MESAS_POR_PAGINA;
  const fin = inicio + MESAS_POR_PAGINA;
  return mesas.value.slice(inicio, fin);
});

// Funciones para la paginación
const cambiarPagina = () => {
  paginaActual.value = (paginaActual.value + 1) % totalPaginas.value;
};

const iniciarRotacionPaginas = () => {
  if (mesas.value.length > MESAS_POR_PAGINA) {
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
    await campeonatoStore.obtenerActual();
    if (!campeonato.value) {
      error.value = 'No hay campeonato activo';
      return;
    }

    await mesaStore.obtenerMesas(campeonato.value.id, campeonato.value.partida_actual);
    iniciarRotacionPaginas();
  } catch (e) {
    console.error('Error al cargar los datos:', e);
    error.value = 'Error al cargar los datos';
  }
};

const validarResultado = () => {
  // Reiniciar mensaje de error
  error.value = '';

  const rt1 = resultado.value.rt_pareja1;
  const rt2 = resultado.value.rt_pareja2;
  const pm = campeonato.value?.pm || 300;

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
    error.value = `Los resultados totales (RT) no pueden ser ambos superiores a ${pm}`;
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
    const resultado1 = {
      pareja_id: mesaSeleccionada.value.pareja1.id,
      mesa_id: mesaSeleccionada.value.id,
      partida: campeonato.value.partida_actual,
      campeonato_id: campeonato.value.id,
      rt: resultado.value.rt_pareja1,
      mg: resultado.value.mg_pareja1,
      rp: calculos.value.rp1,
      pg: calculos.value.pg1,
      pp: calculos.value.pp1,
      gb: mesaSeleccionada.value.pareja1.gb
    };

    let resultado2 = null;
    if (mesaSeleccionada.value.pareja2) {
      resultado2 = {
        pareja_id: mesaSeleccionada.value.pareja2.id,
        mesa_id: mesaSeleccionada.value.id,
        partida: campeonato.value.partida_actual,
        campeonato_id: campeonato.value.id,
        rt: resultado.value.rt_pareja2,
        mg: resultado.value.mg_pareja2,
        rp: calculos.value.rp2,
        pg: calculos.value.pg2,
        pp: calculos.value.pp2,
        gb: mesaSeleccionada.value.pareja2.gb
      };
    }

    if (mesaSeleccionada.value.tiene_resultado) {
      // Usar el servicio directamente para actualizar
      await resultadoService.actualizarPorMesa(mesaSeleccionada.value.id, resultado1, resultado2);
    } else {
      // Crear nuevos resultados
      await resultadoStore.crear(resultado1, resultado2);
    }

    await mesaStore.obtenerMesas(campeonato.value.id, campeonato.value.partida_actual);
    await resultadoStore.obtenerRanking(campeonato.value.id);
    cerrarModal();
  } catch (e) {
    error.value = e.message || 'Error al guardar el resultado';
  }
};

const esUltimaPartida = computed(() => {
  return campeonato.value?.partida_actual === campeonato.value?.numero_partidas;
});

const esValido = computed(() => {
  if (!mesaSeleccionada.value?.pareja2) return true;
  
  const rt1 = resultado.value.rt_pareja1;
  const rt2 = resultado.value.rt_pareja2;
  const mg1 = resultado.value.mg_pareja1;
  const mg2 = resultado.value.mg_pareja2;
  const pm = campeonato.value?.pm || 300;

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
  const pm = campeonato.value?.pm || 300;

  return rt1 > pm && rt2 > pm;
});

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