<!-- Componente para el menú de configuración -->
<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  showMenu: {
    type: Boolean,
    default: false
  },
  campeonato: {
    type: Object,
    default: null
  },
  hayResultadosPartidaActual: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits([
  'update:show-menu', 
  'close-menus',
  'mostrar-modal-plantilla',
  'mostrar-posicionamiento-logo',
  'rehacer-partida'
]);

// Verificar si se puede rehacer la partida
const puedeRehacerPartida = computed(() => {
  // Solo se puede rehacer si:
  // 1. Hay un campeonato activo
  // 2. La partida actual es mayor a 1 (no es la primera partida)
  // 3. No hay resultados en la partida actual
  return props.campeonato && 
         props.campeonato.partida_actual > 1 && 
         !props.hayResultadosPartidaActual;
});

// Determinar si mostrar la opción en el menú (siempre que no sea la primera partida)
const mostrarOpcionRehacerPartida = computed(() => {
  return props.campeonato && props.campeonato.partida_actual > 1;
});

// Texto del tooltip para explicar por qué está deshabilitada la opción
const textoTooltipRehacerPartida = computed(() => {
  if (!props.campeonato) {
    return "No hay campeonato activo";
  } 
  if (props.campeonato.partida_actual <= 1) {
    return "No se puede rehacer la primera partida";
  }
  if (props.hayResultadosPartidaActual) {
    return "No se puede rehacer porque ya hay resultados registrados en la partida actual";
  }
  return "Permite volver a la partida anterior para modificar sus resultados";
});

// Función para cerrar el menú
const cerrarMenu = () => {
  emit('update:show-menu', false);
  emit('close-menus');
};

// Función para mostrar modal de plantilla
const mostrarPlantilla = () => {
  cerrarMenu();
  emit('mostrar-modal-plantilla');
};

// Función para mostrar posicionamiento de logo
const mostrarPosicionamientoLogo = () => {
  console.log('MenuConfiguracion: Ejecutando mostrarPosicionamientoLogo');
  cerrarMenu();
  console.log('MenuConfiguracion: Menú cerrado, emitiendo evento mostrar-posicionamiento-logo');
  
  emit('mostrar-posicionamiento-logo');
  
  console.log('MenuConfiguracion: Evento mostrar-posicionamiento-logo emitido');
};

// Función para rehacer partida
const rehacerPartida = () => {
  cerrarMenu();
  emit('rehacer-partida');
};
</script>

<template>
  <div class="relative">
    <!-- Botón con ícono de engranaje -->
    <button
      class="inline-flex items-center px-1 pt-1 text-gray-700 hover:text-gray-900"
      :class="{ 'border-b-2 border-gray-900': showMenu }"
      @mouseenter="$emit('update:show-menu', true)"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
      </svg>
    </button>

    <!-- Menú desplegable -->
    <div
      v-show="showMenu"
      class="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50"
      @mouseenter="$emit('update:show-menu', true)"
      @mouseleave="$emit('update:show-menu', false)"
    >
      <div class="py-1">
        <button 
          class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          @click="mostrarPlantilla"
        >
          Configurar Plantilla
        </button>
        <button 
          class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          @click="mostrarPosicionamientoLogo"
        >
          Posicionamiento información
        </button>
        <button 
          v-if="mostrarOpcionRehacerPartida"
          :disabled="!puedeRehacerPartida"
          class="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
          :class="puedeRehacerPartida ? 'text-gray-700' : 'text-gray-400 cursor-not-allowed'"
          @click="puedeRehacerPartida && rehacerPartida()"
          :title="textoTooltipRehacerPartida"
        >
          Rehacer partida
        </button>
      </div>
    </div>
  </div>
</template> 