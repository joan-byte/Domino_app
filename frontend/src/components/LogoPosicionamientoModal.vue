<script setup>
import { defineProps, defineEmits } from 'vue';
import LogoPosicionamiento from './LogoPosicionamiento.vue';

const props = defineProps({
  mostrar: Boolean,
  plantillaImagenUrl: String,
  campeonato: Object,
  posicionLogoGuardada: Object
});

const emit = defineEmits(['update:mostrar', 'actualizar-posicion-logo']);

const cerrar = () => {
  emit('update:mostrar', false);
};

const actualizarPosicionLogo = (nuevaPosicion) => {
  emit('actualizar-posicion-logo', nuevaPosicion);
};
</script>

<template>
  <div v-if="mostrar" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-3xl">
      <div class="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 class="text-lg font-medium">Posicionamiento de Información</h3>
        <button @click="cerrar" class="text-gray-400 hover:text-gray-500">
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div class="p-4 max-h-[80vh] overflow-y-auto">
        <LogoPosicionamiento 
          :plantilla-imagen-url="plantillaImagenUrl"
          :campeonato="campeonato"
          :posicion-logo-guardada="posicionLogoGuardada"
          @actualizar-posicion-logo="actualizarPosicionLogo"
        />
      </div>
    </div>
  </div>
</template> 