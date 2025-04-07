<template>
  <div class="bg-white rounded-lg p-6">
    <!-- Encabezado -->
    <h2 class="text-xl font-semibold text-gray-800">Registro de Resultado - Mesa {{ mesa.id }}</h2>
    <p class="text-gray-600 mb-6">Partida {{ partida }}</p>

    <!-- Caso especial: Mesa con una sola pareja -->
    <div v-if="!pareja2" class="mb-6 p-4 bg-blue-50 rounded-lg">
      <p class="text-blue-800">Esta mesa solo tiene una pareja. Se asignará automáticamente:</p>
      <ul class="list-disc list-inside mt-2 text-blue-700">
        <li>RT = 150 puntos</li>
        <li>MG = 5 manos</li>
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
          <!-- Resultado Total (RT) -->
          <div class="flex-1">
            <label class="block text-gray-600 mb-2">Resultado Total (RT)</label>
            <div v-if="!pareja2" class="px-3 py-2 bg-gray-100 rounded-lg">150</div>
            <div v-else class="space-y-1">
              <input
                type="number"
                v-model.number="resultados.pareja1.rt"
                class="w-full px-3 py-2 bg-white border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                :class="{
                  'border-red-500 bg-red-50': rtFueraDeRango.pareja1,
                  'border-gray-300': !rtFueraDeRango.pareja1
                }"
                min="0"
                required
                @input="calcularResultados"
              />
              <p v-if="rtFueraDeRango.pareja1" class="text-red-500 text-xs">{{ mensajeErrorRT }}</p>
            </div>
          </div>

          <!-- Manos Ganadas (MG) -->
          <div class="flex-1">
            <label class="block text-gray-600 mb-2">Manos Ganadas (MG)</label>
            <div v-if="!pareja2" class="px-3 py-2 bg-gray-100 rounded-lg">5</div>
            <input
              v-else
              type="number"
              v-model.number="resultados.pareja1.mg"
              class="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
              required
              @input="calcularResultados"
            />
          </div>
          
          <!-- Resultado Partida (RP) -->
          <div class="flex-1">
            <label class="block text-gray-600 mb-2">Resultado Partida (RP)</label>
            <div class="px-3 py-2 bg-gray-100 rounded-lg">{{ resultados.pareja1.rp }}</div>
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

      <!-- Pareja 2 (solo se muestra si existe) -->
      <div v-if="pareja2" class="space-y-4">
        <div>
          <h3 class="text-lg font-medium">Pareja {{ pareja2.id }}</h3>
          <p class="text-gray-600">{{ pareja2.nombre }}</p>
        </div>

        <div class="flex gap-8">
          <!-- Resultado Total (RT) -->
          <div class="flex-1">
            <label class="block text-gray-600 mb-2">Resultado Total (RT)</label>
            <div class="space-y-1">
              <input
                type="number"
                v-model.number="resultados.pareja2.rt"
                class="w-full px-3 py-2 bg-white border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                :class="{
                  'border-red-500 bg-red-50': rtFueraDeRango.pareja2,
                  'border-gray-300': !rtFueraDeRango.pareja2
                }"
                min="0"
                required
                @input="calcularResultados"
              />
              <p v-if="rtFueraDeRango.pareja2" class="text-red-500 text-xs">{{ mensajeErrorRT }}</p>
            </div>
          </div>

          <!-- Manos Ganadas (MG) -->
          <div class="flex-1">
            <label class="block text-gray-600 mb-2">Manos Ganadas (MG)</label>
            <input
              type="number"
              v-model.number="resultados.pareja2.mg"
              class="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
              required
              @input="calcularResultados"
            />
          </div>
          
          <!-- Resultado Partida (RP) -->
          <div class="flex-1">
            <label class="block text-gray-600 mb-2">Resultado Partida (RP)</label>
            <div class="px-3 py-2 bg-gray-100 rounded-lg">{{ resultados.pareja2.rp }}</div>
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
import { useCampeonatoStore } from '../stores/campeonato';

const campeonatoStore = useCampeonatoStore();
const { campeonato } = storeToRefs(campeonatoStore);

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
  campeonato: {
    type: Object,
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
    rt: !props.pareja2 ? 150 : 0,
    mg: !props.pareja2 ? 5 : 0,
    rp: !props.pareja2 ? 150 : 0,
    pg: !props.pareja2 ? 1 : 0,
    pp: !props.pareja2 ? 150 : 0
  },
  pareja2: props.pareja2 ? {
    rt: 0,
    mg: 0,
    rp: 0,
    pg: 0,
    pp: 0
  } : null
});

// Si hay resultados iniciales, cargarlos
if (props.resultadosIniciales?.length > 0) {
  resultados.value.pareja1 = {
    rt: props.resultadosIniciales[0].rt,
    mg: props.resultadosIniciales[0].mg,
    rp: props.resultadosIniciales[0].rp,
    pg: props.resultadosIniciales[0].pg,
    pp: props.resultadosIniciales[0].pp
  };
  if (props.pareja2 && props.resultadosIniciales[1]) {
    resultados.value.pareja2 = {
      rt: props.resultadosIniciales[1].rt,
      mg: props.resultadosIniciales[1].mg,
      rp: props.resultadosIniciales[1].rp,
      pg: props.resultadosIniciales[1].pg,
      pp: props.resultadosIniciales[1].pp
    };
  }
}

const calcularResultados = () => {
  if (!props.pareja2) return; // No calcular si solo hay una pareja

  const rt1 = resultados.value.pareja1.rt;
  const rt2 = resultados.value.pareja2.rt;
  const pm = props.campeonato?.pm ?? 300; // Usar 300 como valor por defecto
  const limite = limiteSuperiorRT.value;

  // Validar que RT no exceda el límite
  if (rt1 > limite || rt2 > limite) {
    return; // No realizar cálculos si los valores están fuera de rango
  }

  // Calcular RP basado en RT y PM
  resultados.value.pareja1.rp = rt1 > pm ? pm : rt1;
  resultados.value.pareja2.rp = rt2 > pm ? pm : rt2;

  // Calcular PG
  resultados.value.pareja1.pg = rt1 > rt2 ? 1 : 0;
  resultados.value.pareja2.pg = rt2 > rt1 ? 1 : 0;

  // Calcular PP basado en RP (no en RT)
  const rp1 = resultados.value.pareja1.rp;
  const rp2 = resultados.value.pareja2.rp;
  resultados.value.pareja1.pp = rp1 - rp2;
  resultados.value.pareja2.pp = rp2 - rp1;
};

// Añadir nuevas variables computadas para validar los rangos de RT
const limiteSuperiorRT = computed(() => {
  const pm = props.campeonato?.pm ?? 300; // Usar 300 como valor por defecto
  return pm + 129;
});

const rtFueraDeRango = computed(() => {
  if (!props.pareja2) return { pareja1: false, pareja2: false };
  
  const rt1 = resultados.value.pareja1.rt;
  const rt2 = resultados.value.pareja2.rt;
  const limite = limiteSuperiorRT.value;
  
  return {
    pareja1: rt1 < 0 || rt1 > limite,
    pareja2: rt2 < 0 || rt2 > limite
  };
});

const mensajeErrorRT = computed(() => {
  const limite = limiteSuperiorRT.value;
  return `El resultado total no puede exceder ${limite} puntos (PM + 129)`;
});

// Modificar la función esValido para ser más estricta
const esValido = computed(() => {
  if (!props.pareja2) return true; // Siempre válido para una sola pareja
  
  const rt1 = resultados.value.pareja1.rt;
  const rt2 = resultados.value.pareja2.rt;
  const mg1 = resultados.value.pareja1.mg;
  const mg2 = resultados.value.pareja2.mg;
  const limite = limiteSuperiorRT.value;

  // Verificar que los valores estén dentro del rango permitido
  if (rt1 < 0 || rt1 > limite || rt2 < 0 || rt2 > limite) {
    return false;
  }

  // Verificar otras condiciones
  const mgValido = mg1 >= 0 && mg2 >= 0;
  const noEmpate = rt1 !== rt2;

  return mgValido && noEmpate;
});

// Función para validar si un valor está dentro del rango
const validarRangoRT = (valor) => {
  const limite = limiteSuperiorRT.value;
  return valor >= 0 && valor <= limite;
};

// Modificar la función guardarResultado para incluir validación adicional
const guardarResultado = () => {
  const limite = limiteSuperiorRT.value;
  const rt1 = resultados.value.pareja1.rt;
  const rt2 = resultados.value.pareja2?.rt;

  // Verificar explícitamente los rangos antes de guardar
  if (rt1 > limite || (rt2 !== undefined && rt2 > limite)) {
    return; // No permitir guardar si algún RT excede el límite
  }

  if (!esValido.value) {
    return; // No hacer nada si los valores no son válidos
  }

  const resultado1 = {
    pareja_id: props.pareja1.id,
    mesa_id: props.mesa.id,
    partida: props.partida,
    campeonato_id: props.mesa.campeonato_id,
    rt: resultados.value.pareja1.rt,
    mg: resultados.value.pareja1.mg,
    rp: resultados.value.pareja1.rp,
    pg: resultados.value.pareja1.pg,
    pp: resultados.value.pareja1.pp,
    gb: props.pareja1.gb
  };

  let resultado2 = null;
  if (props.pareja2) {
    resultado2 = {
      pareja_id: props.pareja2.id,
      mesa_id: props.mesa.id,
      partida: props.partida,
      campeonato_id: props.mesa.campeonato_id,
      rt: resultados.value.pareja2.rt,
      mg: resultados.value.pareja2.mg,
      rp: resultados.value.pareja2.rp,
      pg: resultados.value.pareja2.pg,
      pp: resultados.value.pareja2.pp,
      gb: props.pareja2.gb
    };
  }

  emit('guardar', resultado1, resultado2);
};

// Observar cambios en los resultados para recalcular
watch(
  () => [resultados.value.pareja1.rt, resultados.value.pareja2?.rt],
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