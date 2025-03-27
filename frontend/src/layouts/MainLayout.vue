<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Navbar -->
    <nav class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex h-16">
          <div class="flex flex-col w-full">
            <!-- Logo -->
            <div class="flex-shrink-0 flex items-center h-16">
              <div v-if="campeonatoInfo && campeonatoInfo.logo" class="mr-3 h-10 w-10 flex items-center justify-center bg-gray-100 border border-gray-200 rounded overflow-hidden">
                <!-- Probar múltiples opciones de URL -->
                <img 
                  :src="getLogoUrl(campeonatoInfo.logo)" 
                  alt="Logo del campeonato" 
                  class="max-h-10 max-w-10 object-contain"
                  style="display: block; min-height: 30px; min-width: 30px;"
                  @error="handleImageError"
                  @load="handleImageLoaded"
                />
                <!-- Fallback directo para prueba -->
                <img 
                  v-if="false"
                  :src="campeonatoInfo.logo"
                  alt="Logo directo" 
                  class="hidden"
                />
              </div>
              <h1 class="text-xl font-bold text-gray-900">Domino App</h1>
            </div>
            <!-- Navigation Links -->
            <div class="flex flex-col space-y-2 py-2">
              <router-link
                v-for="item in navigationItems"
                :key="item.name"
                :to="item.to"
                class="inline-flex items-center px-3 py-2 border-l-4"
                :class="[
                  $route.path === item.to
                    ? 'border-primary-500 text-gray-900 bg-gray-50'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 hover:bg-gray-50'
                ]"
              >
                {{ item.name }}
              </router-link>
              <!-- Submenú de Resultados -->
              <div class="pl-4">
                <router-link
                  v-for="subItem in resultadosItems"
                  :key="subItem.name"
                  :to="subItem.to"
                  class="inline-flex items-center px-3 py-2 border-l-4 w-full"
                  :class="[
                    $route.path === subItem.to
                      ? 'border-primary-500 text-gray-900 bg-gray-50'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 hover:bg-gray-50'
                  ]"
                >
                  {{ subItem.name }}
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Page Content -->
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <!-- Debug panel - solo visible en modo desarrollo -->
      <div v-if="isDev" class="bg-yellow-100 p-4 mb-4 rounded-lg border border-yellow-400">
        <h3 class="font-bold text-yellow-800">Panel de depuración</h3>
        <div v-if="campeonatoInfo" class="mt-2">
          <p>Datos del campeonato:</p>
          <ul class="ml-4 text-sm">
            <li><strong>Nombre:</strong> {{ campeonatoInfo.nombre }}</li>
            <li><strong>URL del logo:</strong> {{ campeonatoInfo.logo }}</li>
            <li><strong>URL final:</strong> {{ getLogoUrl(campeonatoInfo.logo) }}</li>
          </ul>
        </div>
        <div v-else class="mt-2 text-red-600">
          No hay datos de campeonato
        </div>
      </div>

      <slot></slot>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useCampeonatoStore } from '../stores/campeonato';

const navigationItems = [
  { name: 'Home', to: '/' },
  { name: 'Parejas', to: '/parejas' },
  { name: 'Mesas', to: '/mesas' },
  { name: 'Resultados', to: '/resultados' }
];

const resultadosItems = [
  { name: 'Ranking', to: '/resultados' },
  { name: 'Podium', to: '/podium' },
  { name: 'Ranking Completo', to: '/ranking' }
];

// Recuperar información del campeonato desde localStorage y store
const campeonatoInfo = ref(null);
const campeonatoStore = useCampeonatoStore();

// Intentar cargar el campeonato desde el store
watch(() => campeonatoStore.campeonato, (nuevoCampeonato) => {
  if (nuevoCampeonato) {
    console.log('Campeonato actualizado desde el store:', nuevoCampeonato);
    campeonatoInfo.value = nuevoCampeonato;
  }
});

onMounted(async () => {
  // Función para actualizar el campeonato desde el servidor
  const actualizarDatosDelServidor = async () => {
    try {
      console.log('Solicitando campeonato actualizado del servidor...');
      await campeonatoStore.obtenerActual();
      if (campeonatoStore.campeonato) {
        console.log('Campeonato actualizado desde servidor:', campeonatoStore.campeonato);
        // Guardar en la variable reactiva
        campeonatoInfo.value = campeonatoStore.campeonato;
        console.log('Logo actualizado:', campeonatoInfo.value.logo);
      }
    } catch (e) {
      console.error('Error al obtener campeonato del servidor:', e);
    }
  };

  // 1. Intentar obtener del localStorage primero para mostrar rápidamente
  const campeonatoData = localStorage.getItem('campeonato');
  if (campeonatoData) {
    try {
      const parsedData = JSON.parse(campeonatoData);
      console.log('Campeonato cargado desde localStorage:', parsedData);
      console.log('Logo en localStorage:', parsedData.logo);
      campeonatoInfo.value = parsedData;
    } catch (e) {
      console.error('Error al parsear datos del localStorage:', e);
    }
  }

  // 2. Actualizamos inmediatamente con datos del servidor
  await actualizarDatosDelServidor();

  // 3. Configurar un intervalo para actualizar periódicamente (cada 30 segundos)
  const intervalId = setInterval(actualizarDatosDelServidor, 30000);

  // 4. Observar cambios en localStorage para sincronizar entre pestañas
  window.addEventListener('storage', (e) => {
    if (e.key === 'campeonato') {
      console.log('Evento storage detectado para campeonato');
      if (e.newValue) {
        try {
          const parsedData = JSON.parse(e.newValue);
          console.log('Nuevos datos de campeonato desde storage:', parsedData);
          console.log('Nuevo logo desde storage:', parsedData.logo);
          campeonatoInfo.value = parsedData;
        } catch (e) {
          console.error('Error al parsear datos del evento storage:', e);
        }
      } else {
        console.log('Campeonato eliminado del localStorage');
        campeonatoInfo.value = null;
      }
    }
  });

  // Limpiar el intervalo cuando el componente se desmonte
  return () => {
    clearInterval(intervalId);
  };
});

// Función para manejar errores de carga de imagen
const handleImageError = (event) => {
  console.error('Error al cargar la imagen del logo:', event);
  console.log('URL de la imagen con error:', event.target.src);
  // Opcional: mostrar una imagen de fallback o esconder el contenedor
};

// Función para corregir la URL del logo si es necesario
const getLogoUrl = (url) => {
  if (!url) return null;
  
  console.log('Procesando URL del logo:', url);
  
  // Si ya es una URL completa, devolverla tal cual
  if (url.startsWith('http://') || url.startsWith('https://')) {
    console.log('URL ya completa, devolviendo:', url);
    return url;
  }
  
  // Si es una ruta relativa, añadir la URL base
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  let finalUrl = '';
  
  if (url.startsWith('/static/')) {
    // URLs que empiezan con /static/ solo necesitan el baseUrl
    finalUrl = `${baseUrl}${url}`;
  } else if (url.startsWith('/')) {
    // Otras URLs que comienzan con / solo necesitan el baseUrl
    finalUrl = `${baseUrl}${url}`;
  } else {
    // URLs sin / inicial necesitan un / adicional
    finalUrl = `${baseUrl}/${url}`;
  }
  
  console.log('URL final construida:', finalUrl);
  return finalUrl;
};

// Función para registrar cuando la imagen se carga correctamente
const handleImageLoaded = (event) => {
  console.log('Imagen del logo cargada correctamente');
  console.log('URL de la imagen cargada:', event.target.src);
};

// Variable para detectar si estamos en modo desarrollo
const isDev = ref(import.meta.env.DEV);
</script>

<style scoped>
.border-primary-500 {
  border-color: #3B82F6;
}
</style> 