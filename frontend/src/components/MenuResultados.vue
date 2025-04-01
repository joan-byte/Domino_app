<script setup>
import { ref } from 'vue';
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

const emit = defineEmits(['update:show-menu', 'close-menus', 'imprimir-ranking']);

// Abrir el menú al pasar el ratón
const abrirMenu = () => {
  emit('update:show-menu', true);
};

// Cerrar el menú al salir
const cerrarMenu = () => {
  emit('update:show-menu', false);
};

// Función para imprimir el ranking
const imprimirRanking = () => {
  cerrarMenu();
  emit('imprimir-ranking');
};
</script>

<template>
  <div class="relative">
    <button 
      id="resultados-menu-button"
      @mouseenter="abrirMenu"
      class="inline-flex items-center px-1 pt-1 text-gray-700 hover:text-gray-900"
    >
      <span>Resultados</span>
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
      id="resultados-dropdown"
      v-show="showMenu" 
      @mouseenter="abrirMenu"
      @mouseleave="cerrarMenu"
      class="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20"
    >
      <div class="py-1">
        <router-link 
          to="/resultados" 
          class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          :class="{ 'bg-gray-100': $route.path === '/resultados' }"
          @click="cerrarMenu"
        >
          Ranking
        </router-link>
        <router-link 
          to="/podium" 
          class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          :class="{ 'bg-gray-100': $route.path === '/podium' }"
          @click="cerrarMenu"
        >
          Podium
        </router-link>
        <router-link 
          to="/ranking" 
          class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          :class="{ 'bg-gray-100': $route.path === '/ranking' }"
          @click="cerrarMenu"
        >
          Ranking Completo
        </router-link>
        <button 
          class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          @click="imprimirRanking"
        >
          Imprimir Ranking
        </button>
      </div>
    </div>
  </div>
</template> 