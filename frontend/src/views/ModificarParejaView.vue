<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-2xl mx-auto bg-white rounded-lg shadow-sm p-8">
      <!-- Mensaje de error -->
      <div v-if="error" class="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        <span class="block sm:inline">{{ error }}</span>
      </div>

      <form @submit.prevent="guardarPareja" class="space-y-6">
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
            class="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
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
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
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
                pattern="[A-Za-zÁáÀàÉéÈèÍíÌìÓóÒòÚúÙùÜüÑñ\s]+"
                title="Ingrese un nombre válido (letras, espacios, acentos abiertos y cerrados permitidos)"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
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
                pattern="[A-Za-zÁáÀàÉéÈèÍíÌìÓóÒòÚúÙùÜüÑñ\s]+"
                title="Ingrese un apellido válido (letras, espacios, acentos abiertos y cerrados permitidos)"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
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
                pattern="[A-Za-zÁáÀàÉéÈèÍíÌìÓóÒòÚúÙùÜüÑñ\s]+"
                title="Ingrese un nombre válido (letras, espacios, acentos abiertos y cerrados permitidos)"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
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
                pattern="[A-Za-zÁáÀàÉéÈèÍíÌìÓóÒòÚúÙùÜüÑñ\s]+"
                title="Ingrese un apellido válido (letras, espacios, acentos abiertos y cerrados permitidos)"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
              />
            </div>
          </div>
        </div>

        <!-- Botones -->
        <div class="flex gap-4 pt-4">
          <button
            type="button"
            @click="eliminarPareja"
            class="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Eliminar
          </button>
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
            Guardar
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useParejasStore } from '../stores/parejas';

const router = useRouter();
const route = useRoute();
const parejasStore = useParejasStore();
const error = ref(null);

const form = ref({
  nombre: '',
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

// Nombre de la pareja computado
const nombrePareja = computed(() => {
  const jugador1 = `${form.value.jugador1.nombre} ${form.value.jugador1.apellido}`.trim();
  const jugador2 = `${form.value.jugador2.nombre} ${form.value.jugador2.apellido}`.trim();
  
  if (jugador1 && jugador2) {
    return `${jugador1} / ${jugador2}`;
  } else if (jugador1) {
    return jugador1;
  } else if (jugador2) {
    return jugador2;
  }
  return '';
});

// Actualizar el nombre cuando cambian los datos de los jugadores
const actualizarNombrePareja = () => {
  form.value.nombre = nombrePareja.value;
};

onMounted(async () => {
  try {
    const parejaId = route.params.id;
    const pareja = await parejasStore.obtenerPareja(parejaId);
    
    if (!pareja) {
      throw new Error('No se pudo cargar la pareja');
    }

    // Asegurarse de que hay al menos dos jugadores
    if (!pareja.jugadores || pareja.jugadores.length < 2) {
      throw new Error('La pareja no tiene los jugadores necesarios');
    }

    form.value = {
      nombre: pareja.nombre,
      club: pareja.club_pertenencia,
      jugador1: {
        nombre: pareja.jugadores[0].nombre,
        apellido: pareja.jugadores[0].apellido
      },
      jugador2: {
        nombre: pareja.jugadores[1].nombre,
        apellido: pareja.jugadores[1].apellido
      }
    };
  } catch (e) {
    console.error('Error al cargar la pareja:', e);
    error.value = e.message || 'Error al cargar la pareja';
    router.push('/parejas');
  }
});

const guardarPareja = async () => {
  try {
    error.value = null;
    // Actualizar el nombre antes de guardar
    form.value.nombre = nombrePareja.value;
    
    const parejaData = {
      nombre: form.value.nombre,
      club_pertenencia: form.value.club,
      activa: true,
      campeonato_id: parseInt(route.params.id),
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

    await parejasStore.actualizarPareja(route.params.id, parejaData);
    router.push('/parejas');
  } catch (e) {
    console.error('Error al guardar la pareja:', e);
    error.value = e.response?.data?.detail?.[0]?.msg || 'Error al guardar la pareja';
  }
};

const eliminarPareja = async () => {
  if (confirm('¿Está seguro de que desea eliminar esta pareja?')) {
    try {
      error.value = null;
      await parejasStore.eliminarPareja(route.params.id);
      router.push('/parejas');
    } catch (e) {
      console.error('Error al eliminar la pareja:', e);
      error.value = e.response?.data?.detail?.[0]?.msg || 'Error al eliminar la pareja';
    }
  }
};

const cancelar = () => {
  router.push('/parejas');
};
</script> 