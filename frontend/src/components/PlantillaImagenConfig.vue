<template>
  <div class="p-4 bg-white shadow rounded-lg">
    <h2 class="text-lg font-semibold mb-4">Configuración de Plantilla de Mesas</h2>
    
    <!-- Previsualización de la imagen actual -->
    <div v-if="imagenUrl" class="mb-4">
      <h3 class="text-md font-medium mb-2">Plantilla Actual:</h3>
      <div class="border border-gray-300 p-2 rounded-md" style="aspect-ratio: 297/210; max-width: 100%;">
        <img :src="imagenUrl" class="w-full h-full object-contain" alt="Plantilla actual" />
      </div>
      <p class="mt-1 text-xs text-gray-500">Vista previa a escala (proporción A4 horizontal)</p>
    </div>

    <!-- Estado de carga -->
    <div v-if="cargando" class="mb-4 flex items-center justify-center py-3">
      <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      <span class="ml-2 text-sm text-gray-600">Guardando plantilla...</span>
    </div>
    
    <!-- Mensaje de error -->
    <div v-if="error" class="mb-4 bg-red-50 border border-red-300 rounded-md p-3 text-sm text-red-600">
      {{ error }}
    </div>
    
    <!-- Selección de imagen -->
    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Seleccionar Nueva Plantilla
      </label>
      <input 
        type="file" 
        accept="image/*" 
        @change="manejarSeleccionImagen"
        class="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />
      <p class="mt-1 text-sm text-gray-500">
        Selecciona una imagen PNG o JPG que servirá como plantilla para la impresión de mesas.
      </p>
      <p class="mt-1 text-sm font-medium text-red-500">
        Importante: La imagen debe estar en formato A4 horizontal (297mm x 210mm) para una impresión correcta.
      </p>
    </div>
    
    <!-- Botones de acción -->
    <div class="flex justify-between">
      <!-- Botones de guardar -->
      <div class="space-x-3">
        <button 
          @click="guardarPlantilla" 
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          :disabled="!imagenSeleccionada || cargando"
        >
          Guardar Plantilla
        </button>
      </div>
      
      <!-- Botones de exportar/importar -->
      <div class="space-x-3">
        <button 
          v-if="imagenUrl !== imagenPredeterminada"
          @click="exportarPlantilla" 
          class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          :disabled="cargando"
        >
          Exportar Plantilla
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { plantillaService } from '../services/api';

// Valor predeterminado para la imagen
const imagenPredeterminada = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI2MDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0id2hpdGUiLz48dGV4dCB4PSI2MDAiIHk9IjMwMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJibGFjayI+Q2FyZ3VlIGxhIGltYWdlbiBkZSBwbGFudGlsbGEgZGVzZGUgbGEgb3BjacOzbiAnQ29uZmlndXJhciBQbGFudGlsbGEnPC90ZXh0Pjwvc3ZnPg==';

const props = defineProps({
  imagenUrlActual: {
    type: String,
    default: imagenPredeterminada
  }
});

const emit = defineEmits(['actualizar-plantilla']);

const imagenUrl = ref(props.imagenUrlActual);
const imagenSeleccionada = ref(null);
const cargando = ref(false);
const error = ref(null);

// Manejar la selección de una nueva imagen
const manejarSeleccionImagen = (event) => {
  const file = event.target.files[0];
  if (file) {
    error.value = null;
    imagenSeleccionada.value = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      imagenUrl.value = e.target.result;
    };
    reader.readAsDataURL(file);
  }
};

// Guardar la plantilla seleccionada en el servidor
const guardarPlantilla = async () => {
  if (imagenSeleccionada.value) {
    cargando.value = true;
    error.value = null;
    
    try {
      // Subir la imagen al servidor usando plantillaService
      const response = await plantillaService.subirPlantilla(imagenUrl.value);
      
      // Si todo va bien, actualizar la URL con la devuelta por el servidor
      if (response && response.url) {
        // Actualizar la URL local y en localStorage como respaldo
        localStorage.setItem('plantilla_mesas_url', response.url);
        
        // Emitir evento con la URL del servidor
        emit('actualizar-plantilla', response.url);
        
        imagenSeleccionada.value = null;
      } else {
        throw new Error('No se recibió una URL válida del servidor');
      }
    } catch (err) {
      console.error('Error al guardar la plantilla:', err);
      error.value = 'Error al guardar la plantilla: ' + (err.message || 'Ocurrió un error en el servidor');
    } finally {
      cargando.value = false;
    }
  }
};

// Restaurar la plantilla predeterminada
// Mantenemos esta función por si se necesita en el futuro aunque ya no tenga botón en la interfaz
const restaurarPlantillaPredeterminada = () => {
  cargando.value = true;
  error.value = null;
  
  try {
    imagenUrl.value = imagenPredeterminada;
    imagenSeleccionada.value = null;
    
    // Guardar en localStorage como respaldo
    localStorage.setItem('plantilla_mesas_url', imagenPredeterminada);
    
    // Emitir evento
    emit('actualizar-plantilla', imagenPredeterminada);
  } catch (err) {
    console.error('Error al restaurar la plantilla predeterminada:', err);
    error.value = 'Error al restaurar la plantilla predeterminada';
  } finally {
    cargando.value = false;
  }
};

// Exportar la plantilla como archivo
const exportarPlantilla = () => {
  // Crear un enlace para descargar la imagen
  const link = document.createElement('a');
  
  // Determinar la extensión de archivo apropiada según el tipo de datos
  let extension = 'png';
  if (imagenUrl.value.startsWith('data:image/jpeg')) {
    extension = 'jpg';
  } else if (imagenUrl.value.startsWith('data:image/svg+xml')) {
    extension = 'svg';
  }
  
  // Configurar y simular clic en el enlace para descargar
  link.href = imagenUrl.value;
  link.download = `plantilla_mesas.${extension}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Cargar la plantilla desde el servidor al montar el componente
onMounted(async () => {
  cargando.value = true;
  error.value = null;
  
  try {
    // Intentar obtener la plantilla del servidor primero
    const serverUrl = await plantillaService.obtenerPlantilla();
    
    if (serverUrl) {
      // Si hay una plantilla en el servidor, usarla
      imagenUrl.value = serverUrl;
    } else {
      // Si no hay plantilla en el servidor, usar la del localStorage o la predeterminada
      imagenUrl.value = props.imagenUrlActual;
    }
  } catch (err) {
    console.error('Error al cargar la plantilla:', err);
    // Si hay un error, usar la URL proporcionada como prop
    imagenUrl.value = props.imagenUrlActual;
  } finally {
    cargando.value = false;
  }
});
</script>

<style scoped>
/* Estilos adicionales si son necesarios */
</style> 