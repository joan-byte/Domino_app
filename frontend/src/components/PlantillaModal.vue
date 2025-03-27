<script setup>
import { defineProps, defineEmits } from 'vue';
import PlantillaImagenConfig from './PlantillaImagenConfig.vue';

const props = defineProps({
  mostrar: Boolean,
  plantillaImagenUrl: String
});

const emit = defineEmits(['update:mostrar', 'actualizar-plantilla']);

const cerrar = () => {
  emit('update:mostrar', false);
};

const actualizarPlantilla = (nuevaUrl) => {
  emit('actualizar-plantilla', nuevaUrl);
  cerrar();
};
</script>

<template>
  <div v-if="mostrar" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-lg">
      <div class="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 class="text-lg font-medium">Configurar Plantilla de Impresión</h3>
        <button @click="cerrar" class="text-gray-400 hover:text-gray-500">
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div class="p-4">
        <PlantillaImagenConfig 
          :imagen-url-actual="plantillaImagenUrl" 
          @actualizar-plantilla="actualizarPlantilla"
        />
      </div>
    </div>
  </div>
</template> 