<template>
  <div class="container mx-auto px-4 py-8">
    <div class="bg-white shadow rounded-lg p-6">
      <h1 class="text-2xl font-bold text-gray-900 mb-6">Configuración</h1>
      
      <div class="space-y-6">
        <!-- Sección de Configuración General -->
        <div class="border-b pb-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Configuración General</h2>
          
          <div class="space-y-4">
            <!-- Opciones de configuración general -->
            <div>
              <label for="tema" class="block text-sm font-medium text-gray-700">Tema</label>
              <select 
                id="tema"
                v-model="configuracion.tema"
                class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              >
                <option value="claro">Claro</option>
                <option value="oscuro">Oscuro</option>
              </select>
            </div>
          </div>
        </div>
        
        <!-- Sección de Configuración de Impresión -->
        <div class="border-b pb-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Configuración de Impresión</h2>
          
          <div class="space-y-4">
            <!-- Opciones de configuración de impresión -->
            <div>
              <label for="formatoPapel" class="block text-sm font-medium text-gray-700">Formato de Papel</label>
              <select 
                id="formatoPapel"
                v-model="configuracion.formatoPapel"
                class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              >
                <option value="a4">A4</option>
                <option value="carta">Carta</option>
              </select>
            </div>
            
            <div>
              <label for="orientacion" class="block text-sm font-medium text-gray-700">Orientación</label>
              <select 
                id="orientacion"
                v-model="configuracion.orientacion"
                class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              >
                <option value="vertical">Vertical</option>
                <option value="horizontal">Horizontal</option>
              </select>
            </div>
          </div>
        </div>
        
        <!-- Botones de acción -->
        <div class="flex justify-end space-x-3">
          <button 
            @click="guardarConfiguracion" 
            class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Guardar Configuración
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

// Valores por defecto de configuración
const configuracionDefecto = {
  tema: 'claro',
  formatoPapel: 'a4',
  orientacion: 'vertical'
};

// Estado reactivo para la configuración
const configuracion = ref({...configuracionDefecto});

// Cargar configuración al montar el componente
onMounted(() => {
  // Intentar cargar la configuración desde localStorage
  const configuracionGuardada = localStorage.getItem('app_configuracion');
  if (configuracionGuardada) {
    try {
      const configuracionParseada = JSON.parse(configuracionGuardada);
      configuracion.value = {...configuracionDefecto, ...configuracionParseada};
    } catch (error) {
      console.error('Error al cargar la configuración:', error);
      // Si hay error, usar configuración por defecto
      configuracion.value = {...configuracionDefecto};
    }
  }
});

// Guardar configuración
const guardarConfiguracion = () => {
  try {
    // Guardar en localStorage
    localStorage.setItem('app_configuracion', JSON.stringify(configuracion.value));
    alert('Configuración guardada correctamente');
  } catch (error) {
    console.error('Error al guardar la configuración:', error);
    alert('Error al guardar la configuración');
  }
};
</script> 