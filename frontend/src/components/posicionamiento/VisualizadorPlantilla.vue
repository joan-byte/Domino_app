<template>
  <div class="visualizador-wrapper">
    <!-- Controles de escala - los mantenemos para permitir zoom in/out pero no afectarán la posición real -->
    <div class="controles-escala">
      <button @click="disminuirEscala" class="boton-escala" :disabled="escala <= 0.5">-</button>
      <span class="escala-valor">{{ Math.round(escala * 100) }}%</span>
      <button @click="aumentarEscala" class="boton-escala" :disabled="escala >= 2">+</button>
      <button @click="resetearEscala" class="boton-resetear-escala" :class="{ 'boton-destacado': escala !== 1 }">
        <span>Escala 1:1</span>
      </button>
    </div>

    <!-- Indicador de tamaño real de impresión -->
    <div class="info-tamanio-impresion">
      Tamaño real de impresión: A4 Apaisado (842×595 px)
    </div>
    
    <div ref="contenedorRef" class="visualizador-plantilla">
      <!-- Contenedor con dimensiones exactas de A4 apaisado -->
      <div class="pagina" :style="{ transform: `scale(${escala})` }">
        <!-- Imagen de fondo de la plantilla -->
        <img 
          v-if="plantillaImagenUrl" 
          :src="plantillaImagenUrl" 
          class="plantilla-imagen" 
          alt="Plantilla para posicionar" 
        />
        <div v-else class="sin-plantilla">
          <p>No se ha cargado ninguna plantilla</p>
        </div>
        
        <!-- Contenedor para elementos posicionados -->
        <div class="elementos-container">
          <slot></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, onUnmounted } from 'vue';

/**
 * Props del componente
 */
const props = defineProps({
  // URL de la imagen de plantilla
  plantillaImagenUrl: {
    type: String,
    default: ''
  },
  // Escala inicial
  escalaInicial: {
    type: Number,
    default: 1
  }
});

const emit = defineEmits(['update:escala']);

// Referencias y estado
const contenedorRef = ref(null);
const escala = ref(props.escalaInicial);

// Controles de escala - solo para visualización, no afecta posiciones reales
const aumentarEscala = () => {
  escala.value = Math.min(2, escala.value + 0.1);
  emit('update:escala', escala.value);
};

const disminuirEscala = () => {
  escala.value = Math.max(0.5, escala.value - 0.1);
  emit('update:escala', escala.value);
};

// Resetear a escala 1:1 para posicionamiento preciso
const resetearEscala = () => {
  escala.value = 1; // Siempre volver a 1:1 para posicionamiento exacto
  emit('update:escala', escala.value);
};

// Actualizar escala cuando cambie la escala inicial
watch(() => props.escalaInicial, (nuevoValor) => {
  escala.value = nuevoValor;
});

// Configuración inicial
onMounted(() => {
  // Para asegurar que empezamos con la escala proporcionada
  escala.value = props.escalaInicial;
  emit('update:escala', escala.value);
});
</script>

<style scoped>
.visualizador-wrapper {
  position: relative;
  width: 100%;
  overflow-x: auto; /* Permitir scroll horizontal si es necesario */
  margin-bottom: 20px;
}

.info-tamanio-impresion {
  background-color: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  padding: 4px 8px;
  font-size: 0.85rem;
  border-radius: 4px;
  margin-bottom: 8px;
  text-align: center;
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.visualizador-plantilla {
  position: relative;
  margin: 0 auto;
  padding: 10px;
}

.pagina {
  position: relative;
  width: 842px; /* Ancho exacto de A4 apaisado */
  height: 595px; /* Alto exacto de A4 apaisado */
  transform-origin: top left;
  overflow: visible; /* Permitir que los elementos sean visibles fuera de los límites */
  background-color: white;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

/* Asegurar que los elementos del lado derecho sean visibles */
:deep(.elemento-arrastrable) {
  z-index: 10;
}

/* Aumentar z-index para lado derecho */
:deep(.elemento-derecho) {
  z-index: 20;
}

.controles-escala {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  display: flex;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 0.25rem;
  border: 1px solid #e5e7eb;
  padding: 0.25rem;
  z-index: 50;
}

.boton-escala {
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 0.25rem;
  cursor: pointer;
  font-weight: bold;
}

.boton-escala:hover:not(:disabled) {
  background-color: #e5e7eb;
}

.boton-escala:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.escala-valor {
  margin: 0 0.5rem;
  min-width: 3rem;
  text-align: center;
  font-size: 0.875rem;
}

.boton-resetear-escala {
  padding: 0 0.5rem;
  height: 1.5rem;
  margin-left: 0.5rem;
  background-color: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 0.25rem;
  cursor: pointer;
  font-size: 0.75rem;
}

.boton-resetear-escala:hover {
  background-color: #e5e7eb;
}

.boton-destacado {
  background-color: #dbeafe;
  border-color: #93c5fd;
  color: #2563eb;
  font-weight: bold;
}

.elementos-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
}

.plantilla-imagen {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  z-index: 1; /* Asegurar que la imagen esté debajo de los elementos */
}

.sin-plantilla {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background-color: #f3f4f6;
  color: #6b7280;
  font-size: 0.875rem;
}

@media (max-width: 900px) {
  .visualizador-plantilla {
    padding: 0;
  }
}
</style> 