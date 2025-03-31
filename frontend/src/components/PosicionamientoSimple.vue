<template>
  <div class="p-4 bg-white rounded-lg">
    <h2 class="text-lg font-bold mb-4">Posicionamiento Simplificado</h2>
    
    <div class="mb-4">
      <p class="text-gray-700">Este es un componente simplificado para probar el funcionamiento del modal.</p>
      <p class="text-gray-700 mt-2">Campeonato: {{ campeonato?.nombre || 'No disponible' }}</p>
    </div>
    
    <div class="grid grid-cols-2 gap-4 mb-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Posición X</label>
        <input type="number" v-model.number="posicion.left" class="w-full p-2 border rounded" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Posición Y</label>
        <input type="number" v-model.number="posicion.top" class="w-full p-2 border rounded" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Ancho</label>
        <input type="number" v-model.number="posicion.width" class="w-full p-2 border rounded" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Alto</label>
        <input type="number" v-model.number="posicion.height" class="w-full p-2 border rounded" />
      </div>
    </div>
    
    <div class="flex justify-end">
      <button 
        @click="guardarPosicion" 
        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Guardar Posición
      </button>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue';

const props = defineProps({
  campeonato: Object,
  plantillaImagenUrl: String,
  posicionLogoGuardada: Object
});

const emit = defineEmits(['actualizar-posicion-logo']);

const posicion = reactive({
  left: 50,
  top: 30,
  width: 100,
  height: 60
});

const guardarPosicion = () => {
  const nuevaPosicion = {
    izquierda: { ...posicion },
    derecha: { ...posicion, left: posicion.left + 400 }
  };
  emit('actualizar-posicion-logo', nuevaPosicion);
};
</script> 