<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Registro de Resultados</h1>
        <h2 class="text-lg text-gray-600">{{ campeonato?.nombre }}</h2>
      </div>
      <div class="text-xl font-semibold text-gray-800">
        Partida {{ campeonato?.partida_actual || 1 }}
      </div>
    </div>

    <!-- Botón de Cerrar Partida o Finalizar Campeonato -->
    <div class="mb-6">
      <button
        v-if="todasLasMesasTienenResultado"
        @click="confirmarCierre"
        :class="[
          'px-4 py-2 rounded-md text-white font-medium',
          esUltimaPartida ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-500 hover:bg-blue-600'
        ]"
      >
        {{ esUltimaPartida ? 'Finalizar Campeonato' : 'Cerrar Partida' }}
      </button>
    </div>

    <!-- Lista de Mesas -->
    <div class="space-y-4">
      <div v-for="mesa in mesas" :key="mesa.id" 
           class="bg-white shadow-lg rounded-lg p-6 flex items-center justify-between">
        <div class="flex-1">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Mesa {{ mesa.id }}</h3>
          <div class="flex items-center justify-between gap-4">
            <div class="flex-1">
              <span class="text-gray-600">{{ mesa.pareja1.id }} - </span>
              <span class="text-gray-900">{{ mesa.pareja1.nombre }}</span>
            </div>
            
            <div class="text-gray-500 font-medium">vs</div>
            
            <div class="flex-1 text-right">
              <span class="text-gray-600">{{ mesa.pareja2.id }} - </span>
              <span class="text-gray-900">{{ mesa.pareja2.nombre }}</span>
            </div>
          </div>
        </div>
        
        <button 
          @click="abrirFormularioResultado(mesa)"
          class="px-4 py-2 rounded-md text-white font-medium bg-orange-500 hover:bg-orange-600"
        >
          Modificar
        </button>
      </div>
    </div>

    <!-- Modal de Registro de Resultado -->
    <div v-if="mostrarModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium leading-6 text-gray-900 mb-4">
            Registro de Resultado - Mesa {{ mesaSeleccionada?.id }}
          </h3>
          <form @submit.prevent="guardarResultado" class="space-y-4">
            <!-- Pareja 1 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ mesaSeleccionada?.pareja1.nombre }}
              </label>
              <input
                v-model.number="resultado.puntos_pareja1"
                type="number"
                required
                min="0"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <!-- Pareja 2 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ mesaSeleccionada?.pareja2.nombre }}
              </label>
              <input
                v-model.number="resultado.puntos_pareja2"
                type="number"
                required
                min="0"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div class="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                @click="cerrarModal"
                class="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded"
              >
                Cancelar
              </button>
              <button
                type="submit"
                class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Guardar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal de Confirmación -->
    <div v-if="mostrarConfirmacion" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium leading-6 text-gray-900 mb-4">
            {{ esUltimaPartida ? 'Finalizar Campeonato' : 'Cerrar Partida' }}
          </h3>
          <p class="text-sm text-gray-500 mb-4">
            {{ esUltimaPartida 
              ? '¿Estás seguro de que deseas finalizar el campeonato? Esta acción no se puede deshacer.'
              : '¿Estás seguro de que deseas cerrar la partida actual?' }}
          </p>
          <div class="flex justify-end space-x-3">
            <button
              @click="mostrarConfirmacion = false"
              class="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded"
            >
              Cancelar
            </button>
            <button
              @click="confirmarAccion"
              :class="[
                'px-4 py-2 rounded-md text-white font-bold',
                esUltimaPartida ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-500 hover:bg-blue-600'
              ]"
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { campeonatoService, mesaService, resultadoService } from '../services/api';

const router = useRouter();
const campeonato = ref(null);
const mesas = ref([]);
const error = ref(null);
const mostrarModal = ref(false);
const mostrarConfirmacion = ref(false);
const mesaSeleccionada = ref(null);
const resultado = ref({
  puntos_pareja1: 0,
  puntos_pareja2: 0
});

const esUltimaPartida = computed(() => {
  return campeonato.value?.partida_actual === campeonato.value?.numero_partidas;
});

const todasLasMesasTienenResultado = computed(() => {
  return mesas.value.every(mesa => mesa.tiene_resultado);
});

const cargarDatos = async () => {
  try {
    // Cargar el campeonato actual
    campeonato.value = await campeonatoService.obtenerActual();
    if (!campeonato.value) {
      error.value = 'No hay campeonato activo';
      return;
    }

    // Cargar las mesas de la partida actual
    const mesasData = await mesaService.listar(
      campeonato.value.id,
      campeonato.value.partida_actual
    );

    // Agregar propiedad tiene_resultado
    mesas.value = await Promise.all(mesasData.map(async mesa => {
      const resultados = await resultadoService.obtenerPorMesa(mesa.id);
      return {
        ...mesa,
        tiene_resultado: resultados.length > 0
      };
    }));

  } catch (e) {
    console.error('Error al cargar los datos:', e);
    error.value = 'Error al cargar los datos';
  }
};

const abrirFormularioResultado = async (mesa) => {
  mesaSeleccionada.value = mesa;
  if (mesa.tiene_resultado) {
    const resultados = await resultadoService.obtenerPorMesa(mesa.id);
    resultado.value = {
      puntos_pareja1: resultados[0].puntos,
      puntos_pareja2: resultados[1].puntos
    };
  } else {
    resultado.value = {
      puntos_pareja1: 0,
      puntos_pareja2: 0
    };
  }
  mostrarModal.value = true;
};

const cerrarModal = () => {
  mostrarModal.value = false;
  mesaSeleccionada.value = null;
  resultado.value = {
    puntos_pareja1: 0,
    puntos_pareja2: 0
  };
};

const guardarResultado = async () => {
  try {
    const resultadoData = {
      mesa_id: mesaSeleccionada.value.id,
      pareja1_id: mesaSeleccionada.value.pareja1.id,
      pareja2_id: mesaSeleccionada.value.pareja2.id,
      puntos_pareja1: resultado.value.puntos_pareja1,
      puntos_pareja2: resultado.value.puntos_pareja2,
      partida: campeonato.value.partida_actual,
      campeonato_id: campeonato.value.id
    };

    if (mesaSeleccionada.value.tiene_resultado) {
      await resultadoService.actualizarPorMesa(mesaSeleccionada.value.id, resultadoData);
    } else {
      await resultadoService.crear(resultadoData);
    }

    cerrarModal();
    await cargarDatos();
  } catch (e) {
    console.error('Error al guardar el resultado:', e);
    error.value = 'Error al guardar el resultado';
  }
};

const confirmarCierre = () => {
  mostrarConfirmacion.value = true;
};

const confirmarAccion = async () => {
  try {
    if (esUltimaPartida.value) {
      await campeonatoService.finalizar(campeonato.value.id);
      router.push('/resultados/podium');
    } else {
      await campeonatoService.cerrarPartida(campeonato.value.id);
      await cargarDatos();
    }
    mostrarConfirmacion.value = false;
  } catch (e) {
    console.error('Error al procesar la acción:', e);
    error.value = esUltimaPartida.value 
      ? 'Error al finalizar el campeonato' 
      : 'Error al cerrar la partida';
  }
};

onMounted(cargarDatos);
</script> 