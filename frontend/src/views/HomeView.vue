<template>
  <div class="container mx-auto px-4 py-8">
    <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
      <strong class="font-bold">Error: </strong>
      <span class="block sm:inline">{{ error }}</span>
    </div>

    <div v-if="!campeonato && !error" class="text-center py-8">
      <h2 class="text-2xl font-bold mb-4">No hay ningún campeonato activo</h2>
      <p class="text-gray-600 mb-6">Para comenzar, crea un nuevo campeonato</p>
      <button
        @click="mostrarFormularioCreacion"
        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Crear Nuevo Campeonato
      </button>
    </div>

    <div v-if="campeonato" class="bg-white shadow-lg rounded-lg p-6">
      <div class="flex justify-between items-start mb-6">
        <h2 class="text-2xl font-bold">{{ campeonato.nombre }}</h2>
        <div class="space-x-2">
          <button
            @click="mostrarFormularioEdicion"
            class="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded"
          >
            Modificar
          </button>
          <button
            @click="confirmarEliminacion"
            class="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
          >
            Eliminar
          </button>
        </div>
      </div>
      
      <div class="bg-gray-50 p-4 rounded-lg">
        <h3 class="text-lg font-semibold mb-3">Información General</h3>
        <div class="space-y-2">
          <p><span class="font-medium">Fecha de inicio:</span> {{ formatearFecha(campeonato.fecha_inicio) }}</p>
          <p><span class="font-medium">Duración:</span> {{ campeonato.dias_duracion }} días</p>
          <p><span class="font-medium">Número de partidas:</span> {{ campeonato.numero_partidas }}</p>
          <p><span class="font-medium">GB:</span> {{ campeonato.gb ? 'Sí' : 'No' }}</p>
          <p v-if="campeonato.gb"><span class="font-medium">GBP:</span> {{ campeonato.gb_valor }}</p>
          <p><span class="font-medium">PM:</span> {{ campeonato.pm }}</p>
          <p><span class="font-medium">Partida actual:</span> {{ campeonato.partida_actual }}</p>
        </div>
      </div>
    </div>

    <!-- Modal de creación/edición de campeonato -->
    <div v-if="mostrarModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium leading-6 text-gray-900 mb-4">
            {{ modoEdicion ? 'Modificar Campeonato' : 'Crear Nuevo Campeonato' }}
          </h3>
          <form @submit.prevent="modoEdicion ? actualizarCampeonato() : crearCampeonato()" class="space-y-4">
            <div>
              <label for="nombre" class="block text-sm font-medium text-gray-700">Nombre</label>
              <input
                id="nombre"
                name="nombre"
                v-model="nuevoCampeonato.nombre"
                type="text"
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label for="fecha_inicio" class="block text-sm font-medium text-gray-700">Fecha de Inicio</label>
              <input
                id="fecha_inicio"
                name="fecha_inicio"
                v-model="nuevoCampeonato.fecha_inicio"
                type="date"
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label for="dias_duracion" class="block text-sm font-medium text-gray-700">Días de Duración</label>
              <input
                id="dias_duracion"
                name="dias_duracion"
                v-model.number="nuevoCampeonato.dias_duracion"
                type="number"
                required
                min="1"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label for="numero_partidas" class="block text-sm font-medium text-gray-700">Número de Partidas</label>
              <input
                id="numero_partidas"
                name="numero_partidas"
                v-model.number="nuevoCampeonato.numero_partidas"
                type="number"
                required
                min="1"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label for="pm" class="block text-sm font-medium text-gray-700">Puntuación Máxima (PM)</label>
              <input
                id="pm"
                name="pm"
                v-model.number="nuevoCampeonato.pm"
                type="number"
                required
                min="0"
                max="500"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div class="flex items-center">
              <input
                id="gb"
                name="gb"
                type="checkbox"
                v-model="nuevoCampeonato.gb"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label for="gb" class="ml-2 block text-sm text-gray-900">GB</label>
            </div>

            <!-- Campo GBP Valor -->
            <div v-if="nuevoCampeonato.gb">
              <label for="gb_valor" class="block text-sm font-medium text-gray-700">GBP</label>
              <input
                id="gb_valor"
                name="gb_valor"
                v-model.number="nuevoCampeonato.gb_valor"
                type="number"
                required
                min="1"
                max="999"
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
                {{ modoEdicion ? 'Guardar Cambios' : 'Crear' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal de confirmación de eliminación -->
    <div v-if="mostrarConfirmacion" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium leading-6 text-gray-900 mb-4">Confirmar Eliminación</h3>
          <p class="text-sm text-gray-500 mb-4">
            ¿Estás seguro de que deseas eliminar este campeonato? Esta acción no se puede deshacer.
          </p>
          <div class="flex justify-end space-x-3">
            <button
              @click="mostrarConfirmacion = false"
              class="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded"
            >
              Cancelar
            </button>
            <button
              @click="eliminarCampeonato"
              class="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { campeonatoService } from '../services/api';

const router = useRouter();
const campeonato = ref(null);
const error = ref(null);
const mostrarModal = ref(false);
const mostrarConfirmacion = ref(false);
const modoEdicion = ref(false);
const nuevoCampeonato = ref({
  nombre: '',
  fecha_inicio: new Date().toISOString().split('T')[0],
  dias_duracion: 1,
  numero_partidas: 1,
  gb: false,
  gb_valor: null,
  pm: 300
});

const formatearFecha = (fecha) => {
  return new Date(fecha).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const cargarCampeonatoActual = async () => {
  try {
    campeonato.value = await campeonatoService.obtenerActual();
    error.value = null;
  } catch (e) {
    if (e.response?.status === 404) {
      campeonato.value = null;
      error.value = null;
    } else {
      console.error('Error:', e);
      error.value = 'Error al cargar el campeonato';
    }
  }
};

const mostrarFormularioCreacion = () => {
  modoEdicion.value = false;
  mostrarModal.value = true;
  nuevoCampeonato.value = {
    nombre: '',
    fecha_inicio: new Date().toISOString().split('T')[0],
    dias_duracion: 1,
    numero_partidas: 1,
    gb: false,
    gb_valor: null,
    pm: 300
  };
};

const mostrarFormularioEdicion = () => {
  modoEdicion.value = true;
  mostrarModal.value = true;
  nuevoCampeonato.value = {
    nombre: campeonato.value.nombre,
    fecha_inicio: campeonato.value.fecha_inicio,
    dias_duracion: campeonato.value.dias_duracion,
    numero_partidas: campeonato.value.numero_partidas,
    gb: campeonato.value.gb,
    gb_valor: campeonato.value.gb_valor,
    pm: campeonato.value.pm
  };
};

const cerrarModal = () => {
  mostrarModal.value = false;
  modoEdicion.value = false;
  nuevoCampeonato.value = {
    nombre: '',
    fecha_inicio: new Date().toISOString().split('T')[0],
    dias_duracion: 1,
    numero_partidas: 1,
    gb: false,
    gb_valor: null,
    pm: 300
  };
};

const crearCampeonato = async () => {
  try {
    const campeonatoCreado = await campeonatoService.crear(nuevoCampeonato.value);
    cerrarModal();
    await cargarCampeonatoActual();
  } catch (e) {
    console.error('Error al crear el campeonato:', e);
    error.value = e.response?.data?.detail || 'Error al crear el campeonato';
  }
};

const actualizarCampeonato = async () => {
  try {
    await campeonatoService.actualizar(campeonato.value.id, nuevoCampeonato.value);
    cerrarModal();
    await cargarCampeonatoActual();
  } catch (e) {
    console.error('Error al actualizar el campeonato:', e);
    error.value = e.response?.data?.detail || 'Error al actualizar el campeonato';
  }
};

const confirmarEliminacion = () => {
  mostrarConfirmacion.value = true;
};

const eliminarCampeonato = async () => {
  try {
    // Primero limpiamos el localStorage
    localStorage.clear(); // Limpiamos todo el localStorage para asegurarnos
    
    await campeonatoService.eliminar(campeonato.value.id);
    mostrarConfirmacion.value = false;
    campeonato.value = null;
    error.value = null;
    
    // No necesitamos cargar el campeonato actual aquí ya que no debería haber ninguno
    // await cargarCampeonatoActual();
  } catch (e) {
    console.error('Error:', e);
    error.value = 'Error al eliminar el campeonato';
  }
};

const navegarAParejas = () => router.push('/parejas');
const navegarAMesas = () => router.push('/mesas');
const navegarARanking = () => router.push('/ranking');

// Watcher para actualizar gb_valor cuando cambia numero_partidas o gb
watch([() => nuevoCampeonato.value.numero_partidas, () => nuevoCampeonato.value.gb], ([numPartidas, gb]) => {
  if (gb && (!nuevoCampeonato.value.gb_valor || nuevoCampeonato.value.gb_valor === 0)) {
    nuevoCampeonato.value.gb_valor = Math.floor(numPartidas / 2);
  } else if (!gb) {
    nuevoCampeonato.value.gb_valor = null;
  }
});

onMounted(cargarCampeonatoActual);
</script> 