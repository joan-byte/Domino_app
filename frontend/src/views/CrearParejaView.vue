<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-2xl mx-auto bg-white rounded-lg shadow-sm p-8">
      <!-- Mensaje de error -->
      <div v-if="error" class="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        <span class="block sm:inline">{{ error }}</span>
      </div>

      <form @submit.prevent="crearPareja" class="space-y-6">
        <!-- Nombre de la Pareja -->
        <div>
          <label for="nombre" class="block text-sm font-medium text-gray-700">
            Nombre de la Pareja
          </label>
          <input
            type="text"
            id="nombre"
            v-model="nombrePareja"
            readonly
            class="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <!-- Club -->
        <div>
          <label for="club" class="block text-sm font-medium text-gray-700">
            Club
          </label>
          <input
            type="text"
            id="club"
            v-model="form.club"
            required
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <!-- Jugador 1 -->
        <div class="space-y-4">
          <h3 class="text-lg font-medium text-gray-700">Jugador 1</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="jugador1_nombre" class="block text-sm font-medium text-gray-700">
                Nombre
              </label>
              <input
                type="text"
                id="jugador1_nombre"
                v-model="form.jugador1.nombre"
                @input="actualizarNombrePareja"
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label for="jugador1_apellido" class="block text-sm font-medium text-gray-700">
                Apellido
              </label>
              <input
                type="text"
                id="jugador1_apellido"
                v-model="form.jugador1.apellido"
                @input="actualizarNombrePareja"
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <!-- Jugador 2 -->
        <div class="space-y-4">
          <h3 class="text-lg font-medium text-gray-700">Jugador 2</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="jugador2_nombre" class="block text-sm font-medium text-gray-700">
                Nombre
              </label>
              <input
                type="text"
                id="jugador2_nombre"
                v-model="form.jugador2.nombre"
                @input="actualizarNombrePareja"
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label for="jugador2_apellido" class="block text-sm font-medium text-gray-700">
                Apellido
              </label>
              <input
                type="text"
                id="jugador2_apellido"
                v-model="form.jugador2.apellido"
                @input="actualizarNombrePareja"
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <!-- Botones -->
        <div class="flex gap-4 pt-4">
          <button
            type="button"
            @click="cancelar"
            class="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancelar
          </button>
          <button
            type="submit"
            class="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Crear
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useParejasStore } from '../stores/parejas';
import { useCampeonatoStore } from '../stores/campeonato';

const router = useRouter();
const parejasStore = useParejasStore();
const campeonatoStore = useCampeonatoStore();

const error = ref(null);
const form = ref({
  club: '',
  jugador1: {
    nombre: '',
    apellido: ''
  },
  jugador2: {
    nombre: '',
    apellido: ''
  }
});

const nombrePareja = computed(() => {
  const jugador1 = `${form.value.jugador1.nombre} ${form.value.jugador1.apellido}`.trim();
  const jugador2 = `${form.value.jugador2.nombre} ${form.value.jugador2.apellido}`.trim();
  
  if (jugador1 && jugador2) {
    return `${jugador1} Y ${jugador2}`;
  } else if (jugador1) {
    return jugador1;
  } else if (jugador2) {
    return jugador2;
  }
  return '';
});

const crearPareja = async () => {
  try {
    error.value = null;
    const campeonato = await campeonatoStore.obtenerActual();
    
    // Preparar los datos en el formato que espera el backend
    const parejaData = {
      nombre: nombrePareja.value,
      club_pertenencia: form.value.club,
      campeonato_id: campeonato.id,
      jugadores: [
        {
          nombre: form.value.jugador1.nombre,
          apellido: form.value.jugador1.apellido
        },
        {
          nombre: form.value.jugador2.nombre,
          apellido: form.value.jugador2.apellido
        }
      ]
    };

    await parejasStore.crearPareja(parejaData);
    router.push('/parejas');
  } catch (e) {
    console.error('Error al crear la pareja:', e);
    error.value = 'Error al crear la pareja. Por favor, inténtalo de nuevo.';
  }
};

const cancelar = () => {
  router.push('/parejas');
};
</script> 