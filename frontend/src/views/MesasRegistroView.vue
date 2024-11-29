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

    <!-- Lista de Mesas -->
    <div class="space-y-4">
      <div v-for="mesa in mesas" :key="mesa.id" 
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

    <!-- Modal de Registro de Resultado -->
    <div v-if="mostrarModal && mesaSeleccionada" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium leading-6 text-gray-900 mb-4">
            Registro de Resultado - Mesa {{ mesaSeleccionada.id }}
          </h3>
          <form @submit.prevent="guardarResultado" class="space-y-4">
            <!-- Pareja 1 -->
            <div v-if="mesaSeleccionada.pareja1">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ mesaSeleccionada.pareja1.id }} - {{ mesaSeleccionada.pareja1.nombre }}
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
            <div v-if="mesaSeleccionada.pareja2">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ mesaSeleccionada.pareja2.id }} - {{ mesaSeleccionada.pareja2.nombre }}
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { campeonatoService, mesaService, resultadoService } from '../services/api';

const campeonato = ref(null);
const mesas = ref([]);
const error = ref(null);
const mostrarModal = ref(false);
const mesaSeleccionada = ref(null);
const resultado = ref({
  puntos_pareja1: 0,
  puntos_pareja2: 0
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
    const mesasData = await mesaService.obtenerMesas(
      campeonato.value.id,
      campeonato.value.partida_actual
    );

    // Agregar propiedad tiene_resultado
    mesas.value = await Promise.all(mesasData.map(async mesa => {
      try {
        const resultados = await resultadoService.obtenerPorMesa(mesa.id);
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

  } catch (e) {
    console.error('Error al cargar los datos:', e);
    error.value = 'Error al cargar los datos';
  }
};

const abrirFormularioResultado = async (mesa) => {
  mesaSeleccionada.value = mesa;
  if (mesa.tiene_resultado && mesa.resultados.length > 0) {
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
    if (!mesaSeleccionada.value) {
      error.value = 'Datos de mesa incompletos';
      return;
    }

    const resultadoData = {
      resultado1: mesaSeleccionada.value.pareja1 ? {
        mesa_id: mesaSeleccionada.value.id,
        pareja_id: mesaSeleccionada.value.pareja1.id,
        rp: resultado.value.puntos_pareja1,
        gb: false,
        partida: campeonato.value.partida_actual,
        campeonato_id: campeonato.value.id
      } : null,
      resultado2: mesaSeleccionada.value.pareja2 ? {
        mesa_id: mesaSeleccionada.value.id,
        pareja_id: mesaSeleccionada.value.pareja2.id,
        rp: resultado.value.puntos_pareja2,
        gb: false,
        partida: campeonato.value.partida_actual,
        campeonato_id: campeonato.value.id
      } : null
    };

    if (mesaSeleccionada.value.tiene_resultado) {
      await resultadoService.actualizarPorMesa(mesaSeleccionada.value.id, resultadoData);
    } else {
      await resultadoService.crear(
        resultadoData.resultado1,
        resultadoData.resultado2
      );
    }

    cerrarModal();
    await cargarDatos();
  } catch (e) {
    console.error('Error al guardar el resultado:', e);
    error.value = 'Error al guardar el resultado';
  }
};

onMounted(cargarDatos);
</script> 