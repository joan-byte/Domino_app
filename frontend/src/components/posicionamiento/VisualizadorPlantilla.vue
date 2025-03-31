<template>
  <div ref="contenedorRef" class="visualizador-plantilla">
    <div class="controles-escala">
      <button @click="disminuirEscala" class="boton-escala" :disabled="escala <= 0.5">-</button>
      <span class="escala-valor">{{ Math.round(escala * 100) }}%</span>
      <button @click="aumentarEscala" class="boton-escala" :disabled="escala >= 2">+</button>
      <button @click="resetearEscala" class="boton-resetear-escala">
        <span>Ajustar</span>
      </button>
    </div>
    
    <div class="area-plantilla" :style="{ transform: `scale(${escala})` }">
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
      
      <!-- Contenedor ampliado para elementos posicionados -->
      <div class="elementos-container">
        <slot></slot>
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

// Calcular la escala automáticamente en función del tamaño del contenedor
const calcularEscalaAutomatica = () => {
  if (!contenedorRef.value) return;
  
  const contenedorAncho = contenedorRef.value.clientWidth;
  
  // Suponiendo formato A4 apaisado (842px de ancho)
  if (contenedorAncho < 842) {
    escala.value = parseFloat((contenedorAncho / 842).toFixed(2));
  } else {
    escala.value = 1;
  }
  
  emit('update:escala', escala.value);
};

// Controles de escala
const aumentarEscala = () => {
  escala.value = Math.min(2, escala.value + 0.1);
  emit('update:escala', escala.value);
};

const disminuirEscala = () => {
  escala.value = Math.max(0.5, escala.value - 0.1);
  emit('update:escala', escala.value);
};

const resetearEscala = () => {
  calcularEscalaAutomatica();
};

// Actualizar escala cuando cambie la escala inicial
watch(() => props.escalaInicial, (nuevoValor) => {
  escala.value = nuevoValor;
});

// Calcular la escala automáticamente al montar el componente
onMounted(() => {
  calcularEscalaAutomatica();
  
  // Recalcular escala al cambiar el tamaño de la ventana
  window.addEventListener('resize', calcularEscalaAutomatica);
});

// Limpiar event listeners
onUnmounted(() => {
  window.removeEventListener('resize', calcularEscalaAutomatica);
});
</script>

<style scoped>
.visualizador-plantilla {
  position: relative;
  overflow: visible; /* Permitir que los elementos se muestren fuera del límite del contenedor */
  min-height: 600px;
  max-width: 100%;
  margin: 0 auto;
}

/* Asegurar que los elementos del lado derecho sean visibles */
.plantilla-container {
  position: relative;
  overflow: visible;
  margin-bottom: 30px; /* Espacio para elementos que puedan quedar abajo */
}

/* Aplicar estilos para asegurar visibilidad */
::v-deep .elemento-arrastrable {
  z-index: 10;
}

/* Aumentar z-index para lado derecho */
::v-deep .elemento-derecho {
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
  z-index: 10;
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

.area-plantilla {
  min-height: 200px;
  transform-origin: top left;
  position: relative;
  width: 842px; /* Ancho A4 apaisado */
  height: 595px; /* Alto A4 apaisado */
  overflow: visible; /* Cambiar a visible para que los elementos no se corten */
}

.elementos-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 1200px; /* Ampliado más allá del tamaño A4 para dar espacio adicional */
  height: 700px; /* Ampliado más allá del tamaño A4 para dar espacio adicional */
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
</style> 