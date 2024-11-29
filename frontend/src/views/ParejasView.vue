<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Mensaje de error -->
    <div v-if="error" class="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
      <span class="block sm:inline">{{ error }}</span>
    </div>

    <!-- Encabezado -->
    <div class="bg-white rounded-lg shadow-sm p-6 mb-8">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">Parejas del Campeonato</h1>
          <p class="text-gray-600 mt-1">{{ campeonato?.nombre }}</p>
        </div>
        <div class="flex gap-4">
          <button 
            @click="cerrarInscripcion" 
            class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Cerrar Inscripción
          </button>
          <button 
            @click="nuevaPareja"
            class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Nueva Pareja
          </button>
        </div>
      </div>
    </div>

    <!-- Lista de Parejas -->
    <div class="bg-white rounded-lg shadow-sm">
      <div class="p-6 border-b border-gray-200">
        <h2 class="text-xl font-semibold text-gray-800">Listado de Parejas Inscritas</h2>
      </div>
      
      <div class="divide-y divide-gray-100">
        <div v-for="pareja in parejas" :key="pareja.id" 
             class="p-6 flex items-center justify-between hover:bg-gray-50">
          <div class="flex items-center gap-6">
            <div class="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-full">
              <span class="text-lg font-semibold text-gray-600">{{ pareja.id }}</span>
            </div>
            <div>
              <h3 
                @click="editarPareja(pareja)"
                class="text-lg font-medium text-blue-500 hover:text-blue-700 cursor-pointer"
              >
                {{ pareja.nombre }}
              </h3>
              <p class="text-gray-500">{{ pareja.club_pertenencia }}</p>
            </div>
          </div>
          
          <div class="flex items-center gap-4">
            <span class="px-3 py-1 text-sm rounded-full" 
                  :class="pareja.activa ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'">
              {{ pareja.activa ? 'Activa' : 'Inactiva' }}
            </span>
            <button 
              @click="toggleEstado(pareja)"
              class="px-4 py-2 text-sm rounded-lg"
              :class="pareja.activa ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-green-500 text-white hover:bg-green-600'"
            >
              {{ pareja.activa ? 'Desactivar' : 'Activar' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useParejasStore } from '../stores/parejas';
import { useCampeonatoStore } from '../stores/campeonato';

const router = useRouter();
const parejasStore = useParejasStore();
const campeonatoStore = useCampeonatoStore();

const parejas = ref([]);
const campeonato = ref(null);
const error = ref(null);

const cargarDatos = async () => {
  try {
    const campeonatoActual = await campeonatoStore.obtenerActual();
    campeonato.value = campeonatoActual;
    if (campeonatoActual) {
      parejas.value = await parejasStore.obtenerParejas(campeonatoActual.id);
    }
  } catch (e) {
    console.error('Error al cargar los datos:', e);
    error.value = 'Error al cargar los datos';
  }
};

const nuevaPareja = () => {
  router.push('/parejas/nueva');
};

const cerrarInscripcion = async () => {
  try {
    await campeonatoStore.cerrarInscripcion(campeonato.value.id);
    await cargarDatos();
  } catch (e) {
    console.error('Error al cerrar la inscripción:', e);
    error.value = 'Error al cerrar la inscripción';
  }
};

const toggleEstado = async (pareja) => {
  try {
    await parejasStore.toggleEstado(pareja.id);
    await cargarDatos();
  } catch (e) {
    console.error('Error al cambiar el estado de la pareja:', e);
    error.value = 'Error al cambiar el estado de la pareja';
  }
};

const editarPareja = (pareja) => {
  router.push(`/parejas/${pareja.id}/editar`);
};

onMounted(() => {
  cargarDatos();
});
</script> 