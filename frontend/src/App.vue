<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterView, useRouter } from 'vue-router'
import { campeonatoService, resultadoService } from './services/api'
import { plantillaService } from './services/api'
import AppHeader from './components/AppHeader.vue'
import PlantillaModal from './components/PlantillaModal.vue'
import impresionService from './services/impresionService'
import rankingPrintService from './services/rankingPrintService'

// Inicializar el router
const router = useRouter()

// Verificar si esta ventana es para impresión
const esVentanaImpresion = ref(false)

// Referencias para los datos
const campeonato = ref(null)
const mesasParaImprimir = ref([])

// Variable para controlar si hay una impresión en curso
const impresionEnProceso = ref(false)
// Tiempo de la última impresión
let ultimaLlamadaImpresion = 0

// Ruta de la imagen de plantilla (usar placeholder base64 si no hay una personalizada)
const plantillaImagenUrl = ref('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI2MDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0id2hpdGUiLz48dGV4dCB4PSI2MDAiIHk9IjMwMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJibGFjayI+Q2FyZ3VlIGxhIGltYWdlbiBkZSBwbGFudGlsbGEgZGVzZGUgbGEgb3BjacOzbiAnQ29uZmlndXJhciBQbGFudGlsbGEnPC90ZXh0Pjwvc3ZnPg==')

// Escala del logo (entre 0.5 y 1.0)
const escalaLogo = ref(0.7)

// Posición del logo
const posicionLogo = ref({
  izquierda: { top: 15, left: 20, width: 120, height: 70 },
  derecha: { top: 15, left: 690, width: 120, height: 70 }
})

// Modales
const mostrarModalPlantilla = ref(false)

// Correcto: esto se ejecuta antes de cualquier await
onUnmounted(() => {
  // limpieza aquí
})

// Función para imprimir las mesas
const imprimir = async () => {
  // Evitar doble clic
  if (impresionEnProceso.value) {
    alert('Ya hay una impresión en proceso. Por favor, espere.');
    return;
  }

  // Activar bloqueo
  impresionEnProceso.value = true;
  
  try {
    console.log('🔄 Preparando la impresión...');

    // Cargar datos de mesas
    const numMesas = await impresionService.cargarDatosImpresion(
      campeonato,
      mesasParaImprimir
    );

    // Verificar si hay mesas
    if (!numMesas || numMesas === 0) {
      alert('No se encontraron mesas para imprimir. Primero debe asignar mesas a las parejas.');
      impresionEnProceso.value = false;
      return;
    }

    // Imprimir
    console.log(`Enviando ${numMesas} mesas a impresión...`);
    await impresionService.ejecutarImpresion(
      campeonato,
      mesasParaImprimir.value,
      plantillaImagenUrl.value,
      escalaLogo.value
    );
  } catch (error) {
    console.error('Error al imprimir:', error);
    alert('Error al imprimir: ' + error.message);
  } finally {
    // Siempre liberar el estado
    setTimeout(() => {
      impresionEnProceso.value = false;
    }, 2000);
  }
};

// Función para imprimir solo el ranking completo
const imprimirRanking = async () => {
  try {
    // Obtener los datos del ranking
    const rankingData = await resultadoService.obtenerRanking(campeonato.value.id);
    
    // Usar el servicio para imprimir el ranking
    await rankingPrintService.imprimirRanking(rankingData, campeonato.value);
  } catch (error) {
    console.error('Error al imprimir ranking:', error);
    alert('Error al imprimir ranking: ' + error.message);
  }
};

// Función para actualizar la imagen de plantilla
const actualizarPlantilla = async (nuevaUrl) => {
  plantillaImagenUrl.value = nuevaUrl;
  // Guardar la URL en localStorage como respaldo
  localStorage.setItem('plantilla_mesas_url', nuevaUrl);
};

// Función para actualizar la escala del logo
const actualizarEscalaLogo = (nuevaEscala) => {
  escalaLogo.value = nuevaEscala;
  localStorage.setItem('logo_escala', nuevaEscala.toString());
};

// Función para actualizar la posición del logo
const actualizarPosicionLogo = (nuevaPosicion) => {
  // Actualizar solo los lados que cambiaron
  if (nuevaPosicion.izquierda) {
    posicionLogo.value.izquierda = nuevaPosicion.izquierda;
  }
  
  if (nuevaPosicion.derecha) {
    posicionLogo.value.derecha = nuevaPosicion.derecha;
  }
  
  // Actualizar el servicio de posicionamiento
  // Esta funcionalidad requeriría actualizar el servicio posicionamientoService.js
};

// Actualizar el posicionamientoService con la posición manual del logo
const actualizarServicioPosicionamiento = () => {
  // Esta función se implementaría para actualizar el servicio
};

// Función para navegar al posicionamiento desde el menú
const irAPosicionamiento = () => {
  console.log('App: Redirigiendo a la vista de posicionamiento de información');
  router.push('/posicionamiento');
};

onMounted(async () => {
  // Código normal de inicialización para la aplicación
  try {
    // Cargar el campeonato actual
    campeonato.value = await campeonatoService.obtenerActual();
    
    if (campeonato.value && campeonato.value.logo && !campeonato.value.logo.startsWith('http')) {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      campeonato.value.logo = `${baseUrl}${campeonato.value.logo.startsWith('/') ? '' : '/'}${campeonato.value.logo}`;
    }
    
    // Cargar escala del logo desde localStorage
    const storedLogoEscala = localStorage.getItem('logo_escala');
    if (storedLogoEscala) {
      const escalaValue = parseFloat(storedLogoEscala);
      if (!isNaN(escalaValue) && escalaValue >= 0.5 && escalaValue <= 1.0) {
        escalaLogo.value = escalaValue;
      }
    }
    
    // Cargar posición del logo desde localStorage
    try {
      const posLogoIzq = localStorage.getItem('logo_posicion_izquierda');
      const posLogoDer = localStorage.getItem('logo_posicion_derecha');
      
      if (posLogoIzq) {
        posicionLogo.value.izquierda = JSON.parse(posLogoIzq);
      }
      
      if (posLogoDer) {
        posicionLogo.value.derecha = JSON.parse(posLogoDer);
      }
    } catch (error) {
      console.error('Error al cargar posición del logo:', error);
    }
    
    // Intentar cargar la plantilla desde el servidor primero
    try {
      const serverTemplateUrl = await plantillaService.obtenerPlantilla();
      if (serverTemplateUrl) {
        plantillaImagenUrl.value = serverTemplateUrl;
        // Actualizar también el localStorage como respaldo
        localStorage.setItem('plantilla_mesas_url', serverTemplateUrl);
      } else {
        // Si no hay plantilla en el servidor, intentar cargar desde localStorage
        const storedTemplateUrl = localStorage.getItem('plantilla_mesas_url');
        if (storedTemplateUrl) {
          plantillaImagenUrl.value = storedTemplateUrl;
        }
      }
    } catch (error) {
      console.error('Error al cargar la plantilla desde el servidor:', error);
      // Intentar cargar desde localStorage como fallback
      const storedTemplateUrl = localStorage.getItem('plantilla_mesas_url');
      if (storedTemplateUrl) {
        plantillaImagenUrl.value = storedTemplateUrl;
      }
    }
  } catch (error) {
    console.error('Error al inicializar la aplicación:', error);
  }
})
</script>

<template>
  <div class="h-screen flex flex-col">
    <!-- Barra de navegación -->
    <AppHeader 
      :campeonato="campeonato"
      @imprimir="imprimir"
      @imprimir-ranking="imprimirRanking"
      @mostrar-modal-plantilla="mostrarModalPlantilla = true"
      @mostrar-posicionamiento-logo="irAPosicionamiento"
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
      :escala-logo="escalaLogo"
      @actualizar-plantilla="actualizarPlantilla"
      @actualizar-escala-logo="actualizarEscalaLogo"
    />
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