<template>
  <div
    ref="elementoRef"
    class="elemento-arrastrable"
    :class="{ 
      'is-dragging': isDragging, 
      'is-resizing': isResizing,
      'elemento-derecho': elementSide === 'derecha'
    }"
    :style="elementStyle"
    @mousedown.prevent="onElementMouseDown"
  >
    <slot></slot>
    
    <!-- Manejador de redimensionamiento -->
    <div 
      v-if="resizable"
      class="resize-handle"
      @mousedown.prevent.stop="onResizeHandleMouseDown"
    ></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { useDraggable } from '../../composables/useDraggable';
import { useResizable } from '../../composables/useResizable';

/**
 * Props del componente
 */
const props = defineProps({
  // Datos posicionales
  position: {
    type: Object,
    default: () => ({ top: 0, left: 0 })
  },
  size: {
    type: Object,
    default: () => ({ width: 100, height: 100 })
  },
  
  // Restricciones de posición
  minLeft: {
    type: Number,
    default: 0
  },
  maxLeft: {
    type: Number,
    default: 2000
  },
  minTop: {
    type: Number,
    default: 0
  },
  maxTop: {
    type: Number,
    default: 2000
  },
  
  // Restricciones de tamaño
  minWidth: {
    type: Number,
    default: 20
  },
  maxWidth: {
    type: Number,
    default: 1000
  },
  minHeight: {
    type: Number,
    default: 20
  },
  maxHeight: {
    type: Number,
    default: 1000
  },
  
  // Funcionalidades habilitadas
  draggable: {
    type: Boolean,
    default: true
  },
  resizable: {
    type: Boolean,
    default: true
  },
  preserveAspectRatio: {
    type: Boolean,
    default: false
  },
  
  // Estilos adicionales
  additionalStyles: {
    type: Object,
    default: () => ({})
  },
  
  // Identificadores para eventos
  elementType: {
    type: String,
    required: true
  },
  elementSide: {
    type: String,
    default: 'izquierda'
  },
  elementSubtype: {
    type: String,
    default: null
  },
  
  // Añadir el prop de alineación
  contentAlignment: {
    type: String,
    default: 'center', // Valores: center, left, right
    validator: (value) => ['center', 'left', 'right'].includes(value)
  }
});

const emit = defineEmits([
  'update:position',
  'update:size',
  'dragStart',
  'dragEnd',
  'resizeStart',
  'resizeEnd',
  'elementChange'
]);

// Referencia al elemento DOM
const elementoRef = ref(null);

// Flags para controlar actualizaciones
const isInternalUpdate = ref(false);
const isHandlingPropChange = ref(false);

// Calcular relación de aspecto inicial si es necesario
const aspectRatio = computed(() => {
  if (props.preserveAspectRatio && props.size.width && props.size.height) {
    return props.size.width / props.size.height;
  }
  return 1;
});

// Configurar draggable
const {
  position,
  isDragging,
  startDrag,
  stopDrag,
  updatePosition
} = useDraggable({
  initialPosition: props.position,
  minLeft: props.minLeft,
  maxLeft: props.maxLeft,
  minTop: props.minTop,
  maxTop: props.maxTop,
  onPositionChange: (newPosition) => {
    if (isHandlingPropChange.value) return;
    
    isInternalUpdate.value = true;
    nextTick(() => {
      emit('update:position', newPosition);
      emitElementChange();
      nextTick(() => {
        isInternalUpdate.value = false;
      });
    });
  },
  onDragEnd: (finalPosition) => {
    if (isHandlingPropChange.value) return;
    
    isInternalUpdate.value = true;
    nextTick(() => {
      emit('dragEnd', {
        type: props.elementType,
        side: props.elementSide,
        subtype: props.elementSubtype,
        position: finalPosition
      });
      nextTick(() => {
        isInternalUpdate.value = false;
      });
    });
  }
});

// Configurar resizable
const {
  size,
  isResizing,
  startResize,
  stopResize,
  updateSize
} = useResizable({
  initialSize: props.size,
  minWidth: props.minWidth,
  maxWidth: props.maxWidth,
  minHeight: props.minHeight,
  maxHeight: props.maxHeight,
  preserveAspectRatio: props.preserveAspectRatio,
  aspectRatio: aspectRatio.value,
  onSizeChange: (newSize) => {
    if (isHandlingPropChange.value) return;
    
    isInternalUpdate.value = true;
    nextTick(() => {
      emit('update:size', newSize);
      emitElementChange();
      nextTick(() => {
        isInternalUpdate.value = false;
      });
    });
  },
  onResizeEnd: (finalSize) => {
    if (isHandlingPropChange.value) return;
    
    isInternalUpdate.value = true;
    nextTick(() => {
      emit('resizeEnd', {
        type: props.elementType,
        side: props.elementSide,
        subtype: props.elementSubtype,
        size: finalSize
      });
      nextTick(() => {
        isInternalUpdate.value = false;
      });
    });
  }
});

// Estilo calculado del elemento
const elementStyle = computed(() => {
  // Generar estilo base
  const baseStyle = {
    position: 'absolute',
    top: `${position.value.top}px`,
    left: `${position.value.left}px`,
    width: `${size.value.width}px`,
    height: `${size.value.height}px`,
    justifyContent: props.contentAlignment === 'left' ? 'flex-start' : 
                    props.contentAlignment === 'right' ? 'flex-end' : 'center',
    cursor: isDragging.value ? 'grabbing' : 'grab',
    zIndex: isDragging.value || isResizing.value ? 100 : 10,
    transformOrigin: 'top left',
    ...props.additionalStyles
  };
  
  return baseStyle;
});

// Manejadores de eventos
const onElementMouseDown = (event) => {
  if (!props.draggable) return;
  
  console.log('Inicio de arrastre:', {
    type: props.elementType,
    side: props.elementSide,
    subtype: props.elementSubtype,
    initialPosition: { ...position.value }
  });
  
  emit('dragStart', {
    type: props.elementType,
    side: props.elementSide,
    subtype: props.elementSubtype
  });
  
  startDrag(event);
};

const onResizeHandleMouseDown = (event) => {
  if (!props.resizable) return;
  
  emit('resizeStart', {
    type: props.elementType,
    side: props.elementSide,
    subtype: props.elementSubtype
  });
  
  startResize(event);
};

// Emitir evento de cambio general
const emitElementChange = () => {
  if (isHandlingPropChange.value) return;
  
  emit('elementChange', {
    type: props.elementType,
    side: props.elementSide,
    subtype: props.elementSubtype,
    position: position.value,
    size: size.value
  });
};

// Actualizar posición y tamaño cuando cambien los props
watch(() => props.position, (newPosition) => {
  if (isInternalUpdate.value) return;
  
  isHandlingPropChange.value = true;
  
  // Comparar valores para evitar actualizaciones innecesarias
  const hasChanged = position.value.top !== newPosition.top || 
                    position.value.left !== newPosition.left;
  
  if (hasChanged) {
    updatePosition(newPosition);
  }
  
  nextTick(() => {
    isHandlingPropChange.value = false;
  });
}, { deep: true });

watch(() => props.size, (newSize) => {
  if (isInternalUpdate.value) return;
  
  isHandlingPropChange.value = true;
  
  // Comparar valores para evitar actualizaciones innecesarias
  const hasChanged = size.value.width !== newSize.width || 
                    size.value.height !== newSize.height;
  
  if (hasChanged) {
    updateSize(newSize);
  }
  
  nextTick(() => {
    isHandlingPropChange.value = false;
  });
}, { deep: true });

// Resetear el elemento si se proporciona una nueva posición o tamaño
const resetElement = () => {
  updatePosition(props.position);
  updateSize(props.size);
};

// Exponer métodos útiles
defineExpose({
  position,
  size,
  isDragging,
  isResizing,
  resetElement
});
</script>

<style scoped>
.elemento-arrastrable {
  box-sizing: border-box;
  position: absolute;
  cursor: grab;
  /* Aumentar la visibilidad de todos los elementos */
  z-index: 10;
}

/* Aplicar estilos específicos para elementos del lado derecho */
.elemento-derecho {
  z-index: 20; /* Priorizar elementos del lado derecho */
  background-color: rgba(255, 255, 255, 0.7) !important; /* Más opaco para mejor visibilidad */
}

.is-dragging {
  cursor: grabbing;
  opacity: 0.9;
  z-index: 100 !important; /* Asegurar que el elemento arrastrado esté en primer plano */
}

.is-resizing {
  cursor: nwse-resize;
  opacity: 0.9;
  z-index: 100 !important; /* Asegurar que el elemento redimensionado esté en primer plano */
}

.resize-handle {
  position: absolute;
  right: -5px;
  bottom: -5px;
  width: 12px;
  height: 12px;
  background-color: #3b82f6;
  border: 2px solid white;
  border-radius: 50%;
  cursor: nwse-resize;
  z-index: 15;
}

.resize-handle:hover {
  transform: scale(1.2);
}
</style> 