<template>
  <div class="space-y-6">
    <!-- Pareja 1 -->
    <div class="space-y-4">
      <div class="flex justify-between items-center">
        <h4 class="text-lg font-medium text-blue-600">{{ pareja1?.nombre }}</h4>
        <span class="text-sm text-gray-500">{{ pareja1?.club_pertenencia }}</span>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700">Puntos</label>
        <input
          type="number"
          v-model.number="resultado1.rp"
          :disabled="!editable"
          :min="0"
          :max="300"
          class="input mt-1 block w-full"
          :class="{ 'bg-gray-100': !editable }"
        />
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Puntos Ganados</label>
          <input
            type="number"
            :value="resultado1.pg"
            disabled
            class="input mt-1 block w-full bg-gray-100"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Puntos Perdidos</label>
          <input
            type="number"
            :value="resultado1.pp"
            disabled
            class="input mt-1 block w-full bg-gray-100"
          />
        </div>
      </div>
      <div class="flex items-center" v-if="editable">
        <input
          type="checkbox"
          v-model="resultado1.gb"
          class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label class="ml-2 block text-sm text-gray-900">GB</label>
      </div>
    </div>

    <!-- Separador -->
    <div class="relative">
      <div class="absolute inset-0 flex items-center">
        <div class="w-full border-t border-gray-300"></div>
      </div>
      <div class="relative flex justify-center">
        <span class="px-3 bg-white text-lg font-medium text-gray-900">VS</span>
      </div>
    </div>

    <!-- Pareja 2 -->
    <div class="space-y-4">
      <div class="flex justify-between items-center">
        <h4 class="text-lg font-medium text-red-600">{{ pareja2?.nombre }}</h4>
        <span class="text-sm text-gray-500">{{ pareja2?.club_pertenencia }}</span>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700">Puntos</label>
        <input
          type="number"
          v-model.number="resultado2.rp"
          :disabled="!editable"
          :min="0"
          :max="300"
          class="input mt-1 block w-full"
          :class="{ 'bg-gray-100': !editable }"
        />
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Puntos Ganados</label>
          <input
            type="number"
            :value="resultado2.pg"
            disabled
            class="input mt-1 block w-full bg-gray-100"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Puntos Perdidos</label>
          <input
            type="number"
            :value="resultado2.pp"
            disabled
            class="input mt-1 block w-full bg-gray-100"
          />
        </div>
      </div>
      <div class="flex items-center" v-if="editable">
        <input
          type="checkbox"
          v-model="resultado2.gb"
          class="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
        />
        <label class="ml-2 block text-sm text-gray-900">GB</label>
      </div>
    </div>

    <!-- Errores -->
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
  editable: {
    type: Boolean,
    default: true
  },
  resultadosIniciales: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['update:resultados']);

const error = ref('');

// Estado inicial de los resultados
const resultado1 = ref({
  pareja_id: props.pareja1.id,
  mesa_id: props.mesa.id,
  partida: props.mesa.partida,
  campeonato_id: props.mesa.campeonato_id,
  rp: 0,
  pg: 0,
  pp: 0,
  gb: false
});

const resultado2 = ref({
  pareja_id: props.pareja2.id,
  mesa_id: props.mesa.id,
  partida: props.mesa.partida,
  campeonato_id: props.mesa.campeonato_id,
  rp: 0,
  pg: 0,
  pp: 0,
  gb: false
});

// Cargar resultados iniciales si existen
if (props.resultadosIniciales.length === 2) {
  const [r1, r2] = props.resultadosIniciales;
  resultado1.value = { ...resultado1.value, ...r1 };
  resultado2.value = { ...resultado2.value, ...r2 };
}

// Calcular PP y PG en tiempo real
watch([() => resultado1.value.rp, () => resultado2.value.rp], ([rp1, rp2]) => {
  if (rp1 === rp2) {
    error.value = 'Los puntos no pueden ser iguales';
    return;
  }
  error.value = '';

  // Calcular PP
  resultado1.value.pp = resultado2.value.rp - resultado1.value.rp;
  resultado2.value.pp = resultado1.value.rp - resultado2.value.rp;

  // Calcular PG
  resultado1.value.pg = resultado1.value.pp > 0 ? 1 : 0;
  resultado2.value.pg = resultado2.value.pp > 0 ? 1 : 0;

  // Emitir resultados actualizados
  emit('update:resultados', [resultado1.value, resultado2.value]);
});

// Validar que los puntos estén en el rango correcto
watch([() => resultado1.value.rp, () => resultado2.value.rp], ([rp1, rp2]) => {
  if (rp1 < 0 || rp1 > 300 || rp2 < 0 || rp2 > 300) {
    error.value = 'Los puntos deben estar entre 0 y 300';
  }
});
</script> 