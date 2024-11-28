<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="md:flex md:items-center md:justify-between">
      <div class="min-w-0 flex-1">
        <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          Parejas
        </h2>
      </div>
      <div class="mt-4 flex md:ml-4 md:mt-0">
        <button
          v-if="campeonato && campeonato.partida_actual === 0"
          @click="showNewParejaModal = true"
          class="btn btn-primary"
        >
          Nueva Pareja
        </button>
        <button
          v-if="parejas.length >= 4 && campeonato?.partida_actual === 0"
          @click="cerrarInscripcion"
          class="ml-3 btn btn-secondary"
        >
          Cerrar Inscripción
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

    <!-- Parejas List -->
    <div class="overflow-hidden bg-white shadow sm:rounded-md">
      <ul role="list" class="divide-y divide-gray-200">
        <li v-for="pareja in parejas" :key="pareja.id" class="px-4 py-4 sm:px-6 hover:bg-gray-50">
          <div class="flex items-center justify-between">
            <div class="flex min-w-0 flex-1 items-center">
              <div class="min-w-0 flex-1 px-4">
                <div class="flex items-center justify-between">
                  <p class="truncate text-sm font-medium text-primary-600">{{ pareja.nombre }}</p>
                  <div class="ml-2 flex flex-shrink-0">
                    <p class="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5"
                       :class="pareja.activa ? 'text-green-800' : 'text-red-800 bg-red-100'">
                      {{ pareja.activa ? 'Activa' : 'Inactiva' }}
                    </p>
                  </div>
                </div>
                <div class="mt-2 flex">
                  <div class="flex items-center text-sm text-gray-500">
                    <span class="truncate">{{ pareja.club_pertenencia }}</span>
                  </div>
                </div>
                <div class="mt-2">
                  <div class="text-sm text-gray-500">
                    <span v-for="(jugador, index) in pareja.jugadores" :key="jugador.id">
                      {{ jugador.nombre }} {{ jugador.apellido }}
                      <span v-if="index === 0"> - </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div class="flex space-x-2">
              <button
                v-if="campeonato?.partida_actual === 0"
                @click="editarPareja(pareja)"
                class="btn btn-secondary"
              >
                Editar
              </button>
              <button
                @click="toggleActiva(pareja.id)"
                class="btn"
                :class="pareja.activa ? 'btn-danger' : 'btn-primary'"
              >
                {{ pareja.activa ? 'Desactivar' : 'Activar' }}
              </button>
            </div>
          </div>
        </li>
      </ul>
    </div>

    <!-- New/Edit Pareja Modal -->
    <div v-if="showNewParejaModal || showEditParejaModal" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
      <div class="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 class="text-lg font-medium text-gray-900">
          {{ showEditParejaModal ? 'Editar Pareja' : 'Nueva Pareja' }}
        </h3>
        <form @submit.prevent="submitPareja" class="mt-4 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Nombre de la Pareja</label>
            <input
              v-model="parejaForm.nombre"
              type="text"
              required
              class="input mt-1 block w-full"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Club de Pertenencia</label>
            <input
              v-model="parejaForm.club_pertenencia"
              type="text"
              required
              class="input mt-1 block w-full"
            />
          </div>
          <!-- Jugador 1 -->
          <div class="space-y-2">
            <h4 class="text-sm font-medium text-gray-700">Jugador 1</h4>
            <div>
              <input
                v-model="parejaForm.jugadores[0].nombre"
                type="text"
                required
                placeholder="Nombre"
                class="input mt-1 block w-full"
              />
            </div>
            <div>
              <input
                v-model="parejaForm.jugadores[0].apellido"
                type="text"
                required
                placeholder="Apellido"
                class="input mt-1 block w-full"
              />
            </div>
          </div>
          <!-- Jugador 2 -->
          <div class="space-y-2">
            <h4 class="text-sm font-medium text-gray-700">Jugador 2</h4>
            <div>
              <input
                v-model="parejaForm.jugadores[1].nombre"
                type="text"
                required
                placeholder="Nombre"
                class="input mt-1 block w-full"
              />
            </div>
            <div>
              <input
                v-model="parejaForm.jugadores[1].apellido"
                type="text"
                required
                placeholder="Apellido"
                class="input mt-1 block w-full"
              />
            </div>
          </div>
          <div class="mt-5 sm:mt-6 space-x-3">
            <button type="submit" class="btn btn-primary">
              {{ showEditParejaModal ? 'Guardar' : 'Crear' }}
            </button>
            <button
              type="button"
              @click="closeModal"
              class="btn btn-secondary"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useCampeonatoStore } from '../stores/campeonato';
import { useParejaStore } from '../stores/pareja';

const campeonatoStore = useCampeonatoStore();
const parejaStore = useParejaStore();

const { campeonato } = storeToRefs(campeonatoStore);
const { parejas, loading, error } = storeToRefs(parejaStore);

const showNewParejaModal = ref(false);
const showEditParejaModal = ref(false);
const parejaForm = ref({
  nombre: '',
  club_pertenencia: '',
  jugadores: [
    { nombre: '', apellido: '' },
    { nombre: '', apellido: '' }
  ]
});

onMounted(async () => {
  if (campeonato.value) {
    await parejaStore.fetchParejas(campeonato.value.id);
  }
});

function resetForm() {
  parejaForm.value = {
    nombre: '',
    club_pertenencia: '',
    jugadores: [
      { nombre: '', apellido: '' },
      { nombre: '', apellido: '' }
    ]
  };
}

function closeModal() {
  showNewParejaModal.value = false;
  showEditParejaModal.value = false;
  resetForm();
}

async function submitPareja() {
  if (!campeonato.value) return;

  const parejaData = {
    ...parejaForm.value,
    campeonato_id: campeonato.value.id
  };

  let success;
  if (showEditParejaModal.value) {
    success = await parejaStore.actualizarPareja(parejaForm.value.id, parejaData);
  } else {
    success = await parejaStore.crearPareja(parejaData);
  }

  if (success) {
    closeModal();
  }
}

function editarPareja(pareja) {
  parejaForm.value = {
    id: pareja.id,
    nombre: pareja.nombre,
    club_pertenencia: pareja.club_pertenencia,
    jugadores: [...pareja.jugadores]
  };
  showEditParejaModal.value = true;
}

async function toggleActiva(id) {
  await parejaStore.toggleActivaPareja(id);
}

async function cerrarInscripcion() {
  // TODO: Implementar la lógica para cerrar inscripción
  // Esto debería navegar a la vista de mesas después de crear las mesas por sorteo
}
</script> 