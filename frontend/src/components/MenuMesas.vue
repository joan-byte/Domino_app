<script setup>
import { defineEmits, defineProps, ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
// Referencia local para controlar el estado
const menuAbierto = ref(false);

const props = defineProps({
  showMenu: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:show-menu', 'clear-timeout', 'close-menus', 'imprimir', 'mostrar-modal-plantilla', 'mostrar-posicionamiento-logo']);

// Abrir el menú al pasar el ratón
const abrirMenu = () => {
  emit('update:show-menu', true);
};

// Cerrar el menú al salir
const cerrarMenu = () => {
  emit('update:show-menu', false);
};

const imprimir = () => {
  cerrarMenu();
  emit('imprimir');
};

const mostrarPlantilla = () => {
  cerrarMenu();
  emit('mostrar-modal-plantilla');
};

const mostrarPosicionamientoLogo = () => {
  cerrarMenu();
  emit('mostrar-posicionamiento-logo');
};
</script>

<template>
  <div class="relative mr-16">
    <button 
      id="mesas-menu-button"
      @mouseenter="abrirMenu"
      class="inline-flex items-center px-1 pt-1 text-gray-700 hover:text-gray-900"
    >
      <span>Mesas</span>
      <svg 
        class="ml-2 w-5 h-5 transition-transform duration-200"
        :class="{ 'transform rotate-180': showMenu }"
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>
    <div 
      id="mesas-dropdown"
      v-show="showMenu" 
      @mouseenter="abrirMenu"
      @mouseleave="cerrarMenu"
      class="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20"
    >
      <div class="py-1">
        <router-link 
          to="/mesas/asignacion" 
          class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          :class="{ 'bg-gray-100': $route.path === '/mesas/asignacion' }"
          @click="cerrarMenu"
        >
          Asignación
        </router-link>
        <router-link 
          to="/mesas/registro" 
          class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          :class="{ 'bg-gray-100': $route.path === '/mesas/registro' }"
          @click="cerrarMenu"
        >
          Registro
        </router-link>
        <button 
          class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          @click="imprimir"
        >
          Imprimir
        </button>
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
      </div>
    </div>
  </div>
</template> 