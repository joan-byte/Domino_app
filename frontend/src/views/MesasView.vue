<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="md:flex md:items-center md:justify-between">
      <div class="min-w-0 flex-1">
        <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          Mesas - Partida {{ campeonato?.partida_actual || 0 }}
        </h2>
      </div>
      <div class="mt-4 flex md:ml-4 md:mt-0">
        <button
          v-if="campeonato?.partida_actual === 0 && parejas.length >= 4"
          @click="crearMesasPorSorteo"
          class="btn btn-primary"
        >
          Cerrar Inscripción y Sortear
        </button>
        <button
          v-if="puedeCrearNuevaRonda"
          @click="crearMesasPorRanking"
          class="btn btn-primary ml-3"
        >
          Cerrar Partida y Crear Nueva Ronda
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
      <p class="mt-2 text-sm text-gray-500">Cargando...</p>
    </div>

    <!-- Error State -->
    <div v-if="error" class="rounded-md bg-red-50 p-4">
      <div class="flex">
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">Error</h3>
          <div class="mt-2 text-sm text-red-700">
            <p>{{ error }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- No hay mesas -->
    <div v-if="!loading && !mesas.length" class="text-center py-12">
      <svg
        class="mx-auto h-12 w-12 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V7a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">No hay mesas asignadas</h3>
      <p class="mt-1 text-sm text-gray-500">
        {{ getMensajeNoMesas }}
      </p>
    </div>

    <!-- Grid de Mesas -->
    <div v-else class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <MesaCard
        v-for="mesa in mesas"
        :key="mesa.id"
        :mesa="mesa"
        :pareja1="getParejaById(mesa.pareja1_id)"
        :pareja2="getParejaById(mesa.pareja2_id)"
        @registrar-resultado="registrarResultado"
        @ver-resultado="verResultado"
      />
    </div>

    <!-- Modal de Resultados -->
    <div v-if="showResultadosModal" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
      <div class="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium text-gray-900">
            {{ modalMode === 'registrar' ? 'Registrar Resultado' : 'Ver Resultado' }}
          </h3>
          <button
            @click="showResultadosModal = false"
            class="text-gray-400 hover:text-gray-500"
          >
            <span class="sr-only">Cerrar</span>
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Formulario de Resultados -->
        <ResultadoForm
          v-if="mesaSeleccionada"
          :mesa="mesaSeleccionada"
          :pareja1="getParejaById(mesaSeleccionada.pareja1_id)"
          :pareja2="getParejaById(mesaSeleccionada.pareja2_id)"
          :partida="campeonato?.partida_actual"
          :resultados-iniciales="mesaSeleccionada.resultados || []"
          @guardar="guardarResultadoForm"
          @cancelar="showResultadosModal = false"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useCampeonatoStore } from '../stores/campeonato';
import { useParejaStore } from '../stores/pareja';
import { useMesaStore } from '../stores/mesa';
import { useResultadoStore } from '../stores/resultado';
import MesaCard from '../components/MesaCard.vue';
import ResultadoForm from '../components/ResultadoForm.vue';

// Stores
const campeonatoStore = useCampeonatoStore();
const parejaStore = useParejaStore();
const mesaStore = useMesaStore();
const resultadoStore = useResultadoStore();

// Referencias a los stores
const { campeonato } = storeToRefs(campeonatoStore);
const { parejas } = storeToRefs(parejaStore);
const { mesas, loading, error } = storeToRefs(mesaStore);

// Estado local
const showResultadosModal = ref(false);
const modalMode = ref('registrar'); // 'registrar' o 'ver'
const mesaSeleccionada = ref(null);

// Computed
const puedeCrearNuevaRonda = computed(() => {
  if (!campeonato.value) return false;
  return mesaStore.puedeCrearSiguienteRonda(campeonato.value);
});

const getMensajeNoMesas = computed(() => {
  if (campeonato.value?.partida_actual === 0) {
    return 'Cierra la inscripción para crear las mesas por sorteo.';
  }
  return 'Las mesas se crearán automáticamente al cerrar la partida actual.';
});

const resultadosValidos = computed(() => {
  if (!resultadosActualizados.value.length) return false;
  const [r1, r2] = resultadosActualizados.value;
  return r1.rp !== r2.rp && 
         r1.rp >= 0 && r1.rp <= 300 && 
         r2.rp >= 0 && r2.rp <= 300;
});

// Métodos
const getParejaById = (id) => {
  return parejas.value.find(p => p.id === id);
};

async function crearMesasPorSorteo() {
  if (!mesaStore.puedeCrearMesas(parejas.value)) return;
  
  const success = await mesaStore.crearMesasPorSorteo(campeonato.value.id);
  if (success) {
    await campeonatoStore.fetchCampeonatoActual();
  }
}

async function crearMesasPorRanking() {
  const success = await mesaStore.crearMesasPorRanking(campeonato.value.id);
  if (success) {
    await campeonatoStore.fetchCampeonatoActual();
  }
}

function registrarResultado(mesa) {
  console.log('Registrando resultado para mesa:', mesa);
  mesaSeleccionada.value = mesa;
  modalMode.value = 'registrar';
  showResultadosModal.value = true;
}

function verResultado(mesa) {
  mesaSeleccionada.value = mesa;
  modalMode.value = 'ver';
  showResultadosModal.value = true;
}

async function guardarResultadoForm(resultado1, resultado2 = null) {
  console.log('Guardando resultados:', { resultado1, resultado2 });
  try {
    const success = await resultadoStore.crearResultados(resultado1, resultado2);
    
    if (success) {
      await mesaStore.fetchMesas(campeonato.value.id, campeonato.value.partida_actual);
      showResultadosModal.value = false;
    }
  } catch (error) {
    console.error('Error al guardar el resultado:', error);
  }
}

// Lifecycle
onMounted(async () => {
  if (campeonato.value) {
    await mesaStore.fetchMesas(campeonato.value.id, campeonato.value.partida_actual);
    await parejaStore.fetchParejas(campeonato.value.id);
  }
});
</script> 