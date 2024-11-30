<template>
  <div class="bg-white rounded-lg p-6">
    <!-- Encabezado -->
    <h2 class="text-xl font-semibold text-gray-800">Registro de Resultado - Mesa {{ mesa.id }}</h2>
    <p class="text-gray-600 mb-6">Partida {{ partida }}</p>

    <!-- Caso especial: Mesa con una sola pareja -->
    <div v-if="!pareja2" class="mb-6 p-4 bg-blue-50 rounded-lg">
      <p class="text-blue-800">Esta mesa solo tiene una pareja. Se asignará automáticamente:</p>
      <ul class="list-disc list-inside mt-2 text-blue-700">
        <li>RP = 150 puntos</li>
        <li>PG = 1 punto</li>
        <li>PP = 150 puntos</li>
      </ul>
    </div>

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
            <div v-if="!pareja2" class="px-3 py-2 bg-gray-100 rounded-lg">150</div>
            <input
              v-else
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
            <div class="px-3 py-2 bg-gray-100 rounded-lg">{{ !pareja2 ? 1 : resultados.pareja1.pg }}</div>
          </div>
          
          <!-- Puntos Partida (PP) -->
          <div class="flex-1">
            <label class="block text-gray-600 mb-2">Puntos Partida (PP)</label>
            <div class="px-3 py-2 bg-gray-100 rounded-lg">{{ !pareja2 ? 150 : resultados.pareja1.pp }}</div>
          </div>
        </div>
      </div>

      <!-- Pareja 2 (solo se muestra si existe) -->
      <div v-if="pareja2" class="space-y-4">
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
import { ref, computed, watch, onMounted } from 'vue';

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
    default: null
  },
  partida: {
    type: Number,
    required: true
  },
  resultadosIniciales: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['guardar', 'cancelar']);

// Inicializar resultados
const resultados = ref({
  pareja1: {
    rp: !props.pareja2 ? 150 : 0,
    pg: !props.pareja2 ? 1 : 0,
    pp: !props.pareja2 ? 150 : 0
  },
  pareja2: props.pareja2 ? {
    rp: 0,
    pg: 0,
    pp: 0
  } : null
});

// Si hay resultados iniciales, cargarlos
if (props.resultadosIniciales?.length > 0) {
  resultados.value.pareja1 = {
    rp: props.resultadosIniciales[0].rp,
    pg: props.resultadosIniciales[0].pg,
    pp: props.resultadosIniciales[0].pp
  };
  if (props.pareja2 && props.resultadosIniciales[1]) {
    resultados.value.pareja2 = {
      rp: props.resultadosIniciales[1].rp,
      pg: props.resultadosIniciales[1].pg,
      pp: props.resultadosIniciales[1].pp
    };
  }
}

const calcularResultados = () => {
  if (!props.pareja2) return; // No calcular si solo hay una pareja

  const rp1 = resultados.value.pareja1.rp;
  const rp2 = resultados.value.pareja2.rp;

  // Calcular PG
  resultados.value.pareja1.pg = rp1 > rp2 ? 1 : 0;
  resultados.value.pareja2.pg = rp2 > rp1 ? 1 : 0;

  // Calcular PP
  resultados.value.pareja1.pp = rp1 - rp2;
  resultados.value.pareja2.pp = rp2 - rp1;
};

const esValido = computed(() => {
  if (!props.pareja2) return true; // Siempre válido para una sola pareja
  
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

  if (!props.pareja2) {
    // Caso especial: Mesa con una sola pareja
    const resultado = {
      pareja_id: props.pareja1.id,
      mesa_id: props.mesa.id,
      partida: props.partida,
      campeonato_id: props.mesa.campeonato_id,
      rp: 150,
      pg: 1,
      pp: 150
    };
    emit('guardar', resultado);
  } else {
    // Caso normal: Mesa con dos parejas
    const resultado1 = {
      pareja_id: props.pareja1.id,
      mesa_id: props.mesa.id,
      partida: props.partida,
      campeonato_id: props.mesa.campeonato_id,
      rp: resultados.value.pareja1.rp,
      pg: resultados.value.pareja1.pg,
      pp: resultados.value.pareja1.pp
    };

    const resultado2 = {
      pareja_id: props.pareja2.id,
      mesa_id: props.mesa.id,
      partida: props.partida,
      campeonato_id: props.mesa.campeonato_id,
      rp: resultados.value.pareja2.rp,
      pg: resultados.value.pareja2.pg,
      pp: resultados.value.pareja2.pp
    };

    emit('guardar', resultado1, resultado2);
  }
};

// Observar cambios en los resultados para recalcular
watch(
  () => [resultados.value.pareja1.rp, resultados.value.pareja2?.rp],
  () => calcularResultados(),
  { immediate: true }
);

// Emitir los resultados automáticamente si solo hay una pareja
onMounted(() => {
  if (!props.pareja2 && !props.resultadosIniciales?.length) {
    guardarResultado();
  }
});
</script> 