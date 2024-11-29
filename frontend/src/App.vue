<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'

const route = useRoute()
const showMesasMenu = ref(false)
const showResultadosMenu = ref(false)

const closeMenus = (e) => {
  const mesasButton = document.getElementById('mesas-menu-button')
  const mesasDropdown = document.getElementById('mesas-dropdown')
  const resultadosButton = document.getElementById('resultados-menu-button')
  const resultadosDropdown = document.getElementById('resultados-dropdown')

  if (mesasButton && mesasDropdown) {
    if (!mesasButton.contains(e.target) && !mesasDropdown.contains(e.target)) {
      showMesasMenu.value = false
    }
  }

  if (resultadosButton && resultadosDropdown) {
    if (!resultadosButton.contains(e.target) && !resultadosDropdown.contains(e.target)) {
      showResultadosMenu.value = false
    }
  }
}

onMounted(() => {
  document.addEventListener('click', closeMenus)
})

onUnmounted(() => {
  document.removeEventListener('click', closeMenus)
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navegación Horizontal -->
    <nav class="bg-white shadow-sm fixed w-full z-10">
      <div class="max-w-7xl mx-auto px-4">
        <div class="flex justify-between h-16">
          <!-- Logo y enlaces izquierdos -->
          <div class="flex">
            <div class="flex-shrink-0 flex items-center">
              <h1 class="text-xl font-bold text-gray-900">Domino App</h1>
            </div>
            <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
              <router-link 
                to="/" 
                class="inline-flex items-center px-1 pt-1 text-gray-700 hover:text-gray-900"
                :class="{ 'border-b-2 border-gray-900': $route.path === '/' }"
              >
                Inicio
              </router-link>
            </div>
          </div>

          <!-- Enlaces derechos -->
          <div class="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-8">
            <router-link 
              to="/parejas" 
              class="inline-flex items-center px-1 pt-1 text-gray-700 hover:text-gray-900"
              :class="{ 'border-b-2 border-gray-900': $route.path.startsWith('/parejas') }"
            >
              Parejas
            </router-link>

            <!-- Menú desplegable de Mesas -->
            <div class="relative">
              <button 
                id="mesas-menu-button"
                @click="showMesasMenu = !showMesasMenu"
                class="inline-flex items-center px-1 pt-1 text-gray-700 hover:text-gray-900"
              >
                <span>Mesas</span>
                <svg 
                  class="ml-2 w-5 h-5 transition-transform duration-200"
                  :class="{ 'transform rotate-180': showMesasMenu }"
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div 
                id="mesas-dropdown"
                v-show="showMesasMenu" 
                class="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5"
              >
                <div class="py-1">
                  <router-link 
                    to="/mesas/asignacion" 
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    :class="{ 'bg-gray-100': $route.path === '/mesas/asignacion' }"
                  >
                    Asignación
                  </router-link>
                  <router-link 
                    to="/mesas/registro" 
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    :class="{ 'bg-gray-100': $route.path === '/mesas/registro' }"
                  >
                    Registro
                  </router-link>
                </div>
              </div>
            </div>

            <!-- Menú desplegable de Resultados -->
            <div class="relative">
              <button 
                id="resultados-menu-button"
                @click="showResultadosMenu = !showResultadosMenu"
                class="inline-flex items-center px-1 pt-1 text-gray-700 hover:text-gray-900"
              >
                <span>Resultados</span>
                <svg 
                  class="ml-2 w-5 h-5 transition-transform duration-200"
                  :class="{ 'transform rotate-180': showResultadosMenu }"
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div 
                id="resultados-dropdown"
                v-show="showResultadosMenu" 
                class="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5"
              >
                <div class="py-1">
                  <router-link 
                    to="/ranking" 
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    :class="{ 'bg-gray-100': $route.path === '/ranking' }"
                  >
                    Ranking
                  </router-link>
                  <router-link 
                    to="/podium" 
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    :class="{ 'bg-gray-100': $route.path === '/podium' }"
                  >
                    Podium
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Contenido Principal -->
    <div class="pt-16">
      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <router-view></router-view>
      </main>
    </div>
  </div>
</template>

<style scoped>
.transform {
  transition: transform 0.2s ease-in-out;
}
</style>
