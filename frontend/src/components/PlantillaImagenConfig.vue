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
    <div class="flex justify-end space-x-3">
      <button 
        @click="guardarPlantilla" 
        class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        :disabled="!imagenSeleccionada"
      >
        Guardar Plantilla
      </button>
      <button 
        v-if="imagenUrl !== imagenPredeterminada"
        @click="restaurarPlantillaPredeterminada" 
        class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
      >
        Restaurar Predeterminada
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

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

// Manejar la selección de una nueva imagen
const manejarSeleccionImagen = (event) => {
  const file = event.target.files[0];
  if (file) {
    imagenSeleccionada.value = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      imagenUrl.value = e.target.result;
    };
    reader.readAsDataURL(file);
  }
};

// Guardar la plantilla seleccionada
const guardarPlantilla = () => {
  if (imagenSeleccionada.value) {
    // En un entorno real, aquí podrías subir la imagen al servidor
    // Por ahora, solo emitimos el evento con la URL de datos
    emit('actualizar-plantilla', imagenUrl.value);
    imagenSeleccionada.value = null;
  }
};

// Restaurar la plantilla predeterminada
const restaurarPlantillaPredeterminada = () => {
  imagenUrl.value = imagenPredeterminada;
  imagenSeleccionada.value = null;
  emit('actualizar-plantilla', imagenUrl.value);
};

// Cargar la imagen actual al montar el componente
onMounted(() => {
  imagenUrl.value = props.imagenUrlActual;
});
</script>

<style scoped>
/* Estilos adicionales si son necesarios */
</style> 