<template>
  <div class="bg-white rounded-lg shadow p-6 space-y-4">
    <div class="flex justify-between items-center">
      <h3 class="text-lg font-medium text-gray-900">Mesa {{ mesa.id }}</h3>
      <span 
        class="px-2 py-1 text-sm rounded-full"
        :class="{
          'bg-green-100 text-green-800': tieneResultados,
          'bg-yellow-100 text-yellow-800': !tieneResultados
        }"
      >
        {{ tieneResultados ? 'Completada' : 'Pendiente' }}
      </span>
    </div>

    <div class="space-y-4">
      <!-- Pareja 1 -->
      <div class="border-l-4 border-blue-500 pl-4">
        <div class="text-sm text-gray-500">Pareja 1</div>
        <div class="font-medium">{{ pareja1?.nombre || 'Sin asignar' }}</div>
        <div class="text-sm text-gray-500">{{ pareja1?.club_pertenencia || '' }}</div>
      </div>

      <!-- VS Separator -->
      <div class="flex items-center justify-center">
        <div class="w-16 h-px bg-gray-300"></div>
        <span class="mx-4 text-gray-500 font-medium">VS</span>
        <div class="w-16 h-px bg-gray-300"></div>
      </div>

      <!-- Pareja 2 -->
      <div class="border-l-4 border-red-500 pl-4">
        <div class="text-sm text-gray-500">Pareja 2</div>
        <div class="font-medium">{{ pareja2?.nombre || 'Sin asignar' }}</div>
        <div class="text-sm text-gray-500">{{ pareja2?.club_pertenencia || '' }}</div>
      </div>
    </div>

    <!-- Acciones -->
    <div class="mt-6 flex justify-end space-x-3">
      <button
        v-if="!tieneResultados"
        @click="$emit('registrar-resultado', mesa)"
        class="btn btn-primary"
      >
        Registrar Resultado
      </button>
      <button
        v-else
        @click="$emit('ver-resultado', mesa)"
        class="btn btn-secondary"
      >
        Ver Resultado
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  mesa: {
    type: Object,
    required: true
  },
  pareja1: {
    type: Object,
    default: null
  },
  pareja2: {
    type: Object,
    default: null
  }
});

defineEmits(['registrar-resultado', 'ver-resultado']);

const tieneResultados = computed(() => {
  return props.mesa.resultados && props.mesa.resultados.length > 0;
});
</script> 