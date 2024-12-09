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

            <!-- Pareja 1 -->
            <div v-if="mesaSeleccionada.pareja1" class="space-y-2">
              <div class="text-lg mb-4">
                {{ mesaSeleccionada.pareja1.id }} - {{ mesaSeleccionada.pareja1.nombre }}
              </div>
              
              <div class="grid grid-cols-3 gap-8">
                <div class="flex flex-col">
                  <label 
                    for="rp_pareja1" 
                    class="block text-sm text-gray-600 h-6"
                  >
                    Resultado Partida (RP)
                  </label>
                  <div v-if="!mesaSeleccionada.pareja2" class="px-3 py-2 bg-gray-100 rounded-md">
                    150
                  </div>
                  <input
                    v-else
                    id="rp_pareja1"
                    name="rp_pareja1"
                    v-model.number="resultado.puntos_pareja1"
                    type="number"
                    required
                    min="0"
                    max="300"
                    @input="() => {
                      if (resultado.puntos_pareja1 > 300) {
                        error = 'Los resultados no pueden ser mayores a 300';
                      } else if (resultado.puntos_pareja1 === resultado.puntos_pareja2 && (resultado.puntos_pareja1 !== 0 || resultado.puntos_pareja2 !== 0)) {
                        error = 'Los resultados no pueden ser iguales';
                      } else {
                        error = '';
                      }
                    }"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    :class="{
                      'border-red-500': resultado.puntos_pareja1 > 300 || 
                        (resultado.puntos_pareja1 === resultado.puntos_pareja2 && (resultado.puntos_pareja1 !== 0 || resultado.puntos_pareja2 !== 0))
                    }"
                  />
                </div>
                <div class="flex flex-col">
                  <span class="block text-sm text-gray-600 h-6">
                    Partidas Ganadas (PG)
                  </span>
                  <div class="px-3 py-2 bg-gray-100 rounded-md">
                    {{ !mesaSeleccionada.pareja2 ? 1 : calculos.pg1 }}
                  </div>
                </div>
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
              
              <div class="grid grid-cols-3 gap-8">
                <div class="flex flex-col">
                  <label 
                    for="rp_pareja2" 
                    class="block text-sm text-gray-600 h-6"
                  >
                    Resultado Partida (RP)
                  </label>
                  <input
                    id="rp_pareja2"
                    name="rp_pareja2"
                    v-model.number="resultado.puntos_pareja2"
                    type="number"
                    required
                    min="0"
                    max="300"
                    @input="() => {
                      if (resultado.puntos_pareja2 > 300) {
                        error = 'Los resultados no pueden ser mayores a 300';
                      } else if (resultado.puntos_pareja2 === resultado.puntos_pareja1 && (resultado.puntos_pareja2 !== 0 || resultado.puntos_pareja1 !== 0)) {
                        error = 'Los resultados no pueden ser iguales';
                      } else {
                        error = '';
                      }
                    }"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    :class="{
                      'border-red-500': resultado.puntos_pareja2 > 300 || 
                        (resultado.puntos_pareja2 === resultado.puntos_pareja1 && (resultado.puntos_pareja2 !== 0 || resultado.puntos_pareja1 !== 0))
                    }"
                  />
                </div>
                <div class="flex flex-col">
                  <span class="block text-sm text-gray-600 h-6">
                    Partidas Ganadas (PG)
                  </span>
                  <div class="px-3 py-2 bg-gray-100 rounded-md">
                    {{ calculos.pg2 }}
                  </div>
                </div>
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

            <div class="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                id="btn_cancelar"
                @click="cerrarModal"
                class="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Cancelar
              </button>
              <button
                type="submit"
                id="btn_guardar"
                class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
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
import { campeonatoService, mesaService, resultadoService } from '../services/api';
import { useRouter } from 'vue-router';

const campeonato = ref(null);
const mesas = ref([]);
const error = ref(null);
const mostrarModal = ref(false);
const mesaSeleccionada = ref(null);
const resultado = ref({
  puntos_pareja1: 0,
  puntos_pareja2: 0
});
const router = useRouter();

const MESAS_POR_PAGINA = 15;
const INTERVALO_CAMBIO = 10000; // 10 segundos

const paginaActual = ref(0);
const intervalId = ref(null);

// Computed properties para los cálculos
const calculos = computed(() => {
  const rp1 = resultado.value.puntos_pareja1;
  const rp2 = resultado.value.puntos_pareja2;

  // Validar límites y empates
  if (rp1 > 300 || rp2 > 300) {
    error.value = 'Los resultados no pueden ser mayores a 300';
    return {
      pg1: 0,
      pg2: 0,
      pp1: 0,
      pp2: 0
    };
  } else if (rp1 === rp2 && rp1 !== 0) {
    error.value = 'Los resultados no pueden ser iguales';
    return {
      pg1: 0,
      pg2: 0,
      pp1: 0,
      pp2: 0
    };
  } else {
    error.value = '';
  }

  return {
    // Partidas Ganadas: 1 para el ganador, 0 para el perdedor
    pg1: rp1 > rp2 ? 1 : 0,
    pg2: rp2 > rp1 ? 1 : 0,
    // Puntos Partida: RP propio - RP contrario
    pp1: rp1 - rp2,  // PP de pareja 1 = RP de pareja 1 - RP de pareja 2
    pp2: rp2 - rp1   // PP de pareja 2 = RP de pareja 2 - RP de pareja 1
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
    // Cargar el campeonato actual
    campeonato.value = await campeonatoService.obtenerActual();
    if (!campeonato.value) {
      error.value = 'No hay campeonato activo';
      return;
    }

    // Cargar las mesas de la partida actual
    const mesasData = await mesaService.obtenerMesas(
      campeonato.value.id,
      campeonato.value.partida_actual
    );

    // Agregar propiedad tiene_resultado
    mesas.value = await Promise.all(mesasData.map(async mesa => {
      try {
        const resultados = await resultadoService.obtenerPorMesa(
          mesa.id,
          campeonato.value.partida_actual
        );
        return {
          ...mesa,
          tiene_resultado: resultados && resultados.length > 0,
          resultados: resultados || []
        };
      } catch (e) {
        console.error(`Error al cargar resultados para mesa ${mesa.id}:`, e);
        return {
          ...mesa,
          tiene_resultado: false,
          resultados: []
        };
      }
    }));

    // Iniciar la rotación de páginas si hay más de MESAS_POR_PAGINA mesas
    iniciarRotacionPaginas();

  } catch (e) {
    console.error('Error al cargar los datos:', e);
    error.value = 'Error al cargar los datos';
  }
};

const validarResultado = () => {
  // Reiniciar mensaje de error
  error.value = '';

  const rp1 = resultado.value.puntos_pareja1;
  const rp2 = resultado.value.puntos_pareja2;

  // Verificar que los valores son números
  if (isNaN(rp1) || isNaN(rp2)) {
    error.value = 'Los resultados deben ser números válidos';
    return false;
  }

  // Verificar que los valores están entre 0 y 300
  if (rp1 < 0 || rp1 > 300 || rp2 < 0 || rp2 > 300) {
    error.value = 'Los resultados deben estar entre 0 y 300';
    return false;
  }

  // Verificar que los valores son diferentes (no hay empate), excepto cuando ambos son 0
  if (rp1 === rp2 && (rp1 !== 0 || rp2 !== 0)) {
    error.value = 'Los resultados no pueden ser iguales';
    return false;
  }

  return true;
};

const abrirFormularioResultado = async (mesa) => {
  mesaSeleccionada.value = mesa;
  
  // Caso especial: Mesa con una sola pareja
  if (!mesa.pareja2) {
    resultado.value = {
      puntos_pareja1: 150,
      puntos_pareja2: 0
    };
  } else if (mesa.tiene_resultado && mesa.resultados.length > 0) {
    resultado.value = {
      puntos_pareja1: mesa.pareja1 ? mesa.resultados[0].rp : 0,
      puntos_pareja2: mesa.pareja2 ? mesa.resultados[1].rp : 0
    };
  } else {
    resultado.value = {
      puntos_pareja1: mesa.pareja1 ? 0 : null,
      puntos_pareja2: mesa.pareja2 ? 0 : null
    };
  }
  mostrarModal.value = true;
  
  // Dar foco al primer campo de entrada después de que el modal se muestre
  setTimeout(() => {
    const primerInput = document.getElementById('rp_pareja1');
    if (primerInput && mesa.pareja2) {
      primerInput.focus();
    }
  }, 100);
};

const cerrarModal = () => {
  mostrarModal.value = false;
  mesaSeleccionada.value = null;
  resultado.value = {
    puntos_pareja1: 0,
    puntos_pareja2: 0
  };
  error.value = null;
};

const guardarResultado = async () => {
  try {
    if (!mesaSeleccionada.value) {
      error.value = 'Datos de mesa incompletos';
      return;
    }

    // Caso especial: Mesa con una sola pareja
    if (!mesaSeleccionada.value.pareja2) {
      const resultado1 = {
        mesa_id: mesaSeleccionada.value.id,
        pareja_id: mesaSeleccionada.value.pareja1.id,
        rp: 150,
        pg: 1,
        pp: 150,
        partida: campeonato.value.partida_actual,
        campeonato_id: campeonato.value.id
      };

      await resultadoService.crear(resultado1);
      cerrarModal();
      await cargarDatos();
      return;
    }

    // Caso normal: Mesa con dos parejas
    if (!validarResultado()) {
      return;
    }

    const resultado1 = {
      mesa_id: mesaSeleccionada.value.id,
      pareja_id: mesaSeleccionada.value.pareja1.id,
      rp: resultado.value.puntos_pareja1,
      partida: campeonato.value.partida_actual,
      campeonato_id: campeonato.value.id
    };

    const resultado2 = {
      mesa_id: mesaSeleccionada.value.id,
      pareja_id: mesaSeleccionada.value.pareja2.id,
      rp: resultado.value.puntos_pareja2,
      partida: campeonato.value.partida_actual,
      campeonato_id: campeonato.value.id
    };

    if (mesaSeleccionada.value.tiene_resultado) {
      await resultadoService.actualizarPorMesa(
        mesaSeleccionada.value.id,
        resultado1,
        resultado2
      );
    } else {
      await resultadoService.crear(resultado1, resultado2);
    }

    cerrarModal();
    await cargarDatos();
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

// Agregar método para cerrar partida
const cerrarPartida = async () => {
  try {
    if (esUltimaPartida.value) {
      router.push('/podium');
      return;
    }
    await mesaService.crearMesasPorRanking(campeonato.value.id);
    await cargarDatos();
    router.push('/mesas/asignacion');
  } catch (e) {
    console.error('Error al cerrar la partida:', e);
    error.value = 'Error al cerrar la partida';
  }
};

const esUltimaPartida = computed(() => {
  return campeonato.value?.partida_actual === campeonato.value?.numero_partidas;
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