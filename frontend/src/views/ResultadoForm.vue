<template>
  <div class="bg-white rounded-lg shadow-sm p-6">
    <!-- Encabezado -->
    <div class="mb-6">
      <h2 class="text-xl font-bold text-gray-800">Registro de Resultado - Mesa {{ mesa.numero }}</h2>
      <p class="text-gray-600">Partida {{ partida }}</p>
    </div>

    <!-- Formulario -->
    <form @submit.prevent="guardarResultado" class="space-y-8">
      <!-- Pareja 1 -->
      <div class="space-y-4">
        <div>
          <h3 class="text-lg font-medium text-gray-700">Pareja {{ pareja1.numero }}</h3>
          <p class="text-gray-500">{{ pareja1.nombre }}</p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700">
              Resultado Partida (RP)
            </label>
            <input
              type="number"
              v-model="form.pareja1.rp"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">
              Partidas Ganadas (PG)
            </label>
            <div class="mt-1 text-lg">{{ form.pareja1.pg }}</div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">
              Puntos Partida (PP)
            </label>
            <div class="mt-1 text-lg">{{ form.pareja1.pp }}</div>
          </div>
        </div>
      </div>

      <!-- Pareja 2 -->
      <div class="space-y-4">
        <div>
          <h3 class="text-lg font-medium text-gray-700">Pareja {{ pareja2.numero }}</h3>
          <p class="text-gray-500">{{ pareja2.nombre }}</p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700">
              Resultado Partida (RP)
            </label>
            <input
              type="number"
              v-model="form.pareja2.rp"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">
              Partidas Ganadas (PG)
            </label>
            <div class="mt-1 text-lg">{{ form.pareja2.pg }}</div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">
              Puntos Partida (PP)
            </label>
            <div class="mt-1 text-lg">{{ form.pareja2.pp }}</div>
          </div>
        </div>
      </div>

      <!-- Botones -->
      <div class="flex justify-end gap-4 pt-4">
        <button
          type="button"
          @click="cancelar"
          class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancelar
        </button>
        <button
          type="submit"
          class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Guardar
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useResultadoStore } from '../stores/resultado';

const props = defineProps({
  mesa: {
    type: Object,
    required: true
  },
  pareja1: {
    type: Object,
    required: true
  },
  pareja2: {
    type: Object,
    required: true
  },
  partida: {
    type: Number,
    required: true
  }
});

const router = useRouter();
const resultadoStore = useResultadoStore();

const form = ref({
  pareja1: {
    rp: 0,
    pg: 0,
    pp: 0
  },
  pareja2: {
    rp: 0,
    pg: 0,
    pp: 0
  }
});

// Calcular PG y PP basado en RP
watch(() => [form.value.pareja1.rp, form.value.pareja2.rp], ([rp1, rp2]) => {
  // Convertir a números
  const resultado1 = parseInt(rp1) || 0;
  const resultado2 = parseInt(rp2) || 0;

  // Calcular PG
  form.value.pareja1.pg = resultado1 > resultado2 ? 1 : 0;
  form.value.pareja2.pg = resultado2 > resultado1 ? 1 : 0;

  // Calcular PP
  form.value.pareja1.pp = resultado1;
  form.value.pareja2.pp = resultado2;
}, { immediate: true });

const guardarResultado = async () => {
  try {
    await resultadoStore.guardarResultado({
      mesa_id: props.mesa.id,
      partida: props.partida,
      resultados: [
        {
          pareja_id: props.pareja1.id,
          ...form.value.pareja1
        },
        {
          pareja_id: props.pareja2.id,
          ...form.value.pareja2
        }
      ]
    });
    router.push('/mesas/registro');
  } catch (error) {
    console.error('Error al guardar el resultado:', error);
  }
};

const cancelar = () => {
  router.push('/mesas/registro');
};
</script> 