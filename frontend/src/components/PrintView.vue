<script setup>
import posicionamientoService from '../services/posicionamientoService';

const props = defineProps({
  mesasParaImprimir: Array,
  campeonato: Object,
  plantillaImagenUrl: String,
  escalaLogo: {
    type: Number,
    default: 0.7
  }
});

// Función para manejar errores de carga del logo
const handleLogoError = (event) => {
  console.error('Error al cargar el logo:', event.target.src);
};
</script>

<template>
  <div id="print-container" class="print-container">
    <!-- Imprimir todas las mesas, 2 por página -->
    <template v-for="(mesa, index) in mesasParaImprimir" :key="mesa.id">
      <!-- Crear una nueva página cada dos mesas (índices 0, 2, 4, etc.) -->
      <div v-if="index % 2 === 0" :id="`print-page-${Math.floor(index/2)}`" class="print-page">
        <!-- Imagen de fondo del formulario -->
        <div class="print-template-image">
          <!-- Primera cargamos la plantilla de fondo -->
          <img :src="plantillaImagenUrl" alt="Plantilla de mesas" class="template-image" />
          
          <!-- Superponemos los logos y datos - Aseguramos que se muestren encima usando z-index alto -->
          
          <!-- Logo izquierdo - Ajustado a la casilla "Logo" -->
          <div :style="posicionamientoService.obtenerEstiloPosicionTexto('logoCampeonato', index, 'izquierda')" class="logo-container">
            <img v-if="campeonato?.logo" 
                 :src="campeonato.logo" 
                 alt="Logo mesa izquierda" 
                 :style="posicionamientoService.obtenerEstiloPosicionTexto('logoImagen', index, 'izquierda', escalaLogo)" 
                 @error="handleLogoError" />
          </div>
          
          <!-- Logo derecho (solo si hay una mesa siguiente) -->
          <div v-if="index + 1 < mesasParaImprimir.length" 
               :style="posicionamientoService.obtenerEstiloPosicionTexto('logoCampeonato', index + 1, 'derecha')" 
               class="logo-container">
            <img v-if="campeonato?.logo" 
                 :src="campeonato.logo" 
                 alt="Logo mesa derecha" 
                 :style="posicionamientoService.obtenerEstiloPosicionTexto('logoImagen', index + 1, 'derecha', escalaLogo)" 
                 @error="handleLogoError" />
          </div>
          
          <!-- Datos de la primera mesa (izquierda) -->
          <div class="template-overlay left-side">
            <!-- Nombre del campeonato -->
            <div class="form-field" :style="posicionamientoService.obtenerEstiloPosicionTexto('nombreCampeonato', index, 'izquierda')">
              {{ campeonato?.nombre || '' }}
            </div>
            
            <!-- Número de mesa y partida -->
            <div class="form-field" :style="posicionamientoService.obtenerEstiloPosicionTexto('mesaNumero', index, 'izquierda')">
              {{ mesa.id }}
            </div>
            <div class="form-field" :style="posicionamientoService.obtenerEstiloPosicionTexto('partidaNumero', index, 'izquierda')">
              {{ campeonato?.partida_actual || '' }}
            </div>
            
            <!-- Datos pareja izquierda -->
            <div class="form-field" :style="posicionamientoService.obtenerEstiloPosicionTexto('posicion', index, 'izquierda')">
              {{ mesa.pareja1?.ranking_posicion || '-' }}
            </div>
            <div class="form-field" :style="posicionamientoService.obtenerEstiloPosicionTexto('pg', index, 'izquierda')">
              {{ mesa.pareja1?.partidas_ganadas || '0' }}
            </div>
            <div class="form-field" :style="posicionamientoService.obtenerEstiloPosicionTexto('diferencia', index, 'izquierda')">
              {{ mesa.pareja1?.diferencia || '0' }}
            </div>
            
            <!-- Datos pareja derecha (en la mesa izquierda) -->
            <div class="form-field" :style="posicionamientoService.obtenerEstiloPosicionTexto('posicionOponente', index, 'izquierda')">
              {{ mesa.pareja2?.ranking_posicion || '-' }}
            </div>
            <div class="form-field" :style="posicionamientoService.obtenerEstiloPosicionTexto('pgOponente', index, 'izquierda')">
              {{ mesa.pareja2?.partidas_ganadas || '0' }}
            </div>
            <div class="form-field" :style="posicionamientoService.obtenerEstiloPosicionTexto('diferenciaOponente', index, 'izquierda')">
              {{ mesa.pareja2?.diferencia || '0' }}
            </div>
          </div>
          
          <!-- Datos de la segunda mesa (derecha) -->
          <div v-if="index + 1 < mesasParaImprimir.length" class="template-overlay right-side">
            <!-- Nombre del campeonato -->
            <div class="form-field" :style="posicionamientoService.obtenerEstiloPosicionTexto('nombreCampeonato', index + 1, 'derecha')">
              {{ campeonato?.nombre || '' }}
            </div>
            
            <!-- Número de mesa y partida -->
            <div class="form-field" :style="posicionamientoService.obtenerEstiloPosicionTexto('mesaNumero', index + 1, 'derecha')">
              {{ mesasParaImprimir[index + 1].id }}
            </div>
            <div class="form-field" :style="posicionamientoService.obtenerEstiloPosicionTexto('partidaNumero', index + 1, 'derecha')">
              {{ campeonato?.partida_actual || '' }}
            </div>
            
            <!-- Datos pareja izquierda (en la mesa derecha) -->
            <div class="form-field" :style="posicionamientoService.obtenerEstiloPosicionTexto('posicion', index + 1, 'derecha')">
              {{ mesasParaImprimir[index + 1].pareja1?.ranking_posicion || '-' }}
            </div>
            <div class="form-field" :style="posicionamientoService.obtenerEstiloPosicionTexto('pg', index + 1, 'derecha')">
              {{ mesasParaImprimir[index + 1].pareja1?.partidas_ganadas || '0' }}
            </div>
            <div class="form-field" :style="posicionamientoService.obtenerEstiloPosicionTexto('diferencia', index + 1, 'derecha')">
              {{ mesasParaImprimir[index + 1].pareja1?.diferencia || '0' }}
            </div>
            
            <!-- Datos pareja derecha (en la mesa derecha) -->
            <div class="form-field" :style="posicionamientoService.obtenerEstiloPosicionTexto('posicionOponente', index + 1, 'derecha')">
              {{ mesasParaImprimir[index + 1].pareja2?.ranking_posicion || '-' }}
            </div>
            <div class="form-field" :style="posicionamientoService.obtenerEstiloPosicionTexto('pgOponente', index + 1, 'derecha')">
              {{ mesasParaImprimir[index + 1].pareja2?.partidas_ganadas || '0' }}
            </div>
            <div class="form-field" :style="posicionamientoService.obtenerEstiloPosicionTexto('diferenciaOponente', index + 1, 'derecha')">
              {{ mesasParaImprimir[index + 1].pareja2?.diferencia || '0' }}
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.logo-container {
  position: absolute;
  z-index: 10;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: visible;
}

/* Asegurar que la imagen del logo se visualice correctamente */
img[alt^="Logo mesa"] {
  max-width: 100%;
  max-height: 100%;
  width: auto !important;
  height: auto !important;
  object-fit: contain;
  object-position: center;
}

/* Estilos específicos para modo impresión cuando es ventana de impresión */
.print-container {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  overflow: hidden;
  padding: 0;
  margin: 0;
}

/* Estilos específicos para modo impresión cuando es ventana de impresión */
.print-page {
  width: 100%;
  height: 100%;
  position: relative;
  page-break-after: always;
  box-sizing: border-box;
  padding: 0;
  margin: 0;
  overflow: hidden;
}

.print-template-image {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  overflow: hidden;
}

.template-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  /* Asegurar que la imagen de plantilla se procese primero */
  z-index: 1;
}

.template-overlay {
  position: relative;
  z-index: 15;
}

.left-side, .right-side {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.form-field {
  position: absolute;
  text-align: center;
  font-family: Arial, sans-serif;
  font-size: 10pt;
  color: black;
  /* Asegurar que el texto se renderice encima de la imagen */
  z-index: 20;
}

/* Último elemento sin salto de página */
.print-page:last-child {
  page-break-after: auto;
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