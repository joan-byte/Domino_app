<template>
  <ElementoArrastrable
    :position="position"
    :size="size"
    :min-left="0"
    :max-left="maxLeft"
    :min-top="0"
    :max-top="1000"
    :min-width="30"
    :max-width="400"
    :min-height="30"
    :max-height="400"
    :draggable="true"
    :resizable="true"
    :preserve-aspect-ratio="true"
    :additional-styles="{ 
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'visible',
      backgroundColor: 'rgba(255, 255, 255, 0.5)',
      border: '1px dashed #ccc'
    }"
    :element-type="'logo'"
    :element-side="lado"
    @update:position="updatePosition"
    @update:size="updateSize"
    @drag-end="onDragEnd"
    @resize-end="onResizeEnd"
  >
    <div class="etiqueta-descriptiva">LOGO</div>
    
    <div class="contenido-logo">
      <img 
        v-if="logoUrl" 
        :src="logoUrl" 
        :style="{
          maxWidth: '100%',
          maxHeight: '100%',
          objectFit: 'contain'
        }" 
        alt="Logo"
      />
      <div v-else class="logo-placeholder">
        Logo
      </div>
    </div>
  </ElementoArrastrable>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import ElementoArrastrable from './ElementoArrastrable.vue';

/**
 * Props del componente
 */
const props = defineProps({
  // Información de posicionamiento
  posicion: {
    type: Object,
    required: true
  },
  // Lado (izquierda o derecha)
  lado: {
    type: String,
    default: 'izquierda',
    validator: (value) => ['izquierda', 'derecha'].includes(value)
  },
  // URL del logo
  logoUrl: {
    type: String,
    default: ''
  },
  // Ancho máximo disponible
  anchoMaximo: {
    type: Number,
    default: 842 // Ancho A4 apaisado
  }
});

const emit = defineEmits(['update:posicion']);

// Calcular el límite derecho según el lado
const maxLeft = computed(() => {
  // Si es lado derecho, permitir mover hasta el ancho máximo
  // Si es lado izquierdo, limitar a la mitad del ancho máximo
  return props.lado === 'derecha' 
    ? props.anchoMaximo - props.posicion.width 
    : (props.anchoMaximo / 2) - props.posicion.width;
});

// Extraer posición y tamaño del prop posicion
const position = ref({
  top: props.posicion.top,
  left: props.posicion.left
});

const size = ref({
  width: props.posicion.width,
  height: props.posicion.height
});

// Flag para controlar actualización
const isUpdatingFromProps = ref(false);
const isEmittingUpdate = ref(false);

// Actualizar posición cuando cambie el prop
watch(() => props.posicion, (newValue) => {
  // Evitar reacciones en cadena
  if (isEmittingUpdate.value) return;
  
  isUpdatingFromProps.value = true;
  
  // Verificar cambios antes de actualizar para romper ciclos
  if (position.value.top !== newValue.top || position.value.left !== newValue.left) {
    position.value = {
      top: newValue.top,
      left: newValue.left
    };
  }
  
  if (size.value.width !== newValue.width || size.value.height !== newValue.height) {
    size.value = {
      width: newValue.width,
      height: newValue.height
    };
  }
  
  nextTick(() => {
    isUpdatingFromProps.value = false;
  });
}, { deep: true });

// Manejadores de eventos
const updatePosition = (newPosition) => {
  if (isUpdatingFromProps.value) return;
  
  position.value = newPosition;
  emitUpdate();
};

const updateSize = (newSize) => {
  if (isUpdatingFromProps.value) return;
  
  size.value = newSize;
  emitUpdate();
};

const onDragEnd = () => {
  // Se podría agregar lógica adicional aquí si es necesario
  if (!isUpdatingFromProps.value) {
    emitUpdate();
  }
};

const onResizeEnd = () => {
  // Se podría agregar lógica adicional aquí si es necesario
  if (!isUpdatingFromProps.value) {
    emitUpdate();
  }
};

// Emitir actualización de posición
const emitUpdate = () => {
  if (isEmittingUpdate.value) return;
  
  isEmittingUpdate.value = true;
  
  const updatedPosition = {
    top: position.value.top,
    left: position.value.left,
    width: size.value.width,
    height: size.value.height
  };
  
  nextTick(() => {
    emit('update:posicion', updatedPosition);
    nextTick(() => {
      isEmittingUpdate.value = false;
    });
  });
};
</script>

<style scoped>
.elemento-logo-container {
  position: relative;
}

.etiqueta-descriptiva {
  position: absolute;
  top: -20px;
  left: 0;
  color: #3b82f6; /* Azul */
  font-size: 12px;
  font-weight: bold;
  z-index: 1000;
  pointer-events: none;
  white-space: nowrap;
  /* Eliminar fondo, borde y sombra */
}

.contenido-logo {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.logo-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background-color: #f5f5f5;
  color: #999;
  font-size: 14px;
  font-weight: bold;
  border-radius: 4px;
}

/* Ocultar la etiqueta descriptiva en la impresión */
@media print {
  .etiqueta-descriptiva {
    display: none !important;
  }
}
</style> 