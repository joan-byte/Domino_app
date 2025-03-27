<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterView } from 'vue-router'
import { campeonatoService } from './services/api'
import AppHeader from './components/AppHeader.vue'
import PrintView from './components/PrintView.vue'
import PlantillaModal from './components/PlantillaModal.vue'
import impresionService from './services/impresionService'

// Verificar si esta ventana es para impresión
const esVentanaImpresion = ref(false)

// Referencias para los datos
const campeonato = ref(null)
const mesasParaImprimir = ref([])

// Ruta de la imagen de plantilla (usar placeholder base64 si no hay una personalizada)
const plantillaImagenUrl = ref('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI2MDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0id2hpdGUiLz48dGV4dCB4PSI2MDAiIHk9IjMwMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJibGFjayI+Q2FyZ3VlIGxhIGltYWdlbiBkZSBwbGFudGlsbGEgZGVzZGUgbGEgb3BjacOzbiAnQ29uZmlndXJhciBQbGFudGlsbGEnPC90ZXh0Pjwvc3ZnPg==')

// Modal de configuración de plantilla
const mostrarModalPlantilla = ref(false)

// Función para imprimir las mesas
const imprimir = async () => {
  try {
    await impresionService.ejecutarImpresion(
      campeonato,
      mesasParaImprimir,
      plantillaImagenUrl.value
    );
  } catch (error) {
    alert('Error al imprimir: ' + error.message);
  }
};

// Función para actualizar la imagen de plantilla
const actualizarPlantilla = (nuevaUrl) => {
  plantillaImagenUrl.value = nuevaUrl;
  // Guardar la URL en localStorage
  localStorage.setItem('plantilla_mesas_url', nuevaUrl);
};

onMounted(async () => {
  // Verificar si hay parámetro "imprimir=true" en la URL
  const urlParams = new URLSearchParams(window.location.search);
  esVentanaImpresion.value = urlParams.get('imprimir') === 'true';
  
  // Si es ventana de impresión, configurar para imprimir automáticamente
  if (esVentanaImpresion.value) {
    // Usar los datos pasados por la ventana principal
    if (window.opener) {
      mesasParaImprimir.value = window.opener.mesasParaImprimir || [];
      campeonato.value = window.opener.campeonato || null;
      plantillaImagenUrl.value = window.opener.plantillaImagenUrl || '';
      
      // Imprimir automáticamente después de cargar
      setTimeout(() => {
        window.print();
        // Opcionalmente cerrar después de imprimir
        setTimeout(() => {
          window.close();
        }, 1000);
      }, 500);
    }
    return;
  }
  
  // Código normal de inicialización para la ventana principal
  try {
    // Cargar el campeonato actual
    campeonato.value = await campeonatoService.obtenerActual();
    
    if (campeonato.value && campeonato.value.logo && !campeonato.value.logo.startsWith('http')) {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      campeonato.value.logo = `${baseUrl}${campeonato.value.logo.startsWith('/') ? '' : '/'}${campeonato.value.logo}`;
    }
    
    // Cargar la plantilla guardada
    const storedTemplateUrl = localStorage.getItem('plantilla_mesas_url');
    if (storedTemplateUrl) {
      plantillaImagenUrl.value = storedTemplateUrl;
    }
  } catch (error) {
    console.error('Error al inicializar la aplicación:', error);
  }
})

onUnmounted(() => {
  // Limpiar
})
</script>

<template>
  <div class="h-screen flex flex-col">
    <!-- Mostrar solo el contenido de impresión cuando es ventana de impresión -->
    <template v-if="esVentanaImpresion">
      <PrintView 
        :mesas-para-imprimir="mesasParaImprimir"
        :campeonato="campeonato"
        :plantilla-imagen-url="plantillaImagenUrl"
      />
    </template>
    
    <!-- Interfaz normal cuando no es ventana de impresión -->
    <template v-else>
      <!-- Barra de navegación -->
      <AppHeader 
        :campeonato="campeonato"
        @imprimir="imprimir"
        @mostrar-modal-plantilla="mostrarModalPlantilla = true"
      />

      <!-- Contenido Principal -->
      <div class="pt-24">
        <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RouterView />
        </main>
      </div>

      <!-- Modal para configurar la plantilla de impresión -->
      <PlantillaModal
        v-model:mostrar="mostrarModalPlantilla"
        :plantilla-imagen-url="plantillaImagenUrl"
        @actualizar-plantilla="actualizarPlantilla"
      />
    </template>
  </div>
</template>

<style>
/* Estilos básicos */
body {
  margin: 0;
  padding: 0;
}

/* Estilos para ventanas normales */
@media not print {
  .print-only {
    display: none !important;
  }
}

/* Estilos específicos para impresión */
@media print {
  /* Ocultar todo menos el contenido de impresión */
  body {
    margin: 0 !important;
    padding: 0 !important;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
  
  /* Configuración básica de página sin márgenes */
  @page {
    size: A4 landscape;
    margin: 0cm;
  }
}
</style>
