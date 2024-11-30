<template>
  <div class="bg-white rounded-lg p-6">
    <!-- Encabezado -->
    <h2 class="text-xl font-semibold text-gray-800">Registro de Resultado - Mesa {{ mesa.id }}</h2>
    <p class="text-gray-600 mb-6">Partida {{ partida }}</p>

    <!-- Formulario -->
    <form @submit.prevent="guardarResultado" class="space-y-8">
      <!-- Pareja 1 -->
      <div class="space-y-4">
        <div>
          <h3 class="text-lg font-medium">Pareja {{ pareja1.id }}</h3>
          <p class="text-gray-600">{{ pareja1.nombre }}</p>
        </div>

        <div class="flex gap-8">
          <!-- Resultado Partida (RP) -->
          <div class="flex-1">
            <label class="block text-gray-600 mb-2">Resultado Partida (RP)</label>
            <input
              type="number"
              v-model.number="resultados.pareja1.rp"
              class="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
              :max="300"
              required
              @input="calcularResultados"
            />
          </div>
          
          <!-- Partidas Ganadas (PG) -->
          <div class="flex-1">
            <label class="block text-gray-600 mb-2">Partidas Ganadas (PG)</label>
            <div class="px-3 py-2 bg-gray-100 rounded-lg">{{ resultados.pareja1.pg }}</div>
          </div>
          
          <!-- Puntos Partida (PP) -->
          <div class="flex-1">
            <label class="block text-gray-600 mb-2">Puntos Partida (PP)</label>
            <div class="px-3 py-2 bg-gray-100 rounded-lg">{{ resultados.pareja1.pp }}</div>
          </div>
        </div>
      </div>

      <!-- Pareja 2 -->
      <div class="space-y-4">
        <div>
          <h3 class="text-lg font-medium">Pareja {{ pareja2.id }}</h3>
          <p class="text-gray-600">{{ pareja2.nombre }}</p>
        </div>

        <div class="flex gap-8">
          <!-- Resultado Partida (RP) -->
          <div class="flex-1">
            <label class="block text-gray-600 mb-2">Resultado Partida (RP)</label>
            <input
              type="number"
              v-model.number="resultados.pareja2.rp"
              class="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
              :max="300"
              required
              @input="calcularResultados"
            />
          </div>
          
          <!-- Partidas Ganadas (PG) -->
          <div class="flex-1">
            <label class="block text-gray-600 mb-2">Partidas Ganadas (PG)</label>
            <div class="px-3 py-2 bg-gray-100 rounded-lg">{{ resultados.pareja2.pg }}</div>
          </div>
          
          <!-- Puntos Partida (PP) -->
          <div class="flex-1">
            <label class="block text-gray-600 mb-2">Puntos Partida (PP)</label>
            <div class="px-3 py-2 bg-gray-100 rounded-lg">{{ resultados.pareja2.pp }}</div>
          </div>
        </div>
      </div>

      <!-- Botones -->
      <div class="flex justify-end space-x-3 pt-6">
        <button
          type="button"
          @click="$emit('cancelar')"
          class="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          Cancelar
        </button>
        <button
          type="submit"
          class="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          :disabled="!esValido"
        >
          Guardar
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

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

const emit = defineEmits(['guardar', 'cancelar']);

const resultados = ref({
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

const calcularResultados = () => {
  // Validar que los resultados sean números válidos
  const rp1 = resultados.value.pareja1.rp || 0;
  const rp2 = resultados.value.pareja2.rp || 0;

  // Calcular PG (Partidas Ganadas)
  resultados.value.pareja1.pg = rp1 > rp2 ? 1 : 0;
  resultados.value.pareja2.pg = rp2 > rp1 ? 1 : 0;

  // Calcular PP (Puntos Partida)
  resultados.value.pareja1.pp = rp1 > rp2 ? 1 : 0;
  resultados.value.pareja2.pp = rp2 > rp1 ? 1 : 0;
};

const esValido = computed(() => {
  const rp1 = resultados.value.pareja1.rp;
  const rp2 = resultados.value.pareja2.rp;
  return (
    rp1 >= 0 && rp1 <= 300 &&
    rp2 >= 0 && rp2 <= 300 &&
    rp1 !== rp2 // No pueden empatar
  );
});

const guardarResultado = () => {
  if (!esValido.value) return;
  
  emit('guardar', {
    mesa_id: props.mesa.id,
    resultados: [
      {
        pareja_id: props.pareja1.id,
        ...resultados.value.pareja1
      },
      {
        pareja_id: props.pareja2.id,
        ...resultados.value.pareja2
      }
    ]
  });
};

// Observar cambios en los resultados para recalcular
watch(
  () => [resultados.value.pareja1.rp, resultados.value.pareja2.rp],
  () => calcularResultados(),
  { immediate: true }
);
</script> 