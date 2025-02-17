<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Mensaje de error general -->
    <div v-if="error" class="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
      <span class="block sm:inline">{{ error }}</span>
    </div>

    <!-- Modal de Error -->
    <div v-if="mostrarModalError" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <div class="flex items-center justify-center">
            <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg class="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          <h3 class="text-lg font-medium leading-6 text-gray-900 text-center mt-4">Error</h3>
          <div class="mt-2 px-7 py-3">
            <p class="text-sm text-gray-500 text-center">{{ mensajeError }}</p>
          </div>
          <div class="flex justify-center mt-4">
            <button
              @click="mostrarModalError = false"
              class="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
            >
              Aceptar
            </button>
          </div>
        </div>
      </div>
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
            v-if="campeonato?.partida_actual > 0"
            @click="volverAtras"
            :disabled="hayResultados"
            class="px-4 py-2 bg-amber-500 text-white rounded-lg transition-colors"
            :class="hayResultados ? 'opacity-50 cursor-not-allowed' : 'hover:bg-amber-600'"
          >
            Volver Atrás
          </button>
          <button 
            v-if="campeonato?.partida_actual === 0"
            @click="cerrarInscripcion" 
            class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Cerrar Inscripción
          </button>
          <button 
            v-if="campeonato?.partida_actual === 0"
            @click="nuevaPareja"
            @keyup.enter="nuevaPareja"
            ref="nuevaParejaBtn"
            tabindex="0"
            autofocus
            class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
                :class="{ 'pointer-events-none text-gray-400': campeonato?.partida_actual > 0 }"
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
import { useMesaStore } from '../stores/mesa';
import { resultadoService } from '../services/api';

const router = useRouter();
const parejasStore = useParejasStore();
const campeonatoStore = useCampeonatoStore();
const mesaStore = useMesaStore();

const parejas = ref([]);
const campeonato = ref(null);
const error = ref(null);
const mostrarModalError = ref(false);
const mensajeError = ref('');
const loading = ref(false);
const hayResultados = ref(false);
const nuevaParejaBtn = ref(null);

const verificarResultados = async () => {
  try {
    const resultados = await resultadoService.obtenerResultadosCampeonato(campeonato.value.id);
    hayResultados.value = resultados && resultados.length > 0;
  } catch (e) {
    console.error('Error al verificar resultados:', e);
    hayResultados.value = false;
  }
};

const cargarDatos = async () => {
  try {
    const campeonatoActual = await campeonatoStore.obtenerActual();
    campeonato.value = campeonatoActual;
    if (campeonatoActual) {
      parejas.value = await parejasStore.obtenerParejas(campeonatoActual.id);
      if (campeonatoActual.partida_actual > 0) {
        try {
          await verificarResultados();
        } catch (e) {
          console.error('Error al verificar resultados:', e);
        }
      } else {
        // Si estamos en partida 0, establecer el foco después de cargar los datos
        setTimeout(() => {
          if (nuevaParejaBtn.value) {
            nuevaParejaBtn.value.focus();
          }
        }, 100);
      }
    }
  } catch (e) {
    console.error('Error al cargar los datos:', e);
    error.value = 'Error al cargar los datos';
  }
};

const nuevaPareja = () => {
  router.push('/parejas/nueva');
};

const volverAtras = async () => {
  try {
    loading.value = true;
    await mesaStore.eliminarMesas(campeonato.value.id);
    await campeonatoStore.reiniciarCampeonato(campeonato.value.id);
    loading.value = false;
    await cargarDatos();
  } catch (error) {
    loading.value = false;
    mensajeError.value = 'Error al eliminar las mesas y reiniciar el campeonato. Por favor, inténtelo de nuevo.';
    mostrarModalError.value = true;
  }
};

const cerrarInscripcion = async () => {
  try {
    // Verificar número mínimo de parejas activas
    const parejasActivas = parejas.value.filter(p => p.activa);
    if (parejasActivas.length < 4) {
      mensajeError.value = 'Se necesitan al menos 4 parejas activas para cerrar la inscripción';
      mostrarModalError.value = true;
      return;
    }

    // Confirmar con el usuario
    if (!confirm('¿Está seguro de que desea cerrar la inscripción? Esta acción creará las mesas iniciales por sorteo.')) {
      return;
    }

    // Cerrar inscripción y crear mesas iniciales
    await campeonatoStore.cerrarInscripcion(campeonato.value.id);
    // Redirigir inmediatamente después de cerrar inscripción
    router.push('/mesas/asignacion');
  } catch (e) {
    console.error('Error al cerrar la inscripción:', e);
    mensajeError.value = 'Error al cerrar la inscripción';
    mostrarModalError.value = true;
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
  if (campeonato.value?.partida_actual > 0) return;
  router.push(`/parejas/${pareja.id}/editar`);
};

onMounted(async () => {
  await cargarDatos();
});
</script> 